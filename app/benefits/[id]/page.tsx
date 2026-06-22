import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Phone,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Info,
} from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { SafeImage } from "@/components/safe-image";
import { CategoryBadge } from "@/components/category-badge";
import { CouponPanel } from "@/components/coupon-panel";
import { getBenefit, benefits } from "@/data/benefits";
import { getPartner } from "@/data/partners";

export function generateStaticParams() {
  return benefits.map((b) => ({ id: b.id }));
}

export function generateMetadata({
  params,
}: {
  params: { id: string };
}): Metadata {
  const benefit = getBenefit(params.id);
  const partner = benefit ? getPartner(benefit.partnerId) : undefined;
  return { title: partner ? `${partner.name} 혜택` : "혜택 상세" };
}

export default function BenefitDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const benefit = getBenefit(params.id);
  const partner = benefit ? getPartner(benefit.partnerId) : undefined;
  if (!benefit || !partner) notFound();

  return (
    <SiteShell>
      <div className="container-pad pt-8">
        <Link
          href="/benefits"
          className="inline-flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-brand-700"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          혜택 목록으로
        </Link>
      </div>

      <section className="container-pad py-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* 좌측: 업체/혜택 상세 */}
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
                {partner.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-brand-400" aria-hidden />
                    {partner.phone}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-brand-400" aria-hidden />
                  {benefit.validFrom.replace(/-/g, ".")} ~{" "}
                  {benefit.validTo.replace(/-/g, ".")}
                </span>
              </div>
            </div>

            {/* 혜택 요약 */}
            <div className="mt-7 rounded-2xl border border-brand-100 bg-brand-50/60 p-6">
              <h2 className="text-sm font-semibold text-brand-700">제공 혜택</h2>
              <p className="mt-1 text-lg font-bold text-ink">{benefit.title}</p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {benefit.summary.map((line) => (
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

            {/* 소개 */}
            <div className="mt-7">
              <h2 className="text-base font-bold text-ink">업체 소개</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {partner.description}
              </p>
            </div>

            {/* 이용 조건 */}
            <div className="mt-7">
              <h2 className="flex items-center gap-1.5 text-base font-bold text-ink">
                <Info className="h-4 w-4 text-brand-400" aria-hidden />
                이용 조건
              </h2>
              <ul className="mt-3 space-y-2">
                {benefit.conditions.map((c) => (
                  <li
                    key={c}
                    className="flex items-start gap-2 text-sm text-ink-soft"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-300" />
                    {c}
                  </li>
                ))}
                <li className="flex items-start gap-2 text-sm text-ink-soft">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-300" />
                  사용 가능 횟수: {benefit.usageLimit}
                </li>
              </ul>
            </div>
          </div>

          {/* 우측: 쿠폰 패널 (sticky) */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <CouponPanel benefit={benefit} />
            <p className="mt-3 px-1 text-center text-xs leading-relaxed text-ink-faint">
              제휴 매장에는 쿠폰의 유효성만 전달되며,
              <br />
              동·호수 등 개인정보는 제공되지 않습니다.
            </p>
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}
