"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, TicketCheck } from "lucide-react";
import { BENEFIT_REDEMPTION_STATUS_META, TONE_CLASS } from "@/lib/constants";
import {
  BENEFIT_REDEMPTION_STATUSES,
  subscribeAllBenefitRedemptions,
  subscribeAllBenefitUsagePeriods,
} from "@/lib/benefit-redemptions";
import { formatFirestoreDateTime } from "@/lib/format";
import type {
  BenefitRedemption,
  BenefitRedemptionStatus,
  BenefitUsagePeriod,
} from "@/lib/types";

const FILTER_ALL = "all";

export function AdminCoupons() {
  const [redemptions, setRedemptions] = useState<BenefitRedemption[]>([]);
  const [usagePeriods, setUsagePeriods] = useState<BenefitUsagePeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    BenefitRedemptionStatus | typeof FILTER_ALL
  >(FILTER_ALL);
  const [partnerFilter, setPartnerFilter] = useState(FILTER_ALL);
  const [benefitFilter, setBenefitFilter] = useState(FILTER_ALL);

  useEffect(() => {
    const unsubscribers: Array<() => void> = [];
    const loaded = { redemptions: false, usagePeriods: false };
    const markLoaded = (key: keyof typeof loaded) => {
      loaded[key] = true;
      if (Object.values(loaded).every(Boolean)) setLoading(false);
    };

    setLoading(true);
    setError(null);

    try {
      unsubscribers.push(
        subscribeAllBenefitRedemptions(
          (next) => {
            setRedemptions(next);
            markLoaded("redemptions");
          },
          () => {
            setError("혜택 사용 내역을 불러오지 못했습니다. 관리자 권한을 확인해주세요.");
            markLoaded("redemptions");
          },
        ),
      );
      unsubscribers.push(
        subscribeAllBenefitUsagePeriods(
          (next) => {
            setUsagePeriods(next);
            markLoaded("usagePeriods");
          },
          () => {
            setError("혜택 월별 이용 현황을 불러오지 못했습니다.");
            markLoaded("usagePeriods");
          },
        ),
      );
    } catch {
      setError("Firebase 환경변수가 설정되지 않았습니다.");
      setLoading(false);
    }

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  const usageByKey = useMemo(() => {
    const map = new Map<string, BenefitUsagePeriod>();
    usagePeriods.forEach((item) => {
      map.set(`${item.userId}_${item.benefitId}_${item.periodKey}`, item);
    });
    return map;
  }, [usagePeriods]);

  const partners = useMemo(
    () =>
      Array.from(
        new Set(redemptions.map((item) => item.partnerName).filter(Boolean)),
      ).sort(),
    [redemptions],
  );
  const benefits = useMemo(
    () =>
      Array.from(
        new Set(redemptions.map((item) => item.benefitTitle).filter(Boolean)),
      ).sort(),
    [redemptions],
  );

  const filtered = useMemo(
    () =>
      redemptions.filter((item) => {
        if (statusFilter !== FILTER_ALL && item.status !== statusFilter) {
          return false;
        }
        if (partnerFilter !== FILTER_ALL && item.partnerName !== partnerFilter) {
          return false;
        }
        if (benefitFilter !== FILTER_ALL && item.benefitTitle !== benefitFilter) {
          return false;
        }
        return true;
      }),
    [benefitFilter, partnerFilter, redemptions, statusFilter],
  );

  return (
    <div className="card-base p-6">
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-ink">
            <TicketCheck className="h-5 w-5 text-brand-500" aria-hidden />
            혜택 사용 내역
          </h2>
          <p className="mt-1 text-xs text-ink-faint">
            전체 {redemptions.length}건 · 현재 표시 {filtered.length}건
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as BenefitRedemptionStatus | typeof FILTER_ALL,
              )
            }
            className="rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
            aria-label="혜택 사용 상태 필터"
          >
            <option value={FILTER_ALL}>전체 상태</option>
            {BENEFIT_REDEMPTION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {BENEFIT_REDEMPTION_STATUS_META[status].label}
              </option>
            ))}
          </select>

          <select
            value={partnerFilter}
            onChange={(event) => setPartnerFilter(event.target.value)}
            className="rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
            aria-label="업체별 필터"
          >
            <option value={FILTER_ALL}>전체 업체</option>
            {partners.map((partner) => (
              <option key={partner} value={partner}>
                {partner}
              </option>
            ))}
          </select>

          <select
            value={benefitFilter}
            onChange={(event) => setBenefitFilter(event.target.value)}
            className="rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
            aria-label="혜택별 필터"
          >
            <option value={FILTER_ALL}>전체 혜택</option>
            {benefits.map((benefit) => (
              <option key={benefit} value={benefit}>
                {benefit}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="mb-4 flex items-start gap-1.5 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs leading-relaxed text-rose-600">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      {loading ? (
        <div className="rounded-2xl border border-dashed border-line py-12 text-center text-sm text-ink-soft">
          <Loader2 className="mr-2 inline h-4 w-4 animate-spin" aria-hidden />
          혜택 사용 내역을 불러오는 중입니다.
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line py-12 text-center text-sm text-ink-soft">
          조건에 맞는 혜택 사용 내역이 없습니다.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-ink-faint">
                <th className="py-2.5 font-medium">사용자 ID</th>
                <th className="py-2.5 font-medium">업체명</th>
                <th className="py-2.5 font-medium">혜택명</th>
                <th className="py-2.5 font-medium">periodKey</th>
                <th className="py-2.5 font-medium">상태</th>
                <th className="py-2.5 font-medium">생성일시</th>
                <th className="py-2.5 font-medium">사용일시</th>
                <th className="py-2.5 font-medium">월 제한</th>
                <th className="py-2.5 font-medium">사용 횟수</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const meta = BENEFIT_REDEMPTION_STATUS_META[item.status];
                const usage = usageByKey.get(
                  `${item.userId}_${item.benefitId}_${item.periodKey}`,
                );
                return (
                  <tr key={item.id} className="border-b border-line/60 align-top">
                    <td className="max-w-[180px] truncate py-3 font-mono text-xs text-ink-faint">
                      {item.userId || "-"}
                    </td>
                    <td className="py-3 text-ink-soft">{item.partnerName || "-"}</td>
                    <td className="max-w-[260px] py-3 font-medium text-ink">
                      {item.benefitTitle || "-"}
                    </td>
                    <td className="py-3 font-mono text-xs text-ink-soft">
                      {item.periodKey}
                    </td>
                    <td className="py-3">
                      <span className={`badge ${TONE_CLASS[meta.tone]}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="py-3 text-ink-soft">
                      {formatFirestoreDateTime(item.createdAt)}
                    </td>
                    <td className="py-3 text-ink-soft">
                      {formatFirestoreDateTime(item.usedAt)}
                    </td>
                    <td className="py-3 text-ink-soft">{item.monthlyLimit}회</td>
                    <td className="py-3 font-bold text-ink">
                      {usage?.usedCount ?? 0}회
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
