import { benefits } from "@/data/benefits";
import { partners } from "@/data/partners";

export const seedPartners = partners.map((partner) => ({
  id: partner.id,
  slug: partner.slug,
  name: partner.name,
  category: partner.category,
  description: partner.description,
  shortDescription: partner.shortDescription,
  phone: partner.phone ?? "",
  address: partner.address,
  region: partner.region,
  imageUrl: partner.imageUrl,
  status: partner.status,
  isFeatured: partner.isFeatured,
}));

export const seedBenefits = benefits.map((benefit) => ({
  id: benefit.id,
  partnerId: benefit.partnerId,
  partnerName: benefit.partnerName ?? "",
  partnerSlug: benefit.partnerSlug ?? "",
  category: benefit.category,
  title: benefit.title,
  summary: benefit.summaryText ?? benefit.summary.join(", "),
  description: benefit.description,
  benefitType: benefit.benefitType,
  originalPrice: benefit.originalPrice,
  benefitPrice: benefit.benefitPrice,
  discountText: benefit.discountText,
  conditions: benefit.conditions,
  usageGuide: benefit.usageGuide,
  imageUrl: benefit.imageUrl,
  status: benefit.status,
  isFeatured: benefit.isFeatured,
  monthlyLimitPerUser: benefit.monthlyLimitPerUser,
  isMonthlyLimited: benefit.isMonthlyLimited,
  resetDay: 1,
}));
