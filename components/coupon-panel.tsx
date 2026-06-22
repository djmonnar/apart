"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import { canIssueCoupon } from "@/lib/access";
import { useAuth } from "@/lib/auth-context";
import { BENEFIT_REDEMPTION_STATUS_META, TONE_CLASS } from "@/lib/constants";
import {
  completeBenefitRedemption,
  createBenefitRedemption,
  getBenefitMonthlyLimit,
  getKoreaPeriodKey,
  subscribeBenefitUsagePeriod,
} from "@/lib/benefit-redemptions";
import { formatFirestoreDateTime } from "@/lib/format";
import type {
  Benefit,
  BenefitRedemption,
  BenefitUsagePeriod,
  Partner,
} from "@/lib/types";

export function CouponPanel({
  benefit,
  partner,
}: {
  benefit: Benefit;
  partner: Partner;
}) {
  const { accessLevel, status, profile, user } = useAuth();
  const userId = user?.uid;
  const allowed = accessLevel === "admin" || canIssueCoupon(profile);
  const periodKey = getKoreaPeriodKey();
  const monthlyLimit = getBenefitMonthlyLimit(benefit);
  const [usage, setUsage] = useState<BenefitUsagePeriod | null>(null);
  const [redemption, setRedemption] = useState<BenefitRedemption | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(Boolean(user && allowed));
  const [creating, setCreating] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const usedCount = usage?.usedCount ?? 0;
  const remaining = Math.max(0, monthlyLimit - usedCount);
  const isUsed = redemption?.status === "used";
  const isReady = redemption?.status === "ready";

  useEffect(() => {
    if (!userId || !allowed) {
      setUsage(null);
      setLoadingUsage(false);
      return;
    }

    setLoadingUsage(true);
    try {
      return subscribeBenefitUsagePeriod(
        {
          userId,
          benefitId: benefit.id,
          periodKey,
          monthlyLimit,
        },
        (next) => {
          setUsage(next);
          setLoadingUsage(false);
        },
        () => {
          setError("이번 달 이용 현황을 불러오지 못했습니다.");
          setLoadingUsage(false);
        },
      );
    } catch {
      setError("Firebase 환경변수가 설정되지 않았습니다.");
      setLoadingUsage(false);
    }
  }, [allowed, benefit.id, monthlyLimit, periodKey, userId]);

  const startUse = async () => {
    setError(null);

    if (!userId) {
      setError("로그인 후 혜택을 사용할 수 있습니다.");
      return;
    }

    if (!allowed) {
      setError("관리자 승인 후 혜택을 사용할 수 있습니다.");
      return;
    }

    if (remaining <= 0) {
      setError("이번 달 사용 가능 횟수를 모두 사용했습니다.");
      return;
    }

    setCreating(true);
    try {
      const result = await createBenefitRedemption({
        userId,
        benefit,
        partner,
      });

      if (result.kind === "limitReached") {
        setUsage(result.usage);
        setError("이번 달 사용 가능 횟수를 모두 사용했습니다.");
        return;
      }

      setRedemption(result.redemption);
      setUsage(result.usage);
    } catch {
      setError("혜택 사용 화면을 여는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setCreating(false);
    }
  };

  const completeUse = async () => {
    if (!redemption || redemption.status !== "ready") return;

    setCompleting(true);
    setError(null);

    try {
      const result = await completeBenefitRedemption(redemption.id);
      setConfirmOpen(false);

      if (result.kind === "limitReached") {
        setUsage(result.usage);
        setError("이번 달 사용 가능 횟수를 모두 사용했습니다.");
        return;
      }

      setRedemption(result.redemption);
      setUsage(result.usage);
    } catch {
      setError("사용 완료 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setCompleting(false);
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
          혜택 조건과 사용 버튼은 승인된 입주민에게만 표시됩니다.
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
          관리자 승인 후 혜택을 사용할 수 있습니다.
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

      {error && (
        <p className="mt-4 flex items-start gap-1.5 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs leading-relaxed text-rose-600">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      <div className="mt-4 rounded-2xl border border-line bg-white p-4">
        <p className="text-xs font-semibold text-brand-700">이번 달 혜택 이용 현황</p>
        {loadingUsage ? (
          <p className="mt-3 text-sm text-ink-soft">
            <Loader2 className="mr-2 inline h-4 w-4 animate-spin" aria-hidden />
            이용 현황을 확인하는 중입니다.
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <UsageMetric label="월 사용 가능" value={monthlyLimit} />
            <UsageMetric label="사용" value={usedCount} />
            <UsageMetric label="남은 횟수" value={remaining} strong />
          </div>
        )}
      </div>

      {!redemption && (
        <>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            매장에서 혜택을 이용할 때 직원에게 이 화면을 보여주세요. 사용 완료
            버튼이 눌렸을 때만 이번 달 사용 횟수가 차감됩니다.
          </p>
          {remaining <= 0 ? (
            <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-700">
              이번 달 사용 가능 횟수를 모두 사용했습니다. 다음 달 1일에 다시
              이용할 수 있습니다.
            </div>
          ) : (
            <button
              type="button"
              onClick={startUse}
              disabled={creating || loadingUsage}
              className="btn-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Ticket className="h-4 w-4" aria-hidden />
              )}
              혜택 사용하기
            </button>
          )}
        </>
      )}

      {redemption && (
        <div className="mt-5">
          <div className="rounded-2xl bg-cream-100 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-ink">
                {isUsed ? "사용 완료되었습니다." : "아직 사용 처리 전입니다"}
              </p>
              <span
                className={`badge ${
                  TONE_CLASS[BENEFIT_REDEMPTION_STATUS_META[redemption.status].tone]
                }`}
              >
                {BENEFIT_REDEMPTION_STATUS_META[redemption.status].label}
              </span>
            </div>

            <dl className="mt-4 space-y-2 text-sm">
              <RedemptionRow label="업체명" value={partner.name} />
              <RedemptionRow label="혜택명" value={benefit.title} />
              <RedemptionRow label="월 사용 가능 횟수" value={`${monthlyLimit}회`} />
              <RedemptionRow label="이번 달 사용 횟수" value={`${usedCount}회`} />
              <RedemptionRow label="남은 횟수" value={`${remaining}회`} />
              {isUsed && (
                <RedemptionRow
                  label="사용일시"
                  value={formatFirestoreDateTime(redemption.usedAt)}
                />
              )}
            </dl>

            <div className="mt-4 rounded-xl bg-white p-3 text-xs leading-relaxed text-ink-soft">
              <p className="font-semibold text-ink">혜택 조건</p>
              <ul className="mt-2 space-y-1">
                {benefit.conditions.map((condition) => (
                  <li key={condition}>· {condition}</li>
                ))}
              </ul>
            </div>
          </div>

          {isReady && (
            <>
              <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
                <p className="font-bold">매장 직원이 확인 후 사용 완료를 눌러주세요.</p>
                <p className="mt-1">
                  혜택 적용 전 손님 폰에서 이 화면을 확인하고, 혜택 적용 후
                  직원이 아래 버튼을 눌러주세요. 입주민이 직접 누르지 않도록
                  직원에게 화면을 보여주세요.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={completing}
                className="btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {completing && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                )}
                직원이 사용 완료 처리하기
              </button>
            </>
          )}

          {isUsed && (
            <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-700">
              <p className="font-bold">사용 완료되었습니다.</p>
              <p className="mt-1">이번 달 남은 횟수는 {remaining}회입니다.</p>
              <p className="mt-1">다음 달 1일에 사용 가능 횟수가 다시 충전됩니다.</p>
            </div>
          )}
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/55 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="benefit-use-confirm-title"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-card"
          >
            <h2 id="benefit-use-confirm-title" className="text-lg font-bold text-ink">
              정말 사용 완료 처리할까요?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              이 버튼은 매장 직원이 혜택 적용 후 눌러주세요. 처리 후 이번 달
              사용 가능 횟수가 1회 차감됩니다.
            </p>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={completing}
                className="btn-secondary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
              >
                취소
              </button>
              <button
                type="button"
                onClick={completeUse}
                disabled={completing}
                className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {completing && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                )}
                사용 완료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UsageMetric({
  label,
  value,
  strong,
}: {
  label: string;
  value: number;
  strong?: boolean;
}) {
  return (
    <div className="rounded-xl bg-cream-100 px-2 py-3">
      <p className="text-xs text-ink-faint">{label}</p>
      <p className={`mt-1 text-lg font-bold ${strong ? "text-brand-700" : "text-ink"}`}>
        {value}
      </p>
    </div>
  );
}

function RedemptionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-ink-faint">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
