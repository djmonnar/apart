"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Copy,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import { canIssueCoupon } from "@/lib/access";
import { useAuth } from "@/lib/auth-context";
import { COUPON_STATUS_META, TONE_CLASS } from "@/lib/constants";
import { formatFirestoreDate } from "@/lib/format";
import { isCouponExpired, issueCoupon } from "@/lib/coupons";
import { QrPreview } from "./qr-preview";
import type { Benefit, Coupon, CouponStatus, Partner } from "@/lib/types";

export function CouponPanel({
  benefit,
  partner,
}: {
  benefit: Benefit;
  partner: Partner;
}) {
  const { accessLevel, status, profile, user } = useAuth();
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const allowed = accessLevel === "admin" || canIssueCoupon(profile);
  const displayedStatus: CouponStatus | null = coupon
    ? isCouponExpired(coupon)
      ? "expired"
      : coupon.status
    : null;

  const issue = async () => {
    setError(null);
    setNotice(null);

    if (!user) {
      setError("로그인 후 쿠폰을 발급받을 수 있습니다.");
      return;
    }

    if (!allowed) {
      setError("관리자 승인 후 쿠폰을 발급받을 수 있습니다.");
      return;
    }

    setLoading(true);
    try {
      const result = await issueCoupon({
        userId: user.uid,
        benefit,
        partner,
      });
      setCoupon(result.coupon);
      setNotice(
        result.reused
          ? "이미 발급된 쿠폰이 있습니다. 기존 쿠폰을 사용해주세요."
          : "쿠폰이 발급되었습니다. 제휴업체에 쿠폰번호를 제시해주세요.",
      );
    } catch {
      setError("쿠폰 발급 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!coupon?.code) return;
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("쿠폰번호 복사에 실패했습니다. 번호를 직접 확인해주세요.");
    }
  };

  if (accessLevel === "guest" || status === "rejected" || status === "suspended") {
    return (
      <div className="card-base p-6">
        <div className="flex items-center gap-2 text-brand-600">
          <ShieldAlert className="h-5 w-5" aria-hidden />
          <p className="font-bold">입주민 인증이 필요합니다</p>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          혜택 정보는 누구나 확인할 수 있지만, 쿠폰 발급과 사용은 승인된
          입주민만 이용할 수 있습니다.
        </p>
        <Link href="/signup" className="btn-primary mt-5 w-full">
          입주민 인증하기
        </Link>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="card-base p-6">
        <div className="flex items-center gap-2 text-amber-600">
          <Clock3 className="h-5 w-5" aria-hidden />
          <p className="font-bold">관리자 승인 대기 중입니다</p>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          관리자 승인 후 쿠폰을 발급받을 수 있습니다.
        </p>
        <Link href="/mypage" className="btn-secondary mt-5 w-full">
          승인 상태 확인하기
        </Link>
      </div>
    );
  }

  return (
    <div className="card-base p-6">
      <div className="flex items-center gap-2 text-emerald-600">
        <ShieldCheck className="h-5 w-5" aria-hidden />
        <p className="font-bold">입주민 인증 완료</p>
      </div>

      {notice && (
        <p className="mt-4 flex items-start gap-1.5 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-xs leading-relaxed text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          {notice}
        </p>
      )}

      {error && (
        <p className="mt-4 flex items-start gap-1.5 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs leading-relaxed text-rose-600">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      {!coupon ? (
        <>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            버튼을 누르면 24시간 동안 사용할 수 있는 1회용 쿠폰번호와 QR이
            발급됩니다. 제휴 매장에서 제시해주세요.
          </p>
          <button
            onClick={issue}
            type="button"
            disabled={loading}
            className="btn-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Ticket className="h-4 w-4" aria-hidden />
            )}
            쿠폰 받기
          </button>
        </>
      ) : (
        <div className="mt-4">
          <div className="flex flex-col items-center rounded-2xl bg-cream-100 p-5">
            <QrPreview value={coupon.code} />
            <p className="mt-3 text-xs text-ink-faint">
              제휴 매장에 쿠폰번호를 제시하세요
            </p>
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-soft">
              <span className="font-mono text-lg font-bold tracking-wider text-brand-800">
                {coupon.code}
              </span>
              <button
                type="button"
                onClick={copy}
                className="text-ink-faint hover:text-brand-600"
                aria-label="쿠폰번호 복사"
              >
                {copied ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <dl className="mt-4 space-y-2 rounded-2xl border border-line bg-white p-4 text-xs">
            <CouponRow label="혜택명" value={coupon.benefitTitle} />
            <CouponRow label="업체명" value={coupon.partnerName} />
            <CouponRow
              label="상태"
              value={
                displayedStatus ? (
                  <span
                    className={`badge ${TONE_CLASS[COUPON_STATUS_META[displayedStatus].tone]}`}
                  >
                    {COUPON_STATUS_META[displayedStatus].label}
                  </span>
                ) : (
                  "-"
                )
              }
            />
            <CouponRow label="발급일" value={formatFirestoreDate(coupon.issuedAt)} />
            <CouponRow
              label="유효기간"
              value={`${formatFirestoreDate(coupon.expiresAt)}까지`}
            />
          </dl>

          <p className="mt-3 text-center text-xs leading-relaxed text-ink-faint">
            사용 가능 횟수: {benefit.usageLimit}
            <br />
            본 쿠폰은 1회용이며, 매장 사용 완료 처리 후 재사용할 수 없습니다.
          </p>
        </div>
      )}
    </div>
  );
}

function CouponRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-ink-faint">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
