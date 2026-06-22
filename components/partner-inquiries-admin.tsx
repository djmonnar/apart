"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Clipboard, Loader2, Save } from "lucide-react";
import {
  PARTNER_INQUIRY_STATUSES,
  subscribePartnerInquiries,
  updatePartnerInquiry,
} from "@/lib/partner-inquiries";
import { PARTNER_INQUIRY_STATUS_META, TONE_CLASS } from "@/lib/constants";
import { formatFirestoreDate } from "@/lib/format";
import type { PartnerInquiry, PartnerInquiryStatus } from "@/lib/types";

const selectCls =
  "rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs font-semibold text-ink outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100";

export function PartnerInquiriesAdmin() {
  const [items, setItems] = useState<PartnerInquiry[]>([]);
  const [memos, setMemos] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      return subscribePartnerInquiries(
        (next) => {
          setItems(next);
          setMemos((current) => {
            const merged = { ...current };
            next.forEach((item) => {
              if (merged[item.id] === undefined) {
                merged[item.id] = item.internalMemo;
              }
            });
            return merged;
          });
          setLoading(false);
        },
        () => {
          setError("제휴업체 문의 목록을 불러오지 못했습니다. 관리자 권한을 확인해 주세요.");
          setLoading(false);
        },
      );
    } catch {
      setError("Firebase 환경변수가 설정되지 않았습니다.");
      setLoading(false);
    }
  }, []);

  const setStatus = async (id: string, status: PartnerInquiryStatus) => {
    setUpdatingId(id);
    setError(null);
    try {
      await updatePartnerInquiry({ id, status });
    } catch {
      setError("문의 상태 변경에 실패했습니다. 관리자 권한을 확인해 주세요.");
    } finally {
      setUpdatingId(null);
    }
  };

  const saveMemo = async (id: string) => {
    setUpdatingId(id);
    setError(null);
    try {
      await updatePartnerInquiry({ id, internalMemo: memos[id] ?? "" });
      setNotice("내부 메모를 저장했습니다.");
    } catch {
      setError("내부 메모 저장에 실패했습니다. 관리자 권한을 확인해 주세요.");
    } finally {
      setUpdatingId(null);
    }
  };

  const copyPhone = async (phone: string) => {
    try {
      await navigator.clipboard.writeText(phone);
      setNotice("전화번호를 복사했습니다.");
    } catch {
      setNotice("복사할 전화번호: " + phone);
    }
  };

  return (
    <div className="card-base p-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-ink">제휴업체 문의</h2>
          <p className="mt-1 text-xs text-ink-faint">
            총 {items.length}건 · 관리자 전용
          </p>
        </div>
      </div>

      {notice && (
        <p className="mb-4 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-700">
          {notice}
        </p>
      )}

      {error && (
        <p className="mb-4 flex items-start gap-1.5 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs leading-relaxed text-rose-600">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      {loading ? (
        <div className="rounded-2xl border border-dashed border-line py-12 text-center text-sm text-ink-soft">
          <Loader2 className="mr-2 inline h-4 w-4 animate-spin" aria-hidden />
          제휴업체 문의를 불러오는 중...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line py-12 text-center text-sm text-ink-soft">
          아직 접수된 제휴업체 문의가 없습니다.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1060px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-ink-faint">
                <th className="py-2.5 font-medium">접수일</th>
                <th className="py-2.5 font-medium">업체명</th>
                <th className="py-2.5 font-medium">업종</th>
                <th className="py-2.5 font-medium">담당자</th>
                <th className="py-2.5 font-medium">연락처</th>
                <th className="py-2.5 font-medium">지역</th>
                <th className="py-2.5 font-medium">상태</th>
                <th className="py-2.5 font-medium">문의 내용</th>
                <th className="py-2.5 font-medium">내부 메모</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const meta = PARTNER_INQUIRY_STATUS_META[item.status];
                return (
                  <tr key={item.id} className="border-b border-line/60 align-top">
                    <td className="py-3 text-ink-soft">
                      {formatFirestoreDate(item.createdAt)}
                    </td>
                    <td className="py-3 font-medium text-ink">
                      {item.businessName}
                    </td>
                    <td className="py-3 text-ink-soft">{item.category}</td>
                    <td className="py-3 text-ink">{item.contactName}</td>
                    <td className="py-3 text-ink-soft">
                      <button
                        type="button"
                        onClick={() => copyPhone(item.phone)}
                        className="inline-flex items-center gap-1 rounded-lg border border-line px-2 py-1 text-xs font-semibold hover:bg-cream-100"
                        title="전화번호 복사"
                      >
                        <Clipboard className="h-3.5 w-3.5" aria-hidden />
                        {item.phone}
                      </button>
                    </td>
                    <td className="py-3 text-ink-soft">{item.region}</td>
                    <td className="py-3">
                      <div className="flex flex-col gap-2">
                        <span className={`badge w-fit ${TONE_CLASS[meta.tone]}`}>
                          {meta.label}
                        </span>
                        <select
                          value={item.status}
                          onChange={(e) =>
                            setStatus(item.id, e.target.value as PartnerInquiryStatus)
                          }
                          disabled={updatingId === item.id}
                          className={selectCls}
                          aria-label={`${item.businessName} 문의 상태 변경`}
                        >
                          {PARTNER_INQUIRY_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {PARTNER_INQUIRY_STATUS_META[status].label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="max-w-[220px] py-3 text-ink-faint">
                      {item.message || "-"}
                    </td>
                    <td className="min-w-[220px] py-3">
                      <textarea
                        value={memos[item.id] ?? ""}
                        onChange={(e) =>
                          setMemos((current) => ({
                            ...current,
                            [item.id]: e.target.value,
                          }))
                        }
                        rows={2}
                        className="w-full resize-none rounded-lg border border-line bg-white px-2.5 py-2 text-xs text-ink outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
                        placeholder="관리자 메모"
                      />
                      <button
                        type="button"
                        onClick={() => saveMemo(item.id)}
                        disabled={updatingId === item.id}
                        className="mt-2 inline-flex items-center gap-1 rounded-lg bg-brand-600 px-2.5 py-1.5 text-xs font-semibold text-cream-50 hover:bg-brand-700 disabled:opacity-50"
                      >
                        <Save className="h-3.5 w-3.5" aria-hidden />
                        저장
                      </button>
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
