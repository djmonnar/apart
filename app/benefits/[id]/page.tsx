import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { BenefitDetail } from "@/components/benefit-detail";
import { getBenefitWithPartner } from "@/lib/queries";
import { getServerAccessLevel } from "@/lib/access-server";
import { sanitizeBenefitByLevel } from "@/lib/access";

// 권한(쿠키)에 따라 서버에서 혜택을 정제하므로 동적 렌더
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const item = await getBenefitWithPartner(params.id);
  return { title: item ? `${item.partner.name} 혜택` : "혜택 상세" };
}

export default async function BenefitDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const item = await getBenefitWithPartner(params.id);
  if (!item) notFound();

  const level = getServerAccessLevel();
  // 미승인 사용자에게는 상세가 제거된 view가 생성된다 (URL 직접 접근 포함)
  const view = sanitizeBenefitByLevel(item.benefit, level);

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
        <BenefitDetail view={view} partner={item.partner} level={level} />
      </section>
    </SiteShell>
  );
}
