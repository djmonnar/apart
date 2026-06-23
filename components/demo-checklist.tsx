"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle, Loader2, AlertCircle } from "lucide-react";
import { subscribePartners, subscribeBenefits } from "@/lib/benefit-cms";
import type { Benefit, Partner } from "@/lib/types";

const MANUAL_STORAGE_KEY = "pradium-demo-checklist";

const MANUAL_ITEMS = [
  { id: "resident", label: "테스트 입주민 계정 approved" },
  { id: "benefit-used", label: "혜택 사용 1건 테스트 완료" },
  { id: "group-buy", label: "공동구매 신청 1건 테스트 완료" },
  { id: "apartment-inquiry", label: "아파트 도입 문의 1건 테스트 완료" },
] as const;

export function DemoChecklist() {
  const [partners, setPartners] = useState<Partner[] | null>(null);
  const [benefits, setBenefits] = useState<Benefit[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const unsubP = subscribePartners(setPartners, (e) => setError(e.message));
    const unsubB = subscribeBenefits(setBenefits, (e) => setError(e.message));
    try {
      const raw = window.localStorage.getItem(MANUAL_STORAGE_KEY);
      if (raw) setManual(JSON.parse(raw));
    } catch {
      /* noop */
    }
    return () => {
      unsubP();
      unsubB();
    };
  }, []);

  const toggleManual = (id: string) =>
    setManual((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        window.localStorage.setItem(MANUAL_STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* noop */
      }
      return next;
    });

  const loading = partners === null || benefits === null;
  const partnerCount = partners?.length ?? 0;
  const activeBenefitCount =
    benefits?.filter((b) => b.status === "active").length ?? 0;

  const autoItems = useMemo(
    () => [
      {
        id: "partners",
        label: "업체 5개 이상 등록",
        done: partnerCount >= 5,
        detail: `현재 ${partnerCount}개 등록`,
      },
      {
        id: "benefits",
        label: "혜택 5개 이상 active",
        done: activeBenefitCount >= 5,
        detail: `현재 active ${activeBenefitCount}개`,
      },
    ],
    [partnerCount, activeBenefitCount],
  );

  const totalDone =
    autoItems.filter((i) => i.done).length +
    MANUAL_ITEMS.filter((i) => manual[i.id]).length;
  const total = autoItems.length + MANUAL_ITEMS.length;

  return (
    <div className="max-w-2xl">
      {/* 진행도 */}
      <div className="card-base mb-6 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">시연 준비 진행도</p>
          <p className="text-sm font-bold text-brand-700">
            {totalDone} / {total}
          </p>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-sand-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all"
            style={{ width: `${total ? (totalDone / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {error && (
        <p className="mb-4 flex items-start gap-1.5 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs text-rose-600">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          데이터 연결 오류: {error}
        </p>
      )}

      {/* 자동 점검 항목 */}
      <h3 className="mb-2 text-sm font-bold text-ink">자동 점검 (실시간)</h3>
      <ul className="card-base divide-y divide-line p-2">
        {autoItems.map((item) => (
          <li key={item.id} className="flex items-center gap-3 px-3 py-3">
            {loading ? (
              <Loader2 className="h-5 w-5 shrink-0 animate-spin text-ink-faint" aria-hidden />
            ) : item.done ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden />
            ) : (
              <Circle className="h-5 w-5 shrink-0 text-ink-faint" aria-hidden />
            )}
            <span className="flex-1 text-sm text-ink">{item.label}</span>
            <span
              className={`text-xs ${item.done ? "text-emerald-600" : "text-ink-faint"}`}
            >
              {loading ? "확인 중..." : item.detail}
            </span>
          </li>
        ))}
      </ul>

      {/* 수동 점검 항목 */}
      <h3 className="mb-2 mt-6 text-sm font-bold text-ink">
        수동 점검 (테스트 후 체크)
      </h3>
      <ul className="card-base divide-y divide-line p-2">
        {MANUAL_ITEMS.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => toggleManual(item.id)}
              className="flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-cream-100"
            >
              {manual[item.id] ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden />
              ) : (
                <Circle className="h-5 w-5 shrink-0 text-ink-faint" aria-hidden />
              )}
              <span className="flex-1 text-sm text-ink">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-4 rounded-xl bg-cream-100 px-4 py-3 text-xs leading-relaxed text-ink-soft">
        자동 항목은 Firestore 실데이터를 실시간으로 반영합니다. 수동 항목은 시연
        리허설 후 직접 체크하세요(브라우저에 저장됩니다).
      </p>
    </div>
  );
}
