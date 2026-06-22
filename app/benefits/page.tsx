import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/page-hero";
import { BenefitsBrowser, type BrowserItem } from "@/components/benefits-browser";
import { getBenefitsWithPartner } from "@/lib/queries";
import { getServerAccessLevel } from "@/lib/access-server";
import { sanitizeBenefitByLevel } from "@/lib/access";
import { CATEGORY_LABEL } from "@/lib/constants";
import type { CategoryId } from "@/lib/types";

export const metadata: Metadata = { title: "혜택 안내" };

// 권한(쿠키)에 따라 서버에서 혜택을 정제하므로 동적 렌더
export const dynamic = "force-dynamic";

const VALID = Object.keys(CATEGORY_LABEL) as CategoryId[];

export default function BenefitsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const level = getServerAccessLevel();
  const raw = searchParams.category;
  const initialCategory =
    raw && VALID.includes(raw as CategoryId) ? (raw as CategoryId) : "all";

  // 서버에서 권한별 정제: 미승인 사용자에게는 상세 혜택이 전송되지 않음
  const items: BrowserItem[] = getBenefitsWithPartner().map(
    ({ benefit, partner }) => ({
      view: sanitizeBenefitByLevel(benefit, level),
      partner,
    }),
  );

  return (
    <SiteShell>
      <PageHero
        eyebrow="BENEFITS"
        title="혜택 안내"
        description="진주역 스카이시티프라디움 입주민만을 위한 제휴 혜택을 한눈에 살펴보세요. 카테고리와 검색으로 원하는 혜택을 빠르게 찾을 수 있습니다."
      />
      <section className="container-pad py-10">
        <BenefitsBrowser
          items={items}
          level={level}
          initialCategory={initialCategory}
        />
      </section>
    </SiteShell>
  );
}
