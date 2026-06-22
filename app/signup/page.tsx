"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, ShieldCheck, Check } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { SafeImage } from "@/components/safe-image";
import { useAuth } from "@/lib/auth-context";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [form, setForm] = useState({ dong: "", ho: "", name: "", phone: "" });
  const [agree, setAgree] = useState(false);

  const update = (key: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) return;
    signup(form);
    router.push("/mypage");
  };

  return (
    <SiteShell>
      <section className="container-pad py-12">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
          {/* 안내 */}
          <div className="order-2 lg:order-1">
            <span className="badge bg-brand-600 text-cream-50">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              입주민 전용
            </span>
            <h1 className="mt-4 text-2xl font-bold text-ink sm:text-3xl">
              입주민 인증하고
              <br />
              단지 전용 혜택을 시작하세요
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              동·호수·이름·휴대폰번호를 입력해 가입을 신청하시면, 관리자가
              입주민 명부와 대조하여 승인합니다.
            </p>

            <div className="relative mt-6 aspect-[16/10] overflow-hidden rounded-3xl shadow-card">
              <SafeImage
                src="/assets/signup-flow.png"
                alt="회원가입 및 혜택 선택 흐름 안내"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>

            <ul className="mt-6 space-y-2.5">
              {[
                "가입 신청 후 관리자 승인이 완료되면 모든 혜택 이용 가능",
                "승인 전에도 혜택 열람은 자유롭게 가능",
                "제휴 매장에는 개인정보가 제공되지 않습니다",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm text-ink-soft">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* 폼 */}
          <div className="order-1 lg:order-2">
            <form onSubmit={submit} className="card-base p-7" aria-label="회원가입 양식">
              <h2 className="text-lg font-bold text-ink">입주민 가입 신청</h2>
              <div className="mt-5 grid grid-cols-2 gap-4">
                <Field label="동" value={form.dong} onChange={update("dong")} placeholder="101" />
                <Field label="호수" value={form.ho} onChange={update("ho")} placeholder="1203" />
              </div>
              <div className="mt-4 space-y-4">
                <Field
                  label="이름"
                  value={form.name}
                  onChange={update("name")}
                  placeholder="홍길동"
                  autoComplete="name"
                />
                <Field
                  label="휴대폰번호"
                  value={form.phone}
                  onChange={update("phone")}
                  placeholder="010-0000-0000"
                  type="tel"
                  autoComplete="tel"
                />
              </div>

              <label className="mt-5 flex cursor-pointer items-start gap-2.5 rounded-xl bg-cream-100 p-3.5">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-brand-600"
                />
                <span className="text-xs leading-relaxed text-ink-soft">
                  입주민 인증을 위한 개인정보 수집·이용에 동의합니다. 수집된 정보는
                  입주민 확인 목적으로만 사용됩니다.
                </span>
              </label>

              <button
                type="submit"
                disabled={!agree}
                className="btn-primary mt-5 w-full"
              >
                <UserPlus className="h-4 w-4" aria-hidden />
                가입 신청하기
              </button>

              <p className="mt-4 text-center text-sm text-ink-soft">
                이미 인증된 입주민이신가요?{" "}
                <Link href="/login" className="font-semibold text-brand-700 hover:underline">
                  로그인
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <input
        type={type}
        value={value}
        required
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
      />
    </label>
  );
}
