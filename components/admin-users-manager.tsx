"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Ban,
  Check,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  subscribeAdminUsers,
  updateUserApprovalStatus,
  USER_APPROVAL_STATUSES,
} from "@/lib/admin-users";
import { MEMBER_STATUS_META, TONE_CLASS } from "@/lib/constants";
import { formatFirestoreDate } from "@/lib/format";
import type { ApprovalStatus, UserProfile } from "@/lib/types";

const STATUS_LABEL: Record<ApprovalStatus, string> = {
  pending: "승인 대기",
  approved: "승인 완료",
  rejected: "반려",
  suspended: "정지",
};

const inputCls =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100";

export function AdminUsersManager() {
  const { user } = useAuth();
  const [rows, setRows] = useState<UserProfile[]>([]);
  const [activeStatus, setActiveStatus] = useState<ApprovalStatus>("pending");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      return subscribeAdminUsers(
        (next) => {
          setRows(next);
          setLoading(false);
        },
        () => {
          setError("입주민 목록을 불러오지 못했습니다. 관리자 권한을 확인해 주세요.");
          setLoading(false);
        },
      );
    } catch {
      setError("Firebase 환경변수가 설정되지 않았습니다.");
      setLoading(false);
    }
  }, []);

  const counts = useMemo(
    () =>
      USER_APPROVAL_STATUSES.reduce(
        (acc, status) => ({
          ...acc,
          [status]: rows.filter((row) => row.approvalStatus === status).length,
        }),
        {} as Record<ApprovalStatus, number>,
      ),
    [rows],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (row.approvalStatus !== activeStatus) return false;
      if (!normalizedQuery) return true;
      const haystack = [
        row.name,
        row.email,
        row.phone,
        row.building,
        row.unit,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [activeStatus, query, rows]);

  const setStatus = async (uid: string, status: ApprovalStatus) => {
    setUpdatingId(uid);
    setError(null);
    try {
      await updateUserApprovalStatus(uid, status, user?.uid);
    } catch {
      setError("입주민 승인 상태를 저장하지 못했습니다. 관리자 권한을 확인해 주세요.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="card-base p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-base font-bold text-ink">입주민 승인 관리</h2>
          <p className="mt-1 text-xs text-ink-faint">
            승인 대기, 승인 완료, 반려, 정지 회원을 한 곳에서 확인합니다.
          </p>
        </div>
        <label className="relative w-full xl:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`${inputCls} pl-9`}
            placeholder="이름, 동, 호수, 전화번호 검색"
          />
        </label>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {USER_APPROVAL_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setActiveStatus(status)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition ${
              activeStatus === status
                ? "bg-brand-600 text-cream-50"
                : "border border-line bg-white text-ink-soft hover:text-brand-700"
            }`}
          >
            {STATUS_LABEL[status]} {counts[status] ?? 0}
          </button>
        ))}
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
          입주민 목록을 불러오는 중...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line py-12 text-center text-sm text-ink-soft">
          조건에 맞는 입주민이 없습니다.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-ink-faint">
                <th className="py-2.5 font-medium">이름</th>
                <th className="py-2.5 font-medium">이메일</th>
                <th className="py-2.5 font-medium">휴대폰번호</th>
                <th className="py-2.5 font-medium">동</th>
                <th className="py-2.5 font-medium">호수</th>
                <th className="py-2.5 font-medium">신청일</th>
                <th className="py-2.5 font-medium">상태</th>
                <th className="py-2.5 font-medium">처리</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const meta = MEMBER_STATUS_META[row.approvalStatus];
                const disabled = updatingId === row.uid;
                return (
                  <tr key={row.uid} className="border-b border-line/60 align-top">
                    <td className="py-3 font-medium text-ink">{row.name}</td>
                    <td className="py-3 text-ink-soft">{row.email}</td>
                    <td className="py-3 text-ink-soft">{row.phone}</td>
                    <td className="py-3 text-ink">{row.building}동</td>
                    <td className="py-3 text-ink">{row.unit}호</td>
                    <td className="py-3 text-ink-soft">
                      {formatFirestoreDate(row.createdAt)}
                    </td>
                    <td className="py-3">
                      <span className={`badge ${TONE_CLASS[meta.tone]}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <ActionButton
                          icon={Check}
                          label="승인"
                          disabled={disabled || row.approvalStatus === "approved"}
                          onClick={() => setStatus(row.uid, "approved")}
                          primary
                        />
                        <ActionButton
                          icon={X}
                          label="반려"
                          disabled={disabled || row.approvalStatus === "rejected"}
                          onClick={() => setStatus(row.uid, "rejected")}
                        />
                        <ActionButton
                          icon={Ban}
                          label="정지"
                          disabled={disabled || row.approvalStatus === "suspended"}
                          onClick={() => setStatus(row.uid, "suspended")}
                          danger
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

function ActionButton({
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
      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-45 ${cls}`}
      title={label}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
    </button>
  );
}
