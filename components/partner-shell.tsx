import Link from "next/link";
import { Store, ExternalLink } from "lucide-react";

const PARTNER_NAV = [
  { label: "혜택 인증센터", href: "/partner" },
  { label: "혜택 관리", href: "/partner" },
  { label: "사용 내역", href: "/partner" },
  { label: "업체 정보 관리", href: "/partner" },
];

/** 업체용(제휴 매장) 공통 셸 — 확장 가능한 기본 레이아웃 */
export function PartnerShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="border-b border-line bg-white/90 backdrop-blur">
        <div className="container-pad flex h-16 items-center justify-between gap-4">
          <Link href="/partner" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-cream-50">
              <Store className="h-5 w-5" aria-hidden />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-bold text-brand-800">
                업체용 혜택 인증센터
              </span>
              <span className="text-[11px] text-ink-faint">
                진주역 스카이시티프라디움 입주민 복지몰
              </span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {PARTNER_NAV.map((n, i) => (
              <Link
                key={n.label}
                href={n.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  i === 0
                    ? "text-brand-700"
                    : "text-ink-soft hover:text-brand-700"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <Link href="/" className="btn-secondary text-xs">
            입주민 사이트
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-line py-5 text-center text-xs text-ink-faint">
        © 2026 진주역 스카이시티프라디움 입주민 복지몰 · 업체용
      </footer>
    </div>
  );
}
