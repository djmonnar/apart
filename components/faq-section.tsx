import { HelpCircle, Plus } from "lucide-react";

const FAQ = [
  {
    q: "입주민 인증은 어떻게 하나요?",
    a: "회원가입 시 동·호수·이름·휴대폰번호를 입력해 신청하시면, 관리자가 입주민 명부와 대조하여 승인합니다. 승인 완료 후 모든 혜택과 쿠폰을 이용하실 수 있습니다.",
  },
  {
    q: "승인 전에는 아무것도 못 보나요?",
    a: "제휴업체명, 카테고리, 기본 안내는 승인 전에도 확인하실 수 있습니다. 정확한 혜택 조건, 할인율, 쿠폰 발급, 공동구매 가격과 신청은 관리자 승인 이후에만 이용하실 수 있습니다.",
  },
  {
    q: "쿠폰은 어떻게 사용하나요?",
    a: "혜택 상세 페이지에서 발급받은 1회용 쿠폰번호 또는 QR코드를 제휴 매장에서 제시하시면, 업체가 인증 후 혜택을 적용해 드립니다.",
  },
  {
    q: "제휴 매장에 제 개인정보가 노출되나요?",
    a: "아니요. 업체는 쿠폰의 유효성과 혜택 적용 가능 여부만 확인합니다. 동·호수, 연락처 등 개인정보는 업체에게 제공되지 않습니다.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="container-pad scroll-mt-24 py-16">
      <div className="mb-8 text-center">
        <p className="section-eyebrow">FAQ</p>
        <h2 className="mt-2 flex items-center justify-center gap-2 text-2xl font-bold text-ink sm:text-[1.7rem]">
          <HelpCircle className="h-6 w-6 text-brand-500" aria-hidden />
          자주 묻는 질문
        </h2>
      </div>

      <div className="mx-auto max-w-3xl space-y-3">
        {FAQ.map((item) => (
          <details
            key={item.q}
            className="group rounded-2xl border border-line bg-white px-5 py-4 shadow-soft transition-colors open:border-brand-200"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink marker:hidden">
              {item.q}
              <Plus
                className="h-5 w-5 shrink-0 text-brand-400 transition-transform group-open:rotate-45"
                aria-hidden
              />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
