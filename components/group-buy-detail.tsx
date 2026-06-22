import Link from "next/link";
import {
  Lock,
  Clock3,
  ShieldCheck,
  CalendarDays,
  CheckCircle2,
  Info,
  Store,
  ListChecks,
  MapPin,
} from "lucide-react";
import type { Partner } from "@/lib/types";
import {
  type AccessLevel,
  type GroupBuyView,
  getGroupBuyLockMeta,
} from "@/lib/access";
import { GROUP_BUY_STATUS_META, TONE_CLASS } from "@/lib/constants";
import { getProgressPercent } from "@/data/group-buys";
import { formatDiscount } from "@/lib/format";
import { SafeImage } from "./safe-image";
import { ProgressBar, StatusBadge } from "./progress-bar";
import { GroupBuyApply } from "./group-buy-apply";

const APPLY_CONDITIONS = [
  "진주역 스카이시티프라디움 인증 입주민",
  "1세대 1신청 기준 (중복 신청 불가)",
  "목표 인원 달성 시 공동구매가 확정되어 진행됩니다.",
];

export function GroupBuyDetail({
  view,
  level,
  closingSoon,
  partner,
}: {
  view: GroupBuyView;
  level: AccessLevel;
  closingSoon: boolean;
  partner: Partner | null;
}) {
  const statusMeta = GROUP_BUY_STATUS_META[view.status];

  return (
    <div className="grid gap-8 pb-24 lg:grid-cols-[1fr_360px] lg:pb-0">
      {/* 좌측 */}
      <div>
        <div className="relative aspect-[16/9] overflow-hidden rounded-3xl shadow-card">
          <SafeImage
            src={view.image}
            alt={view.title}
            sizes="(max-width: 1024px) 100vw, 60vw"
            priority
          />
          <span className="badge absolute left-4 top-4 bg-white/90 text-brand-700 backdrop-blur-sm">
            {view.category}
          </span>
          <span className="absolute right-4 top-4">
            <StatusBadge
              label={statusMeta.label}
              toneClass={TONE_CLASS[statusMeta.tone]}
              closingSoon={!view.locked && closingSoon}
            />
          </span>
          {view.locked && (
            <div className="absolute inset-0 bg-gradient-to-t from-brand-900/55 to-transparent" />
          )}
        </div>

        <div className="mt-6">
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">
            {view.title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {view.summary}
          </p>
        </div>

        {view.locked ? (
          <div className="mt-7 overflow-hidden rounded-2xl border border-brand-100 bg-cream-100">
            <div className="flex flex-col items-center px-6 py-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-cream-50">
                <Lock className="h-6 w-6" aria-hidden />
              </span>
              <p className="mt-4 font-bold text-ink">
                공동구매 조건은 입주민 전용입니다
              </p>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
                {getGroupBuyLockMeta(level)!.lockMessage}
              </p>
              <ul className="mt-5 space-y-1.5 text-xs text-ink-faint">
                <li>· 정상가 / 공동구매가 및 할인율</li>
                <li>· 목표·현재 신청 인원 및 진행률</li>
                <li>· 상세 설명 · 진행 일정 · 유의사항</li>
                <li>· 참여 신청</li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            {/* 모집 기간 */}
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-soft">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-brand-400" aria-hidden />
                모집 기간 {view.startDate.replace(/-/g, ".")} ~{" "}
                {view.endDate.replace(/-/g, ".")}
              </span>
            </div>

            {/* 설명 */}
            <div className="mt-7">
              <h2 className="text-base font-bold text-ink">공동구매 설명</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {view.description}
              </p>
            </div>

            {/* 신청 조건 */}
            <div className="mt-7">
              <h2 className="flex items-center gap-1.5 text-base font-bold text-ink">
                <ListChecks className="h-4 w-4 text-brand-400" aria-hidden />
                신청 조건
              </h2>
              <ul className="mt-3 space-y-2">
                {APPLY_CONDITIONS.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm text-ink-soft">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            {/* 진행 일정 */}
            <div className="mt-7">
              <h2 className="text-base font-bold text-ink">진행 일정</h2>
              <ol className="mt-3 space-y-3">
                {view.schedule.map((step, i) => (
                  <li key={step.label} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ink">{step.label}</p>
                      {step.date && (
                        <p className="text-xs text-ink-faint">{step.date}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* 유의사항 */}
            <div className="mt-7">
              <h2 className="flex items-center gap-1.5 text-base font-bold text-ink">
                <Info className="h-4 w-4 text-brand-400" aria-hidden />
                유의사항
              </h2>
              <ul className="mt-3 space-y-2">
                {view.terms.map((t) => (
                  <li key={t} className="flex items-start gap-2 text-sm text-ink-soft">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-300" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* 제휴업체 정보 */}
            <div className="mt-7 rounded-2xl border border-line bg-white p-5">
              <h2 className="flex items-center gap-1.5 text-base font-bold text-ink">
                <Store className="h-4 w-4 text-brand-400" aria-hidden />
                제휴업체 정보
              </h2>
              <p className="mt-2 font-semibold text-ink">{view.partnerName}</p>
              {partner ? (
                <>
                  <p className="mt-1 text-sm text-ink-soft">{partner.tagline}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-faint">
                    <MapPin className="h-3.5 w-3.5" aria-hidden />
                    {partner.region}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm text-ink-soft">
                  단지 제휴 협력 업체와 함께 진행됩니다.
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* 우측 패널 */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        {view.locked ? (
          <LockedPanel level={level} />
        ) : (
          <div className="card-base p-6">
            {/* 가격 */}
            <div className="flex items-end gap-2">
              <span className="text-sm text-ink-faint line-through">
                {view.originalPrice}
              </span>
              {(() => {
                const d = formatDiscount(view.originalPrice, view.groupPrice);
                return d ? (
                  <span className="badge bg-rose-100 text-rose-600">{d}</span>
                ) : null;
              })()}
            </div>
            <p className="mt-1 text-2xl font-bold text-brand-700">
              {view.groupPrice}
            </p>

            <div className="mt-5">
              <ProgressBar
                current={view.currentCount}
                target={view.targetCount}
                percent={getProgressPercent(view)}
                closingSoon={closingSoon}
              />
            </div>

            <dl className="mt-5 space-y-2.5 border-t border-line pt-4 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-ink-faint">상태</dt>
                <dd>
                  <span className={`badge ${TONE_CLASS[statusMeta.tone]}`}>
                    {statusMeta.label}
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-faint">목표 인원</dt>
                <dd className="font-medium text-ink">{view.targetCount}세대</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-faint">현재 신청</dt>
                <dd className="font-medium text-ink">{view.currentCount}세대</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-faint">마감일</dt>
                <dd className="font-medium text-ink">
                  {view.endDate.replace(/-/g, ".")}
                </dd>
              </div>
            </dl>

            <div className="mt-5">
              <GroupBuyApply title={view.title} />
            </div>
            <p className="mt-3 text-center text-xs leading-relaxed text-ink-faint">
              신청 정보는 관리자만 확인하며,
              <br />
              제휴업체에는 개인정보가 제공되지 않습니다.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}

function LockedPanel({ level }: { level: AccessLevel }) {
  const meta = getGroupBuyLockMeta(level)!;
  const pending = level === "pending";
  return (
    <div className="card-base p-6">
      <div className="flex items-center gap-2 text-brand-600">
        {pending ? (
          <Clock3 className="h-5 w-5" aria-hidden />
        ) : (
          <ShieldCheck className="h-5 w-5" aria-hidden />
        )}
        <p className="font-bold">
          {pending ? "관리자 승인 대기 중입니다" : "입주민 인증이 필요합니다"}
        </p>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        {meta.lockMessage}
      </p>
      {meta.buttonDisabled ? (
        <button
          type="button"
          disabled
          className="btn mt-5 w-full cursor-not-allowed bg-sand-100 text-ink-faint"
        >
          <Clock3 className="h-4 w-4" aria-hidden />
          {meta.buttonLabel}
        </button>
      ) : (
        <Link href={meta.buttonHref ?? "/login"} className="btn-primary mt-5 w-full">
          <Lock className="h-4 w-4" aria-hidden />
          {meta.buttonLabel}
        </Link>
      )}
      {level === "guest" && (
        <p className="mt-3 text-center text-xs text-ink-soft">
          아직 인증 전이신가요?{" "}
          <Link href="/signup" className="font-semibold text-brand-700 hover:underline">
            입주민 인증하기
          </Link>
        </p>
      )}
    </div>
  );
}
