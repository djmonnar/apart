import type { Benefit, CategoryId, GroupBuy, GroupBuyStatus, User, UserProfile } from "./types";

/**
 * 입주민 전용 폐쇄몰 접근 권한 제어.
 *
 * 핵심 원칙: guest/pending 사용자에게는 "상세 혜택 데이터 자체"를 전달하지 않는다.
 * CSS blur 같은 시각적 가림이 아니라, sanitize 단계에서 상세 필드를 제거한
 * 객체만 컴포넌트로 내려보낸다. 실제 정제는 서버 컴포넌트에서 수행되므로
 * (lib/access-server.ts + 쿠키), 미승인 사용자의 브라우저로는 상세 데이터가
 * 애초에 전송되지 않는다.
 */

export type AccessLevel = "guest" | "pending" | "approved" | "admin";

/** 쿠키에 저장되는 권한 키 */
export const ACCESS_COOKIE = "danji-access";

type AccessProfile = UserProfile | User | null | undefined;

export function getUserAccessLevel(profile: AccessProfile): AccessLevel {
  if (!profile) return "guest";

  if ("role" in profile && "approvalStatus" in profile) {
    if (profile.role === "admin") return "admin";
    if (profile.approvalStatus === "approved") return "approved";
    return "pending";
  }

  if (profile.status === "approved") return "approved";
  return "pending";
}

export function parseAccessLevel(value: string | undefined | null): AccessLevel {
  if (value === "admin" || value === "approved" || value === "pending") {
    return value;
  }
  return "guest";
}

/** 권한 레벨 기준 — 승인 완료 입주민 또는 관리자만 true */
export function canViewByLevel(level: AccessLevel): boolean {
  return level === "approved" || level === "admin";
}

/** 혜택 상세를 볼 수 있는가 — 승인 완료 입주민/관리자만 true */
export function canViewBenefitDetail(profile: AccessProfile): boolean {
  return canViewByLevel(getUserAccessLevel(profile));
}

/** 쿠폰 발급 가능 여부 — 승인 완료 입주민/관리자만 true */
export function canIssueCoupon(profile: AccessProfile): boolean {
  return canViewByLevel(getUserAccessLevel(profile));
}

/**
 * 잠금(비공개) 상태에서 노출 가능한 최소 공개 정보.
 * 상세 혜택(title/summary/conditions/유효기간/usageLimit)은 포함하지 않는다.
 */
export interface PublicBenefitView {
  id: string;
  partnerId: string;
  category: CategoryId;
  locked: true;
}

export type FullBenefitView = Benefit & { locked: false };

export type BenefitView = PublicBenefitView | FullBenefitView;

/** 권한 레벨에 따라 혜택 데이터를 정제한다 (서버/클라이언트 공용 코어) */
export function sanitizeBenefitByLevel(
  benefit: Benefit,
  level: AccessLevel,
): BenefitView {
  if (canViewByLevel(level)) {
    return { ...benefit, locked: false };
  }
  return {
    id: benefit.id,
    partnerId: benefit.partnerId,
    category: benefit.category,
    locked: true,
  };
}

/**
 * 사용자 권한에 따라 혜택 데이터를 정제해 반환한다.
 * - approved/admin: 전체 혜택 정보 (locked: false)
 * - guest/pending/rejected/suspended: 식별 정보만, 상세 혜택 필드 제거
 */
export function sanitizeBenefitForUser(
  benefit: Benefit,
  profile: AccessProfile,
): BenefitView {
  return sanitizeBenefitByLevel(benefit, getUserAccessLevel(profile));
}

/** 잠금 상태별 UI 문구/동작 메타 */
export interface LockMeta {
  badge: string;
  lockMessage: string;
  buttonLabel: string;
  buttonHref?: string;
  buttonDisabled?: boolean;
}

export function getLockMeta(level: AccessLevel): LockMeta | null {
  if (canViewByLevel(level)) return null;
  if (level === "pending") {
    return {
      badge: "입주민 전용",
      lockMessage: "관리자 승인 완료 후 혜택 상세 내용을 확인할 수 있습니다.",
      buttonLabel: "승인 대기 중",
      buttonDisabled: true,
    };
  }
  return {
    badge: "입주민 전용",
    lockMessage: "입주민 인증 후 자세한 혜택을 확인할 수 있습니다.",
    buttonLabel: "로그인 후 혜택 확인",
    buttonHref: "/login",
  };
}

/* ------------------------------------------------------------------
 * 공동구매 접근 권한 — 혜택과 동일한 폐쇄몰 정책 적용
 * guest/pending: 제목·이미지·카테고리·간단설명·상태만 공개
 * approved/admin: 가격·조건·상세설명·업체정보·신청 가능
 * ------------------------------------------------------------------ */

/** 공동구매 상세를 볼 수 있는가 — 승인 완료 입주민/관리자만 true */
export function canViewGroupBuyDetail(profile: AccessProfile): boolean {
  return canViewByLevel(getUserAccessLevel(profile));
}

/** 공동구매 신청 가능 여부 — 승인 완료 입주민/관리자만 true */
export function canApplyGroupBuy(profile: AccessProfile): boolean {
  return canViewByLevel(getUserAccessLevel(profile));
}

/** 잠금 상태에서 노출 가능한 공동구매 최소 정보 */
export interface PublicGroupBuyView {
  id: string;
  title: string;
  category: string;
  image: string;
  imageFallback?: string;
  summary: string;
  status: GroupBuyStatus;
  isFeatured?: boolean;
  locked: true;
}

export type FullGroupBuyView = GroupBuy & { locked: false };
export type GroupBuyView = PublicGroupBuyView | FullGroupBuyView;

/** 권한 레벨에 따라 공동구매 데이터를 정제 (서버/클라이언트 공용 코어) */
export function sanitizeGroupBuyByLevel(
  gb: GroupBuy,
  level: AccessLevel,
): GroupBuyView {
  if (canViewByLevel(level)) {
    return { ...gb, locked: false };
  }
  return {
    id: gb.id,
    title: gb.title,
    category: gb.category,
    image: gb.image,
    imageFallback: gb.imageFallback,
    summary: gb.summary,
    status: gb.status,
    isFeatured: gb.isFeatured,
    locked: true,
  };
}

/** 사용자 권한에 따라 공동구매 데이터를 정제해 반환 */
export function sanitizeGroupBuyForUser(
  gb: GroupBuy,
  profile: AccessProfile,
): GroupBuyView {
  return sanitizeGroupBuyByLevel(gb, getUserAccessLevel(profile));
}

/** 공동구매 잠금 상태별 버튼 라벨/동작 */
export function getGroupBuyLockMeta(level: AccessLevel): LockMeta | null {
  if (canViewByLevel(level)) return null;
  if (level === "pending") {
    return {
      badge: "입주민 전용",
      lockMessage: "관리자 승인 완료 후 공동구매 참여가 가능합니다.",
      buttonLabel: "승인 후 참여 가능",
      buttonDisabled: true,
    };
  }
  return {
    badge: "입주민 전용",
    lockMessage: "입주민 인증 후 공동구매 조건을 확인할 수 있습니다.",
    buttonLabel: "로그인 후 확인",
    buttonHref: "/login",
  };
}
