"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, PenLine } from "lucide-react";

const HIDDEN_PREFIXES = [
  "/admin",
  "/login",
  "/signup",
  "/community/write",
  "/partner/verify",
];

export function MobileActionBar() {
  const pathname = usePathname();

  if (
    HIDDEN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
  ) {
    return null;
  }

  const showNearby = pathname !== "/nearby";
  const showWrite = pathname !== "/community/write";
  const actionCount = Number(showNearby) + Number(showWrite);

  if (!showNearby && !showWrite) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] sm:hidden"
      aria-label="빠른 실행"
    >
      <div
        className={`mx-auto grid max-w-sm gap-2 rounded-2xl border border-brand-200 bg-white/95 p-2 shadow-[0_18px_46px_-22px_rgba(51,39,26,0.55)] backdrop-blur ${
          actionCount === 1 ? "grid-cols-1" : "grid-cols-2"
        }`}
      >
        {showNearby && (
          <Link
            href="/nearby"
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-700 text-sm font-bold text-cream-50"
          >
            <MapPin className="h-4 w-4" aria-hidden />
            내 주변
          </Link>
        )}
        {showWrite && (
          <Link
            href="/community/write"
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-sand-100 text-sm font-bold text-brand-800"
          >
            <PenLine className="h-4 w-4" aria-hidden />
            글쓰기
          </Link>
        )}
      </div>
    </nav>
  );
}
