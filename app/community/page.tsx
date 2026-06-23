import type { Metadata } from "next";
import { CommunityList } from "@/components/community-list";
import { PageHero } from "@/components/page-hero";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = { title: "입주민 커뮤니티" };

export default function CommunityPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="COMMUNITY"
        title="입주민 커뮤니티"
        description="우리 단지 입주민만 함께 이용하는 소통 공간입니다. 개인정보와 동·호수는 공개되지 않고 닉네임으로만 표시됩니다."
      />
      <section className="container-pad py-10">
        <CommunityList />
      </section>
    </SiteShell>
  );
}
