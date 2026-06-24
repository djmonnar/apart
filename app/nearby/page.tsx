import type { Metadata } from "next";
import { NearbyPartnersMap } from "@/components/nearby-partners-map";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = { title: "내 주변 제휴업체" };

export default function NearbyPage() {
  return (
    <SiteShell>
      <section className="container-pad py-7 sm:py-10">
        <NearbyPartnersMap />
      </section>
    </SiteShell>
  );
}
