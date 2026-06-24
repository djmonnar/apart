import Link from "next/link";
import { Mail, Clock, Handshake, MessageCircle, PenLine } from "lucide-react";
import { BrandMark } from "./brand-mark";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-brand-800/40 bg-brand-900 text-cream-200">
      <div className="container-pad grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <BrandMark tone="light" />
          <p className="mt-4 text-sm leading-relaxed text-cream-300/80">
            우리 단지 입주민만을 위한
            <br />
            프리미엄 제휴 혜택관입니다.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/community"
              className="inline-flex items-center gap-2 rounded-xl bg-cream-50 px-4 py-2.5 text-sm font-semibold text-brand-900 transition-colors hover:bg-gold-soft"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              최신글 보기
            </Link>
            <Link
              href="/community/write"
              className="inline-flex items-center gap-2 rounded-xl border border-cream-300/25 px-4 py-2.5 text-sm font-semibold text-cream-50 transition-colors hover:bg-brand-800"
            >
              <PenLine className="h-4 w-4" aria-hidden />
              글쓰기
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-cream-100">고객센터</h3>
          <p className="mt-3 flex items-center gap-2 text-base font-bold text-cream-50">
            <Mail className="h-4 w-4 text-gold" aria-hidden />
            제휴 및 입주민 문의
          </p>
          <p className="mt-2 text-sm text-cream-300/80">
            연락처: <span className="text-cream-200">준비중</span>
          </p>
          <p className="mt-2 flex items-start gap-2 text-sm text-cream-300/80">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
            운영시간: 평일 09:00 - 18:00
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-cream-100">이용안내</h3>
          <ul className="mt-3 space-y-2.5 text-sm text-cream-300/80">
            <li>
              <Link href="/welcome" className="hover:text-cream-50">
                입주민 안내
              </Link>
            </li>
            <li>
              <Link href="/#guide" className="hover:text-cream-50">
                이용 가이드
              </Link>
            </li>
            <li>
              <Link href="/community" className="hover:text-cream-50">
                입주민 커뮤니티
              </Link>
            </li>
            <li>
              <Link href="/nearby" className="hover:text-cream-50">
                내 주변 제휴업체
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="hover:text-cream-50">
                자주 묻는 질문
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-cream-50">
                이용약관
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-cream-50">
                개인정보처리방침
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-cream-100">제휴·도입 문의</h3>
          <p className="mt-3 text-sm text-cream-300/80">
            제휴 업체와 아파트 도입 문의는
            <br />
            언제든 문의해 주세요.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/partner"
              className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-brand-900 transition-colors hover:bg-gold-soft"
            >
              <Handshake className="h-4 w-4" aria-hidden />
              제휴문의하기
            </Link>
            <Link
              href="/apartment"
              className="inline-flex items-center justify-center rounded-xl border border-cream-300/25 px-4 py-2.5 text-sm font-semibold text-cream-50 transition-colors hover:bg-brand-800"
            >
              아파트 도입문의
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-brand-800/50">
        <div className="container-pad flex flex-col gap-3 py-5 text-xs text-cream-300/60 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <p>운영: 단지라운지 · 대상 단지: 진주역 스카이시티프라디움 입주민 전용</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Link href="/welcome" className="hover:text-cream-100">
                입주민 안내
              </Link>
              <span aria-hidden>·</span>
              <Link href="/partner" className="hover:text-cream-100">
                제휴문의
              </Link>
              <span aria-hidden>·</span>
              <Link href="/nearby" className="hover:text-cream-100">
                내 주변
              </Link>
              <span aria-hidden>·</span>
              <Link href="/apartment" className="hover:text-cream-100">
                아파트 도입문의
              </Link>
              <span aria-hidden>·</span>
              <Link href="/terms" className="hover:text-cream-100">
                이용약관
              </Link>
              <span aria-hidden>·</span>
              <Link href="/privacy" className="hover:text-cream-100">
                개인정보처리방침
              </Link>
            </div>
          </div>
          <p>© 2026 진주역 스카이시티프라디움 입주민 복지몰</p>
        </div>
      </div>
    </footer>
  );
}
