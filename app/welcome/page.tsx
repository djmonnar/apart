import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  Gift,
  LockKeyhole,
  ShieldCheck,
  ShoppingBag,
  UserPlus,
} from "lucide-react";
import { SafeImage } from "@/components/safe-image";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "입주민 안내",
  description:
    "진주역 스카이시티프라디움 입주민 전용 복지몰 가입 및 이용 안내 페이지입니다.",
};

const features = [
  {
    icon: Gift,
    title: "제휴 혜택",
    desc: "단지 주변 생활 밀착 업체의 입주민 전용 할인과 서비스를 확인할 수 있습니다.",
  },
  {
    icon: ShoppingBag,
    title: "공동구매",
    desc: "입주민이 함께 신청해 더 좋은 조건으로 이용하는 공동구매를 제공합니다.",
  },
  {
    icon: Building2,
    title: "생활서비스",
    desc: "청소, 세차, 인테리어 등 단지 생활에 필요한 서비스를 연결합니다.",
  },
] as const;

const steps = [
  {
    icon: UserPlus,
    title: "회원가입",
    desc: "이메일, 이름, 연락처, 동·호수를 입력해 입주민 인증을 신청합니다.",
  },
  {
    icon: ShieldCheck,
    title: "관리자 승인",
    desc: "관리자가 입주민 정보를 확인한 뒤 승인하면 복지몰 이용이 가능합니다.",
  },
  {
    icon: CheckCircle2,
    title: "혜택 이용",
    desc: "승인 후 혜택 상세, 공동구매, 매장 사용 완료 처리를 이용할 수 있습니다.",
  },
] as const;

export default function WelcomePage() {
  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-brand-900 text-cream-50">
        <div className="absolute inset-0 opacity-35">
          <SafeImage
            src="/assets/apartment-hero.png"
            fallbackSrc="/assets/hero-aerial.png"
            alt="진주역 스카이시티프라디움 입주민 안내"
            priority
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-brand-900/70 via-brand-900/75 to-brand-900" />

        <div className="container-pad relative py-12 sm:py-16">
          <p className="inline-flex rounded-full bg-gold/20 px-3 py-1 text-xs font-bold text-gold-soft">
            입주민 전용 안내
          </p>
          <h1 className="mt-4 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
            진주역 스카이시티프라디움 입주민 전용 복지몰
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-cream-100/85 sm:text-base">
            입주민 인증 후 우리 단지만의 제휴 혜택, 공동구매, 생활서비스를
            이용하실 수 있습니다. QR로 접속하셨다면 회원가입부터 진행해 주세요.
          </p>
          <div className="mt-7 grid gap-3 sm:flex">
            <Link href="/signup" className="btn-primary justify-center">
              입주민 회원가입
            </Link>
            <Link
              href="/benefits"
              className="btn-secondary justify-center border-cream-100/30 bg-cream-50/10 text-cream-50 hover:bg-cream-50 hover:text-brand-800"
            >
              혜택 둘러보기
            </Link>
          </div>
        </div>
      </section>

      <section className="container-pad py-10 sm:py-14">
        <div className="grid gap-4 sm:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="card-base p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="mt-4 font-bold text-ink">{feature.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {feature.desc}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="container-pad pb-10 sm:pb-14">
        <div className="rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8">
          <p className="section-eyebrow">START</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">
            가입 방법은 3단계입니다
          </h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="rounded-2xl bg-cream-100 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-cream-50">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="text-sm font-bold text-brand-300">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 font-bold text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {step.desc}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="container-pad pb-12 sm:pb-16">
        <div className="rounded-3xl border border-brand-100 bg-brand-50 p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-700">
              <LockKeyhole className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="font-bold text-brand-900">개인정보 보호 안내</h2>
              <p className="mt-2 text-sm leading-relaxed text-brand-800/80">
                동·호수 정보는 입주민 인증 목적으로만 사용합니다. 제휴업체에는
                입주민의 동·호수, 연락처 등 개인정보가 제공되지 않으며, 매장에서는
                손님 휴대폰의 혜택 사용 화면만 확인합니다.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:flex">
            <Link href="/signup" className="btn-primary justify-center">
              지금 가입하기
            </Link>
            <Link href="/privacy" className="btn-secondary justify-center">
              개인정보처리방침
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
