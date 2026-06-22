import Link from "next/link";
import { Gift, ChevronRight, Sparkles, Users } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { Hero } from "@/components/hero";
import { CategoryNav } from "@/components/category-nav";
import { BenefitCard } from "@/components/benefit-card";
import { GroupBuyCard } from "@/components/group-buy-card";
import { AuthStatusCard } from "@/components/auth-status-card";
import { StepsSection } from "@/components/steps-section";
import { NoticeSection } from "@/components/notice-section";
import { FaqSection } from "@/components/faq-section";
import { SafeImage } from "@/components/safe-image";
import { getFeaturedBenefits } from "@/lib/queries";
import { getServerAccessLevel } from "@/lib/access-server";
import { sanitizeBenefitByLevel, sanitizeGroupBuyByLevel } from "@/lib/access";
import { getGroupBuy, isClosingSoon } from "@/data/group-buys";

// 메인에 미리보기로 노출할 공동구매 (모집중 2 + 목표달성 1)
const PREVIEW_GROUP_BUY_IDS = ["gb-aircon", "gb-banchan", "gb-curtain"];

// 권한(쿠키)에 따라 서버에서 혜택을 정제하므로 동적 렌더
export const dynamic = "force-dynamic";

export default function HomePage() {
  const level = getServerAccessLevel();
  const featured = getFeaturedBenefits();

  // 공동구매 미리보기 — 권한별 서버 정제
  const groupBuyPreview = PREVIEW_GROUP_BUY_IDS.map((id) => getGroupBuy(id))
    .filter((gb): gb is NonNullable<typeof gb> => Boolean(gb))
    .map((gb) => ({
      view: sanitizeGroupBuyByLevel(gb, level),
      closingSoon: isClosingSoon(gb),
    }));

  return (
    <SiteShell>
      <Hero />

      {/* 카테고리 */}
      <section className="container-pad py-12">
        <CategoryNav />
      </section>

      {/* 추천 혜택 + 인증 현황 */}
      <section className="container-pad pb-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <h2 className="text-2xl font-bold text-ink">우리 동네 제휴 혜택</h2>
              <span className="badge bg-brand-600 text-cream-50">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                입주민 특별가
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {featured.map(({ benefit, partner }) => (
                <BenefitCard
                  key={benefit.id}
                  view={sanitizeBenefitByLevel(benefit, level)}
                  partner={partner}
                  level={level}
                />
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link href="/benefits" className="btn-secondary px-6">
                전체 혜택 더 보기
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>

          {/* 우측 사이드: 인증 현황 (데스크탑에서 sticky) */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <AuthStatusCard />
          </aside>
        </div>
      </section>

      {/* 공동구매 미리보기 */}
      <section className="container-pad py-10">
        <div className="rounded-3xl border border-line bg-white p-7 shadow-card sm:p-9">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold text-ink">
                <Users className="h-6 w-6 text-brand-500" aria-hidden />
                입주민 공동구매
              </h2>
              <p className="mt-2 text-sm text-ink-soft">
                우리 단지 주민이 함께 신청하면 더 좋은 조건으로 이용할 수 있어요.
              </p>
            </div>
            <Link
              href="/group-buy"
              className="btn-secondary shrink-0 self-start sm:self-auto"
            >
              공동구매 전체보기
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {groupBuyPreview.map(({ view, closingSoon }) => (
              <GroupBuyCard
                key={view.id}
                view={view}
                level={level}
                closingSoon={closingSoon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 프로모 배너 */}
      <section className="container-pad py-10">
        <div className="relative overflow-hidden rounded-3xl bg-brand-800 px-8 py-10 sm:px-12">
          <div className="absolute right-0 top-0 hidden h-full w-1/3 sm:block">
            <SafeImage
              src="/assets/gift-box.png"
              alt="입주민 전용 혜택 선물"
              sizes="33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-800 via-brand-800/60 to-transparent" />
          </div>
          <div className="relative max-w-xl">
            <span className="badge bg-gold/20 text-gold-soft">
              <Gift className="h-3.5 w-3.5" aria-hidden />
              입주민 전용
            </span>
            <h2 className="mt-3 text-2xl font-bold text-cream-50 sm:text-3xl">
              인증 한 번으로, 단지 전용 혜택을 평생 누리세요
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-cream-200/80">
              가입 후 관리자 승인만 받으면 제휴 매장의 특별가 혜택을 바로
              이용하실 수 있습니다.
            </p>
            <Link
              href="/signup"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 text-sm font-semibold text-brand-900 transition-colors hover:bg-gold-soft"
            >
              입주민 인증하고 시작하기
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <StepsSection />
      <NoticeSection />
      <FaqSection />
    </SiteShell>
  );
}
