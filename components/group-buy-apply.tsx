"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  X,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  UserRound,
  Send,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { canApplyGroupBuy } from "@/lib/access";
import { createGroupBuyApplication } from "@/lib/group-buy-applications";
import { firebaseAuthErrorMessage } from "@/lib/auth-errors";

/**
 * 공동구매 참여 신청 버튼 + 모달.
 * 승인 완료 입주민만 신청 실행 가능. 회원 정보(이름/연락처/동/호수)는 자동 입력.
 * 신청 정보는 관리자만 확인하며, 제휴업체에는 개인정보가 제공되지 않는다.
 */
export function GroupBuyApply({
  groupBuyId,
  title,
}: {
  groupBuyId: string;
  title: string;
}) {
  const { accessLevel, profile } = useAuth();
  const allowed = accessLevel === "admin" || canApplyGroupBuy(profile);
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 사이드바용 버튼 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={!allowed}
        className="btn-primary w-full"
      >
        <Send className="h-4 w-4" aria-hidden />
        참여하기
      </button>

      {/* 모바일 하단 고정 바 */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream/95 p-3 backdrop-blur lg:hidden">
        <div className="container-pad px-4">
          <button
            type="button"
            onClick={() => setOpen(true)}
            disabled={!allowed}
            className="btn-primary w-full"
          >
            <Send className="h-4 w-4" aria-hidden />
            공동구매 참여하기
          </button>
        </div>
      </div>

      {open && (
        <ApplyModal
          groupBuyId={groupBuyId}
          title={title}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function ApplyModal({
  groupBuyId,
  title,
  onClose,
}: {
  groupBuyId: string;
  title: string;
  onClose: () => void;
}) {
  const { accessLevel, profile, user } = useAuth();
  const allowed = accessLevel === "admin" || canApplyGroupBuy(profile);
  const [form, setForm] = useState({
    name: profile?.name ?? "",
    phone: profile?.phone ?? "",
    building: profile?.building ?? "",
    unit: profile?.unit ?? "",
    memo: "",
  });
  const [agree, setAgree] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const update = (key: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  // Esc로 닫기 + 배경 스크롤 잠금
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!allowed || !user) {
      setError("승인 완료 입주민만 공동구매를 신청할 수 있습니다.");
      return;
    }

    if (!agree) {
      setError("개인정보 수집 및 이용에 동의해 주세요.");
      return;
    }

    if (!form.name.trim() || !form.phone.trim() || !form.building.trim() || !form.unit.trim()) {
      setError("이름, 연락처, 동, 호수를 모두 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createGroupBuyApplication({
        groupBuyId,
        groupBuyTitle: title,
        userId: user.uid,
        userName: form.name.trim(),
        phone: form.phone.trim(),
        building: form.building.trim(),
        unit: form.unit.trim(),
        memo: form.memo.trim(),
      });

      if (result === "duplicate") {
        setNotice("이미 신청한 공동구매입니다. 마이페이지에서 신청 내역을 확인해주세요.");
        return;
      }

      setSubmitted(true);
    } catch (err) {
      setError(firebaseAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-brand-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="공동구매 참여 신청"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-cream-50 p-6 shadow-card-hover sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          <div className="flex flex-col items-center py-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" aria-hidden />
            </span>
            <h2 className="mt-5 text-lg font-bold text-ink">
              공동구매 신청이 완료되었습니다
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              공동구매 신청이 완료되었습니다. 모집 마감 후 순차적으로 안내드리겠습니다.
              <br />
              신청 내역은 마이페이지에서 확인하실 수 있습니다.
            </p>
            <button onClick={onClose} className="btn-primary mt-6 w-full">
              확인
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-ink">공동구매 참여 신청</h2>
                <p className="mt-1 text-sm text-ink-soft">{title}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="닫기"
                className="text-ink-faint hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-1.5 rounded-xl bg-brand-50 px-3.5 py-2.5 text-xs text-brand-700">
              <UserRound className="h-3.5 w-3.5 shrink-0" aria-hidden />
              회원 정보가 자동 입력되었습니다. 필요 시 수정하세요.
            </div>

            <form onSubmit={submit} className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="이름" value={form.name} onChange={update("name")} />
                <Field
                  label="연락처"
                  value={form.phone}
                  onChange={update("phone")}
                  type="tel"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="동" value={form.building} onChange={update("building")} />
                <Field label="호수" value={form.unit} onChange={update("unit")} />
              </div>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">
                  요청 메모 (선택)
                </span>
                <textarea
                  value={form.memo}
                  onChange={(e) => update("memo")(e.target.value)}
                  rows={3}
                  placeholder="요청 사항이 있으면 입력해 주세요."
                  className="w-full resize-none rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
                />
              </label>

              <label className="flex cursor-pointer items-start gap-2.5 rounded-xl bg-cream-100 p-3.5">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-brand-600"
                />
                <span className="text-xs leading-relaxed text-ink-soft">
                  개인정보 수집 및 이용에 동의합니다. 신청 정보는{" "}
                  <strong className="text-brand-700">관리자만 확인</strong>하며,
                  제휴업체에는 동·호수·연락처가 제공되지 않습니다.
                </span>
              </label>

              {notice && (
                <p className="flex items-start gap-1.5 rounded-xl bg-amber-50 px-3.5 py-2.5 text-xs leading-relaxed text-amber-700">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  {notice}
                </p>
              )}

              {error && (
                <p className="flex items-start gap-1.5 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs leading-relaxed text-rose-600">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={!agree || submitting}
                className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                )}
                {submitting ? "신청 저장 중..." : "신청 완료하기"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <input
        type={type}
        value={value}
        required
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
      />
    </label>
  );
}
