/** 진주역 스카이시티프라디움 워드마크 — 아치형 엠블럼 + 한글 서비스명 */
export function BrandMark({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const main = tone === "light" ? "#FAF6EF" : "#5F472C";
  const sub = tone === "light" ? "#E5D7C2" : "#9A9085";
  const gold = tone === "light" ? "#D9C39A" : "#C2A36B";

  return (
    <span className="flex items-center gap-2.5">
      <svg
        width="38"
        height="34"
        viewBox="0 0 38 34"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        {/* 아치 */}
        <path
          d="M5 22C5 14.27 11.27 8 19 8C26.73 8 33 14.27 33 22"
          stroke={gold}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M10 22C10 17.03 14.03 13 19 13C23.97 13 28 17.03 28 22"
          stroke={main}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="19" cy="5.5" r="2" fill={gold} />
        <path
          d="M7 26H31"
          stroke={sub}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span className="flex flex-col leading-tight">
        <span
          className="text-[15px] font-bold tracking-tight"
          style={{ color: main }}
        >
          진주역 스카이시티프라디움
        </span>
        <span className="text-[11px] font-medium" style={{ color: sub }}>
          입주민 전용 복지몰 · 단지라운지
        </span>
      </span>
    </span>
  );
}
