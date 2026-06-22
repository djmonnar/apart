"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, Loader2, Ticket } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { COUPON_STATUS_META, TONE_CLASS } from "@/lib/constants";
import { formatFirestoreDate } from "@/lib/format";
import { isCouponExpired, subscribeMyCoupons } from "@/lib/coupons";
import type { Coupon, CouponStatus } from "@/lib/types";

export function MyCoupons() {
  const { accessLevel, user } = useAuth();
  const [items, setItems] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(Boolean(user));
  const [error, setError] = useState<string | null>(null);
  const canUseBenefits = accessLevel === "approved" || accessLevel === "admin";

  useEffect(() => {
    if (!user || !canUseBenefits) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      return subscribeMyCoupons(
        user.uid,
        (next) => {
          setItems(next);
          setLoading(false);
        },
        () => {
          setError("쿠폰 내역을 불러오지 못했습니다.");
          setLoading(false);
        },
      );
    } catch {
      setError("Firebase 환경변수가 설정되지 않았습니다.");
      setLoading(false);
    }
  }, [canUseBenefits, user]);

  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-ink">
        <Ticket className="h-5 w-5 text-brand-500" aria-hidden />내 쿠폰
      </h2>

      {!canUseBenefits ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-ink-soft">
          관리자 승인 완료 후 쿠폰을 발급받을 수 있습니다.
        </div>
      ) : error ? (
        <p className="flex items-start gap-1.5 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs leading-relaxed text-rose-600">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : loading ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-ink-soft">
          <Loader2 className="mr-2 inline h-4 w-4 animate-spin" aria-hidden />
          쿠폰 내역을 불러오는 중입니다.
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-ink-soft">
          아직 발급받은 쿠폰이 없습니다.{" "}
          <Link href="/benefits" className="font-semibold text-brand-700">
            혜택 보러 가기
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-line bg-cream-100 text-left text-ink-faint">
                <th className="px-4 py-3 font-medium">혜택명</th>
                <th className="px-4 py-3 font-medium">업체명</th>
                <th className="px-4 py-3 font-medium">쿠폰번호</th>
                <th className="px-4 py-3 font-medium">상태</th>
                <th className="px-4 py-3 font-medium">유효기간</th>
                <th className="px-4 py-3 font-medium">사용일</th>
              </tr>
            </thead>
            <tbody>
              {items.map((coupon) => {
                const status: CouponStatus = isCouponExpired(coupon)
                  ? "expired"
                  : coupon.status;
                const meta = COUPON_STATUS_META[status];
                return (
                  <tr
                    key={coupon.id}
                    className="border-b border-line/60 align-top last:border-0"
                  >
                    <td className="px-4 py-3 font-medium text-ink">
                      <Link
                        href={`/benefits/${coupon.benefitId}`}
                        className="hover:text-brand-700 hover:underline"
                      >
                        {coupon.benefitTitle || "-"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {coupon.partnerName || "-"}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-brand-700">
                      {coupon.code || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${TONE_CLASS[meta.tone]}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {formatFirestoreDate(coupon.expiresAt)}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {formatFirestoreDate(coupon.usedAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
