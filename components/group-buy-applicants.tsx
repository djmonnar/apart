"use client";

import { useState } from "react";
import { Check, X, Eye } from "lucide-react";
import { groupBuyApplications } from "@/data/group-buy-applications";
import { getGroupBuy } from "@/data/group-buys";
import {
  GROUP_BUY_APPLICATION_META,
  TONE_CLASS,
} from "@/lib/constants";
import type { GroupBuyApplicationStatus } from "@/lib/types";

/** 관리자 전용 신청자 목록 — 개인정보(동/호수/연락처)는 관리자만 열람 */
export function GroupBuyApplicants() {
  const [rows, setRows] = useState(groupBuyApplications);

  const setStatus = (id: string, status: GroupBuyApplicationStatus) =>
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r)),
    );

  return (
    <div className="card-base p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-ink">신청자 목록</h2>
        <span className="text-xs text-ink-faint">
          총 {rows.length}건 · 관리자 전용
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
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
            {rows.map((r) => {
              const gb = getGroupBuy(r.groupBuyId);
              const meta = GROUP_BUY_APPLICATION_META[r.status];
              return (
                <tr key={r.id} className="border-b border-line/60 align-top">
                  <td className="py-3 text-ink-soft">{r.createdAt}</td>
                  <td className="py-3 text-ink">{gb?.title ?? "-"}</td>
                  <td className="py-3 font-medium text-ink">{r.name}</td>
                  <td className="py-3 text-ink-soft">{r.building}동</td>
                  <td className="py-3 text-ink-soft">{r.unit}호</td>
                  <td className="py-3 text-ink-soft">{r.phone}</td>
                  <td className="py-3 text-ink-faint">{r.memo ?? "-"}</td>
                  <td className="py-3">
                    <span className={`badge ${TONE_CLASS[meta.tone]}`}>
                      {meta.label}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setStatus(r.id, "checking")}
                        className="inline-flex items-center gap-1 rounded-lg border border-line px-2 py-1.5 text-xs font-semibold text-ink-soft hover:bg-cream-100"
                        title="확인중"
                      >
                        <Eye className="h-3.5 w-3.5" aria-hidden />
                      </button>
                      <button
                        onClick={() => setStatus(r.id, "confirmed")}
                        className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-2 py-1.5 text-xs font-semibold text-cream-50 hover:bg-brand-700"
                        title="확정"
                      >
                        <Check className="h-3.5 w-3.5" aria-hidden />
                      </button>
                      <button
                        onClick={() => setStatus(r.id, "canceled")}
                        className="inline-flex items-center gap-1 rounded-lg border border-line px-2 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-50"
                        title="취소"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
