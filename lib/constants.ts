import type { CategoryId, MemberStatus } from "./types";
import {
  LayoutGrid,
  UtensilsCrossed,
  Scissors,
  ShoppingBag,
  HeartPulse,
  GraduationCap,
  Truck,
  Car,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  icon: LucideIcon;
}

/** 카테고리 정의 (아이콘 포함) */
export const CATEGORIES: CategoryMeta[] = [
  { id: "food", label: "식음료", icon: UtensilsCrossed },
  { id: "beauty", label: "뷰티/미용", icon: Scissors },
  { id: "living", label: "생활/편의", icon: ShoppingBag },
  { id: "health", label: "건강/힐링", icon: HeartPulse },
  { id: "education", label: "교육/취미", icon: GraduationCap },
  { id: "moving", label: "이사/청소", icon: Truck },
  { id: "car", label: "자동차", icon: Car },
  { id: "etc", label: "기타", icon: MoreHorizontal },
];

/** "전체보기" 가상 필터 */
export const ALL_CATEGORY = {
  id: "all" as const,
  label: "전체보기",
  icon: LayoutGrid,
};

export const CATEGORY_LABEL: Record<CategoryId, string> = CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.id]: c.label }),
  {} as Record<CategoryId, string>,
);

/** 입주민 상태 표시 메타 */
export const MEMBER_STATUS_META: Record<
  MemberStatus,
  { label: string; tone: "neutral" | "warning" | "success" | "danger" }
> = {
  guest: { label: "미인증", tone: "neutral" },
  pending: { label: "승인 대기", tone: "warning" },
  approved: { label: "인증 완료", tone: "success" },
  rejected: { label: "반려", tone: "danger" },
};

export const SERVICE_NAME = "진주역 스카이시티프라디움 입주민 복지몰";
export const INTERNAL_NAME = "단지라운지";

import type {
  GroupBuyStatus,
  GroupBuyApplicationStatus,
} from "./types";

type Tone = "neutral" | "info" | "warning" | "success" | "danger";

/** 공동구매 상태 표시 메타 */
export const GROUP_BUY_STATUS_META: Record<
  GroupBuyStatus,
  { label: string; tone: Tone }
> = {
  survey: { label: "수요조사중", tone: "info" },
  recruiting: { label: "모집중", tone: "success" },
  achieved: { label: "목표달성", tone: "warning" },
  closed: { label: "마감", tone: "neutral" },
  done: { label: "진행완료", tone: "neutral" },
  canceled: { label: "취소", tone: "danger" },
};

/** 공동구매 신청 상태 표시 메타 */
export const GROUP_BUY_APPLICATION_META: Record<
  GroupBuyApplicationStatus,
  { label: string; tone: Tone }
> = {
  applied: { label: "신청완료", tone: "info" },
  checking: { label: "확인중", tone: "warning" },
  confirmed: { label: "확정", tone: "success" },
  canceled: { label: "취소", tone: "danger" },
};

/** 톤 → Tailwind 클래스 (뱃지용) */
export const TONE_CLASS: Record<Tone, string> = {
  neutral: "bg-sand-200 text-brand-500",
  info: "bg-sky-100 text-sky-700",
  warning: "bg-amber-100 text-amber-700",
  success: "bg-emerald-100 text-emerald-700",
  danger: "bg-rose-100 text-rose-600",
};

/** 공동구매 목록 상태 탭 (마감임박은 파생 필터) */
export type GroupBuyTab =
  | "all"
  | "survey"
  | "recruiting"
  | "achieved"
  | "closing"
  | "ended";

export const GROUP_BUY_TABS: { id: GroupBuyTab; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "survey", label: "수요조사중" },
  { id: "recruiting", label: "모집중" },
  { id: "achieved", label: "목표달성" },
  { id: "closing", label: "마감임박" },
  { id: "ended", label: "종료" },
];

/** 마감 임박 기준 (일) */
export const CLOSING_SOON_DAYS = 4;
