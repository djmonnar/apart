import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/page-hero";
import { BenefitsBrowser } from "@/components/benefits-browser";
import { CATEGORY_LABEL } from "@/lib/constants";
import type { CategoryId } from "@/lib/types";

export const metadata: Metadata = { title: "혜택 안내" };

const VALID = Object.keys(CATEGORY_LABEL) as CategoryId[];

export default function BenefitsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const raw = searchParams.category;
  const initialCategory =
    raw && VALID.includes(raw as CategoryId) ? (raw as CategoryId) : "all";

  return (
    <SiteShell>
      <PageHero
        eyebrow="BENEFITS"
        title="혜택 안내"
        description="진주역 스카이시티프라디움 입주민만을 위한 제휴 혜택을 한눈에 살펴보세요. 카테고리와 검색으로 원하는 혜택을 빠르게 찾을 수 있습니다."
      />
      <section className="container-pad py-10">
        <BenefitsBrowser initialCategory={initialCategory} />
      </section>
    </SiteShell>
  );
}
