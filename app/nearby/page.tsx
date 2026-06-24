import type { Metadata } from "next";
import { NearbyPartnersMap } from "@/components/nearby-partners-map";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = { title: "내 주변 제휴업체" };

export default function NearbyPage() {
  return (
    <SiteShell>
      <section className="py-0 lg:py-10">
        <div className="mx-auto w-full lg:max-w-content lg:px-8">
          <NearbyPartnersMap />
        </div>
      </section>
    </SiteShell>
  );
}
