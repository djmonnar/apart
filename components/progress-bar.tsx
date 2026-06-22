import { Users } from "lucide-react";

/** 공동구매 진행률 바 */
export function ProgressBar({
  current,
  target,
  percent,
  closingSoon = false,
}: {
  current: number;
  target: number;
  percent: number;
  closingSoon?: boolean;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 font-medium text-ink-soft">
          <Users className="h-3.5 w-3.5 text-brand-400" aria-hidden />
          현재 {current}세대 / 목표 {target}세대
        </span>
        <span
          className={`font-bold ${closingSoon ? "text-rose-600" : "text-brand-700"}`}
        >
          {percent}%
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-sand-200"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            percent >= 100
              ? "bg-emerald-500"
              : closingSoon
                ? "bg-rose-500"
                : "bg-gradient-to-r from-brand-400 to-brand-600"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

/** 공동구매 상태 뱃지 */
export function StatusBadge({
  label,
  toneClass,
  closingSoon = false,
}: {
  label: string;
  toneClass: string;
  closingSoon?: boolean;
}) {
  if (closingSoon) {
    return <span className="badge bg-rose-100 text-rose-600">마감임박</span>;
  }
  return <span className={`badge ${toneClass}`}>{label}</span>;
}
