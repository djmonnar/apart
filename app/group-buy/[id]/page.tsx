import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { GroupBuyDetail } from "@/components/group-buy-detail";
import { getGroupBuy, isClosingSoon } from "@/data/group-buys";
import { getPartner } from "@/data/partners";
import { getServerAccessLevel } from "@/lib/access-server";
import { sanitizeGroupBuyByLevel } from "@/lib/access";

// 권한(쿠키)에 따라 서버에서 정제하므로 동적 렌더
export const dynamic = "force-dynamic";

export function generateMetadata({
  params,
}: {
  params: { id: string };
}): Metadata {
  const gb = getGroupBuy(params.id);
  return { title: gb ? `${gb.title} 공동구매` : "공동구매 상세" };
}

export default function GroupBuyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const gb = getGroupBuy(params.id);
  if (!gb) notFound();

  const level = getServerAccessLevel();
  // 미승인 사용자에게는 상세가 제거된 view 생성 (URL 직접 접근 포함)
  const view = sanitizeGroupBuyByLevel(gb, level);
  const partner = gb.partnerId ? getPartner(gb.partnerId) ?? null : null;

  return (
    <SiteShell>
      <div className="container-pad pt-8">
        <Link
          href="/group-buy"
          className="inline-flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-brand-700"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          공동구매 목록으로
        </Link>
      </div>

      <section className="container-pad py-6">
        <GroupBuyDetail
          view={view}
          level={level}
          closingSoon={isClosingSoon(gb)}
          partner={partner}
        />
      </section>
    </SiteShell>
  );
}
