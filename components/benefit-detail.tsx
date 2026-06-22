import Link from "next/link";
import {
  MapPin,
  Phone,
  CalendarDays,
  CheckCircle2,
  Info,
  Lock,
  Clock3,
  ShieldCheck,
} from "lucide-react";
import type { Partner } from "@/lib/types";
import {
  type AccessLevel,
  type BenefitView,
  getLockMeta,
} from "@/lib/access";
import { SafeImage } from "./safe-image";
import { CategoryBadge } from "./category-badge";
import { CouponPanel } from "./coupon-panel";

/**
 * 프레젠테이션 전용. 서버에서 권한별로 정제된 `view`를 받는다.
 * guest/pending에는 상세 필드가 없는 view가 전달되므로, URL 직접 접근 시에도
 * 브라우저로 상세 혜택 데이터가 내려가지 않는다.
 */
export function BenefitDetail({
  view,
  partner,
  level,
}: {
  view: BenefitView;
  partner: Partner;
  level: AccessLevel;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      {/* 좌측: 업체 정보(공개) + 혜택 상세(승인 시에만) */}
      <div>
        <div className="relative aspect-[16/9] overflow-hidden rounded-3xl shadow-card">
          <SafeImage
            src={partner.image}
            alt={partner.name}
            sizes="(max-width: 1024px) 100vw, 60vw"
            priority
          />
          <span className="absolute left-4 top-4">
            <CategoryBadge category={partner.category} />
          </span>
          {view.locked && (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-brand-900/65 via-brand-900/10 to-transparent" />
              <span className="badge absolute right-4 top-4 bg-brand-900/80 text-cream-100 backdrop-blur-sm">
                <Lock className="h-3 w-3" aria-hidden />
                입주민 전용
              </span>
            </>
          )}
        </div>

        <div className="mt-6">
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">
            {partner.name}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">{partner.tagline}</p>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-brand-400" aria-hidden />
              {partner.region}
            </span>
            {!view.locked && partner.phone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-brand-400" aria-hidden />
                {partner.phone}
              </span>
            )}
            {!view.locked && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-brand-400" aria-hidden />
                {view.validFrom.replace(/-/g, ".")} ~{" "}
                {view.validTo.replace(/-/g, ".")}
              </span>
            )}
          </div>
        </div>

        <div className="mt-7">
          <h2 className="text-base font-bold text-ink">업체 소개</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {partner.description}
          </p>
        </div>

        {view.locked ? (
          <div className="mt-7 overflow-hidden rounded-2xl border border-brand-100 bg-cream-100">
            <div className="flex flex-col items-center px-6 py-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-cream-50">
                <Lock className="h-6 w-6" aria-hidden />
              </span>
              <p className="mt-4 font-bold text-ink">
                혜택 상세는 입주민 전용입니다
              </p>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
                {getLockMeta(level)!.lockMessage}
              </p>
              <ul className="mt-5 space-y-1.5 text-xs text-ink-faint">
                <li>· 정확한 할인율 및 상세 혜택</li>
                <li>· 쿠폰 발급 및 QR 인증</li>
                <li>· 사용 조건 / 예약·문의</li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-7 rounded-2xl border border-brand-100 bg-brand-50/60 p-6">
              <h2 className="text-sm font-semibold text-brand-700">제공 혜택</h2>
              <p className="mt-1 text-lg font-bold text-ink">{view.title}</p>
              <p className="mt-1 text-xs text-ink-faint">
                진주역 스카이시티프라디움 인증 입주민 대상
              </p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {view.summary.map((line) => (
                  <li
                    key={line}
                    className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-sm font-medium text-ink shadow-soft"
                  >
                    <CheckCircle2
                      className="h-4 w-4 shrink-0 text-emerald-500"
                      aria-hidden
                    />
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-7">
              <h2 className="flex items-center gap-1.5 text-base font-bold text-ink">
                <Info className="h-4 w-4 text-brand-400" aria-hidden />
                이용 조건
              </h2>
              <ul className="mt-3 space-y-2">
                {view.conditions.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm text-ink-soft">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-300" />
                    {c}
                  </li>
                ))}
                <li className="flex items-start gap-2 text-sm text-ink-soft">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-300" />
                  사용 가능 횟수: {view.usageLimit}
                </li>
              </ul>
            </div>
          </>
        )}
      </div>

      {/* 우측: 권한별 액션 패널 */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        {view.locked ? (
          <LockedActionPanel level={level} />
        ) : (
          <>
            <CouponPanel benefit={view} partner={partner} />
            <p className="mt-3 px-1 text-center text-xs leading-relaxed text-ink-faint">
              제휴 매장에는 쿠폰의 유효성만 전달되며,
              <br />
              동·호수 등 개인정보는 제공되지 않습니다.
            </p>
          </>
        )}
      </aside>
    </div>
  );
}

function LockedActionPanel({ level }: { level: AccessLevel }) {
  const meta = getLockMeta(level)!;
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
