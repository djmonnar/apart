import type { Metadata } from "next";
import { BadgeCheck, Gift, Store, Ticket } from "lucide-react";
import { PartnerInquiryForm } from "@/components/partner-inquiry-form";
import { PartnerShell } from "@/components/partner-shell";
import { PartnerVerify } from "@/components/partner-verify";

export const metadata: Metadata = { title: "제휴업체 센터" };

const STATS = [
  { icon: BadgeCheck, label: "오늘 인증 건수", value: "12", sub: "어제 대비 +3건" },
  { icon: Ticket, label: "이번 달 혜택 사용", value: "86", sub: "지난달 대비 +19%" },
  { icon: Gift, label: "진행 중 혜택", value: "4", sub: "종료 예정 1건" },
];

const RECENT = [
  { time: "2026.06.22 14:35", benefit: "커트 20% 할인", amount: "10,000원" },
  { time: "2026.06.22 11:22", benefit: "전체 시술 10% 할인", amount: "15,000원" },
  { time: "2026.06.21 16:10", benefit: "염색 15% 할인", amount: "18,000원" },
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
            입주민 혜택 인증과 제휴 문의를 한 곳에서 처리합니다. 업체 화면에서는
            입주민 동호수와 연락처 등 개인정보가 노출되지 않습니다.
          </p>
        </header>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="card-base flex items-center gap-4 p-5">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sand-100 text-brand-500">
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                <div>
                  <p className="text-sm text-ink-soft">{s.label}</p>
                  <p className="text-2xl font-bold text-ink">{s.value}</p>
                  <p className="text-xs text-emerald-600">{s.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        <PartnerVerify />

        <div className="mt-8 card-base p-6">
          <h2 className="text-base font-bold text-ink">최근 사용 내역</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-ink-faint">
                  <th className="py-2.5 font-medium">사용일시</th>
                  <th className="py-2.5 font-medium">혜택명</th>
                  <th className="py-2.5 font-medium">할인금액</th>
                  <th className="py-2.5 font-medium">처리 상태</th>
                </tr>
              </thead>
              <tbody>
                {RECENT.map((r) => (
                  <tr key={r.time} className="border-b border-line/60">
                    <td className="py-3 text-ink-soft">{r.time}</td>
                    <td className="py-3 font-medium text-ink">{r.benefit}</td>
                    <td className="py-3 text-ink">{r.amount}</td>
                    <td className="py-3">
                      <span className="badge bg-emerald-100 text-emerald-700">
                        완료
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <section id="inquiry" className="mt-10 grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="card-base bg-brand-900 p-6 text-cream-50">
            <span className="badge border border-gold/30 bg-white/10 text-gold-soft">
              <Store className="h-3.5 w-3.5" aria-hidden />
              입점 문의
            </span>
            <h2 className="mt-4 text-2xl font-bold leading-tight">
              우리 단지 입주민에게 혜택을 제안하고 싶다면
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
