import type { Benefit } from "@/lib/types";

export const benefits: Benefit[] = [
  {
    id: "bnf-firsthair",
    partnerId: "ptn-firsthair",
    category: "beauty",
    title: "펌/염색 20% 할인 + 전 시술 10% 할인",
    summary: ["펌/염색 20% 할인", "모든 시술 10% 할인"],
    conditions: [
      "입주민 인증 후 쿠폰 제시 시 적용",
      "타 할인 및 이벤트와 중복 적용 불가",
      "예약 방문 권장",
    ],
    validFrom: "2026-05-01",
    validTo: "2026-06-30",
    usageLimit: "1인 1회",
    highlight: true,
  },
  {
    id: "bnf-onemans",
    partnerId: "ptn-onemans",
    category: "beauty",
    title: "컷트 5,000원 할인 + 염색 10% 할인",
    summary: ["컷트 5,000원 할인", "염색 10% 할인"],
    conditions: [
      "입주민 인증 후 쿠폰 제시 시 적용",
      "현장 결제 시에만 적용",
    ],
    validFrom: "2026-05-01",
    validTo: "2026-06-30",
    usageLimit: "1인 1회",
    highlight: true,
  },
  {
    id: "bnf-surakan",
    partnerId: "ptn-surakan",
    category: "food",
    title: "정기배송 10% 할인 + 첫 방문 3,000원 할인",
    summary: ["정기배송 10% 할인", "첫 방문 3,000원 할인"],
    conditions: [
      "첫 방문 할인은 최초 1회 한정",
      "정기배송 할인은 3개월 이상 신청 시 적용",
    ],
    validFrom: "2026-05-01",
    validTo: "2026-07-31",
    usageLimit: "1인 1회",
    highlight: true,
  },
  {
    id: "bnf-3h",
    partnerId: "ptn-3h",
    category: "health",
    title: "무료 체험 1회 + 구매 시 사은품 증정",
    summary: ["무료 체험 1회 제공", "구매 시 사은품 증정"],
    conditions: [
      "무료 체험은 1인 1회 한정",
      "사은품은 제품 구매 고객 대상",
    ],
    validFrom: "2026-05-01",
    validTo: "2026-06-30",
    usageLimit: "1인 1회",
    highlight: true,
  },
  {
    id: "bnf-9992",
    partnerId: "ptn-9992",
    category: "food",
    title: "전 메뉴 2,000원 할인 + 포장 주문 혜택",
    summary: ["전 메뉴 2,000원 할인", "포장 주문 시 적용"],
    conditions: [
      "포장/매장 주문 모두 적용",
      "배달앱 주문 시에는 적용 불가",
    ],
    validFrom: "2026-05-01",
    validTo: "2026-06-30",
    usageLimit: "1인 1회",
    highlight: true,
  },
  {
    id: "bnf-skyfit",
    partnerId: "ptn-skyfit",
    category: "health",
    title: "등록 시 1개월 추가 + PT 10% 할인",
    summary: ["등록 시 1개월 추가 제공", "PT 10% 할인"],
    conditions: [
      "3개월 이상 등록 시 1개월 추가",
      "PT 할인은 10회 이상 등록 시 적용",
    ],
    validFrom: "2026-05-01",
    validTo: "2026-07-31",
    usageLimit: "1인 1회",
    highlight: true,
  },
];

export const getBenefit = (id: string) => benefits.find((b) => b.id === id);
export const getBenefitByPartner = (partnerId: string) =>
  benefits.find((b) => b.partnerId === partnerId);
