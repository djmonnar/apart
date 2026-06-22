import { partners } from "@/data/partners";
import { benefits } from "@/data/benefits";
import type { Benefit, CategoryId, Partner } from "./types";

export interface BenefitWithPartner {
  benefit: Benefit;
  partner: Partner;
}

/** 혜택 + 업체를 합친 뷰 모델 */
export function getBenefitsWithPartner(): BenefitWithPartner[] {
  return benefits
    .map((benefit) => {
      const partner = partners.find((p) => p.id === benefit.partnerId);
      return partner ? { benefit, partner } : null;
    })
    .filter((x): x is BenefitWithPartner => x !== null);
}

/** 메인 추천(특별가) 혜택 */
export function getFeaturedBenefits(): BenefitWithPartner[] {
  return getBenefitsWithPartner().filter(
    ({ benefit, partner }) => benefit.highlight || partner.featured,
  );
}

export function filterByCategory(
  list: BenefitWithPartner[],
  category: CategoryId | "all",
): BenefitWithPartner[] {
  if (category === "all") return list;
  return list.filter(({ partner }) => partner.category === category);
}
