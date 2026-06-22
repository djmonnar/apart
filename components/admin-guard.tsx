"use client";

import Link from "next/link";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { accessLevel, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-50 text-ink-soft">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
        관리자 권한 확인 중...
      </div>
    );
  }

  if (!isAdmin && accessLevel !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-50 px-6">
        <div className="w-full max-w-md rounded-2xl border border-line bg-white p-10 text-center shadow-card">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-500">
            <ShieldAlert className="h-7 w-7" aria-hidden />
          </span>
          <h1 className="mt-4 text-lg font-bold text-ink">
            관리자 전용 페이지입니다
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            운영센터는 관리자 권한이 있는 계정만 이용할 수 있습니다.
            관리자 계정으로 로그인해 주세요.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Link href="/" className="btn-secondary">
              복지몰 홈
            </Link>
            <Link href="/login" className="btn-primary">
              로그인
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
