import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
  type QuerySnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { benefits as seedBenefits } from "@/data/benefits";
import { partners as seedPartners } from "@/data/partners";
import { getFirebaseDb } from "./firebase";
import type {
  Benefit,
  BenefitType,
  CategoryId,
  CmsContentStatus,
  Partner,
} from "./types";

export const PARTNERS_COLLECTION = "partners";
export const BENEFITS_COLLECTION = "benefits";

export const CMS_CONTENT_STATUSES: CmsContentStatus[] = [
  "active",
  "paused",
  "draft",
];

export const BENEFIT_TYPES: BenefitType[] = [
  "discount",
  "gift",
  "service",
  "group",
  "other",
];

const FALLBACK_IMAGE = "/assets/gift-box.png";

const CATEGORY_IDS: CategoryId[] = [
  "food",
  "beauty",
  "living",
  "health",
  "education",
  "moving",
  "car",
  "etc",
];

function asCategory(value: unknown): CategoryId {
  return CATEGORY_IDS.includes(value as CategoryId)
    ? (value as CategoryId)
    : "etc";
}

function asStatus(value: unknown): CmsContentStatus {
  if (value === "active" || value === "paused" || value === "draft") {
    return value;
  }
  return "draft";
}

function asBenefitType(value: unknown): BenefitType {
  if (
    value === "discount" ||
    value === "gift" ||
    value === "service" ||
    value === "group" ||
    value === "other"
  ) {
    return value;
  }
  return "discount";
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function asSummaryLines(value: unknown): string[] {
  const lines = asStringArray(value);
  return lines.length > 0 ? lines.slice(0, 3) : ["입주민 전용 혜택"];
}

function asMonthlyLimit(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(1, Math.floor(value))
    : 1;
}

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function timestampSortValue(value: unknown) {
  if (
    typeof value === "object" &&
    value !== null &&
    "toMillis" in value &&
    typeof (value as { toMillis: unknown }).toMillis === "function"
  ) {
    return (value as { toMillis: () => number }).toMillis();
  }
  if (value instanceof Date) return value.getTime();
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
  }
  return 0;
}

export function normalizePartner(
  id: string,
  data: Record<string, unknown>,
): Partner {
  const name = (data.name as string | undefined)?.trim() || "미등록 업체";
  const imageUrl =
    (data.imageUrl as string | undefined)?.trim() ||
    (data.image as string | undefined)?.trim() ||
    FALLBACK_IMAGE;
  const shortDescription =
    (data.shortDescription as string | undefined)?.trim() ||
    (data.tagline as string | undefined)?.trim() ||
    "입주민 전용 혜택 제공 업체";
  const isFeatured =
    data.isFeatured === true || data.featured === true || false;

  return {
    id: (data.id as string | undefined) ?? id,
    apartmentId: (data.apartmentId as string | undefined) ?? "pradium",
    slug: (data.slug as string | undefined) ?? toSlug(name) ?? id,
    name,
    category: asCategory(data.category),
    image: imageUrl,
    imageUrl,
    region: (data.region as string | undefined) ?? "",
    tagline: shortDescription,
    shortDescription,
    description:
      (data.description as string | undefined) ?? "입주민 전용 혜택을 제공합니다.",
    phone: (data.phone as string | undefined) ?? "",
    address: (data.address as string | undefined) ?? "",
    status: asStatus(data.status),
    isFeatured,
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
    partneredAt: (data.partneredAt as string | undefined) ?? "",
    featured: isFeatured,
  };
}

export function normalizeBenefit(
  id: string,
  data: Record<string, unknown>,
): Benefit {
  const title = (data.title as string | undefined)?.trim() || "미등록 혜택";
  const monthlyLimitPerUser = asMonthlyLimit(data.monthlyLimitPerUser);
  const isMonthlyLimited = data.isMonthlyLimited !== false;
  const summary = asSummaryLines(data.summary);
  const isFeatured =
    data.isFeatured === true || data.highlight === true || false;

  return {
    id: (data.id as string | undefined) ?? id,
    partnerId: (data.partnerId as string | undefined) ?? "",
    partnerName: (data.partnerName as string | undefined) ?? "",
    partnerSlug: (data.partnerSlug as string | undefined) ?? "",
    category: asCategory(data.category),
    title,
    summary,
    summaryText:
      typeof data.summary === "string" ? data.summary : summary.join(", "),
    description:
      (data.description as string | undefined) ?? "입주민 전용 혜택입니다.",
    benefitType: asBenefitType(data.benefitType),
    originalPrice: (data.originalPrice as string | undefined) ?? "",
    benefitPrice: (data.benefitPrice as string | undefined) ?? "",
    discountText: (data.discountText as string | undefined) ?? "",
    conditions: asStringArray(data.conditions),
    usageGuide: asStringArray(data.usageGuide),
    imageUrl: (data.imageUrl as string | undefined) ?? "",
    status: asStatus(data.status),
    isFeatured,
    validFrom: (data.validFrom as string | undefined) ?? "",
    validTo: (data.validTo as string | undefined) ?? "",
    usageLimit: isMonthlyLimited ? `월 ${monthlyLimitPerUser}회` : "월 제한 없음",
    monthlyLimitPerUser,
    isMonthlyLimited,
    resetDay: 1,
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
    highlight: isFeatured,
  };
}

function normalizePartnerSnapshot(snap: QuerySnapshot<DocumentData>) {
  return snap.docs
    .map((item) => normalizePartner(item.id, item.data()))
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));
}

function normalizeBenefitSnapshot(snap: QuerySnapshot<DocumentData>) {
  return snap.docs
    .map((item) => normalizeBenefit(item.id, item.data()))
    .sort(
      (a, b) =>
        timestampSortValue(b.updatedAt ?? b.createdAt) -
        timestampSortValue(a.updatedAt ?? a.createdAt),
    );
}

export function subscribePartners(
  onChange: (items: Partner[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    query(collection(getFirebaseDb(), PARTNERS_COLLECTION)),
    (snap) => onChange(normalizePartnerSnapshot(snap)),
    onError,
  );
}

export function subscribeBenefits(
  onChange: (items: Benefit[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    query(collection(getFirebaseDb(), BENEFITS_COLLECTION)),
    (snap) => onChange(normalizeBenefitSnapshot(snap)),
    onError,
  );
}

export async function savePartner(input: Partner) {
  const id = input.id || toSlug(input.slug || input.name);
  await setDoc(
    doc(getFirebaseDb(), PARTNERS_COLLECTION, id),
    {
      id,
      slug: input.slug || toSlug(input.name) || id,
      name: input.name,
      category: input.category,
      description: input.description,
      shortDescription: input.shortDescription || input.tagline,
      phone: input.phone ?? "",
      address: input.address,
      region: input.region,
      imageUrl: input.imageUrl || input.image,
      status: input.status,
      isFeatured: input.isFeatured || Boolean(input.featured),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function createPartner(input: Omit<Partner, "id"> & { id?: string }) {
  const id = input.id || `ptn-${toSlug(input.slug || input.name)}`;
  await setDoc(doc(getFirebaseDb(), PARTNERS_COLLECTION, id), {
    id,
    slug: input.slug || toSlug(input.name),
    name: input.name,
    category: input.category,
    description: input.description,
    shortDescription: input.shortDescription || input.tagline,
    phone: input.phone ?? "",
    address: input.address,
    region: input.region,
    imageUrl: input.imageUrl || input.image,
    status: input.status || "draft",
    isFeatured: input.isFeatured || Boolean(input.featured),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return id;
}

export async function updatePartnerStatus(
  id: string,
  status: CmsContentStatus,
) {
  await updateDoc(doc(getFirebaseDb(), PARTNERS_COLLECTION, id), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function saveBenefit(input: Benefit, partner: Partner) {
  const id = input.id;
  await setDoc(
    doc(getFirebaseDb(), BENEFITS_COLLECTION, id),
    benefitPayload(input, partner, { created: false }),
    { merge: true },
  );
}

export async function createBenefit(input: Omit<Benefit, "id">, partner: Partner) {
  const ref = doc(collection(getFirebaseDb(), BENEFITS_COLLECTION));
  await setDoc(ref, benefitPayload({ ...input, id: ref.id }, partner, { created: true }));
  return ref.id;
}

export async function updateBenefitStatus(
  id: string,
  status: CmsContentStatus,
) {
  await updateDoc(doc(getFirebaseDb(), BENEFITS_COLLECTION, id), {
    status,
    updatedAt: serverTimestamp(),
  });
}

function benefitPayload(
  input: Benefit,
  partner: Partner,
  options: { created: boolean },
) {
  return {
    ...(options.created ? { createdAt: serverTimestamp() } : {}),
    id: input.id,
    partnerId: partner.id,
    partnerName: partner.name,
    partnerSlug: partner.slug,
    category: input.category || partner.category,
    title: input.title,
    summary: input.summaryText || input.summary.join(", "),
    description: input.description,
    benefitType: input.benefitType,
    originalPrice: input.originalPrice,
    benefitPrice: input.benefitPrice,
    discountText: input.discountText,
    conditions: input.conditions,
    usageGuide: input.usageGuide,
    imageUrl: input.imageUrl,
    status: input.status || "draft",
    isFeatured: input.isFeatured || Boolean(input.highlight),
    monthlyLimitPerUser: asMonthlyLimit(input.monthlyLimitPerUser),
    isMonthlyLimited: input.isMonthlyLimited !== false,
    resetDay: 1,
    updatedAt: serverTimestamp(),
  };
}

export const fallbackPartners = seedPartners.map((item) =>
  normalizePartner(item.id, item as unknown as Record<string, unknown>),
);

export const fallbackBenefits = seedBenefits.map((item) =>
  normalizeBenefit(item.id, item as unknown as Record<string, unknown>),
);
