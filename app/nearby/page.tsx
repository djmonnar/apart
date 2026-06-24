import type { Metadata } from "next";
import { NearbyPartnersMap } from "@/components/nearby-partners-map";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "내 주변 제휴업체" };

export default function NearbyPage() {
  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-cream">
      <SiteHeader />
      <main className="min-h-0 flex-1 overflow-hidden">
        <NearbyPartnersMap />
      </main>
    </div>
  );
}
