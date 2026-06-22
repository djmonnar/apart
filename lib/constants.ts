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
