import Link from "next/link";
import { Megaphone, ChevronRight } from "lucide-react";
import { notices } from "@/data/notices";

export function NoticeSection() {
  return (
    <section id="notice" className="container-pad scroll-mt-24 py-4">
      <div className="rounded-3xl border border-line bg-white p-7 shadow-card sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
            <Megaphone className="h-5 w-5 text-brand-500" aria-hidden />
            공지사항
          </h2>
          <Link
            href="/#notice"
            className="flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-brand-700"
          >
            전체보기
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <ul className="mt-5 divide-y divide-line">
          {notices.map((notice) => (
            <li key={notice.id}>
              <Link
                href="/#notice"
                className="flex items-center justify-between gap-4 py-3.5 transition-colors hover:text-brand-700"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-sm font-medium text-ink">
                    {notice.title}
                  </span>
                  {notice.isNew && (
                    <span className="badge shrink-0 bg-brand-600 text-cream-50">
                      NEW
                    </span>
                  )}
                </span>
                <time className="shrink-0 text-xs text-ink-faint">
                  {notice.date.replace(/-/g, ".")}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
