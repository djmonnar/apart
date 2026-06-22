"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, TicketCheck } from "lucide-react";
import { COUPON_STATUS_META, TONE_CLASS } from "@/lib/constants";
import {
  COUPON_STATUSES,
  isCouponExpired,
  subscribeAllCoupons,
} from "@/lib/coupons";
import { formatFirestoreDate } from "@/lib/format";
import type { Coupon, CouponStatus } from "@/lib/types";

const FILTER_ALL = "all";

export function AdminCoupons() {
  const [items, setItems] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<CouponStatus | typeof FILTER_ALL>(
    FILTER_ALL,
  );
  const [partnerFilter, setPartnerFilter] = useState(FILTER_ALL);
  const [benefitFilter, setBenefitFilter] = useState(FILTER_ALL);

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      return subscribeAllCoupons(
        (next) => {
          setItems(next);
          setLoading(false);
        },
        () => {
          setError("쿠폰 내역을 불러오지 못했습니다. 관리자 권한을 확인해주세요.");
          setLoading(false);
        },
      );
    } catch {
      setError("Firebase 환경변수가 설정되지 않았습니다.");
      setLoading(false);
    }
  }, []);

  const partners = useMemo(
    () =>
      Array.from(new Set(items.map((item) => item.partnerName).filter(Boolean))).sort(),
    [items],
  );
  const benefits = useMemo(
    () =>
      Array.from(new Set(items.map((item) => item.benefitTitle).filter(Boolean))).sort(),
    [items],
  );

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const status = getDisplayStatus(item);
        if (statusFilter !== FILTER_ALL && status !== statusFilter) return false;
        if (partnerFilter !== FILTER_ALL && item.partnerName !== partnerFilter) {
          return false;
        }
        if (benefitFilter !== FILTER_ALL && item.benefitTitle !== benefitFilter) {
          return false;
        }
        return true;
      }),
    [benefitFilter, items, partnerFilter, statusFilter],
  );

  return (
    <div className="card-base p-6">
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-ink">
            <TicketCheck className="h-5 w-5 text-brand-500" aria-hidden />
            쿠폰 발급/사용 내역
          </h2>
          <p className="mt-1 text-xs text-ink-faint">
            전체 {items.length}건 · 현재 표시 {filtered.length}건
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as CouponStatus | typeof FILTER_ALL)
            }
            className="rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
            aria-label="쿠폰 상태 필터"
          >
            <option value={FILTER_ALL}>전체 상태</option>
            {COUPON_STATUSES.map((status) => (
              <option key={status} value={status}>
                {COUPON_STATUS_META[status].label}
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
          쿠폰 내역을 불러오는 중입니다.
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line py-12 text-center text-sm text-ink-soft">
          조건에 맞는 쿠폰 내역이 없습니다.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-ink-faint">
                <th className="py-2.5 font-medium">발급일</th>
                <th className="py-2.5 font-medium">사용일</th>
                <th className="py-2.5 font-medium">쿠폰번호</th>
                <th className="py-2.5 font-medium">혜택명</th>
                <th className="py-2.5 font-medium">업체명</th>
                <th className="py-2.5 font-medium">상태</th>
                <th className="py-2.5 font-medium">사용자 ID</th>
                <th className="py-2.5 font-medium">처리 업체</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((coupon) => {
                const status = getDisplayStatus(coupon);
                const meta = COUPON_STATUS_META[status];
                return (
                  <tr key={coupon.id} className="border-b border-line/60 align-top">
                    <td className="py-3 text-ink-soft">
                      {formatFirestoreDate(coupon.issuedAt)}
                    </td>
                    <td className="py-3 text-ink-soft">
                      {formatFirestoreDate(coupon.usedAt)}
                    </td>
                    <td className="py-3 font-mono font-bold text-brand-700">
                      {coupon.code || "-"}
                    </td>
                    <td className="max-w-[260px] py-3 font-medium text-ink">
                      {coupon.benefitTitle || "-"}
                    </td>
                    <td className="py-3 text-ink-soft">
                      {coupon.partnerName || "-"}
                    </td>
                    <td className="py-3">
                      <span className={`badge ${TONE_CLASS[meta.tone]}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="max-w-[180px] truncate py-3 font-mono text-xs text-ink-faint">
                      {coupon.userId || "-"}
                    </td>
                    <td className="py-3 text-ink-soft">
                      {coupon.usedByPartnerName || "-"}
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

function getDisplayStatus(coupon: Coupon): CouponStatus {
  return isCouponExpired(coupon) ? "expired" : coupon.status;
}
