import {
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  where,
  type DocumentData,
  type QuerySnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "./firebase";
import type {
  Benefit,
  BenefitRedemption,
  BenefitRedemptionStatus,
  BenefitUsagePeriod,
  Partner,
} from "./types";

const REDEMPTIONS_COLLECTION = "benefitRedemptions";
const USAGE_PERIODS_COLLECTION = "benefitUsagePeriods";
const DEFAULT_MONTHLY_LIMIT = 1;

export const BENEFIT_REDEMPTION_STATUSES: BenefitRedemptionStatus[] = [
  "ready",
  "used",
  "cancelled",
];

export type CreateRedemptionResult =
  | {
      kind: "created";
      redemption: BenefitRedemption;
      usage: BenefitUsagePeriod;
    }
  | {
      kind: "limitReached";
      usage: BenefitUsagePeriod;
    };

export type CompleteRedemptionResult =
  | {
      kind: "used";
      redemption: BenefitRedemption;
      usage: BenefitUsagePeriod;
    }
  | {
      kind: "alreadyUsed";
      redemption: BenefitRedemption;
      usage: BenefitUsagePeriod;
    }
  | {
      kind: "limitReached";
      redemption: BenefitRedemption;
      usage: BenefitUsagePeriod;
    }
  | {
      kind: "notReady";
      redemption: BenefitRedemption;
      usage: BenefitUsagePeriod;
    };

function asStatus(value: unknown): BenefitRedemptionStatus {
  if (value === "ready" || value === "used" || value === "cancelled") {
    return value;
  }
  return "ready";
}

function toMillis(value: unknown): number {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "toMillis" in value &&
    typeof (value as { toMillis: unknown }).toMillis === "function"
  ) {
    return (value as { toMillis: () => number }).toMillis();
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().getTime();
  }
  return 0;
}

export function sortByUsedAtDesc(items: BenefitRedemption[]) {
  return [...items].sort((a, b) => {
    const bTime = toMillis(b.usedAt) || toMillis(b.createdAt);
    const aTime = toMillis(a.usedAt) || toMillis(a.createdAt);
    return bTime - aTime;
  });
}

export function getKoreaPeriodKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  return `${year}-${month}`;
}

export function getBenefitMonthlyLimit(benefit: Benefit) {
  return Math.max(1, Math.floor(benefit.monthlyLimitPerUser ?? DEFAULT_MONTHLY_LIMIT));
}

export function benefitUsagePeriodId(
  userId: string,
  benefitId: string,
  periodKey: string,
) {
  return `${userId}_${benefitId}_${periodKey}`;
}

export function normalizeBenefitRedemption(
  id: string,
  data: Record<string, unknown>,
): BenefitRedemption {
  return {
    id: (data.id as string | undefined) ?? id,
    apartmentId: "pradium",
    userId: (data.userId as string | undefined) ?? "",
    benefitId: (data.benefitId as string | undefined) ?? "",
    benefitTitle: (data.benefitTitle as string | undefined) ?? "",
    partnerId: (data.partnerId as string | undefined) ?? "",
    partnerName: (data.partnerName as string | undefined) ?? "",
    periodKey: (data.periodKey as string | undefined) ?? getKoreaPeriodKey(),
    status: asStatus(data.status),
    createdAt: data.createdAt ?? null,
    usedAt: data.usedAt ?? null,
    usedBy:
      data.usedBy === "partner-on-user-phone"
        ? "partner-on-user-phone"
        : null,
    monthlyLimit:
      typeof data.monthlyLimit === "number"
        ? Math.max(1, Math.floor(data.monthlyLimit))
        : DEFAULT_MONTHLY_LIMIT,
  };
}

export function normalizeBenefitUsagePeriod(
  id: string,
  data: Record<string, unknown>,
): BenefitUsagePeriod {
  return {
    id: (data.id as string | undefined) ?? id,
    userId: (data.userId as string | undefined) ?? "",
    benefitId: (data.benefitId as string | undefined) ?? "",
    apartmentId: "pradium",
    periodKey: (data.periodKey as string | undefined) ?? getKoreaPeriodKey(),
    usedCount:
      typeof data.usedCount === "number"
        ? Math.max(0, Math.floor(data.usedCount))
        : 0,
    monthlyLimit:
      typeof data.monthlyLimit === "number"
        ? Math.max(1, Math.floor(data.monthlyLimit))
        : DEFAULT_MONTHLY_LIMIT,
    lastUsedAt: data.lastUsedAt ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}

function normalizeRedemptionSnapshot(snap: QuerySnapshot<DocumentData>) {
  return sortByUsedAtDesc(
    snap.docs.map((item) => normalizeBenefitRedemption(item.id, item.data())),
  );
}

function normalizeUsageSnapshot(snap: QuerySnapshot<DocumentData>) {
  return snap.docs
    .map((item) => normalizeBenefitUsagePeriod(item.id, item.data()))
    .sort((a, b) => toMillis(b.lastUsedAt) - toMillis(a.lastUsedAt));
}

export function emptyUsagePeriod(input: {
  userId: string;
  benefitId: string;
  periodKey: string;
  monthlyLimit: number;
}): BenefitUsagePeriod {
  return {
    id: benefitUsagePeriodId(input.userId, input.benefitId, input.periodKey),
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

export async function createBenefitRedemption(input: {
  userId: string;
  benefit: Benefit;
  partner: Partner;
}): Promise<CreateRedemptionResult> {
  const db = getFirebaseDb();
  const periodKey = getKoreaPeriodKey();
  const monthlyLimit = getBenefitMonthlyLimit(input.benefit);
  const usageId = benefitUsagePeriodId(input.userId, input.benefit.id, periodKey);
  const usageRef = doc(db, USAGE_PERIODS_COLLECTION, usageId);
  const redemptionRef = doc(collection(db, REDEMPTIONS_COLLECTION));

  return runTransaction(db, async (transaction) => {
    const usageSnap = await transaction.get(usageRef);
    const usage = usageSnap.exists()
      ? normalizeBenefitUsagePeriod(usageSnap.id, usageSnap.data())
      : emptyUsagePeriod({
          userId: input.userId,
          benefitId: input.benefit.id,
          periodKey,
          monthlyLimit,
        });

    const effectiveUsage = {
      ...usage,
      monthlyLimit,
    };

    if (effectiveUsage.usedCount >= monthlyLimit) {
      return {
        kind: "limitReached" as const,
        usage: effectiveUsage,
      };
    }

    const redemption: BenefitRedemption = {
      id: redemptionRef.id,
      apartmentId: "pradium",
      userId: input.userId,
      benefitId: input.benefit.id,
      benefitTitle: input.benefit.title,
      partnerId: input.partner.id,
      partnerName: input.partner.name,
      periodKey,
      status: "ready",
      createdAt: new Date(),
      usedAt: null,
      usedBy: null,
      monthlyLimit,
    };

    transaction.set(redemptionRef, {
      ...redemption,
      createdAt: serverTimestamp(),
    });

    return {
      kind: "created" as const,
      redemption,
      usage: effectiveUsage,
    };
  });
}

export async function completeBenefitRedemption(
  redemptionId: string,
): Promise<CompleteRedemptionResult> {
  const token = await getFirebaseAuth().currentUser?.getIdToken();
  if (!token) {
    throw new Error("benefit-redemption/auth-required");
  }

  const response = await fetch("/api/benefit-redemptions/complete", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ redemptionId }),
  });
  const payload = (await response.json().catch(() => null)) as
    | (CompleteRedemptionResult & { message?: string })
    | null;

  if (!response.ok || !payload) {
    throw new Error(
      payload?.message ?? "benefit-redemption/complete-failed",
    );
  }

  return payload;
}

export function subscribeBenefitUsagePeriod(
  input: {
    userId: string;
    benefitId: string;
    periodKey: string;
    monthlyLimit: number;
  },
  onChange: (item: BenefitUsagePeriod) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const db = getFirebaseDb();
  const id = benefitUsagePeriodId(input.userId, input.benefitId, input.periodKey);
  return onSnapshot(
    doc(db, USAGE_PERIODS_COLLECTION, id),
    (snap) => {
      onChange(
        snap.exists()
          ? normalizeBenefitUsagePeriod(snap.id, snap.data())
          : emptyUsagePeriod(input),
      );
    },
    onError,
  );
}

export function subscribeMyBenefitUsagePeriods(
  userId: string,
  onChange: (items: BenefitUsagePeriod[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const q = query(
    collection(getFirebaseDb(), USAGE_PERIODS_COLLECTION),
    where("userId", "==", userId),
  );
  return onSnapshot(q, (snap) => onChange(normalizeUsageSnapshot(snap)), onError);
}

export function subscribeAllBenefitRedemptions(
  onChange: (items: BenefitRedemption[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    collection(getFirebaseDb(), REDEMPTIONS_COLLECTION),
    (snap) => onChange(normalizeRedemptionSnapshot(snap)),
    onError,
  );
}

export function subscribeAllBenefitUsagePeriods(
  onChange: (items: BenefitUsagePeriod[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    collection(getFirebaseDb(), USAGE_PERIODS_COLLECTION),
    (snap) => onChange(normalizeUsageSnapshot(snap)),
    onError,
  );
}
