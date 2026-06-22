import Link from "next/link";
import { Lock, CalendarClock, ChevronRight, Clock3 } from "lucide-react";
import {
  type AccessLevel,
  type GroupBuyView,
  getGroupBuyLockMeta,
} from "@/lib/access";
import {
  GROUP_BUY_STATUS_META,
  TONE_CLASS,
} from "@/lib/constants";
import { getProgressPercent } from "@/data/group-buys";
import { SafeImage } from "./safe-image";
import { ProgressBar, StatusBadge } from "./progress-bar";
import { formatDiscount } from "@/lib/format";

export function GroupBuyCard({
  view,
  level,
  closingSoon = false,
}: {
  view: GroupBuyView;
  level: AccessLevel;
  closingSoon?: boolean;
}) {
  const statusMeta = GROUP_BUY_STATUS_META[view.status];

  // ── 잠금(guest/pending): 가격/진행/조건 비노출 ──
  if (view.locked) {
    const lock = getGroupBuyLockMeta(level)!;
    return (
      <article className="card-base group flex flex-col overflow-hidden">
        <div className="relative aspect-[16/10] overflow-hidden">
          <SafeImage
            src={view.image}
            fallbackSrc={view.imageFallback}
            alt={view.title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-900/70 via-brand-900/15 to-transparent" />
          <span className="badge absolute left-3 top-3 bg-white/90 text-brand-700 backdrop-blur-sm">
            {view.category}
          </span>
          <span className="badge absolute right-3 top-3 bg-brand-900/80 text-cream-100 backdrop-blur-sm">
            <Lock className="h-3 w-3" aria-hidden />
            입주민 전용
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <span className={`badge w-fit ${TONE_CLASS[statusMeta.tone]}`}>
            {statusMeta.label}
          </span>
          <h3 className="mt-2 text-base font-bold text-ink">{view.title}</h3>
          <p className="mt-1.5 line-clamp-2 text-sm text-ink-soft">
            {view.summary}
          </p>

          <div className="mt-3 rounded-xl border border-dashed border-line bg-cream-100/70 px-3.5 py-3">
            <p className="flex items-start gap-1.5 text-xs leading-relaxed text-ink-soft">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-400" aria-hidden />
              {lock.lockMessage}
            </p>
          </div>

          {lock.buttonDisabled ? (
            <button
              type="button"
              disabled
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sand-100 px-4 py-2.5 text-sm font-semibold text-ink-faint"
            >
              <Clock3 className="h-4 w-4" aria-hidden />
              {lock.buttonLabel}
            </button>
          ) : (
            <Link
              href={lock.buttonHref ?? "/login"}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-cream-50 transition-colors hover:bg-brand-700"
            >
              <Lock className="h-4 w-4" aria-hidden />
              {lock.buttonLabel}
            </Link>
          )}
        </div>
      </article>
    );
  }

  // ── 승인(approved): 전체 공개 ──
  const percent = getProgressPercent(view);
  const discount = formatDiscount(view.originalPrice, view.groupPrice);

  return (
    <article className="card-base group flex flex-col overflow-hidden hover:-translate-y-1 hover:shadow-card-hover">
      <Link
        href={`/group-buy/${view.id}`}
        className="relative block aspect-[16/10] overflow-hidden"
        aria-label={`${view.title} 공동구매 보기`}
      >
        <SafeImage
          src={view.image}
          fallbackSrc={view.imageFallback}
          alt={view.title}
          className="transition-transform duration-500 group-hover:scale-105"
        />
        <span className="badge absolute left-3 top-3 bg-white/90 text-brand-700 backdrop-blur-sm">
          {view.category}
        </span>
        <span className="absolute right-3 top-3">
          <StatusBadge
            label={GROUP_BUY_STATUS_META[view.status].label}
            toneClass={TONE_CLASS[GROUP_BUY_STATUS_META[view.status].tone]}
            closingSoon={closingSoon}
          />
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-bold text-ink">{view.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-ink-soft">
          {view.summary}
        </p>

        {/* 가격 */}
        <div className="mt-3 flex items-end gap-2">
          <span className="text-sm text-ink-faint line-through">
            {view.originalPrice}
          </span>
          <span className="text-lg font-bold text-brand-700">
            {view.groupPrice}
          </span>
          {discount && (
            <span className="badge bg-rose-100 text-rose-600">{discount}</span>
          )}
        </div>

        {/* 진행률 */}
        <div className="mt-4">
          <ProgressBar
            current={view.currentCount}
            target={view.targetCount}
            percent={percent}
            closingSoon={closingSoon}
          />
        </div>

        <p className="mt-3 flex items-center gap-1 text-xs text-ink-faint">
          <CalendarClock className="h-3.5 w-3.5" aria-hidden />
          마감 {view.endDate.replace(/-/g, ".")}
        </p>

        <Link
          href={`/group-buy/${view.id}`}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sand-100 px-4 py-2.5 text-sm font-semibold text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-cream-50"
        >
          공동구매 보기
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
