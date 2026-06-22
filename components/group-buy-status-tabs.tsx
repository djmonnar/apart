"use client";

import { GROUP_BUY_TABS, type GroupBuyTab } from "@/lib/constants";

export function GroupBuyStatusTabs({
  active,
  onSelect,
  counts,
}: {
  active: GroupBuyTab;
  onSelect: (tab: GroupBuyTab) => void;
  counts?: Partial<Record<GroupBuyTab, number>>;
}) {
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
      {GROUP_BUY_TABS.map((tab) => {
        const isActive = active === tab.id;
        const count = counts?.[tab.id];
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            aria-pressed={isActive}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              isActive
                ? "bg-brand-600 text-cream-50 shadow-soft"
                : "border border-line bg-white text-ink-soft hover:border-brand-200 hover:text-brand-700"
            }`}
          >
            {tab.label}
            {typeof count === "number" && (
              <span
                className={`ml-1.5 text-xs ${
                  isActive ? "text-cream-200" : "text-ink-faint"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
