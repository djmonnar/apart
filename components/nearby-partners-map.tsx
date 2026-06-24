"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Search,
} from "lucide-react";
import {
  subscribeBenefits,
  subscribeActivePartners,
} from "@/lib/benefit-cms";
import { CATEGORY_LABEL } from "@/lib/constants";
import type { Benefit, CategoryId, Partner } from "@/lib/types";

type NaverWindow = Window & {
  naver?: any;
};

const SCRIPT_ID = "naver-map-script";
const DEFAULT_CENTER = {
  lat: 35.1567431,
  lng: 128.103043,
  label: "경상남도 진주시 가좌동",
};

function loadNaverMap(clientId: string) {
  if (typeof window === "undefined") return Promise.reject();
  const existing = (window as NaverWindow).naver?.maps;
  if (existing) return Promise.resolve(existing);

  return new Promise<any>((resolve, reject) => {
    const current = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (current) {
      current.addEventListener("load", () =>
        resolve((window as NaverWindow).naver?.maps),
      );
      current.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
    script.onload = () => resolve((window as NaverWindow).naver?.maps);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function hasLocation(partner: Partner) {
  return (
    partner.status === "active" &&
    partner.locationEnabled === true &&
    partner.latitude != null &&
    partner.longitude != null
  );
}

function mapUrl(partner: Partner) {
  if (partner.naverMapUrl) return partner.naverMapUrl;
  const query = partner.address || partner.name;
  return `https://map.naver.com/p/search/${encodeURIComponent(query)}`;
}

export function NearbyPartnersMap() {
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loaded = { partners: false, benefits: false };
    const markLoaded = (key: keyof typeof loaded) => {
      loaded[key] = true;
      if (Object.values(loaded).every(Boolean)) setLoading(false);
    };

    try {
      const unsubPartners = subscribeActivePartners(
        (items) => {
          setPartners(items);
          markLoaded("partners");
        },
        () => {
          setError("제휴업체 위치 정보를 불러오지 못했습니다.");
          markLoaded("partners");
        },
      );
      const unsubBenefits = subscribeBenefits(
        (items) => {
          setBenefits(items);
          markLoaded("benefits");
        },
        () => markLoaded("benefits"),
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
    const counts = new Map<string, number>();
    benefits
      .filter((benefit) => benefit.status === "active")
      .forEach((benefit) =>
        counts.set(benefit.partnerId, (counts.get(benefit.partnerId) ?? 0) + 1),
      );
    return counts;
  }, [benefits]);

  const locatedPartners = useMemo(
    () => partners.filter((partner) => hasLocation(partner)),
    [partners],
  );

  const filteredPartners = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return locatedPartners.filter((partner) => {
      if (category !== "all" && partner.category !== category) return false;
      if (!needle) return true;
      return [
        partner.name,
        partner.shortDescription,
        partner.region,
        partner.address,
        CATEGORY_LABEL[partner.category],
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [category, locatedPartners, query]);

  const categories = useMemo(() => {
    return Array.from(new Set(locatedPartners.map((partner) => partner.category)));
  }, [locatedPartners]);

  useEffect(() => {
    if (!clientId || !mapEl.current) {
      setMapLoading(false);
      return;
    }

    let mounted = true;
    setMapLoading(true);
    loadNaverMap(clientId)
      .then((maps) => {
        if (!mounted || !maps || !mapEl.current) return;
        if (!mapRef.current) {
          const centerPartner = filteredPartners[0];
          const center =
            centerPartner?.latitude != null && centerPartner?.longitude != null
              ? new maps.LatLng(centerPartner.latitude, centerPartner.longitude)
              : new maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
          mapRef.current = new maps.Map(mapEl.current, {
            center,
            zoom: centerPartner ? 15 : 14,
            scaleControl: false,
            logoControl: true,
            mapDataControl: false,
          });
        }
        setMapLoading(false);
      })
      .catch(() => {
        setError("네이버 지도를 불러오지 못했습니다. Maps Web 서비스 URL 설정을 확인해주세요.");
        setMapLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [clientId, filteredPartners]);

  useEffect(() => {
    const maps = (window as NaverWindow).naver?.maps;
    if (!maps || !mapRef.current) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    if (filteredPartners.length === 0) {
      mapRef.current.setCenter(new maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng));
      mapRef.current.setZoom(14);
      return;
    }

    const bounds = new maps.LatLngBounds();
    filteredPartners.forEach((partner) => {
      const position = new maps.LatLng(partner.latitude, partner.longitude);
      bounds.extend(position);
      const marker = new maps.Marker({
        map: mapRef.current,
        position,
        title: partner.name,
      });
      maps.Event.addListener(marker, "click", () => {
        setSelectedId(partner.id);
        mapRef.current.setCenter(position);
        mapRef.current.setZoom(16);
      });
      markersRef.current.push(marker);
    });

    if (filteredPartners.length === 1) {
      mapRef.current.setCenter(
        new maps.LatLng(filteredPartners[0].latitude, filteredPartners[0].longitude),
      );
      mapRef.current.setZoom(16);
    } else {
      mapRef.current.fitBounds(bounds);
    }
  }, [filteredPartners]);

  const selectedPartner =
    filteredPartners.find((partner) => partner.id === selectedId) ??
    filteredPartners[0] ??
    null;

  return (
    <div className="relative h-full min-h-0 overflow-hidden bg-cream lg:px-8 lg:py-6">
      <div className="h-full min-h-0 lg:mx-auto lg:grid lg:max-w-content lg:grid-cols-[minmax(0,1fr)_390px] lg:items-stretch lg:gap-6">
        <section className="flex h-full min-h-0 flex-col overflow-hidden border-b border-line bg-white shadow-card lg:rounded-3xl lg:border">
          <div className="shrink-0 border-b border-line bg-cream-100/70 px-5 py-4 lg:p-5">
            <p className="section-eyebrow">NEARBY PARTNERS</p>
            <h1 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">
              내 주변 제휴업체
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft sm:text-base">
              지도에서 우리 단지 주변 제휴업체 위치와 혜택을 확인하세요.
            </p>
          </div>

          <MapCanvas
            mapEl={mapEl}
            loading={loading}
            mapLoading={mapLoading}
            clientId={clientId}
            filteredCount={filteredPartners.length}
            error={error}
            className="min-h-0 flex-1"
          />
        </section>

        <aside className="absolute inset-x-0 bottom-0 z-20 flex h-[46svh] min-h-[290px] max-h-[430px] flex-col rounded-t-[1.75rem] border-t border-line bg-cream px-5 pt-3 shadow-[0_-18px_46px_-30px_rgba(51,39,26,0.55)] lg:static lg:h-full lg:max-h-none lg:min-h-0 lg:rounded-3xl lg:border lg:bg-white lg:p-5 lg:shadow-card">
          <div className="mx-auto mb-3 h-1.5 w-12 shrink-0 rounded-full bg-sand-300 lg:hidden" />

          <div className="shrink-0 -mx-5 bg-cream px-5 pb-4 pt-1 lg:mx-0 lg:bg-white lg:px-0 lg:pb-4 lg:pt-0">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-ink">제휴업체 목록</h2>
                <p className="mt-1 text-xs text-ink-faint">
                  위치 등록 {locatedPartners.length}개 · 표시 {filteredPartners.length}개
                </p>
              </div>
              <MapPin className="h-5 w-5 text-brand-500" aria-hidden />
            </div>

            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-11 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 pl-9 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
                placeholder="업체명, 지역, 주소 검색"
              />
            </label>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
              <CategoryButton
                active={category === "all"}
                label="전체"
                onClick={() => setCategory("all")}
              />
              {categories.map((item) => (
                <CategoryButton
                  key={item}
                  active={category === item}
                  label={CATEGORY_LABEL[item]}
                  onClick={() => setCategory(item)}
                />
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+18px)] pr-1 lg:pb-0">
            {loading ? (
              <div className="rounded-3xl border border-line bg-white p-8 text-center text-sm text-ink-soft shadow-card sm:bg-cream-50">
                <Loader2 className="mr-2 inline h-4 w-4 animate-spin" aria-hidden />
                업체를 불러오는 중입니다.
              </div>
            ) : filteredPartners.length === 0 ? (
              <div className="rounded-3xl border border-line bg-white p-8 text-center shadow-card sm:bg-cream-50">
                <p className="font-bold text-ink">아직 위치 등록된 제휴업체가 없습니다.</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  지도는 기본으로 {DEFAULT_CENTER.label}을 보여줍니다. 관리자에서 업체 위치와 위치 사용 여부를 설정하면 이곳에 표시됩니다.
                </p>
              </div>
            ) : (
              filteredPartners.map((partner) => (
                <PartnerLocationCard
                  key={partner.id}
                  partner={partner}
                  active={partner.id === selectedPartner?.id}
                  benefitCount={benefitCountByPartner.get(partner.id) ?? 0}
                  onSelect={() => setSelectedId(partner.id)}
                />
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function MapCanvas({
  mapEl,
  loading,
  mapLoading,
  clientId,
  filteredCount,
  error,
  className,
}: {
  mapEl: React.RefObject<HTMLDivElement>;
  loading: boolean;
  mapLoading: boolean;
  clientId: string | undefined;
  filteredCount: number;
  error: string | null;
  className: string;
}) {
  return (
    <>
      <div className={`relative overflow-hidden bg-cream-200 ${className}`}>
        <div ref={mapEl} className="h-full w-full" />
        {(loading || mapLoading) && (
          <div className="absolute inset-0 flex items-center justify-center bg-cream-100/80 text-sm font-medium text-ink-soft">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            지도를 준비하는 중입니다.
          </div>
        )}
        {!clientId && (
          <div className="absolute inset-0 flex items-center justify-center bg-cream-100/90 p-6 text-center">
            <div className="max-w-sm">
              <AlertCircle className="mx-auto h-7 w-7 text-amber-600" />
              <p className="mt-3 text-sm font-semibold text-ink">
                네이버 지도 Client ID가 필요합니다.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` 환경변수를 설정해주세요.
              </p>
            </div>
          </div>
        )}
        {!loading && !mapLoading && filteredCount === 0 && clientId && (
          <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-line bg-white/95 p-4 shadow-card backdrop-blur sm:left-5 sm:right-auto sm:max-w-sm">
            <p className="flex items-center gap-1.5 text-sm font-bold text-ink">
              <MapPin className="h-4 w-4 text-brand-500" aria-hidden />
              {DEFAULT_CENTER.label}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">
              아직 위치 등록된 제휴업체가 없어 기본 지역을 표시하고 있습니다.
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="border-t border-line bg-rose-50 px-5 py-3 text-sm text-rose-600">
          {error}
        </p>
      )}
    </>
  );
}

function CategoryButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
        active
          ? "bg-brand-600 text-cream-50"
          : "border border-line bg-white text-ink-soft hover:border-brand-200 hover:text-brand-700"
      }`}
    >
      {label}
    </button>
  );
}

function PartnerLocationCard({
  partner,
  active,
  benefitCount,
  onSelect,
}: {
  partner: Partner;
  active: boolean;
  benefitCount: number;
  onSelect: () => void;
}) {
  return (
    <article
      className={`rounded-3xl border bg-white p-5 shadow-card transition-colors ${
        active ? "border-brand-300" : "border-line"
      }`}
    >
      <button type="button" onClick={onSelect} className="block w-full text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="badge bg-brand-50 text-brand-700">
              {CATEGORY_LABEL[partner.category]}
            </span>
            <h3 className="mt-2 line-clamp-1 text-base font-bold text-ink">
              {partner.name}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-soft">
              {partner.shortDescription}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-sand-100 px-2.5 py-1 text-xs font-bold text-brand-700">
            혜택 {benefitCount}
          </span>
        </div>
        <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-ink-faint">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          {partner.address || partner.region || "주소 미등록"}
        </p>
      </button>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link href={`/benefits?category=${partner.category}`} className="btn-secondary rounded-lg px-3 py-2 text-xs">
          혜택 보기
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
        <a
          href={mapUrl(partner)}
          target="_blank"
          rel="noreferrer"
          className="btn-primary rounded-lg px-3 py-2 text-xs"
        >
          <Navigation className="h-3.5 w-3.5" aria-hidden />
          네이버지도
        </a>
      </div>
      {partner.phone && (
        <a
          href={`tel:${partner.phone}`}
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-brand-700"
        >
          <Phone className="h-3.5 w-3.5" aria-hidden />
          {partner.phone}
        </a>
      )}
      {partner.naverMapUrl && (
        <a
          href={partner.naverMapUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 ml-3 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-brand-700"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          링크 열기
        </a>
      )}
    </article>
  );
}
