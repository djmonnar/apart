"use client";

import Link from "next/link";
import { ShieldCheck, ShieldAlert, Clock3, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { MEMBER_STATUS_META } from "@/lib/constants";

const TONE: Record<string, string> = {
  neutral: "bg-sand-200 text-brand-500",
  warning: "bg-amber-100 text-amber-700",
  success: "bg-emerald-100 text-emerald-700",
  danger: "bg-rose-100 text-rose-700",
};

export function AuthStatusCard() {
  const { status, user } = useAuth();
  const meta = MEMBER_STATUS_META[status];

  const view = {
    guest: {
      icon: ShieldAlert,
      title: "미인증 상태입니다",
      desc: "입주민 인증을 완료하시면\n모든 혜택을 이용하실 수 있습니다.",
      cta: { label: "입주민 인증하기", href: "/signup" },
    },
    pending: {
      icon: Clock3,
      title: "관리자 승인 대기 중입니다",
      desc: "관리자가 입주민 정보를 확인하고 있습니다.\n승인 후 쿠폰 사용이 가능합니다.",
      cta: { label: "마이페이지 보기", href: "/mypage" },
    },
    approved: {
      icon: ShieldCheck,
      title: "인증 완료 입주민입니다",
      desc: "모든 제휴 혜택과 쿠폰을\n자유롭게 이용하실 수 있습니다.",
      cta: { label: "마이페이지 보기", href: "/mypage" },
    },
    rejected: {
      icon: ShieldAlert,
      title: "인증이 반려되었습니다",
      desc: "입력 정보를 확인 후 다시 신청해 주세요.",
      cta: { label: "다시 신청하기", href: "/signup" },
    },
  }[status];

  const Icon = view.icon;

  return (
    <div className="card-base flex flex-col p-6">
      <div className="flex items-center gap-2">
        <h3 className="text-base font-bold text-ink">입주민 인증 현황</h3>
        <span className={`badge ${TONE[meta.tone]}`}>{meta.label}</span>
      </div>

      <div className="mt-5 flex items-start gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${TONE[meta.tone]}`}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="font-semibold text-ink">{view.title}</p>
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
            {view.desc}
          </p>
        </div>
      </div>

      <Link
        href={view.cta.href}
        className="btn-primary mt-5 w-full justify-between px-4"
      >
        {view.cta.label}
        <ChevronRight className="h-4 w-4" aria-hidden />
      </Link>

      <dl className="mt-5 space-y-2.5 border-t border-line pt-4 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-ink-faint">승인 상태</dt>
          <dd className="font-medium text-ink">{meta.label}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-ink-faint">신청일</dt>
          <dd className="font-medium text-ink">{user?.appliedAt ?? "-"}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-ink-faint">최근 로그인</dt>
          <dd className="font-medium text-ink">{user?.lastLoginAt ?? "-"}</dd>
        </div>
      </dl>

      <p className="mt-4 text-xs text-ink-faint">
        * 관리자 승인 후 쿠폰 사용이 가능합니다.
      </p>
    </div>
  );
}
