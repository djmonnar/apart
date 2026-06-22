import Link from "next/link";
import { Phone, Clock, Handshake } from "lucide-react";
import { currentApartment } from "@/data/apartments";
import { BrandMark } from "./brand-mark";

export function SiteFooter() {
  const apt = currentApartment;
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
        </div>

        <div>
          <h3 className="text-sm font-semibold text-cream-100">고객센터</h3>
          <a
            href={`tel:${apt.customerCenter}`}
            className="mt-3 flex items-center gap-2 text-lg font-bold text-cream-50"
          >
            <Phone className="h-4 w-4 text-gold" aria-hidden />
            {apt.customerCenter}
          </a>
          <p className="mt-2 flex items-start gap-2 text-sm text-cream-300/80">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
            {apt.operatingHours}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-cream-100">이용안내</h3>
          <ul className="mt-3 space-y-2.5 text-sm text-cream-300/80">
            <li>
              <Link href="/#guide" className="hover:text-cream-50">
                이용 가이드
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
          <h3 className="text-sm font-semibold text-cream-100">제휴 문의</h3>
          <p className="mt-3 text-sm text-cream-300/80">
            제휴를 원하시는 업체는
            <br />
            언제든 문의해 주세요.
          </p>
          <Link
            href="/partner"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-brand-900 transition-colors hover:bg-gold-soft"
          >
            <Handshake className="h-4 w-4" aria-hidden />
            제휴문의하기
          </Link>
        </div>
      </div>

      <div className="border-t border-brand-800/50">
        <div className="container-pad flex flex-col gap-1 py-5 text-xs text-cream-300/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {apt.name} 입주자대표회의 · {apt.address} · 사업자등록번호
            000-00-00000
          </p>
          <p>© 2026 JINJU SKY CITY PRADIUM. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
