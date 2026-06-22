import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  HeartHandshake,
  Home,
  LockKeyhole,
  MapPinned,
  MessageSquareWarning,
  Smartphone,
  ShieldCheck,
  Sparkles,
  Store,
  TicketPercent,
  Users,
  WalletCards,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { ApartmentInquiryForm } from "@/components/apartment-inquiry-form";
import { SafeImage } from "@/components/safe-image";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "아파트 도입 문의",
  description:
    "아파트 비용 부담 없이 입주민 전용 혜택, 공동구매, 생활서비스를 제공하는 단지 전용 복지몰 도입 제안 페이지입니다.",
};

const asset = (name: string) => `/assets/apartment/${name}`;

const benefits: Array<{ icon: LucideIcon; title: string; body: string }> = [
  {
    icon: WalletCards,
    title: "아파트 비용 부담 없음",
    body: "초기 도입은 비용 부담 없이 시범 운영할 수 있도록 설계합니다.",
  },
  {
    icon: HeartHandshake,
    title: "입주민 만족도 향상",
    body: "생활권에서 바로 쓰는 할인, 공동구매, 생활 편의 혜택을 제공합니다.",
  },
  {
    icon: Sparkles,
    title: "우리 단지만의 프리미엄 혜택",
    body: "단지명과 입주민 인증을 기반으로 외부에 공개되지 않는 전용 혜택을 운영합니다.",
  },
  {
    icon: Store,
    title: "주변 상권과 상생",
    body: "지역 우수 업체에는 안정적인 고객 접점을, 입주민에게는 실속 있는 혜택을 연결합니다.",
  },
  {
    icon: ClipboardCheck,
    title: "관리사무소 업무 부담 최소화",
    body: "가입 승인과 공지 방식은 단지 상황에 맞춰 최소 운영으로 시작합니다.",
  },
  {
    icon: MessageSquareWarning,
    title: "민원 발생 업체 즉시 제외 가능",
    body: "허위 혜택, 불친절, 민원 발생 업체는 노출 중단 또는 제외할 수 있습니다.",
  },
];

const features: Array<{ icon: LucideIcon; title: string; body: string }> = [
  {
    icon: TicketPercent,
    title: "입주민 전용 제휴 혜택",
    body: "미용, 반찬, 청소, 세차, 인테리어 등 생활 밀착형 할인 혜택",
  },
  {
    icon: Users,
    title: "공동구매",
    body: "입주민 수요를 모아 더 좋은 조건으로 진행하는 단지형 공동구매",
  },
  {
    icon: Wrench,
    title: "생활서비스 예약/견적",
    body: "방문 견적, 예약 상담, 생활 편의 서비스를 한 곳에서 안내",
  },
  {
    icon: BadgeCheck,
    title: "입주민 인증",
    body: "동·호수 기반 가입 신청과 관리자 승인 후 혜택 이용",
  },
  {
    icon: Smartphone,
    title: "손님 폰 사용 확인",
    body: "매장 직원이 손님 휴대폰에서 사용 완료만 처리하고 개인정보는 확인하지 않는 구조",
  },
  {
    icon: ClipboardCheck,
    title: "관리자 리포트",
    body: "가입 신청, 제휴 현황, 공동구매 신청 흐름을 관리 화면에서 확인",
  },
];

const upcoming = ["입주민 모임", "중고/나눔", "입주민 클래스", "동호회"];

const securitySteps = [
  "입주민 가입 신청",
  "관리자 승인",
  "제휴업체는 사용 완료 화면만 확인",
  "동호수·연락처 비공개",
];

const policies = [
  "입점 기준이 있는 업체만 등록",
  "동일 업종 복수 입점 가능",
  "허위·과장 혜택 금지",
  "민원 발생 시 노출 중단 가능",
  "혜택 조건 명확히 표기",
  "특정 업체 독점 구조 지양",
];

const examples = [
  "입주민 전용 혜택",
  "공동구매",
  "입주민 인증",
  "혜택 사용 확인",
  "업체 제휴",
  "관리자 승인",
];

const process = [
  "상담 신청",
  "단지 정보 확인",
  "아파트 전용 복지몰 제작",
  "제휴업체 등록",
  "입주민 공지용 안내문 제공",
  "시범 운영 시작",
];

const faqs = [
  {
    q: "아파트에서 비용을 부담해야 하나요?",
    a: "초기 도입은 아파트 비용 부담 없이 시범 운영할 수 있도록 설계합니다. 제휴 혜택 운영은 주변 업체와의 제휴를 통해 구성됩니다.",
  },
  {
    q: "관리사무소 업무가 늘어나지 않나요?",
    a: "입주민 인증과 공지 방식은 단지 상황에 맞춰 최소한의 운영 부담으로 설계합니다. 제휴업체 관리와 페이지 운영은 단지라운지에서 지원합니다.",
  },
  {
    q: "입주민 개인정보는 어떻게 보호되나요?",
    a: "입주민 정보는 인증과 서비스 이용 목적에 한해 사용되며, 제휴업체에는 동호수와 연락처 등 개인정보가 제공되지 않습니다. 업체는 손님 휴대폰의 혜택명과 사용 처리 상태만 확인합니다.",
  },
  {
    q: "특정 업체 특혜 논란은 없나요?",
    a: "동일 업종 복수 입점, 입점 기준, 민원 발생 시 노출 중단 등의 운영 기준을 통해 특정 업체 독점이나 특혜 논란을 줄입니다.",
  },
  {
    q: "제휴업체는 누가 관리하나요?",
    a: "제휴업체 발굴과 혜택 등록, 기본 운영 관리는 단지라운지에서 지원하며, 단지 측 요청에 따라 업체 제외 또는 수정이 가능합니다.",
  },
  {
    q: "시범 운영도 가능한가요?",
    a: "가능합니다. 1개 단지 기준으로 소규모 제휴업체와 공동구매부터 시작해 입주민 반응을 확인한 뒤 확장할 수 있습니다.",
  },
];

export default function ApartmentPage() {
  return (
    <SiteShell>
      <section className="border-b border-line bg-cream-50">
        <div className="container-pad grid min-h-[calc(100vh-68px)] items-center gap-10 py-12 lg:grid-cols-[1.02fr_0.98fr] lg:py-16">
          <div>
            <span className="badge border border-brand-200 bg-white text-brand-700">
              <Building2 className="h-3.5 w-3.5" aria-hidden />
              아파트 단지 전용 제안
            </span>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight text-ink sm:text-5xl lg:text-6xl">
              우리 아파트만의 입주민 전용 복지몰을 만들어드립니다.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
              아파트 비용 부담 없이, 주변 우수 업체와 제휴해 입주민에게
              할인·공동구매·생활 편의 혜택을 제공합니다.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["입주민 인증 기반", "제휴 혜택", "공동구매", "생활서비스"].map(
                (item) => (
                  <span
                    key={item}
                    className="rounded-full border border-line bg-white px-3.5 py-2 text-sm font-semibold text-brand-700 shadow-soft"
                  >
                    {item}
                  </span>
                ),
              )}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="#inquiry" className="btn-primary justify-center">
                우리 아파트 도입 문의하기
              </Link>
              <Link href="#example" className="btn-secondary justify-center">
                실제 예시 보기
              </Link>
            </div>
          </div>

          <div className="relative min-h-[300px] overflow-hidden rounded-[8px] border border-line bg-white shadow-card sm:min-h-[420px]">
            <SafeImage
              src={asset("apartment-hero-dashboard.png")}
              alt="아파트 전용 복지몰 대시보드 예시"
              priority
              sizes="(max-width: 1024px) 100vw, 48vw"
            />
          </div>
        </div>
      </section>

      <section className="container-pad py-16">
        <SectionHeader
          eyebrow="핵심 장점"
          title="아파트에 부담은 줄이고, 입주민 만족도는 높입니다."
          description="단지 운영진이 민감하게 볼 수 있는 비용, 민원, 공정성, 업무 부담 문제를 먼저 고려한 구조입니다."
        />
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((item) => (
            <InfoCard key={item.title} {...item} />
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-white/60">
        <div className="container-pad py-16">
          <SectionHeader
            eyebrow="제공 기능"
            title="입주민이 실제로 사용하는 생활 혜택 기능"
            description="혜택 안내에서 신청, 인증, 관리자 확인까지 하나의 단지 전용 흐름으로 구성합니다."
          />
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((item) => (
              <InfoCard key={item.title} {...item} />
            ))}
          </div>
          <div className="mt-7 rounded-[8px] border border-dashed border-brand-200 bg-cream-50 p-5">
            <p className="text-sm font-bold text-ink">확장 예정 기능</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {upcoming.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink-soft"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-pad grid gap-10 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="relative min-h-[280px] overflow-hidden rounded-[8px] border border-line bg-white shadow-card sm:min-h-[380px]">
          <SafeImage
            src={asset("local-partner-network.png")}
            alt="단지 주변 지역 상권 제휴 네트워크"
            sizes="(max-width: 1024px) 100vw, 45vw"
          />
        </div>
        <div>
          <SectionHeader
            eyebrow="지역 상권 상생"
            title="우리 단지와 주변 우수 업체를 연결합니다."
            description="단지 주변의 미용실, 반찬가게, 청소·세차·인테리어 업체 등 생활 밀착형 업체와 제휴해 입주민에게 실질적인 혜택을 제공합니다."
          />
          <ul className="mt-7 space-y-3">
            {[
              "대형 복지몰이 아닌 우리 동네 맞춤형 혜택",
              "입주민 생활권에 맞춘 제휴",
              "지역 업체에게는 안정적인 고객 접점 제공",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-sm text-ink-soft">
                <MapPinned className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y border-line bg-brand-900 text-cream-50">
        <div className="container-pad grid gap-10 py-16 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <span className="badge border border-gold/30 bg-white/10 text-gold-soft">
              <LockKeyhole className="h-3.5 w-3.5" aria-hidden />
              개인정보 보호
            </span>
            <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
              입주민 개인정보는 제휴업체에 제공하지 않습니다.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-cream-200/90 sm:text-base">
              입주민은 동·호수·이름·연락처로 가입 신청하고, 관리자 승인 후
              혜택을 이용할 수 있습니다. 제휴업체는 손님 휴대폰의 혜택명과 사용 처리 상태만 확인하며,
              동호수와 연락처 등 개인정보는 확인할 수 없습니다.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {securitySteps.map((step) => (
                <div
                  key={step}
                  className="rounded-[8px] border border-cream-100/15 bg-white/10 p-4"
                >
                  <ShieldCheck className="h-5 w-5 text-gold" aria-hidden />
                  <p className="mt-2 text-sm font-semibold text-cream-50">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative min-h-[280px] overflow-hidden rounded-[8px] border border-cream-100/15 bg-cream-50 shadow-card sm:min-h-[380px]">
            <SafeImage
              src={asset("resident-verification-security.png")}
              alt="입주민 인증과 개인정보 보호 구조"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
          </div>
        </div>
      </section>

      <section className="container-pad py-16">
        <SectionHeader
          eyebrow="공정 운영 정책"
          title="특정 업체 특혜 논란을 줄이는 운영 기준"
          description="입대의와 관리사무소가 안심하고 검토할 수 있도록, 입점과 노출 기준을 명확하게 두고 운영합니다."
        />
        <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {policies.map((item) => (
            <div
              key={item}
              className="flex gap-3 rounded-[8px] border border-line bg-white p-4 shadow-soft"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
              <p className="text-sm font-medium leading-relaxed text-ink">
                {item}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="example" className="scroll-mt-20 border-y border-line bg-white/60">
        <div className="container-pad grid gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <SectionHeader
              eyebrow="실제 예시"
              title="진주역 스카이시티프라디움 복지몰 예시"
              description="현재 구현된 복지몰은 입주민 인증을 기준으로 혜택 상세, 혜택 사용, 공동구매 신청 권한을 구분합니다."
            />
            <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {examples.map((item) => (
                <span
                  key={item}
                  className="rounded-[8px] border border-line bg-white px-3 py-2 text-center text-sm font-semibold text-brand-700"
                >
                  {item}
                </span>
              ))}
            </div>
            <Link href="/" className="btn-primary mt-8 w-full justify-center sm:w-auto">
              실제 복지몰 보기
            </Link>
          </div>
          <div className="relative min-h-[280px] overflow-hidden rounded-[8px] border border-line bg-white shadow-card sm:min-h-[390px]">
            <SafeImage
              src={asset("apartment-welfare-preview.png")}
              alt="진주역 스카이시티프라디움 복지몰 예시 화면"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
          </div>
        </div>
      </section>

      <section className="container-pad py-16">
        <SectionHeader
          eyebrow="도입 절차"
          title="도입 절차는 간단합니다."
          description="단지 상황을 확인한 뒤, 작은 범위의 시범 운영부터 시작할 수 있습니다."
        />
        <div className="mt-9 hidden min-h-[320px] overflow-hidden rounded-[8px] border border-line bg-white shadow-card md:block">
          <div className="relative h-[360px]">
            <SafeImage
              src={asset("apartment-process-icons.png")}
              alt="아파트 전용 복지몰 도입 절차"
              sizes="100vw"
            />
          </div>
        </div>
        <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {process.map((item, index) => (
            <div key={item} className="rounded-[8px] border border-line bg-white p-5 shadow-soft">
              <span className="text-xs font-bold text-brand-400">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-2 text-base font-bold text-ink">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="inquiry" className="scroll-mt-20 border-y border-line bg-cream-100">
        <div className="container-pad grid gap-8 py-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <span className="badge bg-white text-brand-700">
              <Home className="h-3.5 w-3.5" aria-hidden />
              도입 상담
            </span>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-ink sm:text-4xl">
              우리 아파트 도입 문의하기
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft sm:text-base">
              아파트명과 연락처를 남겨주시면, 단지 상황에 맞는 전용 복지몰
              도입 방안을 안내드립니다.
            </p>
          </div>
          <ApartmentInquiryForm />
        </div>
      </section>

      <section className="container-pad py-16">
        <SectionHeader
          eyebrow="FAQ"
          title="도입 전 자주 묻는 질문"
          description="비용, 개인정보, 운영 부담, 공정성에 대한 기본 답변입니다."
        />
        <div className="mt-8 divide-y divide-line rounded-[8px] border border-line bg-white">
          {faqs.map((faq) => (
            <details key={faq.q} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold text-ink">
                {faq.q}
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cream-100 text-brand-600 transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="section-eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-bold leading-tight text-ink sm:text-3xl">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft sm:text-base">
        {description}
      </p>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[8px] border border-line bg-white p-5 shadow-soft">
      <span className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-sand-100 text-brand-600">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <h3 className="mt-4 text-base font-bold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
    </div>
  );
}
