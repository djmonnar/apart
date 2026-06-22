"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2, Users, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  subscribeMyGroupBuyApplications,
  updateGroupBuyApplicationStatus,
} from "@/lib/group-buy-applications";
import { GROUP_BUY_APPLICATION_META, TONE_CLASS } from "@/lib/constants";
import { formatFirestoreDate } from "@/lib/format";
import type { GroupBuyApplication } from "@/lib/types";

function canCancel(status: GroupBuyApplication["status"]) {
  return status === "applied" || status === "checking";
}

export function MyGroupBuyApplications() {
  const { user } = useAuth();
  const [items, setItems] = useState<GroupBuyApplication[]>([]);
  const [loading, setLoading] = useState(Boolean(user));
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setItems([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      return subscribeMyGroupBuyApplications(
        user.uid,
        (next) => {
          setItems(next);
          setLoading(false);
        },
        () => {
          setError("공동구매 신청 내역을 불러오지 못했습니다.");
          setLoading(false);
        },
      );
    } catch {
      setError("Firebase 환경변수가 설정되지 않았습니다.");
      setLoading(false);
    }
  }, [user]);

  const cancel = async (item: GroupBuyApplication) => {
    setError(null);
    setNotice(null);

    if (item.status === "confirmed") {
      setNotice("확정된 공동구매는 관리자에게 문의해주세요.");
      return;
    }

    if (!canCancel(item.status)) return;

    setUpdatingId(item.id);
    try {
      await updateGroupBuyApplicationStatus(item.id, "cancelled");
    } catch {
      setError("신청 취소에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="mt-8">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-ink">
        <Users className="h-5 w-5 text-brand-500" aria-hidden />
        내 공동구매 신청 내역
      </h2>

      {notice && (
        <p className="mb-3 flex items-start gap-1.5 rounded-xl bg-amber-50 px-3.5 py-2.5 text-xs leading-relaxed text-amber-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          {notice}
        </p>
      )}

      {error && (
        <p className="mb-3 flex items-start gap-1.5 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs leading-relaxed text-rose-600">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      {loading ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-ink-soft">
          <Loader2 className="mr-2 inline h-4 w-4 animate-spin" aria-hidden />
          신청 내역을 불러오는 중...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-ink-soft">
          아직 공동구매 신청 내역이 없습니다.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line bg-cream-100 text-left text-ink-faint">
                <th className="px-4 py-3 font-medium">공동구매명</th>
                <th className="px-4 py-3 font-medium">신청일</th>
                <th className="px-4 py-3 font-medium">상태</th>
                <th className="px-4 py-3 font-medium">요청 메모</th>
                <th className="px-4 py-3 font-medium">취소</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const meta = GROUP_BUY_APPLICATION_META[item.status];
                return (
                  <tr key={item.id} className="border-b border-line/60 last:border-0">
                    <td className="px-4 py-3 font-medium text-ink">
                      {item.groupBuyTitle}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {formatFirestoreDate(item.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${TONE_CLASS[meta.tone]}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {item.memo || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => cancel(item)}
                        disabled={!canCancel(item.status) || updatingId === item.id}
                        className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-ink-soft hover:bg-cream-100 disabled:cursor-not-allowed disabled:opacity-50"
                        title={
                          item.status === "confirmed"
                            ? "확정된 공동구매는 관리자에게 문의해주세요."
                            : "신청 취소"
                        }
                      >
                        {updatingId === item.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                        ) : (
                          <X className="h-3.5 w-3.5" aria-hidden />
                        )}
                        취소
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
