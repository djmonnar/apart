"use client";

import { useState } from "react";
import { ScanLine, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { getCouponByCode } from "@/data/coupons";
import { getBenefit } from "@/data/benefits";

type Result =
  | { kind: "idle" }
  | { kind: "invalid" }
  | { kind: "valid"; benefitTitle: string; usageLimit: string; code: string };

/**
 * 업체용 쿠폰 인증 — 쿠폰번호 유효성과 혜택 적용 가능 여부만 표시.
 * 입주민의 동·호수, 연락처 등 개인정보는 일절 노출하지 않는다.
 */
export function PartnerVerify() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<Result>({ kind: "idle" });

  const verify = (e: React.FormEvent) => {
    e.preventDefault();
    const coupon = getCouponByCode(input);
    const benefit = coupon ? getBenefit(coupon.benefitId) : undefined;
    if (coupon && benefit && coupon.status !== "used") {
      setResult({
        kind: "valid",
        benefitTitle: benefit.title,
        usageLimit: benefit.usageLimit,
        code: coupon.code,
      });
    } else {
      setResult({ kind: "invalid" });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* 입력 */}
      <form onSubmit={verify} className="card-base p-6">
        <h2 className="text-base font-bold text-ink">
          1회용 쿠폰번호 입력 또는 QR 인증
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          입주민이 제시한 쿠폰번호를 입력하거나 QR코드를 스캔하여 인증하세요.
        </p>

        <label className="mt-5 block">
          <span className="mb-1.5 block text-sm font-medium text-ink">
            쿠폰번호
          </span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="예) PRD-2026-ABCD-1234"
            className="w-full rounded-xl border border-line bg-white px-4 py-3 font-mono text-sm uppercase text-ink outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
          />
        </label>

        <div className="mt-4 flex gap-2">
          <button type="submit" className="btn-primary flex-1">
            인증하기
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setInput("PRD-2026-ABCD-1234");
              setResult({ kind: "idle" });
            }}
          >
            <ScanLine className="h-4 w-4" aria-hidden />
            QR 스캔
          </button>
        </div>
        <p className="mt-3 text-xs text-ink-faint">
          데모: 샘플 코드 <code className="font-mono">PRD-2026-ABCD-1234</code>{" "}
          로 인증을 확인할 수 있습니다.
        </p>
      </form>

      {/* 결과 */}
      <div className="card-base flex flex-col justify-center p-6">
        {result.kind === "idle" && (
          <div className="flex flex-col items-center gap-2 py-8 text-center text-ink-faint">
            <ShieldCheck className="h-9 w-9 text-brand-200" aria-hidden />
            <p className="text-sm">쿠폰번호를 입력하면 결과가 표시됩니다.</p>
          </div>
        )}

        {result.kind === "valid" && (
          <div>
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" aria-hidden />
              <p className="text-lg font-bold">인증 입주민 / 혜택 적용 가능</p>
            </div>
            <dl className="mt-5 space-y-3 rounded-2xl bg-cream-100 p-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-faint">쿠폰번호</dt>
                <dd className="font-mono font-medium text-ink">
                  {result.code}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-faint">혜택명</dt>
                <dd className="font-medium text-ink">{result.benefitTitle}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-faint">사용 가능</dt>
                <dd className="font-medium text-ink">{result.usageLimit}</dd>
              </div>
            </dl>
            <button className="btn-primary mt-4 w-full">사용 완료 처리</button>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-faint">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-400" aria-hidden />
              입주민 개인정보(동·호수·연락처)는 제공되지 않습니다.
            </p>
          </div>
        )}

        {result.kind === "invalid" && (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <XCircle className="h-9 w-9 text-rose-500" aria-hidden />
            <p className="font-bold text-ink">유효하지 않은 쿠폰입니다</p>
            <p className="text-sm text-ink-soft">
              번호를 다시 확인하거나 이미 사용된 쿠폰인지 확인해 주세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
