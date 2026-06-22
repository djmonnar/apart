import Link from "next/link";
import { ShieldCheck, BookOpen, Sparkles } from "lucide-react";
import { SafeImage } from "./safe-image";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-brand-900">
      {/* 배경: 시네마틱 단지 전경 (좌측 다크 / 우측 골든) */}
      <div className="absolute inset-0">
        <SafeImage
          src="/assets/hero-aerial.png"
          alt="진주역 스카이시티프라디움 단지 전경"
          sizes="100vw"
          priority
          className="object-[68%_center] sm:object-center"
        />
        {/* 좌측 다크 그라데이션 (데스크탑 텍스트 가독성) */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900 via-brand-900/70 to-transparent sm:via-brand-900/45" />
        {/* 하단 다크 그라데이션 (모바일 텍스트 가독성) */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900/85 via-brand-900/10 to-transparent sm:from-brand-900/50" />
      </div>

      <div className="container-pad relative">
        <div className="max-w-xl animate-fade-up py-20 sm:py-28 lg:py-36">
          <span className="badge border border-gold/30 bg-white/10 text-gold-soft backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            입주민 전용 프리미엄 혜택관
          </span>

          <h1 className="mt-5 text-3xl font-bold leading-[1.25] text-cream-50 drop-shadow-sm sm:text-4xl lg:text-[2.9rem]">
            진주역 스카이시티프라디움
            <br />
            <span className="bg-gradient-to-r from-gold-soft to-gold bg-clip-text text-transparent">
              입주민 복지몰
            </span>
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-cream-200/90 sm:text-lg">
            우리 단지 입주민만 누릴 수 있는 특별한 제휴 혜택.{" "}
            <br className="hidden sm:block" />
            이제 복지몰에서 더 쉽고 편리하게 누리세요.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="btn inline-flex justify-center bg-gold px-6 py-3.5 text-base text-brand-900 shadow-card-hover hover:bg-gold-soft active:scale-[0.98]"
            >
              <ShieldCheck className="h-5 w-5" aria-hidden />
              입주민 인증하고 시작하기
            </Link>
            <Link
              href="/#guide"
              className="btn inline-flex justify-center border border-cream-100/40 px-6 py-3.5 text-base text-cream-50 backdrop-blur-sm hover:bg-white/10"
            >
              <BookOpen className="h-5 w-5" aria-hidden />
              이용 가이드 보기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
