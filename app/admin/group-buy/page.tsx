import type { Metadata } from "next";
import { ClipboardList, Target, Timer, Users } from "lucide-react";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import { GroupBuyApplicants } from "@/components/group-buy-applicants";
import { groupBuys, isClosingSoon } from "@/data/group-buys";
import { GROUP_BUY_STATUS_META, TONE_CLASS } from "@/lib/constants";

export const metadata: Metadata = { title: "공동구매 관리" };

export default function AdminGroupBuyPage() {
  const active = groupBuys.filter(
    (item) => item.status === "survey" || item.status === "recruiting",
  ).length;
  const achieved = groupBuys.filter((item) => item.status === "achieved").length;
  const closing = groupBuys.filter((item) => isClosingSoon(item)).length;

  const stats = [
    {
      icon: Users,
      label: "진행 중 공동구매",
      value: active,
      sub: "수요조사·모집중",
    },
    {
      icon: ClipboardList,
      label: "신청자 관리",
      value: "실시간",
      sub: "Firestore 신청 기준",
    },
    { icon: Target, label: "목표 달성", value: achieved, sub: "목표 인원 도달" },
    { icon: Timer, label: "마감 임박", value: closing, sub: "마감 4일 이내" },
  ];

  return (
    <AdminGuard>
      <AdminShell current="공동구매 관리">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-ink">공동구매 관리</h2>
          <p className="text-xs text-ink-faint">
            공동구매별 신청자와 상태를 확인하고 확정/취소 처리를 진행합니다.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="card-base flex items-center gap-4 p-5">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sand-100 text-brand-500">
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                <div>
                  <p className="text-sm text-ink-soft">{item.label}</p>
                  <p className="text-2xl font-bold text-ink">{item.value}</p>
                  <p className="text-xs text-ink-faint">{item.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 card-base p-6">
          <h2 className="mb-4 text-base font-bold text-ink">공동구매 목록</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-ink-faint">
                  <th className="py-2.5 font-medium">제목</th>
                  <th className="py-2.5 font-medium">카테고리</th>
                  <th className="py-2.5 font-medium">상태</th>
                  <th className="py-2.5 font-medium">목표</th>
                  <th className="py-2.5 font-medium">현재</th>
                  <th className="py-2.5 font-medium">마감일</th>
                </tr>
              </thead>
              <tbody>
                {groupBuys.map((item) => {
                  const meta = GROUP_BUY_STATUS_META[item.status];
                  return (
                    <tr key={item.id} className="border-b border-line/60">
                      <td className="py-3 font-medium text-ink">{item.title}</td>
                      <td className="py-3 text-ink-soft">{item.category}</td>
                      <td className="py-3">
                        <span className={`badge ${TONE_CLASS[meta.tone]}`}>
                          {meta.label}
                        </span>
                        {isClosingSoon(item) && (
                          <span className="badge ml-1 bg-rose-100 text-rose-600">
                            마감임박
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-ink-soft">{item.targetCount}명</td>
                      <td className="py-3 text-ink">{item.currentCount}명</td>
                      <td className="py-3 text-ink-soft">{item.endDate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6">
          <GroupBuyApplicants />
        </div>
      </AdminShell>
    </AdminGuard>
  );
}
