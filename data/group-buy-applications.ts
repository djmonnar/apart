import type { GroupBuyApplication } from "@/lib/types";

/** 공동구매 신청 목업 — 실데이터 전환 전 관리자 화면 fallback 참고용 */
export const groupBuyApplications: GroupBuyApplication[] = [
  {
    id: "gb-aircon_usr-hong",
    groupBuyId: "gb-aircon",
    groupBuyTitle: "에어컨 분해 청소 공동구매",
    apartmentId: "pradium",
    userId: "usr-hong",
    userName: "홍길동",
    phone: "010-1234-5678",
    building: "102",
    unit: "1203",
    memo: "스탠드형 1대 포함입니다.",
    status: "confirmed",
    createdAt: "2026-06-20",
    updatedAt: "2026-06-20",
  },
  {
    id: "gb-aircon_usr-lee",
    groupBuyId: "gb-aircon",
    groupBuyTitle: "에어컨 분해 청소 공동구매",
    apartmentId: "pradium",
    userId: "usr-lee",
    userName: "이서연",
    phone: "010-2345-6789",
    building: "104",
    unit: "701",
    memo: "",
    status: "checking",
    createdAt: "2026-06-21",
    updatedAt: "2026-06-21",
  },
  {
    id: "gb-banchan_usr-park",
    groupBuyId: "gb-banchan",
    groupBuyTitle: "궁중수라간 반찬 정기배송 공동구매",
    apartmentId: "pradium",
    userId: "usr-park",
    userName: "박지은",
    phone: "010-3456-7890",
    building: "103",
    unit: "1402",
    memo: "견과류 알러지 있어요.",
    status: "applied",
    createdAt: "2026-06-22",
    updatedAt: "2026-06-22",
  },
];

export const getApplicationsByGroupBuy = (groupBuyId: string) =>
  groupBuyApplications.filter((a) => a.groupBuyId === groupBuyId);
