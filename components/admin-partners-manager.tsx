"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Edit3, Loader2, Plus, Save, Search } from "lucide-react";
import {
  CMS_CONTENT_STATUSES,
  createPartner,
  savePartner,
  subscribeBenefits,
  subscribePartners,
  updatePartnerStatus,
} from "@/lib/benefit-cms";
import {
  CATEGORIES,
  CATEGORY_LABEL,
  CMS_CONTENT_STATUS_META,
  TONE_CLASS,
} from "@/lib/constants";
import type { Benefit, CategoryId, CmsContentStatus, Partner } from "@/lib/types";

const inputCls =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100";
const labelCls = "text-xs font-semibold text-ink-soft";

type PartnerForm = {
  id: string;
  name: string;
  slug: string;
  category: CategoryId;
  shortDescription: string;
  description: string;
  phone: string;
  address: string;
  region: string;
  imageUrl: string;
  status: CmsContentStatus;
  isFeatured: boolean;
};

function emptyForm(): PartnerForm {
  return {
    id: "",
    name: "",
    slug: "",
    category: "etc",
    shortDescription: "",
    description: "",
    phone: "",
    address: "",
    region: "",
    imageUrl: "",
    status: "draft",
    isFeatured: false,
  };
}

function toForm(item: Partner): PartnerForm {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    category: item.category,
    shortDescription: item.shortDescription,
    description: item.description,
    phone: item.phone ?? "",
    address: item.address,
    region: item.region,
    imageUrl: item.imageUrl,
    status: item.status,
    isFeatured: item.isFeatured,
  };
}

function toPartner(form: PartnerForm): Partner {
  return {
    id: form.id,
    apartmentId: "pradium",
    slug: form.slug,
    name: form.name,
    category: form.category,
    image: form.imageUrl,
    imageUrl: form.imageUrl,
    region: form.region,
    tagline: form.shortDescription,
    shortDescription: form.shortDescription,
    description: form.description,
    phone: form.phone,
    address: form.address,
    status: form.status,
    isFeatured: form.isFeatured,
    partneredAt: "",
    featured: form.isFeatured,
  };
}

export function AdminPartnersManager() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [form, setForm] = useState<PartnerForm>(() => emptyForm());
  const [query, setQuery] = useState("");
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
          mark("partners");
        },
        () => {
          setError("업체 목록을 불러오지 못했습니다. 관리자 권한을 확인해주세요.");
          mark("partners");
        },
      );
      const unsubBenefits = subscribeBenefits(
        (next) => {
          setBenefits(next);
          mark("benefits");
        },
        () => mark("benefits"),
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

  const benefitCountByPartner = useMemo(() => {
    const counts: Record<string, number> = {};
    benefits.forEach((benefit) => {
      counts[benefit.partnerId] = (counts[benefit.partnerId] ?? 0) + 1;
    });
    return counts;
  }, [benefits]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return partners;
    return partners.filter((partner) =>
      [partner.name, partner.category, partner.region, partner.shortDescription]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [partners, query]);

  const updateForm = <K extends keyof PartnerForm>(
    key: K,
    value: PartnerForm[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      setError("업체명과 slug는 필수입니다.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (form.id) {
        await savePartner(toPartner(form));
        setNotice("업체 정보를 수정했습니다.");
      } else {
        const id = await createPartner(toPartner({ ...form, id: "" }));
        setForm((current) => ({ ...current, id }));
        setNotice("업체를 등록했습니다.");
      }
    } catch {
      setError("업체 저장에 실패했습니다. 관리자 권한을 확인해주세요.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (id: string, status: CmsContentStatus) => {
    setError(null);
    try {
      await updatePartnerStatus(id, status);
      setNotice("업체 상태를 변경했습니다.");
    } catch {
      setError("업체 상태 변경에 실패했습니다.");
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
      <section className="card-base p-5 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-ink">업체 목록</h2>
            <p className="mt-1 text-xs text-ink-faint">
              총 {partners.length}개 · active/paused/draft 관리
            </p>
          </div>
          <label className="relative block sm:w-72">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
              aria-hidden
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className={`${inputCls} pl-9`}
              placeholder="업체명, 카테고리, 지역 검색"
              type="search"
            />
          </label>
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
            업체 목록을 불러오는 중...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line py-12 text-center text-sm text-ink-soft">
            조건에 맞는 업체가 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-ink-faint">
                  <th className="py-2.5 font-medium">업체</th>
                  <th className="py-2.5 font-medium">카테고리</th>
                  <th className="py-2.5 font-medium">지역</th>
                  <th className="py-2.5 font-medium">혜택 수</th>
                  <th className="py-2.5 font-medium">상태</th>
                  <th className="py-2.5 font-medium">관리</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((partner) => {
                  const meta = CMS_CONTENT_STATUS_META[partner.status];
                  return (
                    <tr key={partner.id} className="border-b border-line/60">
                      <td className="py-3">
                        <p className="font-semibold text-ink">{partner.name}</p>
                        <p className="text-xs text-ink-faint">{partner.slug}</p>
                      </td>
                      <td className="py-3 text-ink-soft">
                        {CATEGORY_LABEL[partner.category]}
                      </td>
                      <td className="py-3 text-ink-soft">{partner.region || "-"}</td>
                      <td className="py-3 text-ink-soft">
                        {benefitCountByPartner[partner.id] ?? 0}개
                      </td>
                      <td className="py-3">
                        <select
                          value={partner.status}
                          onChange={(event) =>
                            handleStatus(
                              partner.id,
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
                          onClick={() => setForm(toForm(partner))}
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
              {form.id ? "업체 수정" : "업체 등록"}
            </h2>
            <p className="mt-1 text-xs text-ink-faint">
              대표 이미지는 URL 입력 방식입니다.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setForm(emptyForm())}
            className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold hover:bg-cream-100"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            신규
          </button>
        </div>

        <div className="space-y-3">
          <Field label="업체명">
            <input
              value={form.name}
              onChange={(event) => updateForm("name", event.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="slug">
            <input
              value={form.slug}
              onChange={(event) => updateForm("slug", event.target.value)}
              className={inputCls}
              placeholder="firsthair"
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
          <Field label="한 줄 소개">
            <input
              value={form.shortDescription}
              onChange={(event) =>
                updateForm("shortDescription", event.target.value)
              }
              className={inputCls}
            />
          </Field>
          <Field label="상세 소개">
            <textarea
              value={form.description}
              onChange={(event) => updateForm("description", event.target.value)}
              rows={4}
              className={inputCls}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="연락처">
              <input
                value={form.phone}
                onChange={(event) => updateForm("phone", event.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="지역">
              <input
                value={form.region}
                onChange={(event) => updateForm("region", event.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="주소">
            <input
              value={form.address}
              onChange={(event) => updateForm("address", event.target.value)}
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
          <label className="flex items-center gap-2 rounded-xl bg-cream-100 px-3 py-2 text-sm font-semibold text-ink">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(event) => updateForm("isFeatured", event.target.checked)}
              className="h-4 w-4 accent-brand-600"
            />
            추천 업체로 표시
          </label>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-primary w-full"
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
