"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, UserRound, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { BrandMark } from "./brand-mark";

const NAV = [
  { label: "복지몰 홈", href: "/" },
  { label: "혜택 안내", href: "/benefits" },
  { label: "공동구매", href: "/group-buy" },
  { label: "아파트 도입문의", href: "/apartment" },
  { label: "이용 가이드", href: "/#guide" },
  { label: "공지사항", href: "/#notice" },
  { label: "자주 묻는 질문", href: "/#faq" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { status, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const isAuthed = status !== "guest";

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-cream/85 backdrop-blur-md">
      <div className="container-pad flex h-[68px] items-center justify-between gap-4">
        <Link href="/" className="shrink-0" aria-label="복지몰 홈">
          <BrandMark />
        </Link>

        <nav className="hidden items-center gap-0 lg:flex xl:gap-1" aria-label="주요 메뉴">
          {NAV.map((item) => {
            const baseHref = item.href.split("#")[0];
            const active =
              item.href === "/"
                ? pathname === "/"
                : item.href.includes("#")
                  ? pathname === baseHref
                  : pathname.startsWith(baseHref);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-2.5 py-2 text-sm font-medium transition-colors xl:px-3.5 ${
                  active
                    ? "text-brand-700"
                    : "text-ink-soft hover:text-brand-700"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {isAuthed ? (
            <>
              <Link href="/mypage" className="btn-secondary">
                <UserRound className="h-4 w-4" aria-hidden />
                마이페이지
              </Link>
              <button onClick={logout} className="btn-ghost" type="button">
                <LogOut className="h-4 w-4" aria-hidden />
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-secondary">
                <UserRound className="h-4 w-4" aria-hidden />
                로그인
              </Link>
              <Link href="/signup" className="btn-primary">
                회원가입
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="btn-ghost px-2 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* 모바일 메뉴 */}
      {open && (
        <div className="border-t border-line bg-cream lg:hidden">
          <nav className="container-pad flex flex-col py-3" aria-label="모바일 메뉴">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-ink-soft hover:bg-brand-50 hover:text-brand-700"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-line pt-3">
              {isAuthed ? (
                <>
                  <Link
                    href="/mypage"
                    onClick={() => setOpen(false)}
                    className="btn-secondary"
                  >
                    마이페이지
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    className="btn-ghost"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="btn-secondary"
                  >
                    로그인
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="btn-primary"
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
