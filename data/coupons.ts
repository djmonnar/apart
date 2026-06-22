import type { Coupon } from "@/lib/types";

/** 쿠폰 목업 — 마이페이지/업체 인증/관리자 사용내역 데모용 */
export const coupons: Coupon[] = [
  {
    id: "cpn-0001",
    code: "PRD-2026-ABCD-1234",
    benefitId: "bnf-firsthair",
    userId: "usr-hong",
    status: "issued",
    issuedAt: "2026-06-22",
    partnerId: "ptn-firsthair",
  },
  {
    id: "cpn-0002",
    code: "PRD-2026-WXYZ-7788",
    benefitId: "bnf-9992",
    userId: "usr-hong",
    status: "used",
    issuedAt: "2026-06-10",
    usedAt: "2026-06-12",
    partnerId: "ptn-9992",
  },
];

export const getCouponByCode = (code: string) =>
  coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());

export const getCouponsByUser = (userId: string) =>
  coupons.filter((c) => c.userId === userId);

/** 1회용 쿠폰번호 생성기 (목업) */
export function generateCouponCode(): string {
  const block = () =>
    Array.from({ length: 4 }, () =>
      "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".charAt(
        Math.floor(Math.random() * 32),
      ),
    ).join("");
  return `PRD-2026-${block()}-${block()}`;
}
