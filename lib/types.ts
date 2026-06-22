// 도메인 타입 정의 — 추후 실제 백엔드(API/Firestore) 연동 시 그대로 재사용 가능하도록 분리

/** 혜택 카테고리 식별자 */
export type CategoryId =
  | "food"
  | "beauty"
  | "living"
  | "health"
  | "education"
  | "moving"
  | "car"
  | "etc";

/** 입주민(소비자) 인증/승인 상태 */
export type MemberStatus =
  | "guest" // 비로그인
  | "pending" // 승인 대기
  | "approved" // 승인 완료
  | "rejected"; // 반려

/** 쿠폰 사용 상태 */
export type CouponStatus = "issued" | "used" | "expired";

export interface Apartment {
  id: string;
  name: string; // 진주역 스카이시티프라디움
  shortName: string; // 스카이시티프라디움
  address: string;
  customerCenter: string;
  operatingHours: string;
}

export interface User {
  id: string;
  apartmentId: string;
  name: string;
  dong: string; // 동
  ho: string; // 호수
  phone: string;
  status: MemberStatus;
  appliedAt: string; // 가입 신청일 (ISO)
  approvedAt?: string;
  lastLoginAt?: string;
}

export interface Partner {
  id: string;
  apartmentId: string;
  name: string;
  category: CategoryId;
  /** public/assets 내 이미지 경로 */
  image: string;
  region: string; // 위치 (예: 진주시 신안동)
  /** 한 줄 소개 */
  tagline: string;
  description: string;
  phone?: string;
  partneredAt: string; // 제휴 시작일
  /** 추천(특별가) 노출 여부 */
  featured?: boolean;
}

export interface Benefit {
  id: string;
  partnerId: string;
  category: CategoryId;
  title: string; // 혜택명 (예: 컷트 20% 할인)
  /** 카드에 노출할 요약 혜택 (1~2줄) */
  summary: string[];
  /** 상세 이용 조건 */
  conditions: string[];
  validFrom: string;
  validTo: string;
  /** 1인 사용 제한 (예: 1회) */
  usageLimit: string;
  highlight?: boolean; // 메인 추천 노출
}

export interface Coupon {
  id: string;
  code: string; // 1회용 쿠폰번호 (예: PRD-2026-ABCD-1234)
  benefitId: string;
  userId: string;
  status: CouponStatus;
  issuedAt: string;
  usedAt?: string;
  /** 사용 처리한 업체 */
  partnerId: string;
}

export interface Notice {
  id: string;
  apartmentId: string;
  category: "service" | "guide" | "partner" | "privacy" | "event";
  title: string;
  date: string;
  isNew?: boolean;
  body?: string;
}
