"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, ShieldCheck } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { BrandMark } from "@/components/brand-mark";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
    router.push("/mypage");
  };

  return (
    <SiteShell>
      <section className="container-pad flex justify-center py-16">
        <div className="w-full max-w-md">
          <div className="mb-7 flex flex-col items-center text-center">
            <BrandMark />
            <h1 className="mt-6 text-2xl font-bold text-ink">로그인</h1>
            <p className="mt-2 text-sm text-ink-soft">
              입주민 인증 정보로 로그인해 주세요.
            </p>
          </div>

          <form
            onSubmit={submit}
            className="card-base space-y-4 p-7"
            aria-label="로그인 양식"
          >
            <Field
              label="이름"
              value={name}
              onChange={setName}
              placeholder="홍길동"
              autoComplete="name"
            />
            <Field
              label="휴대폰번호"
              value={phone}
              onChange={setPhone}
              placeholder="010-0000-0000"
              type="tel"
              autoComplete="tel"
            />

            <button type="submit" className="btn-primary w-full">
              <LogIn className="h-4 w-4" aria-hidden />
              로그인
            </button>

            <p className="rounded-xl bg-cream-100 px-4 py-3 text-xs leading-relaxed text-ink-soft">
              <ShieldCheck
                className="mr-1 inline h-3.5 w-3.5 text-brand-400"
                aria-hidden
              />
              데모 버전입니다. 입력값과 무관하게 승인 완료 입주민으로
              로그인됩니다.
            </p>
          </form>

          <p className="mt-5 text-center text-sm text-ink-soft">
            아직 입주민 인증 전이신가요?{" "}
            <Link href="/signup" className="font-semibold text-brand-700 hover:underline">
              회원가입
            </Link>
          </p>
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
