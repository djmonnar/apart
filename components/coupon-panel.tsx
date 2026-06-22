"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Clock3,
  Ticket,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { generateCouponCode } from "@/data/coupons";
import { QrPreview } from "./qr-preview";
import type { Benefit } from "@/lib/types";

export function CouponPanel({ benefit }: { benefit: Benefit }) {
  const { status } = useAuth();
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const issue = () => setCode(generateCouponCode());
  const copy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  };

  // 미인증 / 승인대기: 쿠폰 사용 제한
  if (status === "guest" || status === "rejected") {
    return (
      <div className="card-base p-6">
        <div className="flex items-center gap-2 text-brand-600">
          <ShieldAlert className="h-5 w-5" aria-hidden />
          <p className="font-bold">입주민 인증이 필요합니다</p>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          혜택 정보는 누구나 열람할 수 있지만, 쿠폰 발급과 사용은 승인된 입주민만
          이용하실 수 있습니다.
        </p>
        <Link href="/signup" className="btn-primary mt-5 w-full">
          입주민 인증하기
        </Link>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="card-base p-6">
        <div className="flex items-center gap-2 text-amber-600">
          <Clock3 className="h-5 w-5" aria-hidden />
          <p className="font-bold">관리자 승인 대기 중입니다</p>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          관리자가 입주민 정보를 확인하고 있습니다. 승인이 완료되면 쿠폰을
          발급받을 수 있습니다.
        </p>
        <Link href="/mypage" className="btn-secondary mt-5 w-full">
          승인 상태 확인하기
        </Link>
      </div>
    );
  }

  // 승인 완료
  return (
    <div className="card-base p-6">
      <div className="flex items-center gap-2 text-emerald-600">
        <ShieldCheck className="h-5 w-5" aria-hidden />
        <p className="font-bold">인증 완료 입주민입니다</p>
      </div>

      {!code ? (
        <>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            아래 버튼을 누르면 1회용 쿠폰번호와 QR이 발급됩니다. 제휴 매장에서
            제시해 주세요.
          </p>
          <button onClick={issue} type="button" className="btn-primary mt-5 w-full">
            <Ticket className="h-4 w-4" aria-hidden />
            쿠폰 발급받기
          </button>
        </>
      ) : (
        <div className="mt-4">
          <div className="flex flex-col items-center rounded-2xl bg-cream-100 p-5">
            <QrPreview value={code} />
            <p className="mt-3 text-xs text-ink-faint">제휴 매장에 제시하세요</p>
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-soft">
              <span className="font-mono text-sm font-bold tracking-wider text-brand-800">
                {code}
              </span>
              <button
                type="button"
                onClick={copy}
                className="text-ink-faint hover:text-brand-600"
                aria-label="쿠폰번호 복사"
              >
                {copied ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <p className="mt-3 text-center text-xs leading-relaxed text-ink-faint">
            · 사용 가능: {benefit.usageLimit}
            <br />· 본 쿠폰은 1회용이며, 매장 사용 완료 처리 시 재사용이
            불가합니다.
          </p>
        </div>
      )}
    </div>
  );
}
