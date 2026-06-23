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
  | "rejected" // 반려
  | "suspended"; // 이용 정지

export type UserRole = "resident" | "admin" | "partner";

export type ApprovalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "suspended";

export type CmsContentStatus = "active" | "paused" | "draft";

export type BenefitType =
  | "discount"
  | "gift"
  | "service"
  | "group"
  | "other";

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  nickname?: string;
  phone: string;
  building: string;
  unit: string;
  apartmentId: "pradium";
  role: UserRole;
  approvalStatus: ApprovalStatus;
  createdAt: unknown;
  approvedAt: unknown | null;
  approvedBy: string | null;
}

/** 쿠폰 사용 상태 */
export type CouponStatus = "issued" | "used" | "expired" | "cancelled";

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
  email?: string;
}

export interface Partner {
  id: string;
  apartmentId: string;
  slug: string;
  name: string;
  category: CategoryId;
  /** public/assets 내 이미지 경로 */
  image: string;
  imageUrl: string;
  region: string; // 위치 (예: 진주시 신안동)
  /** 한 줄 소개 */
  tagline: string;
  shortDescription: string;
  description: string;
  phone?: string;
  address: string;
  status: CmsContentStatus;
  isFeatured: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
  partneredAt: string; // 제휴 시작일
  /** 추천(특별가) 노출 여부 */
  featured?: boolean;
}

export interface Benefit {
  id: string;
  partnerId: string;
  partnerName?: string;
  partnerSlug?: string;
  category: CategoryId;
  title: string; // 혜택명 (예: 컷트 20% 할인)
  /** 카드에 노출할 요약 혜택 (1~2줄) */
  summary: string[];
  summaryText?: string;
  description: string;
  benefitType: BenefitType;
  originalPrice: string;
  benefitPrice: string;
  discountText: string;
  /** 상세 이용 조건 */
  conditions: string[];
  usageGuide: string[];
  imageUrl: string;
  status: CmsContentStatus;
  isFeatured: boolean;
  validFrom: string;
  validTo: string;
  /** 1인 사용 제한 (예: 1회) */
  usageLimit: string;
  monthlyLimitPerUser: number;
  isMonthlyLimited: boolean;
  resetDay: 1;
  createdAt?: unknown;
  updatedAt?: unknown;
  highlight?: boolean; // 메인 추천 노출
}

export interface Coupon {
  id: string;
  code: string;
  apartmentId: "pradium";
  userId: string;
  benefitId: string;
  benefitTitle: string;
  partnerId: string;
  partnerName: string;
  status: CouponStatus;
  issuedAt: unknown;
  expiresAt: unknown;
  usedAt: unknown | null;
  usedByPartnerId: string | null;
  usedByPartnerName: string | null;
}

export type BenefitRedemptionStatus = "ready" | "used" | "cancelled";

export interface BenefitRedemption {
  id: string;
  apartmentId: "pradium";
  userId: string;
  benefitId: string;
  benefitTitle: string;
  partnerId: string;
  partnerName: string;
  periodKey: string;
  status: BenefitRedemptionStatus;
  createdAt: unknown;
  usedAt: unknown | null;
  usedBy: "partner-on-user-phone" | null;
  monthlyLimit: number;
}

export interface BenefitUsagePeriod {
  id: string;
  userId: string;
  benefitId: string;
  apartmentId: "pradium";
  periodKey: string;
  usedCount: number;
  monthlyLimit: number;
  lastUsedAt: unknown | null;
  updatedAt: unknown | null;
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

/** 공동구매 진행 상태 */
export type GroupBuyStatus =
  | "survey" // 수요조사중
  | "recruiting" // 모집중
  | "achieved" // 목표달성
  | "closed" // 마감
  | "done" // 진행완료
  | "canceled"; // 취소

/** 진행 일정 단계 */
export interface GroupBuyScheduleStep {
  label: string;
  date?: string;
}

export interface GroupBuy {
  id: string;
  apartmentId: string;
  title: string;
  /** 표시용 카테고리 라벨 (예: 생활/편의, 반찬/식품) */
  category: string;
  /** 대표 이미지(예정 파일). 없으면 imageFallback → 기본 fallback UI 순으로 표시 */
  image: string;
  /** image 로드 실패 시 사용할 기존 이미지 */
  imageFallback?: string;
  summary: string;
  description: string;
  /** 가격은 "90,000원" 또는 "방문견적" 등 자유 문자열 */
  originalPrice: string;
  groupPrice: string;
  targetCount: number;
  currentCount: number;
  startDate: string;
  endDate: string;
  status: GroupBuyStatus;
  partnerId?: string;
  partnerName: string;
  terms: string[];
  schedule: GroupBuyScheduleStep[];
  isFeatured?: boolean;
  /** 관리자가 수동으로 잠근 경우 (접근 권한과 별개) */
  isLocked?: boolean;
}

/** 공동구매 신청 상태 */
export type GroupBuyApplicationStatus =
  | "applied" // 신청완료
  | "checking" // 확인중
  | "confirmed" // 확정
  | "cancelled"; // 취소

export interface GroupBuyApplication {
  id: string;
  groupBuyId: string;
  groupBuyTitle: string;
  apartmentId: "pradium";
  userId: string;
  userName: string;
  phone: string;
  building: string; // 동
  unit: string; // 호수
  memo: string;
  status: GroupBuyApplicationStatus;
  createdAt: unknown;
  updatedAt: unknown;
}

export type ApartmentInquiryRole =
  | "residentRepresentative"
  | "managementOffice"
  | "resident"
  | "etc";

export type ApartmentInquiryStatus = "new" | "checking" | "done";

export interface ApartmentInquiry {
  id: string;
  apartmentName: string;
  region: string;
  householdCount: string;
  contactName: string;
  role: ApartmentInquiryRole;
  phone: string;
  message: string;
  internalMemo: string;
  status: ApartmentInquiryStatus;
  createdAt: unknown;
  updatedAt: unknown;
}

export type PartnerInquiryStatus = "new" | "checking" | "done";

export interface PartnerInquiry {
  id: string;
  businessName: string;
  category: string;
  contactName: string;
  phone: string;
  region: string;
  message: string;
  internalMemo: string;
  status: PartnerInquiryStatus;
  createdAt: unknown;
  updatedAt: unknown;
}

export type CommunityCategory =
  | "free"
  | "group_request"
  | "market"
  | "local_info";

export type CommunityContentStatus = "published" | "hidden" | "deleted";

export type CommunityReportReason =
  | "spam"
  | "abuse"
  | "privacy"
  | "commercial"
  | "etc";

export type CommunityTag =
  | "question"
  | "review"
  | "info"
  | "chat"
  | "proposal"
  | "survey"
  | "request"
  | "in_progress"
  | "done"
  | "share"
  | "sale"
  | "wanted"
  | "reserved"
  | "restaurant"
  | "medical"
  | "academy"
  | "tip"
  | "recommend";

export interface CommunityPost {
  id: string;
  apartmentId: "pradium";
  category: CommunityCategory;
  tags: CommunityTag[];
  title: string;
  content: string;
  authorId: string;
  authorNickname: string;
  status: CommunityContentStatus;
  isNotice: boolean;
  isPinned: boolean;
  commentCount: number;
  likeCount: number;
  reportCount: number;
  viewCount: number;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface CommunityComment {
  id: string;
  postId: string;
  apartmentId: "pradium";
  content: string;
  authorId: string;
  authorNickname: string;
  status: CommunityContentStatus;
  reportCount: number;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface CommunityReport {
  id: string;
  targetType: "post" | "comment";
  targetId: string;
  postId: string;
  reporterId: string;
  reason: CommunityReportReason;
  message: string;
  createdAt: unknown;
}
