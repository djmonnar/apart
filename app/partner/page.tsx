import type { Metadata } from "next";
import { PartnerShell } from "@/components/partner-shell";
import { PartnerVerify } from "@/components/partner-verify";
import { BadgeCheck, Ticket, Gift } from "lucide-react";

export const metadata: Metadata = { title: "업체용 혜택 인증센터" };

const STATS = [
  { icon: BadgeCheck, label: "오늘 인증 건수", value: "12", sub: "어제 대비 +3건" },
  { icon: Ticket, label: "이번 달 혜택 사용 수", value: "86", sub: "지난 달 대비 +19%" },
  { icon: Gift, label: "진행 중 혜택", value: "4", sub: "종료 예정 1개" },
];

const RECENT = [
  { time: "2026.06.22 14:35", benefit: "컷트 20% 할인", amount: "10,000원" },
  { time: "2026.06.22 11:22", benefit: "전체 시술 10% 할인", amount: "15,000원" },
  { time: "2026.06.21 16:10", benefit: "염색 15% 할인", amount: "18,000원" },
];

export default function PartnerPage() {
  return (
    <PartnerShell>
      <section className="container-pad py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">
            업체용 혜택 인증센터
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            입주민 혜택 인증 및 사용 처리를 간편하고 정확하게 관리하세요.
          </p>
        </header>

        {/* 통계 */}
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

        {/* 인증 */}
        <PartnerVerify />

        {/* 최근 사용 내역 */}
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
          <p className="mt-4 rounded-xl bg-cream-100 px-4 py-3 text-xs text-ink-soft">
            ※ 본 화면은 기본 골격입니다. 혜택 관리·업체 정보 관리 등은 이후
            확장됩니다. 업체는 어떠한 경우에도 입주민 개인정보를 조회할 수
            없습니다.
          </p>
        </div>
      </section>
    </PartnerShell>
  );
}
