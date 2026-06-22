import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, type Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdminApp, getFirebaseAdminDb } from "@/lib/firebase-admin";
import type {
  ApprovalStatus,
  BenefitRedemption,
  BenefitRedemptionStatus,
  BenefitUsagePeriod,
  UserRole,
} from "@/lib/types";

export const runtime = "nodejs";

const APARTMENT_ID = "pradium";
const DEFAULT_ADMIN_EMAILS = ["djmonnar4@gmail.com"];

const ADMIN_EMAILS = [
  ...DEFAULT_ADMIN_EMAILS,
  ...(process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "").split(","),
]
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

type RedemptionData = {
  id?: string;
  apartmentId?: string;
  userId?: string;
  benefitId?: string;
  benefitTitle?: string;
  partnerId?: string;
  partnerName?: string;
  periodKey?: string;
  status?: BenefitRedemptionStatus;
  createdAt?: Timestamp | null;
  usedAt?: Timestamp | null;
  usedBy?: "partner-on-user-phone" | null;
  monthlyLimit?: number;
};

type UsageData = {
  id?: string;
  userId?: string;
  benefitId?: string;
  apartmentId?: string;
  periodKey?: string;
  usedCount?: number;
  monthlyLimit?: number;
  lastUsedAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

function toIso(value: Timestamp | Date | string | null | undefined) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return value.toDate().toISOString();
}

function normalizeLimit(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(1, Math.floor(value))
    : 1;
}

function usagePeriodId(userId: string, benefitId: string, periodKey: string) {
  return `${userId}_${benefitId}_${periodKey}`;
}

function serializeRedemption(
  id: string,
  data: RedemptionData,
): BenefitRedemption {
  return {
    id: data.id ?? id,
    apartmentId: "pradium",
    userId: data.userId ?? "",
    benefitId: data.benefitId ?? "",
    benefitTitle: data.benefitTitle ?? "",
    partnerId: data.partnerId ?? "",
    partnerName: data.partnerName ?? "",
    periodKey: data.periodKey ?? "",
    status: data.status ?? "ready",
    createdAt: toIso(data.createdAt),
    usedAt: toIso(data.usedAt),
    usedBy: data.usedBy === "partner-on-user-phone" ? data.usedBy : null,
    monthlyLimit: normalizeLimit(data.monthlyLimit),
  };
}

function serializeUsage(id: string, data: UsageData): BenefitUsagePeriod {
  return {
    id: data.id ?? id,
    userId: data.userId ?? "",
    benefitId: data.benefitId ?? "",
    apartmentId: "pradium",
    periodKey: data.periodKey ?? "",
    usedCount:
      typeof data.usedCount === "number"
        ? Math.max(0, Math.floor(data.usedCount))
        : 0,
    monthlyLimit: normalizeLimit(data.monthlyLimit),
    lastUsedAt: toIso(data.lastUsedAt),
    updatedAt: toIso(data.updatedAt),
  };
}

function emptyUsage(input: {
  userId: string;
  benefitId: string;
  periodKey: string;
  monthlyLimit: number;
}): BenefitUsagePeriod {
  return {
    id: usagePeriodId(input.userId, input.benefitId, input.periodKey),
    userId: input.userId,
    benefitId: input.benefitId,
    apartmentId: "pradium",
    periodKey: input.periodKey,
    usedCount: 0,
    monthlyLimit: input.monthlyLimit,
    lastUsedAt: null,
    updatedAt: null,
  };
}

function asRole(value: unknown): UserRole {
  if (value === "admin" || value === "partner" || value === "resident") {
    return value;
  }
  return "resident";
}

function asApprovalStatus(value: unknown): ApprovalStatus {
  if (
    value === "approved" ||
    value === "pending" ||
    value === "rejected" ||
    value === "suspended"
  ) {
    return value;
  }
  return "pending";
}

async function verifyRequest(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;
  return getAuth(getFirebaseAdminApp()).verifyIdToken(token);
}

export async function POST(request: Request) {
  try {
    const decoded = await verifyRequest(request);
    if (!decoded) {
      return jsonError("로그인이 필요합니다.", 401);
    }

    const body = (await request.json().catch(() => ({}))) as {
      redemptionId?: unknown;
    };
    const redemptionId = String(body.redemptionId ?? "").trim();
    if (!redemptionId) {
      return jsonError("혜택 사용권 정보가 없습니다.", 400);
    }

    const db = getFirebaseAdminDb();
    const actorEmail = decoded.email?.toLowerCase() ?? "";
    const result = await db.runTransaction(async (transaction) => {
      const userRef = db.collection("users").doc(decoded.uid);
      const redemptionRef = db
        .collection("benefitRedemptions")
        .doc(redemptionId);
      const [userSnap, redemptionSnap] = await Promise.all([
        transaction.get(userRef),
        transaction.get(redemptionRef),
      ]);

      const userData = userSnap.data() ?? {};
      const actorIsAdmin =
        asRole(userData.role) === "admin" || ADMIN_EMAILS.includes(actorEmail);
      const actorIsApproved =
        actorIsAdmin ||
        asApprovalStatus(userData.approvalStatus ?? userData.status) ===
          "approved";

      if (!actorIsApproved) {
        return {
          httpStatus: 403,
          body: { message: "관리자 승인 후 이용할 수 있습니다." },
        };
      }

      if (!redemptionSnap.exists) {
        return {
          httpStatus: 404,
          body: { message: "혜택 사용권을 찾을 수 없습니다." },
        };
      }

      const redemptionData = redemptionSnap.data() as RedemptionData;
      if (!actorIsAdmin && redemptionData.userId !== decoded.uid) {
        return {
          httpStatus: 403,
          body: { message: "본인의 혜택 사용권만 처리할 수 있습니다." },
        };
      }

      const redemption = serializeRedemption(redemptionSnap.id, redemptionData);
      const usageId = usagePeriodId(
        redemption.userId,
        redemption.benefitId,
        redemption.periodKey,
      );
      const usageRef = db.collection("benefitUsagePeriods").doc(usageId);
      const usageSnap = await transaction.get(usageRef);
      const usage = usageSnap.exists
        ? serializeUsage(usageSnap.id, usageSnap.data() as UsageData)
        : emptyUsage({
            userId: redemption.userId,
            benefitId: redemption.benefitId,
            periodKey: redemption.periodKey,
            monthlyLimit: redemption.monthlyLimit,
          });
      const monthlyLimit = normalizeLimit(
        redemption.monthlyLimit || usage.monthlyLimit,
      );
      const normalizedUsage = { ...usage, monthlyLimit };

      if (redemption.status === "used") {
        return {
          httpStatus: 200,
          body: {
            kind: "alreadyUsed",
            redemption,
            usage: normalizedUsage,
            message: "이미 사용 완료 처리된 혜택입니다.",
          },
        };
      }

      if (redemption.status !== "ready") {
        return {
          httpStatus: 200,
          body: {
            kind: "notReady",
            redemption,
            usage: normalizedUsage,
            message: "사용 완료 처리할 수 없는 상태입니다.",
          },
        };
      }

      if (normalizedUsage.usedCount >= monthlyLimit) {
        return {
          httpStatus: 200,
          body: {
            kind: "limitReached",
            redemption,
            usage: normalizedUsage,
            message: "이번 달 사용 가능 횟수를 모두 사용했습니다.",
          },
        };
      }

      const usedAt = new Date();
      const nextUsage = {
        ...normalizedUsage,
        usedCount: normalizedUsage.usedCount + 1,
        lastUsedAt: usedAt.toISOString(),
        updatedAt: usedAt.toISOString(),
      };
      const nextRedemption = {
        ...redemption,
        status: "used" as const,
        usedAt: usedAt.toISOString(),
        usedBy: "partner-on-user-phone" as const,
      };

      transaction.update(redemptionRef, {
        status: "used",
        usedAt: FieldValue.serverTimestamp(),
        usedBy: "partner-on-user-phone",
      });
      transaction.set(usageRef, {
        id: usageId,
        userId: redemption.userId,
        benefitId: redemption.benefitId,
        apartmentId: APARTMENT_ID,
        periodKey: redemption.periodKey,
        usedCount: nextUsage.usedCount,
        monthlyLimit,
        lastUsedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      return {
        httpStatus: 200,
        body: {
          kind: "used",
          redemption: nextRedemption,
          usage: nextUsage,
          message: "사용 완료 처리되었습니다.",
        },
      };
    });

    return NextResponse.json(result.body, { status: result.httpStatus });
  } catch (error) {
    console.error("[benefit-redemptions.complete]", error);
    return jsonError(
      "혜택 사용 완료 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      500,
    );
  }
}
