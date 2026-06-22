import Link from "next/link";
import { ShieldCheck, BookOpen, Sparkles } from "lucide-react";
import { SafeImage } from "./safe-image";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* 배경: 아파트 외관 */}
      <div className="absolute inset-0">
        <SafeImage
          src="/assets/apartment-hero.png"
          alt="진주역 스카이시티프라디움 단지 전경"
          sizes="100vw"
          priority
        />
        {/* 가독성 그라데이션 (좌측 크림 → 우측 투명) */}
        <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/85 to-cream/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-cream/70 to-transparent" />
      </div>

      <div className="container-pad relative">
        <div className="max-w-xl animate-fade-up py-16 sm:py-24 lg:py-28">
          <span className="badge bg-white/70 text-brand-600 shadow-soft">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            입주민 전용 프리미엄 혜택관
          </span>

          <h1 className="mt-5 text-3xl font-bold leading-snug text-ink sm:text-4xl lg:text-[2.7rem]">
            진주역 스카이시티프라디움
            <br />
            <span className="text-brand-600">입주민 복지몰</span>
          </h1>

          <p className="mt-5 text-base leading-relaxed text-ink-soft sm:text-lg">
            우리 단지 입주민만 누릴 수 있는 특별한 제휴 혜택.
            <br className="hidden sm:block" />
            이제 복지몰에서 더 쉽고 편리하게 누리세요.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn-primary px-6 py-3.5 text-base">
              <ShieldCheck className="h-5 w-5" aria-hidden />
              입주민 인증하고 시작하기
            </Link>
            <Link href="/#guide" className="btn-secondary px-6 py-3.5 text-base">
              <BookOpen className="h-5 w-5" aria-hidden />
              이용 가이드 보기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
