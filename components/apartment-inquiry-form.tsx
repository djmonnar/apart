"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import {
  APARTMENT_INQUIRY_ROLES,
  createApartmentInquiry,
} from "@/lib/apartment-inquiries";
import { APARTMENT_INQUIRY_ROLE_LABEL } from "@/lib/constants";
import type { ApartmentInquiryRole } from "@/lib/types";

const inputCls =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-100";

const emptyForm = {
  apartmentName: "",
  region: "",
  householdCount: "",
  contactName: "",
  role: "residentRepresentative" as ApartmentInquiryRole,
  phone: "",
  message: "",
};

export function ApartmentInquiryForm() {
  const [form, setForm] = useState(emptyForm);
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update =
    <Key extends keyof typeof form>(key: Key) =>
    (value: (typeof form)[Key]) => {
      setSuccess(false);
      setForm((current) => ({ ...current, [key]: value }));
    };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (
      !form.apartmentName.trim() ||
      !form.region.trim() ||
      !form.householdCount.trim() ||
      !form.contactName.trim() ||
      !form.phone.trim()
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
      await createApartmentInquiry({
        apartmentName: form.apartmentName.trim(),
        region: form.region.trim(),
        householdCount: form.householdCount.trim(),
        contactName: form.contactName.trim(),
        role: form.role,
        phone: form.phone.trim(),
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
    <form onSubmit={submit} className="card-base p-5 sm:p-6 lg:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="아파트명" required>
          <input
            value={form.apartmentName}
            onChange={(e) => update("apartmentName")(e.target.value)}
            className={inputCls}
            placeholder="예: 진주역 스카이시티프라디움"
            required
          />
        </Field>
        <Field label="지역" required>
          <input
            value={form.region}
            onChange={(e) => update("region")(e.target.value)}
            className={inputCls}
            placeholder="예: 경남 진주시"
            required
          />
        </Field>
        <Field label="세대수" required>
          <input
            value={form.householdCount}
            onChange={(e) => update("householdCount")(e.target.value)}
            className={inputCls}
            placeholder="예: 1,200세대"
            required
          />
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
        <Field label="직책" required>
          <select
            value={form.role}
            onChange={(e) => update("role")(e.target.value as ApartmentInquiryRole)}
            className={inputCls}
            required
          >
            {APARTMENT_INQUIRY_ROLES.map((role) => (
              <option key={role} value={role}>
                {APARTMENT_INQUIRY_ROLE_LABEL[role]}
              </option>
            ))}
          </select>
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
        <Field label="문의 내용" full>
          <textarea
            value={form.message}
            onChange={(e) => update("message")(e.target.value)}
            className={`${inputCls} min-h-[132px] resize-none`}
            placeholder="단지 상황, 시범 운영 희망 시기, 궁금한 점을 남겨주세요."
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
          도입 문의 응대와 안내를 위해 입력한 개인정보를 수집 및 이용하는 데
          동의합니다.
        </span>
      </label>

      {success && (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          도입 문의가 접수되었습니다. 확인 후 순차적으로 연락드리겠습니다.
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
        className="btn-primary mt-6 w-full py-3.5 text-base disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Send className="h-4 w-4" aria-hidden />
        )}
        {submitting ? "문의 접수 중..." : "도입 문의하기"}
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
