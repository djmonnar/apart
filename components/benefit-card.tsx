import Link from "next/link";
import { MapPin, Ticket, Check, Lock, Clock3 } from "lucide-react";
import type { Partner } from "@/lib/types";
import {
  type AccessLevel,
  type BenefitView,
  getLockMeta,
} from "@/lib/access";
import { SafeImage } from "./safe-image";
import { CategoryBadge } from "./category-badge";

/**
 * 프레젠테이션 전용. 정제된 `view`만 받으므로 잠금 상태에서는
 * 상세 혜택 데이터를 애초에 보유하지 않는다 (서버에서 sanitize 완료).
 */
export function BenefitCard({
  partner,
  view,
  level,
}: {
  partner: Partner;
  view: BenefitView;
  level: AccessLevel;
}) {
  // ── 잠금(guest/pending): 상세 혜택 비노출 ──────────────────────────
  if (view.locked) {
    const lock = getLockMeta(level)!;
    return (
      <article className="card-base group flex flex-col overflow-hidden">
        <div className="relative aspect-[4/3] overflow-hidden">
          <SafeImage src={partner.image} alt={partner.name} />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-900/70 via-brand-900/15 to-transparent" />
          <span className="absolute left-3 top-3">
            <CategoryBadge category={partner.category} />
          </span>
          <span className="badge absolute right-3 top-3 bg-brand-900/80 text-cream-100 backdrop-blur-sm">
            <Lock className="h-3 w-3" aria-hidden />
            {lock.badge}
          </span>
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 p-4 text-cream-50">
            <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="text-xs font-medium">입주민 인증 시 혜택 공개</span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-base font-bold text-ink">{partner.name}</h3>
          <p className="mt-1.5 line-clamp-2 text-sm text-ink-soft">
            진주역 스카이시티프라디움 입주민 전용 혜택 제공 중
          </p>

          <div className="mt-3 rounded-xl border border-dashed border-line bg-cream-100/70 px-3.5 py-3">
            <p className="flex items-start gap-1.5 text-xs leading-relaxed text-ink-soft">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-400" aria-hidden />
              {lock.lockMessage}
            </p>
          </div>

          <p className="mt-3 flex items-center gap-1 text-xs text-ink-faint">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            {partner.region}
          </p>

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

  // ── 승인 완료(approved): 전체 혜택 공개 ───────────────────────────
  return (
    <article className="card-base group flex flex-col overflow-hidden hover:-translate-y-1 hover:shadow-card-hover">
      <Link
        href={`/benefits/${view.id}`}
        className="relative block aspect-[4/3] overflow-hidden"
        aria-label={`${partner.name} 혜택 자세히 보기`}
      >
        <SafeImage
          src={partner.image}
          alt={partner.name}
          className="transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3">
          <CategoryBadge category={partner.category} />
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-bold text-ink">{partner.name}</h3>

        <ul className="mt-2.5 space-y-1.5">
          {view.summary.map((line) => (
            <li
              key={line}
              className="flex items-start gap-1.5 text-sm text-ink-soft"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" aria-hidden />
              <span>{line}</span>
            </li>
          ))}
        </ul>

        <p className="mt-3 flex items-center gap-1 text-xs text-ink-faint">
          <MapPin className="h-3.5 w-3.5" aria-hidden />
          {partner.region}
        </p>

        <Link
          href={`/benefits/${view.id}`}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sand-100 px-4 py-2.5 text-sm font-semibold text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-cream-50"
        >
          <Ticket className="h-4 w-4" aria-hidden />
          혜택 보기
        </Link>
      </div>
    </article>
  );
}
