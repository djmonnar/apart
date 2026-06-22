import type { Metadata } from "next";
import { PartnerShell } from "@/components/partner-shell";
import { PartnerVerify } from "@/components/partner-verify";

export const metadata: Metadata = { title: "쿠폰 인증센터" };

export default function PartnerVerifyPage() {
  return (
    <PartnerShell>
      <section className="container-pad py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">
            쿠폰 인증센터
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
            입주민이 제시한 쿠폰번호로 혜택 적용 가능 여부를 확인하고 사용 완료
            처리를 진행합니다. 입주민 개인정보는 업체 화면에 표시되지 않습니다.
          </p>
        </header>
        <PartnerVerify />
      </section>
    </PartnerShell>
  );
}
