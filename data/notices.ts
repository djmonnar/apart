import type { Notice } from "@/lib/types";

export const notices: Notice[] = [
  {
    id: "ntc-001",
    apartmentId: "apt-pradium",
    category: "service",
    title: "복지몰 서비스 오픈 안내",
    date: "2026-05-01",
    isNew: true,
    body: "진주역 스카이시티프라디움 입주민 전용 복지몰이 정식 오픈되었습니다. 입주민 인증 후 다양한 제휴 혜택을 누려보세요.",
  },
  {
    id: "ntc-002",
    apartmentId: "apt-pradium",
    category: "guide",
    title: "입주민 인증 절차 안내",
    date: "2026-05-01",
    isNew: true,
    body: "회원가입 시 동·호수·이름·휴대폰번호를 입력하시면 관리자 확인 후 승인됩니다. 승인 완료 후 혜택 사용이 가능합니다.",
  },
  {
    id: "ntc-003",
    apartmentId: "apt-pradium",
    category: "partner",
    title: "제휴업체 추가 안내",
    date: "2026-04-30",
    body: "뷰티/미용, 식음료, 건강/힐링 분야 제휴업체가 새롭게 추가되었습니다.",
  },
  {
    id: "ntc-004",
    apartmentId: "apt-pradium",
    category: "privacy",
    title: "개인정보 처리방침 변경 안내",
    date: "2026-04-25",
    body: "개인정보 처리방침이 일부 변경되었습니다. 자세한 내용은 개인정보처리방침 페이지에서 확인하실 수 있습니다.",
  },
];
