"use client";

import { useMemo, useState } from "react";
import { Search, SearchX } from "lucide-react";
import { CategoryNav } from "./category-nav";
import { BenefitCard } from "./benefit-card";
import { type AccessLevel, type BenefitView, canViewByLevel } from "@/lib/access";
import type { CategoryId, Partner } from "@/lib/types";

export interface BrowserItem {
  view: BenefitView;
  partner: Partner;
}

/**
 * 목록/검색 인터랙션 담당(클라이언트). 단, 데이터는 서버에서 권한별로
 * 정제된 `items`를 받으므로, 미승인 사용자에게는 상세 혜택이 전달되지 않는다.
 */
export function BenefitsBrowser({
  items,
  level,
  initialCategory = "all",
}: {
  items: BrowserItem[];
  level: AccessLevel;
  initialCategory?: CategoryId | "all";
}) {
  const canViewDetail = canViewByLevel(level);
  const [category, setCategory] = useState<CategoryId | "all">(initialCategory);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    let list =
      category === "all"
        ? items
        : items.filter((it) => it.partner.category === category);

    const q = query.trim();
    if (q) {
      list = list.filter(({ partner, view }) => {
        // 미승인 사용자는 업체명/소개만 검색 (할인 정보 비노출)
        if (partner.name.includes(q) || partner.tagline.includes(q)) return true;
        if (!canViewDetail || view.locked) return false;
        return (
          view.title.includes(q) || view.summary.some((s) => s.includes(q))
        );
      });
    }
    return list;
  }, [items, category, query, canViewDetail]);

  return (
    <div>
      <div className="mb-6">
        <label className="relative block max-w-md">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              canViewDetail
                ? "업체명 또는 혜택을 검색하세요"
                : "업체명으로 검색하세요"
            }
            className="w-full rounded-xl border border-line bg-white py-3 pl-11 pr-4 text-sm text-ink shadow-soft outline-none transition-colors placeholder:text-ink-faint focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
            aria-label="혜택 검색"
          />
        </label>
      </div>

      <div className="mb-8 rounded-2xl border border-line bg-white p-4 shadow-soft">
        <CategoryNav active={category} onSelect={setCategory} />
      </div>

      <p className="mb-4 text-sm text-ink-soft">
        총 <span className="font-bold text-brand-700">{results.length}</span>개의
        혜택
      </p>

      {results.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map(({ view, partner }) => (
            <BenefitCard
              key={view.id}
              view={view}
              partner={partner}
              level={level}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line bg-white py-16 text-center">
          <SearchX className="h-8 w-8 text-brand-300" aria-hidden />
          <p className="text-sm text-ink-soft">
            조건에 맞는 혜택이 없습니다.
            <br />
            다른 카테고리나 검색어를 시도해 보세요.
          </p>
        </div>
      )}
    </div>
  );
}
