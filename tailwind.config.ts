import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 따뜻한 크림/베이지/브라운 팔레트
        cream: {
          DEFAULT: "#FAF6EF",
          50: "#FDFBF7",
          100: "#FAF6EF",
          200: "#F3ECE0",
          300: "#EADFCC",
        },
        sand: {
          100: "#F1E9DC",
          200: "#E5D7C2",
          300: "#D8C5A8",
          400: "#C9AE85",
        },
        brand: {
          // 우드 브라운 (주 버튼/포인트)
          50: "#F6F1EA",
          100: "#EADFD0",
          200: "#D7C2A6",
          300: "#BFA17C",
          400: "#A6825A",
          500: "#8C6A43",
          600: "#785A38",
          700: "#5F472C",
          800: "#473522",
          900: "#33271A",
        },
        gold: {
          DEFAULT: "#C2A36B",
          soft: "#D9C39A",
        },
        ink: {
          DEFAULT: "#3A332C",
          soft: "#6B6157",
          faint: "#9A9085",
        },
        line: "#ECE3D6",
      },
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 4px 20px -8px rgba(74, 56, 34, 0.12)",
        "card-hover": "0 14px 36px -12px rgba(74, 56, 34, 0.22)",
        soft: "0 2px 12px -6px rgba(74, 56, 34, 0.10)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      maxWidth: {
        content: "1180px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
