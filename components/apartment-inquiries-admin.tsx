"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Clipboard, Loader2, Save } from "lucide-react";
import {
  APARTMENT_INQUIRY_STATUSES,
  subscribeApartmentInquiries,
  updateApartmentInquiry,
} from "@/lib/apartment-inquiries";
import {
  APARTMENT_INQUIRY_ROLE_LABEL,
  APARTMENT_INQUIRY_STATUS_META,
  TONE_CLASS,
} from "@/lib/constants";
import { formatFirestoreDate } from "@/lib/format";
import type { ApartmentInquiry, ApartmentInquiryStatus } from "@/lib/types";

const selectCls =
  "rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs font-semibold text-ink outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100";

export function ApartmentInquiriesAdmin() {
  const [items, setItems] = useState<ApartmentInquiry[]>([]);
  const [memos, setMemos] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      return subscribeApartmentInquiries(
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
          setError("아파트 도입 문의 목록을 불러오지 못했습니다. 관리자 권한을 확인해 주세요.");
          setLoading(false);
        },
      );
    } catch {
      setError("Firebase 환경변수가 설정되지 않았습니다.");
      setLoading(false);
    }
  }, []);

  const setStatus = async (id: string, status: ApartmentInquiryStatus) => {
    setUpdatingId(id);
    setError(null);
    try {
      await updateApartmentInquiry({ id, status });
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
      await updateApartmentInquiry({ id, internalMemo: memos[id] ?? "" });
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
          <h2 className="text-base font-bold text-ink">아파트 도입 문의</h2>
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
          아파트 도입 문의를 불러오는 중...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line py-12 text-center text-sm text-ink-soft">
          아직 접수된 아파트 도입 문의가 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const meta = APARTMENT_INQUIRY_STATUS_META[item.status];
            return (
              <details
                key={item.id}
                className="rounded-xl border border-line bg-white p-4 open:shadow-soft"
              >
                <summary className="grid cursor-pointer list-none gap-3 md:grid-cols-[1.2fr_1fr_1fr_auto] md:items-center">
                  <div>
                    <p className="font-bold text-ink">{item.apartmentName}</p>
                    <p className="mt-1 text-xs text-ink-faint">
                      {formatFirestoreDate(item.createdAt)} · {item.region} ·{" "}
                      {item.householdCount}
                    </p>
                  </div>
                  <div className="text-sm text-ink-soft">
                    {item.contactName} · {APARTMENT_INQUIRY_ROLE_LABEL[item.role]}
                  </div>
                  <span className="text-sm text-ink-soft">{item.phone}</span>
                  <span className={`badge w-fit ${TONE_CLASS[meta.tone]}`}>
                    {meta.label}
                  </span>
                </summary>

                <div className="mt-4 grid gap-4 border-t border-line pt-4 lg:grid-cols-[1fr_280px]">
                  <div>
                    <p className="text-xs font-semibold text-ink-faint">
                      문의 내용
                    </p>
                    <p className="mt-2 rounded-xl bg-cream-100 p-4 text-sm leading-relaxed text-ink-soft">
                      {item.message || "-"}
                    </p>
                    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                      <Info label="지역" value={item.region} />
                      <Info label="세대수" value={item.householdCount} />
                      <Info label="담당자" value={item.contactName} />
                      <Info label="직책" value={APARTMENT_INQUIRY_ROLE_LABEL[item.role]} />
                    </dl>
                    <button
                      type="button"
                      onClick={() => copyPhone(item.phone)}
                      className="mt-4 inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-ink-soft hover:bg-cream-100"
                    >
                      <Clipboard className="h-3.5 w-3.5" aria-hidden />
                      전화번호 복사
                    </button>
                  </div>
                  <div>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold text-ink-faint">
                        상태 변경
                      </span>
                      <select
                        value={item.status}
                        onChange={(e) =>
                          setStatus(item.id, e.target.value as ApartmentInquiryStatus)
                        }
                        disabled={updatingId === item.id}
                        className={`${selectCls} w-full`}
                        aria-label={`${item.apartmentName} 문의 상태 변경`}
                      >
                        {APARTMENT_INQUIRY_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {APARTMENT_INQUIRY_STATUS_META[status].label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="mt-4 block">
                      <span className="mb-1.5 block text-xs font-semibold text-ink-faint">
                        내부 메모
                      </span>
                      <textarea
                        value={memos[item.id] ?? ""}
                        onChange={(e) =>
                          setMemos((current) => ({
                            ...current,
                            [item.id]: e.target.value,
                          }))
                        }
                        rows={4}
                        className="w-full resize-none rounded-lg border border-line bg-white px-2.5 py-2 text-xs text-ink outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
                        placeholder="관리자 메모"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => saveMemo(item.id)}
                      disabled={updatingId === item.id}
                      className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-brand-600 px-2.5 py-2 text-xs font-semibold text-cream-50 hover:bg-brand-700 disabled:opacity-50"
                    >
                      <Save className="h-3.5 w-3.5" aria-hidden />
                      메모 저장
                    </button>
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-cream-100 px-3.5 py-3">
      <dt className="text-xs text-ink-faint">{label}</dt>
      <dd className="mt-1 font-medium text-ink">{value || "-"}</dd>
    </div>
  );
}
