import type { Metadata } from "next";
import Link from "next/link";
import { Users, ChevronRight, Megaphone, Sparkles } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import {
  GroupBuyBrowser,
  type GroupBuyItem,
} from "@/components/group-buy-browser";
import { groupBuys, isClosingSoon } from "@/data/group-buys";
import { getServerAccessLevel } from "@/lib/access-server";
import { sanitizeGroupBuyByLevel } from "@/lib/access";

export const metadata: Metadata = { title: "입주민 전용 공동구매" };

// 권한(쿠키)에 따라 서버에서 정제하므로 동적 렌더
export const dynamic = "force-dynamic";

export default function GroupBuyPage() {
  const level = getServerAccessLevel();

  // 서버에서 권한별 정제: 미승인 사용자에게는 가격/조건이 전송되지 않음
  const items: GroupBuyItem[] = groupBuys.map((gb) => ({
    view: sanitizeGroupBuyByLevel(gb, level),
    closingSoon: isClosingSoon(gb),
  }));

  return (
    <SiteShell>
      {/* 히어로 */}
      <section className="border-b border-line bg-gradient-to-br from-brand-800 to-brand-900 text-cream-50">
        <div className="container-pad py-14 sm:py-16">
          <span className="badge border border-gold/30 bg-white/10 text-gold-soft backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            입주민 전용 · 함께 사면 더 좋은 조건
          </span>
          <h1 className="mt-4 flex items-center gap-2 text-3xl font-bold sm:text-4xl">
            <Users className="hidden h-8 w-8 text-gold sm:block" aria-hidden />
            입주민 전용 공동구매
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-cream-200/90 sm:text-base">
            우리 단지 입주민이 함께 신청하면 더 좋은 조건으로 이용할 수 있습니다.
            생활에 꼭 필요한 서비스를 합리적으로 만나보세요.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#list"
              className="btn inline-flex justify-center bg-gold px-6 py-3.5 text-base text-brand-900 hover:bg-gold-soft"
            >
              진행 중인 공동구매 보기
            </Link>
            <Link
              href="/partner"
              className="btn inline-flex justify-center border border-cream-100/40 px-6 py-3.5 text-base text-cream-50 hover:bg-white/10"
            >
              <Megaphone className="h-5 w-5" aria-hidden />
              공동구매 제안하기
            </Link>
          </div>
        </div>
      </section>

      {/* 목록 */}
      <section id="list" className="container-pad scroll-mt-20 py-10">
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-2xl font-bold text-ink">진행 중인 공동구매</h2>
          <span className="badge bg-brand-600 text-cream-50">
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            우리 단지 한정
          </span>
        </div>
        <GroupBuyBrowser items={items} level={level} />
      </section>
    </SiteShell>
  );
}
