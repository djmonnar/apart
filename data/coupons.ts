import type { Coupon } from "@/lib/types";

/** 쿠폰 목업 — 마이페이지/업체 인증/관리자 사용내역 데모용 */
export const coupons: Coupon[] = [
  {
    id: "cpn-0001",
    code: "482913",
    apartmentId: "pradium",
    userId: "usr-hong",
    benefitId: "bnf-firsthair",
    benefitTitle: "첫염색 20% 할인 + 전 시술 10% 할인",
    partnerId: "ptn-firsthair",
    partnerName: "퍼스트헤어",
    status: "issued",
    issuedAt: "2026-06-22",
    expiresAt: "2026-06-23",
    usedAt: null,
    usedByPartnerId: null,
    usedByPartnerName: null,
  },
  {
    id: "cpn-0002",
    code: "391842",
    apartmentId: "pradium",
    userId: "usr-hong",
    benefitId: "bnf-9992",
    benefitTitle: "인기 메뉴 2,000원 할인 + 포장 주문 혜택",
    partnerId: "ptn-9992",
    partnerName: "9992 프라지움점",
    status: "used",
    issuedAt: "2026-06-10",
    expiresAt: "2026-06-11",
    usedAt: "2026-06-12",
    usedByPartnerId: "ptn-9992",
    usedByPartnerName: "9992 프라지움점",
  },
];

export const getCouponByCode = (code: string) =>
  coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());

export const getCouponsByUser = (userId: string) =>
  coupons.filter((c) => c.userId === userId);

/** 1회용 쿠폰번호 생성기 (목업) */
export function generateCouponCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
