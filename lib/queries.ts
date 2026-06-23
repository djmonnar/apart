import "server-only";

import { getFirebaseAdminDb } from "./firebase-admin";
import {
  BENEFITS_COLLECTION,
  PARTNERS_COLLECTION,
  fallbackBenefits,
  fallbackPartners,
  normalizeBenefit,
  normalizePartner,
} from "./benefit-cms";
import type { Benefit, CategoryId, Partner } from "./types";

export interface BenefitWithPartner {
  benefit: Benefit;
  partner: Partner;
}

function joinBenefitsWithPartners(
  benefits: Benefit[],
  partners: Partner[],
): BenefitWithPartner[] {
  const partnerById = new Map(partners.map((partner) => [partner.id, partner]));
  return benefits
    .map((benefit) => {
      const partner = partnerById.get(benefit.partnerId);
      return partner ? { benefit, partner } : null;
    })
    .filter((item): item is BenefitWithPartner => item !== null);
}

function fallbackActiveBenefitsWithPartner() {
  return joinBenefitsWithPartners(
    fallbackBenefits.filter((benefit) => benefit.status === "active"),
    fallbackPartners.filter((partner) => partner.status === "active"),
  );
}

/** 혜택 + 업체를 합친 뷰 모델. Firestore active 문서를 우선 사용한다. */
export async function getBenefitsWithPartner(): Promise<BenefitWithPartner[]> {
  try {
    const db = getFirebaseAdminDb();
    const [partnersSnap, benefitsSnap] = await Promise.all([
      db
        .collection(PARTNERS_COLLECTION)
        .where("status", "==", "active")
        .get(),
      db
        .collection(BENEFITS_COLLECTION)
        .where("status", "==", "active")
        .get(),
    ]);

    const partners = partnersSnap.docs.map((item) =>
      normalizePartner(item.id, item.data()),
    );
    const benefits = benefitsSnap.docs.map((item) =>
      normalizeBenefit(item.id, item.data()),
    );
    const joined = joinBenefitsWithPartners(benefits, partners);
    return joined.length > 0 ? joined : fallbackActiveBenefitsWithPartner();
  } catch {
    return fallbackActiveBenefitsWithPartner();
  }
}

export async function getBenefitWithPartner(
  id: string,
): Promise<BenefitWithPartner | null> {
  try {
    const db = getFirebaseAdminDb();
    const benefitSnap = await db.collection(BENEFITS_COLLECTION).doc(id).get();
    if (!benefitSnap.exists) return null;

    const benefit = normalizeBenefit(benefitSnap.id, benefitSnap.data() ?? {});
    if (benefit.status !== "active") return null;

    const partnerSnap = await db
      .collection(PARTNERS_COLLECTION)
      .doc(benefit.partnerId)
      .get();
    if (!partnerSnap.exists) return null;

    const partner = normalizePartner(partnerSnap.id, partnerSnap.data() ?? {});
    if (partner.status !== "active") return null;

    return { benefit, partner };
  } catch {
    const item = fallbackActiveBenefitsWithPartner().find(
      ({ benefit }) => benefit.id === id,
    );
    return item ?? null;
  }
}

/** 메인 추천 혜택 */
export async function getFeaturedBenefits(): Promise<BenefitWithPartner[]> {
  const items = await getBenefitsWithPartner();
  return items.filter(
    ({ benefit, partner }) => benefit.isFeatured || partner.isFeatured,
  );
}

export function filterByCategory(
  list: BenefitWithPartner[],
  category: CategoryId | "all",
): BenefitWithPartner[] {
  if (category === "all") return list;
  return list.filter(({ partner }) => partner.category === category);
}
