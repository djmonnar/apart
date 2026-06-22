"use client";

import { useState } from "react";
import { FlaskConical, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import type { MemberStatus } from "@/lib/types";

const OPTIONS: { value: MemberStatus; label: string }[] = [
  { value: "guest", label: "미인증" },
  { value: "pending", label: "승인대기" },
  { value: "approved", label: "승인완료" },
];

/**
 * 데모 전용: 입주민 인증 상태를 즉시 전환해 화면을 미리 볼 수 있게 하는 플로팅 컨트롤.
 * 실제 서비스에서는 제거한다.
 */
export function DemoStatusSwitcher() {
  const { status, setDemoStatus } = useAuth();
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-brand-700 px-4 py-2.5 text-xs font-semibold text-cream-50 shadow-card-hover hover:bg-brand-800"
      >
        <FlaskConical className="h-4 w-4" aria-hidden />
        데모 상태 전환
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 w-60 rounded-2xl border border-line bg-white p-4 shadow-card-hover">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-ink">데모 상태 전환</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="닫기"
          className="text-ink-faint hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-1 text-[11px] leading-snug text-ink-faint">
        인증 상태별 화면을 미리 확인하세요.
      </p>
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setDemoStatus(opt.value)}
            className={`rounded-lg px-2 py-2 text-xs font-medium transition-colors ${
              status === opt.value
                ? "bg-brand-600 text-cream-50"
                : "bg-sand-100 text-brand-600 hover:bg-brand-100"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
