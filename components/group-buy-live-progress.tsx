"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { subscribeGroupBuyApplicationsByGroup } from "@/lib/group-buy-applications";
import { ProgressBar } from "./progress-bar";

function progressPercent(current: number, target: number) {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

export function GroupBuyLiveProgress({
  groupBuyId,
  fallbackCurrent,
  targetCount,
  closingSoon,
  statusLabel,
  statusToneClass,
  endDate,
}: {
  groupBuyId: string;
  fallbackCurrent: number;
  targetCount: number;
  closingSoon: boolean;
  statusLabel: string;
  statusToneClass: string;
  endDate: string;
}) {
  const { accessLevel } = useAuth();
  const [liveCurrent, setLiveCurrent] = useState<number | null>(null);

  useEffect(() => {
    if (accessLevel !== "admin") {
      setLiveCurrent(null);
      return;
    }

    try {
      return subscribeGroupBuyApplicationsByGroup(
        groupBuyId,
        (items) => {
          setLiveCurrent(items.filter((item) => item.status !== "cancelled").length);
        },
        () => setLiveCurrent(null),
      );
    } catch {
      setLiveCurrent(null);
    }
  }, [accessLevel, groupBuyId]);

  const current = liveCurrent ?? fallbackCurrent;
  const percent = useMemo(
    () => progressPercent(current, targetCount),
    [current, targetCount],
  );

  return (
    <>
      <div className="mt-5">
        <ProgressBar
          current={current}
          target={targetCount}
          percent={percent}
          closingSoon={closingSoon}
        />
      </div>

      <dl className="mt-5 space-y-2.5 border-t border-line pt-4 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-ink-faint">상태</dt>
          <dd>
            <span className={`badge ${statusToneClass}`}>{statusLabel}</span>
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-ink-faint">목표 인원</dt>
          <dd className="font-medium text-ink">{targetCount}세대</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-ink-faint">현재 신청</dt>
          <dd className="font-medium text-ink">
            {current}세대
            {liveCurrent !== null && (
              <span className="ml-1 text-xs font-normal text-ink-faint">
                실시간
              </span>
            )}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-ink-faint">마감일</dt>
          <dd className="font-medium text-ink">{endDate.replace(/-/g, ".")}</dd>
        </div>
      </dl>
    </>
  );
}
