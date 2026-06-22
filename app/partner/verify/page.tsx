import type { Metadata } from "next";
import { PartnerShell } from "@/components/partner-shell";
import { PartnerVerify } from "@/components/partner-verify";

export const metadata: Metadata = { title: "고급 쿠폰 인증센터" };

export default function PartnerVerifyPage() {
  return (
    <PartnerShell>
      <section className="container-pad py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">
            고급 쿠폰 인증센터
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
            이번 MVP 기본 흐름은 손님 휴대폰에서 직원이 사용 완료 처리하는
            방식입니다. 이 화면은 쿠폰번호/QR 인증이 필요해질 때를 위한 추후
            확장용 인증센터입니다.
          </p>
        </header>
        <PartnerVerify />
      </section>
    </PartnerShell>
  );
}
