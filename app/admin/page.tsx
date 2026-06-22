import type { Metadata } from "next";
import { Users, Store, Ticket, TrendingUp } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { AdminGuard } from "@/components/admin-guard";
import { PendingApprovals } from "@/components/pending-approvals";
import { partners } from "@/data/partners";
import { CATEGORY_LABEL } from "@/lib/constants";

export const metadata: Metadata = { title: "관리자 대시보드" };

const STATS = [
  { icon: Users, label: "승인대기 회원", value: "32", sub: "전일 대비 +8" },
  { icon: Store, label: "제휴업체 수", value: "156", sub: "전일 대비 +2" },
  { icon: Ticket, label: "이번 달 쿠폰 사용", value: "1,248", sub: "전월 대비 +18.6%" },
  { icon: TrendingUp, label: "총 방문수", value: "28,562", sub: "전월 대비 +12.4%" },
];

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminShell>
      {/* 통계 카드 */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        {/* 승인 대기 입주민 */}
        <PendingApprovals />

        {/* 제휴업체 현황 */}
        <div className="card-base p-6">
          <h2 className="mb-4 text-base font-bold text-ink">제휴업체 현황</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-ink-faint">
                  <th className="py-2.5 font-medium">업체명</th>
                  <th className="py-2.5 font-medium">카테고리</th>
                  <th className="py-2.5 font-medium">지역</th>
                  <th className="py-2.5 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((p) => (
                  <tr key={p.id} className="border-b border-line/60">
                    <td className="py-3 font-medium text-ink">{p.name}</td>
                    <td className="py-3 text-ink-soft">
                      {CATEGORY_LABEL[p.category]}
                    </td>
                    <td className="py-3 text-ink-soft">{p.region}</td>
                    <td className="py-3">
                      <span className="badge bg-emerald-100 text-emerald-700">
                        제휴중
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <p className="mt-6 rounded-xl bg-cream-100 px-4 py-3 text-xs text-ink-soft">
        ※ 본 화면은 관리자 대시보드의 기본 골격입니다. 아파트·입주민·제휴업체·혜택·쿠폰
        사용내역 관리와 리포트 기능이 이후 확장됩니다.
      </p>
      </AdminShell>
    </AdminGuard>
  );
}
