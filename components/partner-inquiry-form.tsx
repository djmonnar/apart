"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { createPartnerInquiry } from "@/lib/partner-inquiries";

const inputCls =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-100";

const emptyForm = {
  businessName: "",
  category: "",
  contactName: "",
  phone: "",
  region: "",
  message: "",
};

const categories = [
  "음식/반찬",
  "뷰티/미용",
  "생활서비스",
  "청소/세차",
  "이사/인테리어",
  "교육/취미",
  "기타",
];

export function PartnerInquiryForm() {
  const [form, setForm] = useState(emptyForm);
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update =
    (key: keyof typeof form) =>
    (value: string) => {
      setSuccess(false);
      setForm((current) => ({ ...current, [key]: value }));
    };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (
      !form.businessName.trim() ||
      !form.category.trim() ||
      !form.contactName.trim() ||
      !form.phone.trim() ||
      !form.region.trim()
    ) {
      setError("필수 항목을 모두 입력해 주세요.");
      return;
    }

    if (!agree) {
      setError("개인정보 수집 및 이용에 동의해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      await createPartnerInquiry({
        businessName: form.businessName.trim(),
        category: form.category.trim(),
        contactName: form.contactName.trim(),
        phone: form.phone.trim(),
        region: form.region.trim(),
        message: form.message.trim(),
      });
      setForm(emptyForm);
      setAgree(false);
      setSuccess(true);
    } catch {
      setError("문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="card-base p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="업체명" required>
          <input
            value={form.businessName}
            onChange={(e) => update("businessName")(e.target.value)}
            className={inputCls}
            placeholder="예: 퍼스트헤어"
            required
          />
        </Field>
        <Field label="업종" required>
          <select
            value={form.category}
            onChange={(e) => update("category")(e.target.value)}
            className={inputCls}
            required
          >
            <option value="" disabled>
              업종 선택
            </option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </Field>
        <Field label="담당자 성함" required>
          <input
            value={form.contactName}
            onChange={(e) => update("contactName")(e.target.value)}
            className={inputCls}
            placeholder="성함"
            required
          />
        </Field>
        <Field label="연락처" required>
          <input
            value={form.phone}
            onChange={(e) => update("phone")(e.target.value)}
            className={inputCls}
            placeholder="010-0000-0000"
            inputMode="tel"
            required
          />
        </Field>
        <Field label="지역" required>
          <input
            value={form.region}
            onChange={(e) => update("region")(e.target.value)}
            className={inputCls}
            placeholder="예: 진주시 충무공동"
            required
          />
        </Field>
        <Field label="문의 내용" full>
          <textarea
            value={form.message}
            onChange={(e) => update("message")(e.target.value)}
            className={`${inputCls} min-h-[120px] resize-none`}
            placeholder="제안 가능한 혜택, 방문 가능 지역, 희망 제휴 조건을 적어주세요."
          />
        </Field>
      </div>

      <label className="mt-5 flex cursor-pointer items-start gap-2.5 rounded-xl bg-cream-100 p-3.5">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-brand-600"
        />
        <span className="text-xs leading-relaxed text-ink-soft">
          제휴 상담 응대를 위해 입력한 개인정보를 수집 및 이용하는 데 동의합니다.
        </span>
      </label>

      {success && (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          제휴업체 입점 문의가 접수되었습니다. 확인 후 순차적으로 연락드리겠습니다.
        </p>
      )}

      {error && (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm leading-relaxed text-rose-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary mt-6 w-full py-3.5 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Send className="h-4 w-4" aria-hidden />
        )}
        {submitting ? "문의 접수 중..." : "입점 문의하기"}
      </button>
    </form>
  );
}

function Field({
  label,
  full,
  required,
  children,
}: {
  label: string;
  full?: boolean;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </span>
      {children}
    </label>
  );
}
