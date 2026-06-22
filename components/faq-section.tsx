import { HelpCircle, Plus } from "lucide-react";

const FAQ = [
  {
    q: "입주민 인증은 어떻게 하나요?",
    a: "회원가입 시 동·호수·이름·휴대폰번호를 입력해 신청하시면, 관리자가 입주민 명부와 대조하여 승인합니다. 승인 완료 후 모든 혜택을 이용하실 수 있습니다.",
  },
  {
    q: "승인 전에는 아무것도 못 보나요?",
    a: "제휴업체명, 카테고리, 기본 안내는 승인 전에도 확인하실 수 있습니다. 정확한 혜택 조건, 할인율, 혜택 사용, 공동구매 가격과 신청은 관리자 승인 이후에만 이용하실 수 있습니다.",
  },
  {
    q: "혜택은 어떻게 사용하나요?",
    a: "혜택 상세 페이지에서 ‘혜택 사용하기’를 누른 뒤, 매장에서 직원이 손님 휴대폰의 사용 완료 버튼을 눌러 혜택을 적용합니다. 사용 완료 처리 전에는 월 사용 횟수가 차감되지 않습니다.",
  },
  {
    q: "제휴 매장에 제 개인정보가 노출되나요?",
    a: "아니요. 업체는 손님 휴대폰의 혜택명과 사용 처리 상태만 확인합니다. 동·호수, 연락처 등 개인정보는 업체에게 제공되지 않습니다.",
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
