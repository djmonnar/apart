import Link from "next/link";
import { MapPin, Ticket, Check } from "lucide-react";
import type { Benefit, Partner } from "@/lib/types";
import { SafeImage } from "./safe-image";
import { CategoryBadge } from "./category-badge";

export function BenefitCard({
  partner,
  benefit,
}: {
  partner: Partner;
  benefit: Benefit;
}) {
  return (
    <article className="card-base group flex flex-col overflow-hidden hover:-translate-y-1 hover:shadow-card-hover">
      <Link
        href={`/benefits/${benefit.id}`}
        className="relative block aspect-[4/3] overflow-hidden"
        aria-label={`${partner.name} 혜택 자세히 보기`}
      >
        <SafeImage
          src={partner.image}
          alt={partner.name}
          className="transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3">
          <CategoryBadge category={partner.category} />
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-bold text-ink">{partner.name}</h3>

        <ul className="mt-2.5 space-y-1.5">
          {benefit.summary.map((line) => (
            <li
              key={line}
              className="flex items-start gap-1.5 text-sm text-ink-soft"
            >
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-brand-400"
                aria-hidden
              />
              <span>{line}</span>
            </li>
          ))}
        </ul>

        <p className="mt-3 flex items-center gap-1 text-xs text-ink-faint">
          <MapPin className="h-3.5 w-3.5" aria-hidden />
          {partner.region}
        </p>

        <Link
          href={`/benefits/${benefit.id}`}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sand-100 px-4 py-2.5 text-sm font-semibold text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-cream-50"
        >
          <Ticket className="h-4 w-4" aria-hidden />
          쿠폰 받기
        </Link>
      </div>
    </article>
  );
}
