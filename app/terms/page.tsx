import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = { title: "이용약관" };

export default function TermsPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="TERMS"
        title="이용약관"
        description="진주역 스카이시티프라디움 입주민 복지몰 이용에 관한 기본 약관입니다."
      />
      <section className="container-pad py-10">
        <div className="max-w-3xl space-y-6 text-sm leading-relaxed text-ink-soft">
          <div>
            <h2 className="text-base font-bold text-ink">제1조 (목적)</h2>
            <p className="mt-2">
              본 약관은 진주역 스카이시티프라디움 입주민 복지몰(이하 “복지몰”)이
              제공하는 입주민 전용 제휴 혜택 서비스의 이용 조건을 규정합니다.
            </p>
          </div>
          <div>
            <h2 className="text-base font-bold text-ink">제2조 (이용 자격)</h2>
            <p className="mt-2">
              복지몰은 진주역 스카이시티프라디움 입주민으로 인증된 회원에 한해
              혜택 및 쿠폰을 이용할 수 있습니다.
            </p>
          </div>
          <div>
            <h2 className="text-base font-bold text-ink">제3조 (쿠폰의 사용)</h2>
            <p className="mt-2">
              발급된 쿠폰은 1회용이며, 제휴 매장에서 사용 완료 처리 시 재사용이
              불가합니다.
            </p>
          </div>
          <p className="text-xs text-ink-faint">
            * 본 약관은 데모용 예시이며, 실제 운영 시 확정됩니다.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
