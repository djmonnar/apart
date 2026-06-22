import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  UserCheck,
  Store,
  Gift,
  Users,
  Ticket,
  Megaphone,
  BarChart3,
  Settings,
} from "lucide-react";

const NAV = [
  { label: "대시보드", icon: LayoutDashboard, href: "/admin" },
  { label: "아파트 관리", icon: Building2, href: "/admin" },
  { label: "입주민 승인", icon: UserCheck, href: "/admin", badge: 3 },
  { label: "제휴업체 관리", icon: Store, href: "/admin" },
  { label: "혜택 관리", icon: Gift, href: "/admin" },
  { label: "공동구매 관리", icon: Users, href: "/admin/group-buy" },
  { label: "쿠폰 사용내역", icon: Ticket, href: "/admin" },
  { label: "공지사항", icon: Megaphone, href: "/admin" },
  { label: "리포트", icon: BarChart3, href: "/admin" },
  { label: "설정", icon: Settings, href: "/admin" },
];

/** 관리자용 공통 셸 — 다크 사이드바 + 본문 (확장 가능한 기본 레이아웃) */
export function AdminShell({
  children,
  current = "대시보드",
}: {
  children: React.ReactNode;
  current?: string;
}) {
  return (
    <div className="flex min-h-screen bg-cream-50">
      {/* 사이드바 */}
      <aside className="hidden w-60 shrink-0 flex-col bg-brand-900 text-cream-200 lg:flex">
        <div className="flex h-16 items-center gap-2 px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold text-brand-900">
            <LayoutDashboard className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-sm font-bold text-cream-50">통합 관리자</span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map((n) => {
            const Icon = n.icon;
            const isActive = n.label === current;
            return (
              <Link
                key={n.label}
                href={n.href}
                className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-brand-700 font-semibold text-cream-50"
                    : "text-cream-300/80 hover:bg-brand-800 hover:text-cream-50"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4" aria-hidden />
                  {n.label}
                </span>
                {n.badge && (
                  <span className="rounded-full bg-gold px-1.5 py-0.5 text-[11px] font-bold text-brand-900">
                    {n.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/"
          className="m-3 rounded-lg bg-brand-800 px-3 py-2.5 text-center text-xs text-cream-200 hover:bg-brand-700"
        >
          입주민 사이트로
        </Link>
      </aside>

      {/* 본문 */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-line bg-white px-6">
          <div>
            <h1 className="text-base font-bold text-ink">
              {current === "대시보드" ? "관리자 대시보드" : current}
            </h1>
            <p className="text-xs text-ink-faint">
              진주역 스카이시티프라디움 · 입주민 전용 복지몰
            </p>
          </div>
          <span className="flex items-center gap-2 text-sm text-ink-soft">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sand-200 text-xs font-bold text-brand-700">
              관
            </span>
            관리자님
          </span>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
