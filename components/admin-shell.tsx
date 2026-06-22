import Link from "next/link";
import {
  Building2,
  ClipboardList,
  Gift,
  LayoutDashboard,
  Settings,
  Store,
  TicketCheck,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

const NAV: {
  label: string;
  icon: LucideIcon;
  href: string;
}[] = [
  { label: "대시보드", icon: LayoutDashboard, href: "/admin" },
  { label: "입주민 승인", icon: UserCheck, href: "/admin/users" },
  { label: "공동구매 관리", icon: Users, href: "/admin/group-buy" },
  { label: "혜택 사용내역", icon: TicketCheck, href: "/admin/coupons" },
  { label: "제휴업체 문의", icon: Store, href: "/admin/partner-inquiries" },
  { label: "아파트 도입 문의", icon: Building2, href: "/admin/apartment-inquiries" },
  { label: "혜택 관리", icon: Gift, href: "/admin" },
  { label: "업체 관리", icon: ClipboardList, href: "/admin" },
  { label: "설정", icon: Settings, href: "/admin" },
];

export function AdminShell({
  children,
  current = "대시보드",
}: {
  children: React.ReactNode;
  current?: string;
}) {
  return (
    <div className="flex min-h-screen bg-cream-50">
      <aside className="hidden w-64 shrink-0 flex-col bg-brand-900 text-cream-200 lg:flex">
        <div className="flex h-16 items-center gap-2 px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold text-brand-900">
            <LayoutDashboard className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-sm font-bold text-cream-50">운영센터</span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = item.label === current;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-brand-700 font-semibold text-cream-50"
                    : "text-cream-300/80 hover:bg-brand-800 hover:text-cream-50"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {item.label}
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

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-line bg-white px-4 py-3 sm:px-6 lg:h-16 lg:py-0">
          <div className="flex items-center justify-between gap-4 lg:h-full">
            <div>
              <h1 className="text-base font-bold text-ink">
                {current === "대시보드" ? "운영센터 대시보드" : current}
              </h1>
              <p className="text-xs text-ink-faint">
                진주역 스카이시티프라디움 · 입주민 복지몰 운영센터
              </p>
            </div>
            <span className="hidden items-center gap-2 text-sm text-ink-soft sm:flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sand-200 text-xs font-bold text-brand-700">
                관
              </span>
              관리자
            </span>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  item.label === current
                    ? "bg-brand-600 text-cream-50"
                    : "border border-line bg-white text-ink-soft"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
