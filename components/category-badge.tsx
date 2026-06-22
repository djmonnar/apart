import type { CategoryId } from "@/lib/types";
import { CATEGORY_LABEL } from "@/lib/constants";

export function CategoryBadge({
  category,
  className = "",
}: {
  category: CategoryId;
  className?: string;
}) {
  return (
    <span
      className={`badge bg-white/90 text-brand-700 shadow-soft backdrop-blur-sm ${className}`}
    >
      {CATEGORY_LABEL[category]}
    </span>
  );
}
