import type { Metadata } from "next";
import { CommunityWriteForm } from "@/components/community-write-form";
import { PageHero } from "@/components/page-hero";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = { title: "커뮤니티 글쓰기" };

export default function CommunityWritePage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="COMMUNITY"
        title="커뮤니티 글쓰기"
        description="닉네임으로만 표시됩니다. 실명, 동·호수, 연락처 등 개인정보는 본문에 입력하지 마세요."
      />
      <section className="container-pad py-10">
        <CommunityWriteForm />
      </section>
    </SiteShell>
  );
}
