import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CommunityDetail } from "@/components/community-detail";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = { title: "커뮤니티 글 보기" };

export default function CommunityPostPage({
  params,
}: {
  params: { postId: string };
}) {
  return (
    <SiteShell>
      <section className="container-pad py-8">
        <Link
          href="/community"
          className="inline-flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-brand-700"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          커뮤니티 목록으로
        </Link>
        <div className="mt-5">
          <CommunityDetail postId={params.postId} />
        </div>
      </section>
    </SiteShell>
  );
}
