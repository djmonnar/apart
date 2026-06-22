"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, ShieldCheck, AlertCircle } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { BrandMark } from "@/components/brand-mark";
import { useAuth } from "@/lib/auth-context";
import { firebaseAuthErrorMessage } from "@/lib/auth-errors";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/mypage");
    } catch (err) {
      setError(firebaseAuthErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <SiteShell>
      <section className="container-pad flex justify-center py-16">
        <div className="w-full max-w-md">
          <div className="mb-7 flex flex-col items-center text-center">
            <BrandMark />
            <h1 className="mt-6 text-2xl font-bold text-ink">로그인</h1>
            <p className="mt-2 text-sm text-ink-soft">
              입주민 인증 계정으로 로그인해 주세요.
            </p>
          </div>

          <form onSubmit={submit} className="card-base space-y-4 p-7" aria-label="로그인 양식">
            <Field
              label="이메일"
              value={email}
              onChange={setEmail}
              placeholder="example@email.com"
              type="email"
              autoComplete="email"
            />
            <Field
              label="비밀번호"
              value={password}
              onChange={setPassword}
              placeholder="비밀번호"
              type="password"
              autoComplete="current-password"
            />

            {error && (
              <p className="flex items-start gap-1.5 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs leading-relaxed text-rose-600">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                {error}
              </p>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              <LogIn className="h-4 w-4" aria-hidden />
              {submitting ? "로그인 중..." : "로그인"}
            </button>

            <p className="rounded-xl bg-cream-100 px-4 py-3 text-xs leading-relaxed text-ink-soft">
              <ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-brand-400" aria-hidden />
              로그인 상태는 자동으로 유지됩니다. 공용 PC에서는 이용 후 로그아웃해 주세요.
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
