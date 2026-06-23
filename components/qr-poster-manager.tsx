"use client";

import { useEffect, useMemo, useState } from "react";
import { toDataURL } from "qrcode";
import {
  Copy,
  Download,
  Gift,
  Loader2,
  Printer,
  QrCode,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

const DEFAULT_WELCOME_URL = "https://pradium-welfare.vercel.app/welcome";

const BENEFIT_ITEMS = [
  "입주민 전용 제휴 혜택",
  "공동구매",
  "생활서비스",
  "월 n회 사용 가능한 전용 혜택",
];

const USE_STEPS = ["QR 코드 접속", "입주민 회원가입", "관리자 승인 후 혜택 이용"];

type PosterLayout = "mobile" | "a4";

export function QrPosterManager() {
  const [welcomeUrl, setWelcomeUrl] = useState(DEFAULT_WELCOME_URL);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    toDataURL(welcomeUrl, {
      width: 720,
      margin: 1,
      color: {
        dark: "#5F472C",
        light: "#FAF6EF",
      },
    })
      .then((url) => {
        if (!active) return;
        setQrDataUrl(url);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setQrDataUrl("");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [welcomeUrl]);

  const canExport = Boolean(qrDataUrl) && !loading;
  const mobileSvg = useMemo(
    () => (qrDataUrl ? buildPosterSvg("mobile", qrDataUrl, welcomeUrl) : ""),
    [qrDataUrl, welcomeUrl],
  );
  const a4Svg = useMemo(
    () => (qrDataUrl ? buildPosterSvg("a4", qrDataUrl, welcomeUrl) : ""),
    [qrDataUrl, welcomeUrl],
  );

  const copyUrl = async () => {
    await navigator.clipboard.writeText(welcomeUrl);
    setNotice("/welcome URL을 복사했습니다.");
  };

  const download = (layout: PosterLayout) => {
    const svg = layout === "mobile" ? mobileSvg : a4Svg;
    if (!svg) return;
    const fileName =
      layout === "mobile"
        ? "pradium-welfare-qr-mobile.svg"
        : "pradium-welfare-qr-a4.svg";
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setNotice(`${layout === "mobile" ? "모바일 공유용" : "A4 포스터"} SVG 이미지를 저장했습니다.`);
  };

  return (
    <div className="space-y-6">
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            background: white !important;
          }
          aside,
          header,
          .qr-poster-controls,
          .qr-poster-mobile-preview,
          .qr-poster-not-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
          }
          .qr-poster-print-area {
            display: block !important;
          }
          .qr-poster-page {
            margin: 0 auto !important;
            box-shadow: none !important;
            max-width: 190mm !important;
            width: 190mm !important;
          }
        }
      `}</style>

      <section className="qr-poster-controls grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="card-base p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <QrCode className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h3 className="font-bold text-ink">QR 연결 URL</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                기본값은 production의 /welcome 페이지입니다. 미리보기용 URL을 바꾸면
                QR 코드와 저장 이미지도 함께 갱신됩니다.
              </p>
            </div>
          </div>

          <label className="mt-5 block">
            <span className="mb-1.5 block text-sm font-medium text-ink">
              입주민 안내 페이지 URL
            </span>
            <input
              value={welcomeUrl}
              onChange={(event) => setWelcomeUrl(event.target.value.trim())}
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
            />
          </label>

          {notice && (
            <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-700">
              {notice}
            </p>
          )}
        </div>

        <div className="card-base p-5 sm:p-6">
          <h3 className="font-bold text-ink">저장 / 출력</h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            SVG는 확대해도 선명합니다. A4는 인쇄 버튼으로 바로 출력할 수 있습니다.
          </p>
          <div className="mt-4 grid gap-2">
            <button
              type="button"
              onClick={() => download("mobile")}
              disabled={!canExport}
              className="btn-primary w-full rounded-lg py-2.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              모바일 공유용 저장
            </button>
            <button
              type="button"
              onClick={() => download("a4")}
              disabled={!canExport}
              className="btn-secondary w-full rounded-lg py-2.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download className="h-4 w-4" aria-hidden />
              A4 포스터 저장
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="btn-secondary w-full rounded-lg py-2.5"
            >
              <Printer className="h-4 w-4" aria-hidden />
              A4 인쇄하기
            </button>
            <button
              type="button"
              onClick={copyUrl}
              className="btn-ghost w-full rounded-lg py-2.5"
            >
              <Copy className="h-4 w-4" aria-hidden />
              URL 복사
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="qr-poster-mobile-preview">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-ink">모바일 공유용 미리보기</h3>
            <span className="text-xs text-ink-faint">1080 x 1350 비율</span>
          </div>
          <MobilePoster qrDataUrl={qrDataUrl} loading={loading} />
        </div>

        <div className="qr-poster-print-area">
          <div className="qr-poster-not-print mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-ink">A4 세로형 포스터 미리보기</h3>
            <span className="text-xs text-ink-faint">인쇄 시 이 영역만 출력</span>
          </div>
          <A4Poster qrDataUrl={qrDataUrl} loading={loading} />
        </div>
      </section>
    </div>
  );
}

function MobilePoster({
  qrDataUrl,
  loading,
}: {
  qrDataUrl: string;
  loading: boolean;
}) {
  return (
    <article className="mx-auto aspect-[4/5] w-full max-w-[420px] overflow-hidden rounded-[2rem] border border-line bg-cream-50 p-7 shadow-card">
      <div className="flex h-full flex-col">
        <p className="inline-flex self-start rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
          입주민 전용 안내
        </p>
        <h2 className="mt-5 text-3xl font-bold leading-tight text-brand-900">
          진주역 스카이시티프라디움
          <br />
          입주민 전용 복지몰
          <br />
          오픈 안내
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          입주민 인증 후 우리 단지만의 제휴 혜택과 공동구매를 이용하실 수
          있습니다.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          {BENEFIT_ITEMS.map((item) => (
            <div key={item} className="rounded-2xl bg-white px-3 py-2 text-xs font-bold text-brand-800">
              {item}
            </div>
          ))}
        </div>

        <div className="mt-auto flex flex-col items-center rounded-[1.75rem] bg-white p-5 text-center">
          <QrImage qrDataUrl={qrDataUrl} loading={loading} className="h-44 w-44" />
          <p className="mt-4 text-lg font-bold text-brand-800">
            QR 코드로 입주민 회원가입하기
          </p>
          <p className="mt-2 text-xs leading-relaxed text-ink-soft">
            동·호수 정보는 인증용으로만 사용되며 제휴업체에는 제공되지 않습니다.
          </p>
        </div>
      </div>
    </article>
  );
}

function A4Poster({
  qrDataUrl,
  loading,
}: {
  qrDataUrl: string;
  loading: boolean;
}) {
  return (
    <article className="qr-poster-page mx-auto aspect-[210/297] w-full max-w-[620px] overflow-hidden rounded-[1.25rem] border border-line bg-cream-50 p-8 shadow-card sm:p-10">
      <div className="flex h-full flex-col rounded-[1.5rem] border border-sand-200 bg-white p-7 sm:p-9">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="section-eyebrow">RESIDENT WELFARE MALL</p>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-brand-900 sm:text-4xl">
              진주역 스카이시티프라디움
              <br />
              입주민 전용 복지몰
              <br />
              오픈 안내
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-soft sm:text-base">
              입주민 인증 후 우리 단지만의 제휴 혜택과 공동구매를 이용하실 수
              있습니다.
            </p>
          </div>
          <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 sm:flex">
            <Sparkles className="h-6 w-6" aria-hidden />
          </span>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {[
            { icon: Gift, label: "입주민 전용 제휴 혜택" },
            { icon: Users, label: "공동구매" },
            { icon: ShieldCheck, label: "생활서비스" },
            { icon: QrCode, label: "월 n회 사용 가능한 전용 혜택" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-3 rounded-2xl bg-cream-100 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <p className="text-sm font-bold text-ink">{item.label}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-[1fr_230px] sm:items-center">
          <div>
            <h3 className="text-lg font-bold text-ink">이용 방법</h3>
            <ol className="mt-4 space-y-3">
              {USE_STEPS.map((step, index) => (
                <li key={step} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-cream-50">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold text-ink">{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-6 rounded-2xl bg-brand-50 p-4 text-xs leading-relaxed text-brand-800/80">
              동·호수 정보는 입주민 인증용으로만 사용되며, 제휴업체에는 개인정보가
              제공되지 않습니다.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-sand-200 bg-cream-50 p-4 text-center">
            <QrImage qrDataUrl={qrDataUrl} loading={loading} className="mx-auto h-52 w-52" />
            <p className="mt-3 text-sm font-bold text-brand-800">
              QR 코드로 입주민 회원가입하기
            </p>
          </div>
        </div>

        <p className="mt-auto pt-6 text-center text-xs text-ink-faint">
          진주역 스카이시티프라디움 입주민 복지몰 · 단지라운지
        </p>
      </div>
    </article>
  );
}

function QrImage({
  qrDataUrl,
  loading,
  className,
}: {
  qrDataUrl: string;
  loading: boolean;
  className: string;
}) {
  return (
    <div className={`flex items-center justify-center rounded-2xl bg-cream-50 p-2 ${className}`}>
      {loading ? (
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" aria-hidden />
      ) : qrDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={qrDataUrl} alt="/welcome 페이지 QR 코드" className="h-full w-full rounded-xl" />
      ) : (
        <QrCode className="h-12 w-12 text-brand-300" aria-hidden />
      )}
    </div>
  );
}

function buildPosterSvg(layout: PosterLayout, qrDataUrl: string, welcomeUrl: string) {
  if (layout === "mobile") {
    return svgShell(
      1080,
      1350,
      `
        <rect width="1080" height="1350" rx="72" fill="#FAF6EF"/>
        <rect x="72" y="72" width="936" height="1206" rx="56" fill="#FFFFFF" stroke="#E5D7C2" stroke-width="4"/>
        <rect x="112" y="112" width="218" height="50" rx="25" fill="#EADFD0"/>
        ${svgText("입주민 전용 안내", 140, 145, 25, "#5F472C", 700)}
        ${svgText("진주역 스카이시티프라디움", 112, 250, 54, "#33271A", 800)}
        ${svgText("입주민 전용 복지몰", 112, 322, 54, "#33271A", 800)}
        ${svgText("오픈 안내", 112, 394, 54, "#33271A", 800)}
        ${svgText("입주민 인증 후 우리 단지만의 제휴 혜택과 공동구매를", 112, 474, 28, "#6B6157", 500)}
        ${svgText("이용하실 수 있습니다.", 112, 514, 28, "#6B6157", 500)}
        ${svgPill("입주민 전용 제휴 혜택", 112, 585)}
        ${svgPill("공동구매", 552, 585)}
        ${svgPill("생활서비스", 112, 670)}
        ${svgPill("월 n회 사용 가능한 전용 혜택", 552, 670)}
        <rect x="190" y="800" width="700" height="390" rx="48" fill="#FAF6EF" stroke="#E5D7C2" stroke-width="3"/>
        <image href="${qrDataUrl}" x="365" y="845" width="350" height="350"/>
        ${svgText("QR 코드로 입주민 회원가입하기", 270, 1248, 34, "#5F472C", 800)}
        ${svgText("동·호수 정보는 입주민 인증용으로만 사용되며", 210, 1292, 23, "#9A9085", 500)}
      `,
    );
  }

  return svgShell(
    1240,
    1754,
    `
      <rect width="1240" height="1754" fill="#FAF6EF"/>
      <rect x="80" y="80" width="1080" height="1594" rx="44" fill="#FFFFFF" stroke="#E5D7C2" stroke-width="4"/>
      ${svgText("RESIDENT WELFARE MALL", 130, 185, 26, "#A6825A", 700, 2)}
      ${svgText("진주역 스카이시티프라디움", 130, 305, 66, "#33271A", 800)}
      ${svgText("입주민 전용 복지몰", 130, 392, 66, "#33271A", 800)}
      ${svgText("오픈 안내", 130, 479, 66, "#33271A", 800)}
      ${svgText("입주민 인증 후 우리 단지만의 제휴 혜택과 공동구매를 이용하실 수 있습니다.", 130, 565, 30, "#6B6157", 500)}
      ${svgBenefitBox("입주민 전용 제휴 혜택", 130, 665)}
      ${svgBenefitBox("공동구매", 650, 665)}
      ${svgBenefitBox("생활서비스", 130, 775)}
      ${svgBenefitBox("월 n회 사용 가능한 전용 혜택", 650, 775)}
      ${svgText("이용 방법", 130, 985, 38, "#3A332C", 800)}
      ${svgStep(1, "QR 코드 접속", 130, 1060)}
      ${svgStep(2, "입주민 회원가입", 130, 1140)}
      ${svgStep(3, "관리자 승인 후 혜택 이용", 130, 1220)}
      <rect x="130" y="1330" width="520" height="132" rx="32" fill="#F6F1EA"/>
      ${svgText("개인정보 안내", 166, 1382, 27, "#5F472C", 800)}
      ${svgText("동·호수 정보는 입주민 인증용으로만 사용되며,", 166, 1425, 22, "#6B6157", 500)}
      ${svgText("제휴업체에는 개인정보가 제공되지 않습니다.", 166, 1458, 22, "#6B6157", 500)}
      <rect x="770" y="960" width="300" height="390" rx="42" fill="#FAF6EF" stroke="#E5D7C2" stroke-width="4"/>
      <image href="${qrDataUrl}" x="815" y="1005" width="210" height="210"/>
      ${svgText("QR 코드로", 860, 1270, 28, "#5F472C", 800)}
      ${svgText("입주민 회원가입하기", 800, 1310, 28, "#5F472C", 800)}
      ${svgText("진주역 스카이시티프라디움 입주민 복지몰 · ${escapeXml(welcomeUrl)}", 255, 1605, 20, "#9A9085", 500)}
    `,
  );
}

function svgShell(width: number, height: number, body: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <style>
      text { font-family: Pretendard, "Noto Sans KR", Arial, sans-serif; }
    </style>
    ${body}
  </svg>`;
}

function svgText(
  text: string,
  x: number,
  y: number,
  size: number,
  fill: string,
  weight: number,
  letterSpacing = 0,
) {
  return `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" letter-spacing="${letterSpacing}">${escapeXml(text)}</text>`;
}

function svgPill(text: string, x: number, y: number) {
  return `
    <rect x="${x}" y="${y}" width="385" height="58" rx="22" fill="#F6F1EA"/>
    ${svgText(text, x + 28, y + 38, 26, "#5F472C", 800)}
  `;
}

function svgBenefitBox(text: string, x: number, y: number) {
  return `
    <rect x="${x}" y="${y}" width="460" height="78" rx="24" fill="#FAF6EF"/>
    <circle cx="${x + 44}" cy="${y + 39}" r="18" fill="#D9C39A"/>
    ${svgText(text, x + 82, y + 49, 27, "#3A332C", 800)}
  `;
}

function svgStep(index: number, text: string, x: number, y: number) {
  return `
    <circle cx="${x + 24}" cy="${y - 13}" r="24" fill="#5F472C"/>
    ${svgText(String(index), x + 16, y - 4, 24, "#FAF6EF", 800)}
    ${svgText(text, x + 72, y - 2, 30, "#3A332C", 700)}
  `;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
