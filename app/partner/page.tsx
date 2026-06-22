import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Gift, Store, Ticket } from "lucide-react";
import { PartnerInquiryForm } from "@/components/partner-inquiry-form";
import { PartnerShell } from "@/components/partner-shell";

export const metadata: Metadata = { title: "제휴업체 센터" };

const GUIDE = [
  "손님이 본인 휴대폰에서 혜택 상세 화면을 엽니다.",
  "직원이 업체명, 혜택명, 남은 횟수를 확인합니다.",
  "혜택 적용 후 손님 휴대폰에서 사용 완료 버튼을 눌러 처리합니다.",
];

export default function PartnerPage() {
  return (
    <PartnerShell>
      <section className="container-pad py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">
            제휴업체 센터
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
            이번 MVP에서는 업체 로그인, 쿠폰번호 입력, QR 스캔 없이 손님 휴대폰의
            혜택 사용 화면에서 직원이 사용 완료를 눌러 처리합니다. 업체 화면에는
            입주민 개인정보가 표시되지 않습니다.
          </p>
        </header>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Stat icon={BadgeCheck} label="인증 방식" value="손님 폰 확인" sub="로그인 없음" />
          <Stat icon={Ticket} label="횟수 차감" value="사용 완료 시" sub="발급만으로 차감 안 됨" />
          <Stat icon={Gift} label="개인정보" value="비공개" sub="동·호수·연락처 미노출" />
        </div>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.82fr]">
          <div className="card-base p-6">
            <h2 className="text-base font-bold text-ink">매장 사용 방법</h2>
            <ol className="mt-4 space-y-3">
              {GUIDE.map((item, index) => (
                <li key={item} className="flex gap-3 text-sm text-ink-soft">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-cream-50">
                    {index + 1}
                  </span>
                  <span className="pt-1">{item}</span>
                </li>
              ))}
            </ol>
            <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
              매장 직원 안내 문구: “혜택 적용 전 손님 휴대폰에서 사용 화면을
              확인하고, 혜택 적용 후 사용 완료 버튼을 눌러주세요.”
            </div>
          </div>

          <div className="card-base p-6">
            <span className="badge bg-sand-100 text-brand-700">추후 확장</span>
            <h2 className="mt-3 text-base font-bold text-ink">고급 인증 방식</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              쿠폰번호 입력이나 QR 스캔 방식은 이번 MVP 기본 흐름에서는 사용하지
              않습니다. 필요 시 별도 인증센터로 확장할 수 있도록 기존 화면은
              유지합니다.
            </p>
            <Link href="/partner/verify" className="btn-secondary mt-5 w-full">
              고급 인증센터 보기
            </Link>
          </div>
        </section>

        <section id="inquiry" className="mt-10 grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="card-base bg-brand-900 p-6 text-cream-50">
            <span className="badge border border-gold/30 bg-white/10 text-gold-soft">
              <Store className="h-3.5 w-3.5" aria-hidden />
              입점 문의
            </span>
            <h2 className="mt-4 text-2xl font-bold leading-tight">
              우리 동네 입주민에게 혜택을 제안하고 싶다면
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-cream-200/90">
              업체명과 연락처를 남겨주시면 운영팀에서 혜택 조건, 노출 기준,
              입주민 이용 흐름을 확인한 뒤 연락드립니다.
            </p>
          </div>
          <PartnerInquiryForm />
        </section>
      </section>
    </PartnerShell>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="card-base flex items-center gap-4 p-5">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sand-100 text-brand-500">
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <div>
        <p className="text-sm text-ink-soft">{label}</p>
        <p className="text-xl font-bold text-ink">{value}</p>
        <p className="text-xs text-emerald-600">{sub}</p>
      </div>
    </div>
  );
}
