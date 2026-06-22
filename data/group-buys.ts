import type { GroupBuy } from "@/lib/types";
import { CLOSING_SOON_DAYS } from "@/lib/constants";

/** 공동구매 목업 — 입주민 전용 생활 혜택 공동구매 */
export const groupBuys: GroupBuy[] = [
  {
    id: "gb-aircon",
    apartmentId: "apt-pradium",
    title: "에어컨 분해 청소 공동구매",
    category: "생활/편의",
    image: "/assets/group-buy/group-aircon-cleaning.png",
    imageFallback: "/assets/spa-lounge.png",
    summary: "우리 단지 입주민을 위한 에어컨 분해 청소 공동구매",
    description:
      "여름철 필수, 전문 업체의 에어컨 완전 분해 청소를 입주민 공동구매가로 진행합니다. 벽걸이·스탠드 모두 가능하며, 단지 내 동시 방문으로 일정이 편리합니다.",
    originalPrice: "90,000원",
    groupPrice: "69,000원",
    targetCount: 10,
    currentCount: 7,
    startDate: "2026-06-10",
    endDate: "2026-06-30",
    status: "recruiting",
    partnerName: "클린에어 케어",
    terms: [
      "벽걸이형 기준 가격이며, 스탠드형은 현장 추가 견적이 발생할 수 있습니다.",
      "목표 인원 미달 시 공동구매가 자동 취소될 수 있습니다.",
      "방문 일정은 모집 마감 후 개별 안내됩니다.",
    ],
    schedule: [
      { label: "신청 모집", date: "2026-06-10 ~ 06-30" },
      { label: "일정 조율 안내", date: "2026-07-01" },
      { label: "방문 청소 진행", date: "2026-07-05 ~ 07-12" },
    ],
    isFeatured: true,
  },
  {
    id: "gb-banchan",
    apartmentId: "apt-pradium",
    title: "궁중수라간 반찬 정기배송 공동구매",
    category: "반찬/식품",
    image: "/assets/group-buy/group-banchan-delivery.png",
    imageFallback: "/assets/korean-table.png",
    summary: "궁중수라간 반찬 정기배송 입주민 공동구매",
    description:
      "단지 제휴 매장 궁중수라간의 정성 반찬을 4주 정기배송으로. 입주민이 함께 신청할수록 더 좋은 조건으로 제공됩니다.",
    originalPrice: "120,000원",
    groupPrice: "108,000원",
    targetCount: 20,
    currentCount: 13,
    startDate: "2026-06-12",
    endDate: "2026-06-28",
    status: "recruiting",
    partnerId: "ptn-surakan",
    partnerName: "궁중수라간",
    terms: [
      "4주 1회 배송 / 총 4회 기준 가격입니다.",
      "알러지 등 식단 요청은 신청 메모에 남겨주세요.",
      "배송은 단지 무인택배함으로 일괄 진행됩니다.",
    ],
    schedule: [
      { label: "신청 모집", date: "2026-06-12 ~ 06-28" },
      { label: "첫 배송 시작", date: "2026-07-02" },
    ],
    isFeatured: true,
  },
  {
    id: "gb-carwash",
    apartmentId: "apt-pradium",
    title: "차량 실내 살균 세차 공동구매",
    category: "자동차",
    image: "/assets/group-buy/group-carwash.png",
    imageFallback: "/assets/gift-box.png",
    summary: "지하주차장 방문 실내 살균 세차 입주민 공동구매",
    description:
      "출장 세차 업체가 단지 지하주차장으로 방문하여 차량 실내 살균·클리닝을 진행합니다. 수요조사 후 일정이 확정됩니다.",
    originalPrice: "80,000원",
    groupPrice: "60,000원",
    targetCount: 15,
    currentCount: 5,
    startDate: "2026-06-18",
    endDate: "2026-07-10",
    status: "survey",
    partnerName: "스카이 디테일링",
    terms: [
      "수요조사 단계로, 목표 인원 도달 시 모집으로 전환됩니다.",
      "차량 크기에 따라 가격이 조정될 수 있습니다.",
    ],
    schedule: [
      { label: "수요조사", date: "2026-06-18 ~ 07-10" },
      { label: "모집 전환 및 일정 확정", date: "미정" },
    ],
    isFeatured: true,
  },
  {
    id: "gb-curtain",
    apartmentId: "apt-pradium",
    title: "커튼·블라인드 방문견적 공동구매",
    category: "이사/청소/인테리어",
    image: "/assets/group-buy/group-curtain-blinds.png",
    imageFallback: "/assets/hair-salon.png",
    summary: "입주민 단체 방문견적으로 받는 커튼·블라인드 특별가",
    description:
      "전문 업체가 세대를 방문해 맞춤 견적을 제공합니다. 입주민 공동 진행으로 시공비 부담을 낮췄습니다.",
    originalPrice: "방문견적",
    groupPrice: "입주민 특별가",
    targetCount: 8,
    currentCount: 8,
    startDate: "2026-06-05",
    endDate: "2026-06-22",
    status: "achieved",
    partnerName: "프라디움 홈데코",
    terms: [
      "방문 견적 후 시공 여부는 자유롭게 선택하실 수 있습니다.",
      "목표 인원을 달성하여 단체 특별가가 적용됩니다.",
    ],
    schedule: [
      { label: "신청 모집", date: "2026-06-05 ~ 06-22" },
      { label: "세대별 방문 견적", date: "2026-06-25 ~ 06-30" },
    ],
    isFeatured: false,
  },
  {
    id: "gb-cleaning",
    apartmentId: "apt-pradium",
    title: "입주청소·줄눈 시공 공동구매",
    category: "이사/청소/인테리어",
    image: "/assets/group-buy/group-move-cleaning.png",
    imageFallback: "/assets/barbershop.png",
    summary: "신규 입주 세대를 위한 입주청소·줄눈 시공 공동구매",
    description:
      "입주 전 전문 청소와 욕실·주방 줄눈 시공을 한 번에. 입주민 공동 진행으로 합리적인 조건에 제공합니다.",
    originalPrice: "상담 후 안내",
    groupPrice: "입주민 특별가",
    targetCount: 10,
    currentCount: 3,
    startDate: "2026-06-20",
    endDate: "2026-07-15",
    status: "recruiting",
    partnerName: "프라디움 클린서비스",
    terms: [
      "평형·시공 범위에 따라 견적이 달라집니다.",
      "상담 후 개별 일정으로 진행됩니다.",
    ],
    schedule: [
      { label: "신청 모집", date: "2026-06-20 ~ 07-15" },
      { label: "상담 및 일정 조율", date: "2026-07-16 ~" },
    ],
    isFeatured: false,
  },
];

export const getGroupBuy = (id: string) =>
  groupBuys.find((g) => g.id === id);

/** 진행률(%) 계산 — 0~100 */
export function getProgressPercent(gb: {
  currentCount: number;
  targetCount: number;
}): number {
  if (gb.targetCount <= 0) return 0;
  return Math.min(100, Math.round((gb.currentCount / gb.targetCount) * 100));
}

/** 기준일 대비 마감 임박 여부 (모집중 + 마감 N일 이내) */
export function isClosingSoon(
  gb: { status: string; endDate: string },
  now: Date = new Date("2026-06-23"),
): boolean {
  if (gb.status !== "recruiting") return false;
  const end = new Date(gb.endDate);
  const diffDays = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= CLOSING_SOON_DAYS;
}

/** 종료 계열 상태 여부 */
export function isEnded(status: string): boolean {
  return status === "closed" || status === "done" || status === "canceled";
}
