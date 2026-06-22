"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  Download,
  Eye,
  Loader2,
  RotateCcw,
  X,
} from "lucide-react";
import { groupBuys } from "@/data/group-buys";
import {
  GROUP_BUY_APPLICATION_STATUSES,
  subscribeAllGroupBuyApplications,
  updateGroupBuyApplicationStatus,
} from "@/lib/group-buy-applications";
import { GROUP_BUY_APPLICATION_META, TONE_CLASS } from "@/lib/constants";
import { formatFirestoreDate } from "@/lib/format";
import type { GroupBuyApplication, GroupBuyApplicationStatus } from "@/lib/types";

const FILTER_ALL = "all";

function csvEscape(value: string | number) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadCsv(rows: GroupBuyApplication[]) {
  const header = [
    "신청일",
    "공동구매",
    "이름",
    "동",
    "호수",
    "연락처",
    "메모",
    "상태",
  ];
  const body = rows.map((row) => [
    formatFirestoreDate(row.createdAt),
    row.groupBuyTitle,
    row.userName,
    row.building,
    row.unit,
    row.phone,
    row.memo,
    GROUP_BUY_APPLICATION_META[row.status].label,
  ]);
  const csv = [header, ...body]
    .map((line) => line.map(csvEscape).join(","))
    .join("\n");
  const blob = new Blob(["\ufeff" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `group-buy-applications-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function GroupBuyApplicants() {
  const [rows, setRows] = useState<GroupBuyApplication[]>([]);
  const [groupFilter, setGroupFilter] = useState(FILTER_ALL);
  const [statusFilter, setStatusFilter] = useState<
    GroupBuyApplicationStatus | typeof FILTER_ALL
  >(FILTER_ALL);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      return subscribeAllGroupBuyApplications(
        (next) => {
          setRows(next);
          setLoading(false);
        },
        () => {
          setError("공동구매 신청자 목록을 불러오지 못했습니다. 관리자 권한을 확인해 주세요.");
          setLoading(false);
        },
      );
    } catch {
      setError("Firebase 환경변수가 설정되지 않았습니다.");
      setLoading(false);
    }
  }, []);

  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        if (groupFilter !== FILTER_ALL && row.groupBuyId !== groupFilter) {
          return false;
        }
        if (statusFilter !== FILTER_ALL && row.status !== statusFilter) {
          return false;
        }
        return true;
      }),
    [groupFilter, rows, statusFilter],
  );

  const setStatus = async (id: string, status: GroupBuyApplicationStatus) => {
    setUpdatingId(id);
    setError(null);
    try {
      await updateGroupBuyApplicationStatus(id, status);
    } catch {
      setError("상태 변경에 실패했습니다. 관리자 권한을 확인해 주세요.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="card-base p-6">
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-base font-bold text-ink">공동구매 신청자 목록</h2>
          <p className="mt-1 text-xs text-ink-faint">
            총 {rows.length}건 · 현재 표시 {filtered.length}건 · 관리자 전용
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
            aria-label="공동구매별 필터"
          >
            <option value={FILTER_ALL}>전체 공동구매</option>
            {groupBuys.map((gb) => (
              <option key={gb.id} value={gb.id}>
                {gb.title}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as GroupBuyApplicationStatus | typeof FILTER_ALL)
            }
            className="rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
            aria-label="상태별 필터"
          >
            <option value={FILTER_ALL}>전체 상태</option>
            {GROUP_BUY_APPLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {GROUP_BUY_APPLICATION_META[status].label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => downloadCsv(filtered)}
            disabled={filtered.length === 0}
            className="btn-secondary whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" aria-hidden />
            CSV 다운로드
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 flex items-start gap-1.5 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs leading-relaxed text-rose-600">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      {loading ? (
        <div className="rounded-2xl border border-dashed border-line py-12 text-center text-sm text-ink-soft">
          <Loader2 className="mr-2 inline h-4 w-4 animate-spin" aria-hidden />
          신청자 목록을 불러오는 중...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line py-12 text-center text-sm text-ink-soft">
          조건에 맞는 신청자가 없습니다.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-ink-faint">
                <th className="py-2.5 font-medium">신청일</th>
                <th className="py-2.5 font-medium">공동구매</th>
                <th className="py-2.5 font-medium">이름</th>
                <th className="py-2.5 font-medium">동</th>
                <th className="py-2.5 font-medium">호수</th>
                <th className="py-2.5 font-medium">연락처</th>
                <th className="py-2.5 font-medium">메모</th>
                <th className="py-2.5 font-medium">상태</th>
                <th className="py-2.5 font-medium">처리</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const meta = GROUP_BUY_APPLICATION_META[row.status];
                const disabled = updatingId === row.id;
                return (
                  <tr key={row.id} className="border-b border-line/60 align-top">
                    <td className="py-3 text-ink-soft">
                      {formatFirestoreDate(row.createdAt)}
                    </td>
                    <td className="py-3 text-ink">{row.groupBuyTitle}</td>
                    <td className="py-3 font-medium text-ink">{row.userName}</td>
                    <td className="py-3 text-ink-soft">{row.building}동</td>
                    <td className="py-3 text-ink-soft">{row.unit}호</td>
                    <td className="py-3 text-ink-soft">{row.phone}</td>
                    <td className="max-w-[220px] py-3 text-ink-faint">
                      {row.memo || "-"}
                    </td>
                    <td className="py-3">
                      <span className={`badge ${TONE_CLASS[meta.tone]}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1.5">
                        <StatusButton
                          icon={RotateCcw}
                          label="신청완료"
                          disabled={disabled || row.status === "applied"}
                          onClick={() => setStatus(row.id, "applied")}
                        />
                        <StatusButton
                          icon={Eye}
                          label="확인중"
                          disabled={disabled || row.status === "checking"}
                          onClick={() => setStatus(row.id, "checking")}
                        />
                        <StatusButton
                          icon={Check}
                          label="확정"
                          primary
                          disabled={disabled || row.status === "confirmed"}
                          onClick={() => setStatus(row.id, "confirmed")}
                        />
                        <StatusButton
                          icon={X}
                          label="취소"
                          danger
                          disabled={disabled || row.status === "cancelled"}
                          onClick={() => setStatus(row.id, "cancelled")}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  primary,
  danger,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  danger?: boolean;
}) {
  const cls = primary
    ? "bg-brand-600 text-cream-50 hover:bg-brand-700"
    : danger
      ? "border border-line text-rose-500 hover:bg-rose-50"
      : "border border-line text-ink-soft hover:bg-cream-100";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-45 ${cls}`}
      title={label}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      <span className="sr-only">{label}</span>
    </button>
  );
}
