import type { Metadata } from "next";
import { CommunityList } from "@/components/community-list";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = { title: "입주민 커뮤니티" };

export default function CommunityPage() {
  return (
    <SiteShell>
      <section className="container-pad py-7 sm:py-10">
        <CommunityList />
      </section>
    </SiteShell>
  );
}
