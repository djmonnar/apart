"use client";

import Link from "next/link";
import { CATEGORIES, ALL_CATEGORY } from "@/lib/constants";
import type { CategoryId } from "@/lib/types";

type CategoryKey = CategoryId | "all";

interface CategoryNavProps {
  /** 현재 선택값 (필터 모드) */
  active?: CategoryKey;
  /** 제공 시 버튼(필터) 모드, 미제공 시 /benefits 링크 모드 */
  onSelect?: (id: CategoryKey) => void;
}

export function CategoryNav({ active = "all", onSelect }: CategoryNavProps) {
  const items = [ALL_CATEGORY, ...CATEGORIES];

  return (
    <div className="flex gap-2.5 overflow-x-auto pb-2 [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:overflow-visible md:grid-cols-5 lg:grid-cols-9">
      {items.map((item) => {
        const isActive = active === item.id;
        const Icon = item.icon;
        const inner = (
          <span className="flex flex-col items-center gap-2">
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ${
                isActive
                  ? "bg-brand-600 text-cream-50"
                  : "bg-sand-100 text-brand-500 group-hover:bg-brand-100"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <span
              className={`text-xs font-medium ${
                isActive ? "text-brand-700" : "text-ink-soft"
              }`}
            >
              {item.label}
            </span>
          </span>
        );

        const cls =
          "group flex min-w-[64px] shrink-0 flex-col items-center rounded-2xl px-2 py-3 transition-colors hover:bg-cream-200/60 sm:min-w-0";

        return onSelect ? (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id as CategoryKey)}
            className={cls}
            aria-pressed={isActive}
          >
            {inner}
          </button>
        ) : (
          <Link
            key={item.id}
            href={
              item.id === "all" ? "/benefits" : `/benefits?category=${item.id}`
            }
            className={cls}
          >
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
