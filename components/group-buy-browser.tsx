"use client";

import { useMemo, useState } from "react";
import { PackageOpen } from "lucide-react";
import { GroupBuyStatusTabs } from "./group-buy-status-tabs";
import { GroupBuyCard } from "./group-buy-card";
import type { AccessLevel, GroupBuyView } from "@/lib/access";
import type { GroupBuyTab } from "@/lib/constants";

export interface GroupBuyItem {
  view: GroupBuyView;
  closingSoon: boolean;
}

const ENDED = new Set(["closed", "done", "canceled"]);

function matchesTab(item: GroupBuyItem, tab: GroupBuyTab): boolean {
  const { view, closingSoon } = item;
  switch (tab) {
    case "all":
      return true;
    case "closing":
      return closingSoon;
    case "ended":
      return ENDED.has(view.status);
    default:
      return view.status === tab;
  }
}

export function GroupBuyBrowser({
  items,
  level,
}: {
  items: GroupBuyItem[];
  level: AccessLevel;
}) {
  const [tab, setTab] = useState<GroupBuyTab>("all");

  const counts = useMemo(() => {
    const c: Partial<Record<GroupBuyTab, number>> = {
      all: items.length,
      survey: 0,
      recruiting: 0,
      achieved: 0,
      closing: 0,
      ended: 0,
    };
    for (const item of items) {
      if (item.view.status === "survey") c.survey!++;
      if (item.view.status === "recruiting") c.recruiting!++;
      if (item.view.status === "achieved") c.achieved!++;
      if (item.closingSoon) c.closing!++;
      if (ENDED.has(item.view.status)) c.ended!++;
    }
    return c;
  }, [items]);

  const results = useMemo(
    () => items.filter((item) => matchesTab(item, tab)),
    [items, tab],
  );

  return (
    <div>
      <div className="mb-6">
        <GroupBuyStatusTabs active={tab} onSelect={setTab} counts={counts} />
      </div>

      {results.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map(({ view, closingSoon }) => (
            <GroupBuyCard
              key={view.id}
              view={view}
              level={level}
              closingSoon={closingSoon}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line bg-white py-16 text-center">
          <PackageOpen className="h-8 w-8 text-brand-300" aria-hidden />
          <p className="text-sm text-ink-soft">
            해당 상태의 공동구매가 없습니다.
          </p>
        </div>
      )}
    </div>
  );
}
