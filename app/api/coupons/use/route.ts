import { NextResponse } from "next/server";
import { FieldValue, type Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import type { CouponStatus } from "@/lib/types";

export const runtime = "nodejs";

type CouponData = {
  code?: string;
  benefitTitle?: string;
  partnerName?: string;
  status?: CouponStatus;
  expiresAt?: Timestamp;
  usedAt?: Timestamp | null;
  usedByPartnerId?: string | null;
  usedByPartnerName?: string | null;
};

function normalizeCode(value: unknown) {
  return String(value ?? "").trim().toUpperCase();
}

function serializeTimestamp(value: Timestamp | null | undefined) {
  return value ? value.toDate().toISOString() : null;
}

function safePayload(input: {
  valid: boolean;
  couponId?: string;
  data?: CouponData;
  status: CouponStatus | "not_found";
  message: string;
  usedAt?: string | null;
}) {
  return {
    valid: input.valid,
    couponId: input.couponId,
    code: input.data?.code ?? null,
    benefitTitle: input.data?.benefitTitle ?? null,
    partnerName: input.data?.partnerName ?? null,
    status: input.status,
    expiresAt: serializeTimestamp(input.data?.expiresAt),
    usedAt: input.usedAt ?? serializeTimestamp(input.data?.usedAt ?? null),
    usedByPartnerName: input.data?.usedByPartnerName ?? null,
    message: input.message,
  };
}

async function findCouponRef(input: { couponId?: string; code?: string }) {
  const db = getFirebaseAdminDb();
  if (input.couponId) {
    return db.collection("coupons").doc(input.couponId);
  }

  if (!input.code) return null;
  const snap = await db
    .collection("coupons")
    .where("code", "==", input.code)
    .limit(1)
    .get();
  return snap.empty ? null : snap.docs[0].ref;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      couponId?: unknown;
      code?: unknown;
      partnerId?: unknown;
      partnerName?: unknown;
    };

    const couponId = String(body.couponId ?? "").trim();
    const code = normalizeCode(body.code);
    const partnerId = String(body.partnerId ?? "partner-demo").trim();
    const partnerName = String(body.partnerName ?? "제휴업체").trim();

    if (!couponId && !code) {
      return NextResponse.json(
        safePayload({
          valid: false,
          status: "not_found",
          message: "쿠폰번호를 입력해주세요.",
        }),
        { status: 400 },
      );
    }

    const ref = await findCouponRef({
      couponId: couponId || undefined,
      code: code || undefined,
    });

    if (!ref) {
      return NextResponse.json(
        safePayload({
          valid: false,
          status: "not_found",
          message: "존재하지 않는 쿠폰번호입니다.",
        }),
      );
    }

    const result = await getFirebaseAdminDb().runTransaction(async (transaction) => {
      const snap = await transaction.get(ref);
      if (!snap.exists) {
        return safePayload({
          valid: false,
          status: "not_found",
          message: "존재하지 않는 쿠폰번호입니다.",
        });
      }

      const data = snap.data() as CouponData;
      const status = data.status ?? "issued";
      const expiresAt = data.expiresAt?.toMillis() ?? 0;

      if (status === "issued" && expiresAt > 0 && expiresAt <= Date.now()) {
        transaction.update(ref, { status: "expired" });
        return safePayload({
          valid: false,
          couponId: snap.id,
          data: { ...data, status: "expired" },
          status: "expired",
          message: "만료된 쿠폰입니다.",
        });
      }

      if (status === "used") {
        return safePayload({
          valid: false,
          couponId: snap.id,
          data,
          status,
          message: "이미 사용 완료된 쿠폰입니다.",
        });
      }

      if (status === "expired") {
        return safePayload({
          valid: false,
          couponId: snap.id,
          data,
          status,
          message: "만료된 쿠폰입니다.",
        });
      }

      if (status === "cancelled") {
        return safePayload({
          valid: false,
          couponId: snap.id,
          data,
          status,
          message: "취소된 쿠폰입니다.",
        });
      }

      const usedAt = new Date().toISOString();
      transaction.update(ref, {
        status: "used",
        usedAt: FieldValue.serverTimestamp(),
        usedByPartnerId: partnerId || "partner-demo",
        usedByPartnerName: partnerName || "제휴업체",
      });

      return safePayload({
        valid: true,
        couponId: snap.id,
        data: {
          ...data,
          status: "used",
          usedByPartnerId: partnerId || "partner-demo",
          usedByPartnerName: partnerName || "제휴업체",
        },
        status: "used",
        usedAt,
        message: "사용 완료 처리되었습니다.",
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[coupons.use]", error);
    return NextResponse.json(
      {
        valid: false,
        message:
          "쿠폰 사용 처리 중 오류가 발생했습니다. 서버 Firebase Admin 설정을 확인해주세요.",
      },
      { status: 500 },
    );
  }
}
