"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, UserRound, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { BrandMark } from "./brand-mark";

const NAV = [
  { label: "복지몰 홈", href: "/" },
  { label: "커뮤니티", href: "/community", highlight: true },
  { label: "내 주변", href: "/nearby" },
  { label: "혜택 안내", href: "/benefits" },
  { label: "공동구매", href: "/group-buy" },
  { label: "공지사항", href: "/#notice" },
  { label: "자주 묻는 질문", href: "/#faq" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { status, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const isAuthed = status !== "guest";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1480px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="min-w-0 shrink-0" aria-label="복지몰 홈">
          <BrandMark compact />
        </Link>

        <nav
          className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 xl:flex"
          aria-label="주요 메뉴"
        >
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : item.href.includes("#")
                  ? false
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 whitespace-nowrap rounded-lg px-2.5 py-2 text-[13px] font-semibold transition-colors 2xl:px-3 2xl:text-sm ${
                  active
                    ? "bg-brand-600 text-cream-50"
                    : item.highlight
                      ? "bg-brand-50 text-brand-800 hover:bg-brand-100"
                      : "text-ink-soft hover:bg-brand-50 hover:text-brand-700"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 xl:flex">
          {isAuthed ? (
            <>
              <Link href="/mypage" className="btn-secondary h-10 whitespace-nowrap rounded-lg px-3.5 py-2">
                <UserRound className="h-4 w-4" aria-hidden />
                마이페이지
              </Link>
              <button
                onClick={logout}
                className="btn-ghost h-10 whitespace-nowrap rounded-lg px-3.5 py-2"
                type="button"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-secondary h-10 whitespace-nowrap rounded-lg px-3.5 py-2">
                <UserRound className="h-4 w-4" aria-hidden />
                로그인
              </Link>
              <Link href="/signup" className="btn-primary h-10 whitespace-nowrap rounded-lg px-3.5 py-2">
                회원가입
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="btn-ghost h-10 w-10 shrink-0 rounded-lg p-0 xl:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* 모바일 메뉴 */}
      {open && (
        <div className="border-t border-line bg-cream shadow-card xl:hidden">
          <nav
            className="mx-auto grid w-full max-w-[760px] grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-2 sm:px-6"
            aria-label="모바일 메뉴"
          >
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`whitespace-nowrap rounded-lg px-3 py-3 text-sm font-semibold hover:bg-brand-50 hover:text-brand-700 ${
                  item.highlight ? "bg-brand-50 text-brand-800" : "text-ink-soft"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-line pt-3 sm:col-span-2">
              {isAuthed ? (
                <>
                  <Link
                    href="/mypage"
                    onClick={() => setOpen(false)}
                    className="btn-secondary whitespace-nowrap rounded-lg px-3 py-2.5"
                  >
                    <UserRound className="h-4 w-4" aria-hidden />
                    마이페이지
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    className="btn-ghost whitespace-nowrap rounded-lg px-3 py-2.5"
                  >
                    <LogOut className="h-4 w-4" aria-hidden />
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="btn-secondary whitespace-nowrap rounded-lg px-3 py-2.5"
                  >
                    <UserRound className="h-4 w-4" aria-hidden />
                    로그인
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="btn-primary whitespace-nowrap rounded-lg px-3 py-2.5"
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
