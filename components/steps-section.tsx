import { UserPlus, ShieldCheck, Gift, Store, ChevronRight } from "lucide-react";

const STEPS = [
  {
    icon: UserPlus,
    title: "가입 신청",
    desc: "회원가입 후 동·호수·이름·연락처 등 입주민 정보를 입력합니다.",
  },
  {
    icon: ShieldCheck,
    title: "관리자 승인",
    desc: "관리자가 입주민 정보를 확인한 후 인증을 승인합니다.",
  },
  {
    icon: Gift,
    title: "혜택 선택",
    desc: "다양한 제휴 혜택을 둘러보고 원하는 혜택의 사용 화면을 엽니다.",
  },
  {
    icon: Store,
    title: "혜택 사용",
    desc: "매장 직원이 손님 휴대폰에서 사용 완료를 눌러 혜택을 적용합니다.",
  },
];

export function StepsSection() {
  return (
    <section id="guide" className="container-pad scroll-mt-24 py-16">
      <div className="rounded-3xl border border-line bg-white p-8 shadow-card sm:p-10">
        <div className="mb-9 text-center">
          <p className="section-eyebrow">HOW TO USE</p>
          <h2 className="mt-2 text-2xl font-bold text-ink sm:text-[1.7rem]">
            이용 방법
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            네 단계면 우리 단지 전용 혜택을 누릴 수 있어요.
          </p>
        </div>

        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="relative">
                <div className="flex h-full flex-col items-center rounded-2xl bg-cream-100 p-6 text-center">
                  <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-cream-50">
                    <Icon className="h-6 w-6" aria-hidden />
                    <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-xs font-bold text-brand-900">
                      {i + 1}
                    </span>
                  </span>
                  <h3 className="mt-4 font-bold text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {step.desc}
                  </p>
                </div>
                {i < STEPS.length - 1 && (
                  <ChevronRight
                    className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 text-brand-200 lg:block"
                    aria-hidden
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
