"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Edit3, Loader2, Plus, Save, Search } from "lucide-react";
import {
  BENEFIT_TYPES,
  CMS_CONTENT_STATUSES,
  createBenefit,
  saveBenefit,
  subscribeBenefits,
  subscribePartners,
  updateBenefitStatus,
} from "@/lib/benefit-cms";
import {
  BENEFIT_TYPE_LABEL,
  CATEGORIES,
  CATEGORY_LABEL,
  CMS_CONTENT_STATUS_META,
  TONE_CLASS,
} from "@/lib/constants";
import type {
  Benefit,
  BenefitType,
  CategoryId,
  CmsContentStatus,
  Partner,
} from "@/lib/types";

const inputCls =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100";
const labelCls = "text-xs font-semibold text-ink-soft";

type BenefitForm = {
  id: string;
  partnerId: string;
  category: CategoryId;
  title: string;
  summary: string;
  description: string;
  benefitType: BenefitType;
  originalPrice: string;
  benefitPrice: string;
  discountText: string;
  conditions: string;
  usageGuide: string;
  imageUrl: string;
  status: CmsContentStatus;
  isFeatured: boolean;
  monthlyLimitPerUser: number;
  isMonthlyLimited: boolean;
};

function emptyForm(partnerId = ""): BenefitForm {
  return {
    id: "",
    partnerId,
    category: "etc",
    title: "",
    summary: "",
    description: "",
    benefitType: "discount",
    originalPrice: "",
    benefitPrice: "",
    discountText: "",
    conditions: "입주민 인증 후 혜택 사용 화면에서 사용 완료 처리 시 적용",
    usageGuide:
      "혜택 상세에서 혜택 사용하기를 누릅니다.\n매장 직원이 손님 휴대폰에서 사용 완료를 눌러 처리합니다.",
    imageUrl: "",
    status: "draft",
    isFeatured: false,
    monthlyLimitPerUser: 1,
    isMonthlyLimited: true,
  };
}

function lines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toForm(item: Benefit): BenefitForm {
  return {
    id: item.id,
    partnerId: item.partnerId,
    category: item.category,
    title: item.title,
    summary: item.summaryText ?? item.summary.join(", "),
    description: item.description,
    benefitType: item.benefitType,
    originalPrice: item.originalPrice,
    benefitPrice: item.benefitPrice,
    discountText: item.discountText,
    conditions: item.conditions.join("\n"),
    usageGuide: item.usageGuide.join("\n"),
    imageUrl: item.imageUrl,
    status: item.status,
    isFeatured: item.isFeatured,
    monthlyLimitPerUser: item.monthlyLimitPerUser,
    isMonthlyLimited: item.isMonthlyLimited,
  };
}

function toBenefit(form: BenefitForm, partner: Partner): Benefit {
  const monthlyLimit = Math.max(1, Math.floor(form.monthlyLimitPerUser || 1));
  return {
    id: form.id,
    partnerId: partner.id,
    partnerName: partner.name,
    partnerSlug: partner.slug,
    category: form.category || partner.category,
    title: form.title,
    summary: lines(form.summary).length > 0 ? lines(form.summary) : [form.summary],
    summaryText: form.summary,
    description: form.description,
    benefitType: form.benefitType,
    originalPrice: form.originalPrice,
    benefitPrice: form.benefitPrice,
    discountText: form.discountText,
    conditions: lines(form.conditions),
    usageGuide: lines(form.usageGuide),
    imageUrl: form.imageUrl,
    status: form.status,
    isFeatured: form.isFeatured,
    validFrom: "",
    validTo: "",
    usageLimit: form.isMonthlyLimited ? `월 ${monthlyLimit}회` : "월 제한 없음",
    monthlyLimitPerUser: monthlyLimit,
    isMonthlyLimited: form.isMonthlyLimited,
    resetDay: 1,
    highlight: form.isFeatured,
  };
}

export function AdminBenefitsManager() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [form, setForm] = useState<BenefitForm>(() => emptyForm());
  const [query, setQuery] = useState("");
  const [partnerFilter, setPartnerFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryId | "all">("all");
  const [statusFilter, setStatusFilter] = useState<CmsContentStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const loaded = { partners: false, benefits: false };
    const mark = (key: keyof typeof loaded) => {
      loaded[key] = true;
      if (Object.values(loaded).every(Boolean)) setLoading(false);
    };

    try {
      const unsubPartners = subscribePartners(
        (next) => {
          setPartners(next);
          setForm((current) => {
            if (current.partnerId || next.length === 0) return current;
            return {
              ...current,
              partnerId: next[0].id,
              category: next[0].category,
              imageUrl: next[0].imageUrl,
            };
          });
          mark("partners");
        },
        () => {
          setError("업체 목록을 불러오지 못했습니다.");
          mark("partners");
        },
      );
      const unsubBenefits = subscribeBenefits(
        (next) => {
          setBenefits(next);
          mark("benefits");
        },
        () => {
          setError("혜택 목록을 불러오지 못했습니다. 관리자 권한을 확인해주세요.");
          mark("benefits");
        },
      );
      return () => {
        unsubPartners();
        unsubBenefits();
      };
    } catch {
      setError("Firebase 환경변수가 설정되지 않았습니다.");
      setLoading(false);
    }
  }, []);

  const partnerById = useMemo(
    () => new Map(partners.map((partner) => [partner.id, partner])),
    [partners],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return benefits.filter((benefit) => {
      if (partnerFilter !== "all" && benefit.partnerId !== partnerFilter) {
        return false;
      }
      if (categoryFilter !== "all" && benefit.category !== categoryFilter) {
        return false;
      }
      if (statusFilter !== "all" && benefit.status !== statusFilter) {
        return false;
      }
      if (!needle) return true;
      const partner = partnerById.get(benefit.partnerId);
      return [
        benefit.title,
        benefit.summaryText,
        benefit.partnerName,
        partner?.name,
        benefit.category,
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [
    benefits,
    categoryFilter,
    partnerById,
    partnerFilter,
    query,
    statusFilter,
  ]);

  const updateForm = <K extends keyof BenefitForm>(
    key: K,
    value: BenefitForm[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const selectPartner = (partnerId: string) => {
    const partner = partnerById.get(partnerId);
    setForm((current) => ({
      ...current,
      partnerId,
      category: partner?.category ?? current.category,
      imageUrl: current.imageUrl || partner?.imageUrl || "",
    }));
  };

  const handleSave = async () => {
    const partner = partnerById.get(form.partnerId);
    if (!partner) {
      setError("연결 업체를 선택해주세요.");
      return;
    }
    if (!form.title.trim() || !form.summary.trim()) {
      setError("혜택 제목과 요약 문구는 필수입니다.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const benefit = toBenefit(form, partner);
      if (form.id) {
        await saveBenefit(benefit, partner);
        setNotice("혜택 정보를 수정했습니다.");
      } else {
        const { id: _id, ...newBenefit } = benefit;
        const id = await createBenefit(newBenefit, partner);
        setForm((current) => ({ ...current, id }));
        setNotice("혜택을 등록했습니다.");
      }
    } catch {
      setError("혜택 저장에 실패했습니다. 관리자 권한을 확인해주세요.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (id: string, status: CmsContentStatus) => {
    setError(null);
    try {
      await updateBenefitStatus(id, status);
      setNotice("혜택 상태를 변경했습니다.");
    } catch {
      setError("혜택 상태 변경에 실패했습니다.");
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_460px]">
      <section className="card-base p-5 sm:p-6">
        <div className="mb-4">
          <h2 className="text-base font-bold text-ink">혜택 목록</h2>
          <p className="mt-1 text-xs text-ink-faint">
            총 {benefits.length}개 · active 혜택만 입주민 화면에 표시됩니다.
          </p>
        </div>

        <div className="mb-4 grid gap-2 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <label className="relative block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
              aria-hidden
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className={`${inputCls} pl-9`}
              placeholder="혜택명, 업체명 검색"
              type="search"
            />
          </label>
          <select
            value={partnerFilter}
            onChange={(event) => setPartnerFilter(event.target.value)}
            className={inputCls}
          >
            <option value="all">전체 업체</option>
            {partners.map((partner) => (
              <option key={partner.id} value={partner.id}>
                {partner.name}
              </option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value as CategoryId | "all")
            }
            className={inputCls}
          >
            <option value="all">전체 카테고리</option>
            {CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as CmsContentStatus | "all")
            }
            className={inputCls}
          >
            <option value="all">전체 상태</option>
            {CMS_CONTENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {CMS_CONTENT_STATUS_META[status].label}
              </option>
            ))}
          </select>
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
            혜택 목록을 불러오는 중...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line py-12 text-center text-sm text-ink-soft">
            조건에 맞는 혜택이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-ink-faint">
                  <th className="py-2.5 font-medium">혜택</th>
                  <th className="py-2.5 font-medium">업체</th>
                  <th className="py-2.5 font-medium">카테고리</th>
                  <th className="py-2.5 font-medium">월 제한</th>
                  <th className="py-2.5 font-medium">추천</th>
                  <th className="py-2.5 font-medium">상태</th>
                  <th className="py-2.5 font-medium">관리</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((benefit) => {
                  const meta = CMS_CONTENT_STATUS_META[benefit.status];
                  const partner = partnerById.get(benefit.partnerId);
                  return (
                    <tr key={benefit.id} className="border-b border-line/60">
                      <td className="py-3">
                        <p className="font-semibold text-ink">{benefit.title}</p>
                        <p className="line-clamp-1 text-xs text-ink-faint">
                          {benefit.summaryText}
                        </p>
                      </td>
                      <td className="py-3 text-ink-soft">
                        {partner?.name ?? benefit.partnerName ?? "-"}
                      </td>
                      <td className="py-3 text-ink-soft">
                        {CATEGORY_LABEL[benefit.category]}
                      </td>
                      <td className="py-3 text-ink-soft">
                        {benefit.isMonthlyLimited
                          ? `월 ${benefit.monthlyLimitPerUser}회`
                          : "제한 없음"}
                      </td>
                      <td className="py-3 text-ink-soft">
                        {benefit.isFeatured ? "추천" : "-"}
                      </td>
                      <td className="py-3">
                        <select
                          value={benefit.status}
                          onChange={(event) =>
                            handleStatus(
                              benefit.id,
                              event.target.value as CmsContentStatus,
                            )
                          }
                          className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs font-semibold text-ink"
                        >
                          {CMS_CONTENT_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {CMS_CONTENT_STATUS_META[status].label}
                            </option>
                          ))}
                        </select>
                        <span className={`badge ml-2 ${TONE_CLASS[meta.tone]}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="py-3">
                        <button
                          type="button"
                          onClick={() => setForm(toForm(benefit))}
                          className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold hover:bg-cream-100"
                        >
                          <Edit3 className="h-3.5 w-3.5" aria-hidden />
                          수정
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

      <section className="card-base p-5 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-ink">
              {form.id ? "혜택 수정" : "혜택 등록"}
            </h2>
            <p className="mt-1 text-xs text-ink-faint">
              월 사용 가능 횟수는 혜택 사용 MVP에 바로 반영됩니다.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setForm(emptyForm(partners[0]?.id ?? ""))}
            className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold hover:bg-cream-100"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            신규
          </button>
        </div>

        <div className="space-y-3">
          <Field label="연결 업체">
            <select
              value={form.partnerId}
              onChange={(event) => selectPartner(event.target.value)}
              className={inputCls}
            >
              <option value="">업체 선택</option>
              {partners.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="혜택 제목">
            <input
              value={form.title}
              onChange={(event) => updateForm("title", event.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="요약 문구">
            <input
              value={form.summary}
              onChange={(event) => updateForm("summary", event.target.value)}
              className={inputCls}
              placeholder="전 메뉴 2,000원 할인, 포장 주문 시 적용"
            />
          </Field>
          <Field label="상세 설명">
            <textarea
              value={form.description}
              onChange={(event) => updateForm("description", event.target.value)}
              rows={3}
              className={inputCls}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="카테고리">
              <select
                value={form.category}
                onChange={(event) =>
                  updateForm("category", event.target.value as CategoryId)
                }
                className={inputCls}
              >
                {CATEGORIES.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="혜택 유형">
              <select
                value={form.benefitType}
                onChange={(event) =>
                  updateForm("benefitType", event.target.value as BenefitType)
                }
                className={inputCls}
              >
                {BENEFIT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {BENEFIT_TYPE_LABEL[type]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="정상가 문구">
              <input
                value={form.originalPrice}
                onChange={(event) =>
                  updateForm("originalPrice", event.target.value)
                }
                className={inputCls}
              />
            </Field>
            <Field label="혜택가 문구">
              <input
                value={form.benefitPrice}
                onChange={(event) =>
                  updateForm("benefitPrice", event.target.value)
                }
                className={inputCls}
              />
            </Field>
            <Field label="할인 문구">
              <input
                value={form.discountText}
                onChange={(event) =>
                  updateForm("discountText", event.target.value)
                }
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="이용 조건">
            <textarea
              value={form.conditions}
              onChange={(event) => updateForm("conditions", event.target.value)}
              rows={3}
              className={inputCls}
            />
          </Field>
          <Field label="이용 방법">
            <textarea
              value={form.usageGuide}
              onChange={(event) => updateForm("usageGuide", event.target.value)}
              rows={3}
              className={inputCls}
            />
          </Field>
          <Field label="대표 이미지 URL">
            <input
              value={form.imageUrl}
              onChange={(event) => updateForm("imageUrl", event.target.value)}
              className={inputCls}
              placeholder="/assets/hair-salon.png"
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="월 사용 가능 횟수">
              <input
                type="number"
                min={1}
                value={form.monthlyLimitPerUser}
                onChange={(event) =>
                  updateForm(
                    "monthlyLimitPerUser",
                    Math.max(1, Number(event.target.value || 1)),
                  )
                }
                className={inputCls}
              />
            </Field>
            <Field label="상태">
              <select
                value={form.status}
                onChange={(event) =>
                  updateForm("status", event.target.value as CmsContentStatus)
                }
                className={inputCls}
              >
                {CMS_CONTENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {CMS_CONTENT_STATUS_META[status].label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex items-center gap-2 rounded-xl bg-cream-100 px-3 py-2 text-sm font-semibold text-ink">
              <input
                type="checkbox"
                checked={form.isMonthlyLimited}
                onChange={(event) =>
                  updateForm("isMonthlyLimited", event.target.checked)
                }
                className="h-4 w-4 accent-brand-600"
              />
              월 제한 사용
            </label>
            <label className="flex items-center gap-2 rounded-xl bg-cream-100 px-3 py-2 text-sm font-semibold text-ink">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(event) =>
                  updateForm("isFeatured", event.target.checked)
                }
                className="h-4 w-4 accent-brand-600"
              />
              추천 혜택
            </label>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || partners.length === 0}
            className="btn-primary w-full disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Save className="h-4 w-4" aria-hidden />
            )}
            저장
          </button>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <span className="mt-1 block">{children}</span>
    </label>
  );
}
