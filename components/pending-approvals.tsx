"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { getFirebaseDb } from "@/lib/firebase";
import { formatFirestoreDate } from "@/lib/format";
import type { UserProfile } from "@/lib/types";

type PendingUser = UserProfile;

function normalizePendingUser(id: string, data: Record<string, unknown>): PendingUser {
  return {
    uid: (data.uid as string | undefined) ?? id,
    email: (data.email as string | undefined) ?? "",
    name: (data.name as string | undefined) ?? "-",
    phone: (data.phone as string | undefined) ?? "-",
    building:
      (data.building as string | undefined) ??
      (data.dong as string | undefined) ??
      "",
    unit:
      (data.unit as string | undefined) ??
      (data.ho as string | undefined) ??
      "",
    apartmentId: "pradium",
    role: data.role === "admin" || data.role === "partner" ? data.role : "resident",
    approvalStatus: "pending",
    createdAt: data.createdAt ?? data.appliedAt ?? null,
    approvedAt: data.approvedAt ?? null,
    approvedBy: (data.approvedBy as string | null | undefined) ?? null,
  };
}

/** 관리자 입주민 승인/반려 — Firestore users 컬렉션 기준 */
export function PendingApprovals() {
  const { user } = useAuth();
  const [rows, setRows] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decidingId, setDecidingId] = useState<string | null>(null);

  useEffect(() => {
    let db: ReturnType<typeof getFirebaseDb>;
    try {
      db = getFirebaseDb();
    } catch {
      setError("Firebase 환경변수가 설정되지 않았습니다. .env.local 값을 확인해 주세요.");
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "users"),
      where("approvalStatus", "==", "pending"),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const next = snap.docs
          .map((item) => normalizePendingUser(item.id, item.data()))
          .sort((a, b) =>
            formatFirestoreDate(a.createdAt).localeCompare(
              formatFirestoreDate(b.createdAt),
            ),
          );
        setRows(next);
        setError(null);
        setLoading(false);
      },
      () => {
        setError("승인 대기 회원을 불러오지 못했습니다. 관리자 권한과 Firestore Rules를 확인해 주세요.");
        setLoading(false);
      },
    );

    return () => unsub();
  }, []);

  const decide = async (uid: string, decision: "approved" | "rejected") => {
    setDecidingId(uid);
    setError(null);
    try {
      await updateDoc(doc(getFirebaseDb(), "users", uid), {
        approvalStatus: decision,
        approvedAt: decision === "approved" ? serverTimestamp() : null,
        approvedBy: decision === "approved" ? user?.uid ?? null : null,
      });
    } catch {
      setError("승인 상태를 저장하지 못했습니다. 관리자 권한을 확인해 주세요.");
    } finally {
      setDecidingId(null);
    }
  };

  return (
    <div className="card-base p-6">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-base font-bold text-ink">승인 대기 입주민</h2>
        <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs font-bold text-cream-50">
          {rows.length}
        </span>
      </div>

      {error && (
        <p className="mb-4 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs leading-relaxed text-rose-600">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-dashed border-line py-12 text-sm text-ink-soft">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
          승인 대기 회원을 불러오는 중...
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line py-12 text-center text-sm text-ink-soft">
          현재 승인 대기 회원이 없습니다.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-ink-faint">
                <th className="py-2.5 font-medium">이름</th>
                <th className="py-2.5 font-medium">동</th>
                <th className="py-2.5 font-medium">호수</th>
                <th className="py-2.5 font-medium">휴대폰번호</th>
                <th className="py-2.5 font-medium">신청일</th>
                <th className="py-2.5 font-medium">작업</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.uid} className="border-b border-line/60">
                  <td className="py-3 font-medium text-ink">{r.name}</td>
                  <td className="py-3 text-ink">{r.building}동</td>
                  <td className="py-3 text-ink">{r.unit}호</td>
                  <td className="py-3 text-ink-soft">{r.phone}</td>
                  <td className="py-3 text-ink-soft">
                    {formatFirestoreDate(r.createdAt)}
                  </td>
                  <td className="py-3">
                    <span className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => decide(r.uid, "approved")}
                        disabled={decidingId === r.uid}
                        className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-2.5 py-1.5 text-xs font-semibold text-cream-50 hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Check className="h-3.5 w-3.5" aria-hidden />
                        승인
                      </button>
                      <button
                        type="button"
                        onClick={() => decide(r.uid, "rejected")}
                        disabled={decidingId === r.uid}
                        className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-ink-soft hover:bg-cream-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden />
                        반려
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
