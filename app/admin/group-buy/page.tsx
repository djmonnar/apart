import type { Metadata } from "next";
import { Users, ClipboardList, Target, Timer, Plus } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { AdminGuard } from "@/components/admin-guard";
import { GroupBuyApplicants } from "@/components/group-buy-applicants";
import { groupBuys, isClosingSoon } from "@/data/group-buys";
import { groupBuyApplications } from "@/data/group-buy-applications";
import { GROUP_BUY_STATUS_META, TONE_CLASS } from "@/lib/constants";

export const metadata: Metadata = { title: "공동구매 관리" };

const CATEGORY_OPTIONS = [
  "생활/편의",
  "반찬/식품",
  "자동차",
  "이사/청소/인테리어",
  "뷰티/미용",
  "건강/힐링",
  "기타",
];

const inputCls =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100";

export default function AdminGroupBuyPage() {
  const active = groupBuys.filter(
    (g) => g.status === "survey" || g.status === "recruiting",
  ).length;
  const achieved = groupBuys.filter((g) => g.status === "achieved").length;
  const closing = groupBuys.filter((g) => isClosingSoon(g)).length;

  const stats = [
    { icon: Users, label: "진행 중 공동구매", value: active, sub: "수요조사·모집중" },
    {
      icon: ClipboardList,
      label: "총 신청 건수",
      value: groupBuyApplications.length,
      sub: "누적 신청",
    },
    { icon: Target, label: "목표 달성", value: achieved, sub: "목표 인원 도달" },
    { icon: Timer, label: "마감 임박", value: closing, sub: "마감 4일 이내" },
  ];

  return (
    <AdminGuard>
      <AdminShell current="공동구매 관리">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-ink">공동구매 관리</h2>
          <p className="text-xs text-ink-faint">
            입주민 전용 공동구매 현황과 신청자를 관리합니다.
          </p>
        </div>
      </div>

      {/* 현황 카드 */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card-base flex items-center gap-4 p-5">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sand-100 text-brand-500">
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <p className="text-sm text-ink-soft">{s.label}</p>
                <p className="text-2xl font-bold text-ink">{s.value}</p>
                <p className="text-xs text-ink-faint">{s.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 공동구매 목록 */}
      <div className="mt-6 card-base p-6">
        <h2 className="mb-4 text-base font-bold text-ink">공동구매 목록</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-ink-faint">
                <th className="py-2.5 font-medium">제목</th>
                <th className="py-2.5 font-medium">카테고리</th>
                <th className="py-2.5 font-medium">상태</th>
                <th className="py-2.5 font-medium">목표</th>
                <th className="py-2.5 font-medium">현재</th>
                <th className="py-2.5 font-medium">마감일</th>
                <th className="py-2.5 font-medium">관리</th>
              </tr>
            </thead>
            <tbody>
              {groupBuys.map((g) => {
                const meta = GROUP_BUY_STATUS_META[g.status];
                return (
                  <tr key={g.id} className="border-b border-line/60">
                    <td className="py-3 font-medium text-ink">{g.title}</td>
                    <td className="py-3 text-ink-soft">{g.category}</td>
                    <td className="py-3">
                      <span className={`badge ${TONE_CLASS[meta.tone]}`}>
                        {meta.label}
                      </span>
                      {isClosingSoon(g) && (
                        <span className="badge ml-1 bg-rose-100 text-rose-600">
                          마감임박
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-ink-soft">{g.targetCount}세대</td>
                    <td className="py-3 text-ink">{g.currentCount}세대</td>
                    <td className="py-3 text-ink-soft">{g.endDate}</td>
                    <td className="py-3">
                      <button className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-ink-soft hover:bg-cream-100">
                        관리
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 등록/수정 폼 */}
      <div className="mt-6 card-base p-6">
        <h2 className="mb-4 flex items-center gap-1.5 text-base font-bold text-ink">
          <Plus className="h-4 w-4 text-brand-500" aria-hidden />
          공동구매 등록 / 수정
        </h2>
        <form className="grid gap-4 sm:grid-cols-2">
          <Field label="제목">
            <input className={inputCls} placeholder="공동구매 제목" />
          </Field>
          <Field label="카테고리">
            <select className={inputCls} defaultValue="">
              <option value="" disabled>
                카테고리 선택
              </option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="대표 이미지 경로" full>
            <input className={inputCls} placeholder="/assets/example.png" />
          </Field>
          <Field label="정상가">
            <input className={inputCls} placeholder="90,000원 또는 방문견적" />
          </Field>
          <Field label="공동구매가">
            <input className={inputCls} placeholder="69,000원 또는 입주민 특별가" />
          </Field>
          <Field label="간단 설명" full>
            <input className={inputCls} placeholder="목록 카드에 노출될 한 줄 설명" />
          </Field>
          <Field label="상세 설명" full>
            <textarea className={inputCls} rows={3} placeholder="공동구매 상세 설명" />
          </Field>
          <Field label="목표 인원(세대)">
            <input className={inputCls} type="number" placeholder="10" />
          </Field>
          <Field label="상태">
            <select className={inputCls} defaultValue="recruiting">
              {(
                Object.keys(GROUP_BUY_STATUS_META) as Array<
                  keyof typeof GROUP_BUY_STATUS_META
                >
              ).map((s) => (
                <option key={s} value={s}>
                  {GROUP_BUY_STATUS_META[s].label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="시작일">
            <input className={inputCls} type="date" />
          </Field>
          <Field label="마감일">
            <input className={inputCls} type="date" />
          </Field>
          <Field label="제휴업체">
            <input className={inputCls} placeholder="제휴업체명" />
          </Field>
          <Field label="유의사항 (줄바꿈으로 구분)" full>
            <textarea className={inputCls} rows={3} placeholder="유의사항을 입력하세요" />
          </Field>

          <div className="sm:col-span-2">
            <button
              type="button"
              className="btn-primary w-full sm:w-auto sm:px-8"
            >
              공동구매 저장
            </button>
            <p className="mt-3 rounded-xl bg-cream-100 px-4 py-3 text-xs text-ink-soft">
              ※ 본 폼은 관리자 골격 UI입니다. 실제 저장은 백엔드 연동 시
              활성화됩니다.
            </p>
          </div>
        </form>
      </div>

      {/* 신청자 목록 */}
      <div className="mt-6">
        <GroupBuyApplicants />
      </div>
      </AdminShell>
    </AdminGuard>
  );
}

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}
