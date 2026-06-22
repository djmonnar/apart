import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
  type DocumentData,
  type QuerySnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import type { Benefit, Coupon, CouponStatus, Partner } from "./types";

const COLLECTION = "coupons";
const COUPON_EXPIRES_HOURS = 24;

export const COUPON_STATUSES: CouponStatus[] = [
  "issued",
  "used",
  "expired",
  "cancelled",
];

export interface IssueCouponResult {
  coupon: Coupon;
  reused: boolean;
}

function asStatus(value: unknown): CouponStatus {
  if (
    value === "issued" ||
    value === "used" ||
    value === "expired" ||
    value === "cancelled"
  ) {
    return value;
  }
  return "issued";
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

export function isCouponExpired(coupon: Pick<Coupon, "expiresAt" | "status">) {
  if (coupon.status !== "issued") return false;
  const expiresAt = toMillis(coupon.expiresAt);
  return expiresAt > 0 && expiresAt <= Date.now();
}

export function normalizeCoupon(
  id: string,
  data: Record<string, unknown>,
): Coupon {
  return {
    id: (data.id as string | undefined) ?? id,
    code: (data.code as string | undefined) ?? "",
    apartmentId: "pradium",
    userId: (data.userId as string | undefined) ?? "",
    benefitId: (data.benefitId as string | undefined) ?? "",
    benefitTitle: (data.benefitTitle as string | undefined) ?? "",
    partnerId: (data.partnerId as string | undefined) ?? "",
    partnerName: (data.partnerName as string | undefined) ?? "",
    status: asStatus(data.status),
    issuedAt: data.issuedAt ?? null,
    expiresAt: data.expiresAt ?? null,
    usedAt: data.usedAt ?? null,
    usedByPartnerId: (data.usedByPartnerId as string | null | undefined) ?? null,
    usedByPartnerName:
      (data.usedByPartnerName as string | null | undefined) ?? null,
  };
}

function sortByIssuedAtDesc(items: Coupon[]) {
  return [...items].sort((a, b) => toMillis(b.issuedAt) - toMillis(a.issuedAt));
}

function normalizeSnapshot(snap: QuerySnapshot<DocumentData>) {
  return sortByIssuedAtDesc(
    snap.docs.map((item) => normalizeCoupon(item.id, item.data())),
  );
}

export function generateCouponCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function issueCoupon(input: {
  userId: string;
  benefit: Benefit;
  partner: Partner;
}): Promise<IssueCouponResult> {
  const db = getFirebaseDb();
  const userCouponsQuery = query(
    collection(db, COLLECTION),
    where("userId", "==", input.userId),
  );
  const existingSnap = await getDocs(userCouponsQuery);
  const existing = normalizeSnapshot(existingSnap).find(
    (coupon) =>
      coupon.benefitId === input.benefit.id &&
      coupon.status === "issued" &&
      !isCouponExpired(coupon),
  );

  if (existing) {
    return { coupon: existing, reused: true };
  }

  const ref = doc(collection(db, COLLECTION));
  const expiresAt = Timestamp.fromDate(
    new Date(Date.now() + COUPON_EXPIRES_HOURS * 60 * 60 * 1000),
  );
  const coupon: Coupon = {
    id: ref.id,
    code: generateCouponCode(),
    apartmentId: "pradium",
    userId: input.userId,
    benefitId: input.benefit.id,
    benefitTitle: input.benefit.title,
    partnerId: input.partner.id,
    partnerName: input.partner.name,
    status: "issued",
    issuedAt: new Date(),
    expiresAt,
    usedAt: null,
    usedByPartnerId: null,
    usedByPartnerName: null,
  };

  await setDoc(ref, {
    ...coupon,
    issuedAt: serverTimestamp(),
  });

  return { coupon, reused: false };
}

export function subscribeMyCoupons(
  userId: string,
  onChange: (items: Coupon[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const db = getFirebaseDb();
  const q = query(collection(db, COLLECTION), where("userId", "==", userId));
  return onSnapshot(q, (snap) => onChange(normalizeSnapshot(snap)), onError);
}

export function subscribeAllCoupons(
  onChange: (items: Coupon[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    collection(getFirebaseDb(), COLLECTION),
    (snap) => onChange(normalizeSnapshot(snap)),
    onError,
  );
}
