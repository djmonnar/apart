import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = { title: "개인정보처리방침" };

export default function PrivacyPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="PRIVACY"
        title="개인정보처리방침"
        description="진주역 스카이시티프라디움 입주민 복지몰은 입주민의 개인정보를 안전하게 보호합니다."
      />
      <section className="container-pad py-10">
        <div className="prose-sm max-w-3xl space-y-6 text-sm leading-relaxed text-ink-soft">
          <div>
            <h2 className="text-base font-bold text-ink">1. 수집하는 개인정보 항목</h2>
            <p className="mt-2">
              입주민 인증을 위해 동·호수, 이름, 휴대폰번호를 수집합니다. 수집된
              정보는 입주민 확인 목적으로만 이용됩니다.
            </p>
          </div>
          <div>
            <h2 className="text-base font-bold text-ink">2. 개인정보의 제3자 제공</h2>
            <p className="mt-2">
              제휴 매장에는 쿠폰의 유효성과 혜택 적용 가능 여부만 전달되며,
              입주민의 동·호수·연락처 등 개인정보는 일절 제공되지 않습니다.
            </p>
          </div>
          <div>
            <h2 className="text-base font-bold text-ink">3. 개인정보의 보유 및 이용기간</h2>
            <p className="mt-2">
              회원 탈퇴 또는 입주민 자격 상실 시 관련 법령에 따라 지체 없이
              파기합니다.
            </p>
          </div>
          <p className="text-xs text-ink-faint">
            * 본 방침은 데모용 예시이며, 실제 운영 시 법무 검토 후 확정됩니다.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
