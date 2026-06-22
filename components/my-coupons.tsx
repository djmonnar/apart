"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, BarChart3, Loader2 } from "lucide-react";
import { getBenefit } from "@/data/benefits";
import { getPartner } from "@/data/partners";
import { useAuth } from "@/lib/auth-context";
import {
  getBenefitMonthlyLimit,
  getKoreaPeriodKey,
  subscribeMyBenefitUsagePeriods,
} from "@/lib/benefit-redemptions";
import { formatFirestoreDateTime } from "@/lib/format";
import type { BenefitUsagePeriod } from "@/lib/types";

export function MyCoupons() {
  const { accessLevel, user } = useAuth();
  const userId = user?.uid;
  const [items, setItems] = useState<BenefitUsagePeriod[]>([]);
  const [loading, setLoading] = useState(Boolean(user));
  const [error, setError] = useState<string | null>(null);
  const canUseBenefits = accessLevel === "approved" || accessLevel === "admin";
  const periodKey = getKoreaPeriodKey();

  useEffect(() => {
    if (!userId || !canUseBenefits) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      return subscribeMyBenefitUsagePeriods(
        userId,
        (next) => {
          setItems(next.filter((item) => item.periodKey === periodKey));
          setLoading(false);
        },
        () => {
          setError("혜택 이용 현황을 불러오지 못했습니다.");
          setLoading(false);
        },
      );
    } catch {
      setError("Firebase 환경변수가 설정되지 않았습니다.");
      setLoading(false);
    }
  }, [canUseBenefits, periodKey, userId]);

  const rows = useMemo(
    () =>
      items.map((item) => {
        const benefit = getBenefit(item.benefitId);
        const partner = benefit ? getPartner(benefit.partnerId) : undefined;
        const monthlyLimit = benefit
          ? getBenefitMonthlyLimit(benefit)
          : item.monthlyLimit;
        return {
          ...item,
          benefitTitle: benefit?.title ?? item.benefitId,
          partnerName: partner?.name ?? "-",
          monthlyLimit,
          remaining: Math.max(0, monthlyLimit - item.usedCount),
        };
      }),
    [items],
  );

  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-ink">
        <BarChart3 className="h-5 w-5 text-brand-500" aria-hidden />
        이번 달 혜택 이용 현황
      </h2>

      {!canUseBenefits ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-ink-soft">
          관리자 승인 완료 후 혜택 이용 현황을 확인할 수 있습니다.
        </div>
      ) : error ? (
        <p className="flex items-start gap-1.5 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs leading-relaxed text-rose-600">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : loading ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-ink-soft">
          <Loader2 className="mr-2 inline h-4 w-4 animate-spin" aria-hidden />
          혜택 이용 현황을 불러오는 중입니다.
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-ink-soft">
          이번 달 사용 완료된 혜택이 아직 없습니다.{" "}
          <Link href="/benefits" className="font-semibold text-brand-700">
            혜택 보러 가기
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-line bg-cream-100 text-left text-ink-faint">
                <th className="px-4 py-3 font-medium">업체명</th>
                <th className="px-4 py-3 font-medium">혜택명</th>
                <th className="px-4 py-3 font-medium">월 사용 가능</th>
                <th className="px-4 py-3 font-medium">사용 횟수</th>
                <th className="px-4 py-3 font-medium">남은 횟수</th>
                <th className="px-4 py-3 font-medium">최근 사용일</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-line/60 align-top last:border-0"
                >
                  <td className="px-4 py-3 text-ink-soft">{item.partnerName}</td>
                  <td className="px-4 py-3 font-medium text-ink">
                    <Link
                      href={`/benefits/${item.benefitId}`}
                      className="hover:text-brand-700 hover:underline"
                    >
                      {item.benefitTitle}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {item.monthlyLimit}회
                  </td>
                  <td className="px-4 py-3 font-bold text-ink">
                    {item.usedCount}회
                  </td>
                  <td className="px-4 py-3 text-brand-700">
                    {item.remaining}회
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {formatFirestoreDateTime(item.lastUsedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {canUseBenefits && (
        <p className="mt-3 text-xs leading-relaxed text-ink-faint">
          월 사용 횟수는 매장 직원이 손님 휴대폰에서 사용 완료를 눌렀을 때만
          차감됩니다. 다음 달 1일에 새 이용 기간으로 자동 전환됩니다.
        </p>
      )}
    </section>
  );
}
