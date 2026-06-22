"use client";

import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  ScanLine,
  ShieldCheck,
  XCircle,
} from "lucide-react";

type CouponVerifyResponse = {
  valid: boolean;
  couponId?: string | null;
  code?: string | null;
  benefitTitle?: string | null;
  partnerName?: string | null;
  status?: "issued" | "used" | "expired" | "cancelled" | "not_found";
  expiresAt?: string | null;
  usedAt?: string | null;
  usedByPartnerName?: string | null;
  message: string;
};

const STATUS_LABEL: Record<string, string> = {
  issued: "사용 가능",
  used: "사용 완료",
  expired: "만료",
  cancelled: "취소",
  not_found: "없음",
};

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function PartnerVerify() {
  const [input, setInput] = useState("");
  const [partnerName, setPartnerName] = useState("제휴업체");
  const [result, setResult] = useState<CouponVerifyResponse | null>(null);
  const [recent, setRecent] = useState<CouponVerifyResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [usingCoupon, setUsingCoupon] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verify = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/coupons/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: input }),
      });
      const data = (await response.json()) as CouponVerifyResponse;
      if (!response.ok) {
        setError(data.message || "쿠폰 인증 중 오류가 발생했습니다.");
      }
      setResult(data);
    } catch {
      setError("쿠폰 인증 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const useCoupon = async () => {
    if (!result?.couponId && !input.trim()) return;

    setUsingCoupon(true);
    setError(null);

    try {
      const response = await fetch("/api/coupons/use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          couponId: result?.couponId,
          code: input,
          partnerId: "partner-demo",
          partnerName: partnerName.trim() || "제휴업체",
        }),
      });
      const data = (await response.json()) as CouponVerifyResponse;
      if (!response.ok) {
        setError(data.message || "사용 완료 처리 중 오류가 발생했습니다.");
      }
      setResult(data);
      if (data.status === "used") {
        setRecent((prev) => [data, ...prev].slice(0, 5));
      }
    } catch {
      setError("사용 완료 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setUsingCoupon(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={verify} className="card-base p-6">
        <h2 className="text-base font-bold text-ink">쿠폰번호 인증</h2>
        <p className="mt-1 text-sm text-ink-soft">
          입주민이 제시한 쿠폰번호를 입력해 혜택 적용 가능 여부만 확인합니다.
        </p>

        <label className="mt-5 block">
          <span className="mb-1.5 block text-sm font-medium text-ink">
            쿠폰번호
          </span>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="예: 482913"
            className="w-full rounded-xl border border-line bg-white px-4 py-3 font-mono text-sm uppercase text-ink outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium text-ink">
            처리 업체명
          </span>
          <input
            value={partnerName}
            onChange={(event) => setPartnerName(event.target.value)}
            placeholder="업체명을 입력해주세요"
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
          />
        </label>

        {error && (
          <p className="mt-4 flex items-start gap-1.5 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs leading-relaxed text-rose-600">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            {error}
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <ShieldCheck className="h-4 w-4" aria-hidden />
            )}
            인증하기
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setInput("");
              setResult(null);
              setError(null);
            }}
          >
            <ScanLine className="h-4 w-4" aria-hidden />
            초기화
          </button>
        </div>
        <p className="mt-3 text-xs text-ink-faint">
          업체 화면에는 입주민 이름, 동·호수, 연락처가 표시되지 않습니다.
        </p>
      </form>

      <div className="card-base flex flex-col justify-center p-6">
        {!result && (
          <div className="flex flex-col items-center gap-2 py-8 text-center text-ink-faint">
            <ShieldCheck className="h-9 w-9 text-brand-200" aria-hidden />
            <p className="text-sm">쿠폰번호를 입력하면 인증 결과가 표시됩니다.</p>
          </div>
        )}

        {result && result.valid && result.status === "issued" && (
          <div>
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" aria-hidden />
              <p className="text-lg font-bold">인증 완료 · 혜택 적용 가능</p>
            </div>
            <ResultDetails result={result} />
            <button
              type="button"
              onClick={useCoupon}
              disabled={usingCoupon}
              className="btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {usingCoupon && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              )}
              사용 완료 처리
            </button>
          </div>
        )}

        {result && (!result.valid || result.status !== "issued") && (
          <div>
            <div className="flex items-center gap-2 text-rose-600">
              {result.status === "used" ? (
                <CheckCircle2 className="h-6 w-6" aria-hidden />
              ) : (
                <XCircle className="h-6 w-6" aria-hidden />
              )}
              <p className="text-lg font-bold">{result.message}</p>
            </div>
            <ResultDetails result={result} />
          </div>
        )}
      </div>

      <section className="card-base p-6 lg:col-span-2">
        <h2 className="text-base font-bold text-ink">최근 사용 처리 내역</h2>
        {recent.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-line py-8 text-center text-sm text-ink-soft">
            이번 화면에서 사용 완료 처리한 쿠폰이 아직 없습니다.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-ink-faint">
                  <th className="py-2.5 font-medium">사용일시</th>
                  <th className="py-2.5 font-medium">쿠폰번호</th>
                  <th className="py-2.5 font-medium">혜택명</th>
                  <th className="py-2.5 font-medium">처리 업체</th>
                  <th className="py-2.5 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((item) => (
                  <tr key={`${item.couponId}-${item.usedAt}`} className="border-b border-line/60">
                    <td className="py-3 text-ink-soft">
                      {formatDateTime(item.usedAt)}
                    </td>
                    <td className="py-3 font-mono font-bold text-brand-700">
                      {item.code}
                    </td>
                    <td className="py-3 font-medium text-ink">
                      {item.benefitTitle}
                    </td>
                    <td className="py-3 text-ink-soft">
                      {item.usedByPartnerName ?? partnerName}
                    </td>
                    <td className="py-3">
                      <span className="badge bg-emerald-100 text-emerald-700">
                        사용 완료
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function ResultDetails({ result }: { result: CouponVerifyResponse }) {
  return (
    <dl className="mt-5 space-y-3 rounded-2xl bg-cream-100 p-5 text-sm">
      <ResultRow label="쿠폰번호" value={result.code ?? "-"} mono />
      <ResultRow label="혜택명" value={result.benefitTitle ?? "-"} />
      <ResultRow label="업체명" value={result.partnerName ?? "-"} />
      <ResultRow
        label="쿠폰 상태"
        value={result.status ? STATUS_LABEL[result.status] ?? result.status : "-"}
      />
      {result.expiresAt && (
        <ResultRow label="유효기간" value={formatDateTime(result.expiresAt)} />
      )}
      {result.usedAt && (
        <ResultRow label="사용일시" value={formatDateTime(result.usedAt)} />
      )}
    </dl>
  );
}

function ResultRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-faint">{label}</dt>
      <dd className={`text-right font-medium text-ink ${mono ? "font-mono" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
