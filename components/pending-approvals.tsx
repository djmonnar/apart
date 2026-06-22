"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { users as mockUsers } from "@/data/users";

type Row = (typeof mockUsers)[number] & { decided?: "approved" | "rejected" };

/** 관리자 입주민 승인/반려 — 목업 로컬 상태 데모 */
export function PendingApprovals() {
  const [rows, setRows] = useState<Row[]>(
    mockUsers.filter((u) => u.status === "pending"),
  );

  const decide = (id: string, decision: "approved" | "rejected") =>
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, decided: decision } : r)),
    );

  return (
    <div className="card-base p-6">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-base font-bold text-ink">승인 대기 입주민</h2>
        <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs font-bold text-cream-50">
          {rows.filter((r) => !r.decided).length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-ink-faint">
              <th className="py-2.5 font-medium">동</th>
              <th className="py-2.5 font-medium">호수</th>
              <th className="py-2.5 font-medium">이름</th>
              <th className="py-2.5 font-medium">신청일</th>
              <th className="py-2.5 font-medium">작업</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-line/60">
                <td className="py-3 text-ink">{r.dong}동</td>
                <td className="py-3 text-ink">{r.ho}호</td>
                <td className="py-3 font-medium text-ink">{r.name}</td>
                <td className="py-3 text-ink-soft">{r.appliedAt}</td>
                <td className="py-3">
                  {r.decided ? (
                    <span
                      className={`badge ${
                        r.decided === "approved"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-600"
                      }`}
                    >
                      {r.decided === "approved" ? "승인 완료" : "반려"}
                    </span>
                  ) : (
                    <span className="flex gap-1.5">
                      <button
                        onClick={() => decide(r.id, "approved")}
                        className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-2.5 py-1.5 text-xs font-semibold text-cream-50 hover:bg-brand-700"
                      >
                        <Check className="h-3.5 w-3.5" aria-hidden />
                        승인
                      </button>
                      <button
                        onClick={() => decide(r.id, "rejected")}
                        className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-ink-soft hover:bg-cream-100"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden />
                        반려
                      </button>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
