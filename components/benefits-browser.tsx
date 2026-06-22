"use client";

import { useMemo, useState } from "react";
import { Search, SearchX } from "lucide-react";
import { CategoryNav } from "./category-nav";
import { BenefitCard } from "./benefit-card";
import { getBenefitsWithPartner, filterByCategory } from "@/lib/queries";
import type { CategoryId } from "@/lib/types";

export function BenefitsBrowser({
  initialCategory = "all",
}: {
  initialCategory?: CategoryId | "all";
}) {
  const all = useMemo(() => getBenefitsWithPartner(), []);
  const [category, setCategory] = useState<CategoryId | "all">(initialCategory);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    let list = filterByCategory(all, category);
    const q = query.trim();
    if (q) {
      list = list.filter(
        ({ partner, benefit }) =>
          partner.name.includes(q) ||
          benefit.title.includes(q) ||
          benefit.summary.some((s) => s.includes(q)),
      );
    }
    return list;
  }, [all, category, query]);

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
            placeholder="업체명 또는 혜택을 검색하세요"
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
          {results.map(({ benefit, partner }) => (
            <BenefitCard key={benefit.id} benefit={benefit} partner={partner} />
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
