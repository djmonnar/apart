"use client";

import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  getBenefitMonthlyLimit,
  getKoreaPeriodKey,
  subscribeBenefitUsagePeriod,
} from "@/lib/benefit-redemptions";
import { useAuth } from "@/lib/auth-context";
import type { Benefit, BenefitUsagePeriod } from "@/lib/types";

export function BenefitUsageMini({ benefit }: { benefit: Benefit }) {
  const { accessLevel, user } = useAuth();
  const [usage, setUsage] = useState<BenefitUsagePeriod | null>(null);
  const monthlyLimit = getBenefitMonthlyLimit(benefit);
  const isMonthlyLimited = benefit.isMonthlyLimited !== false;
  const periodKey = getKoreaPeriodKey();

  useEffect(() => {
    if (
      !user?.uid ||
      !isMonthlyLimited ||
      (accessLevel !== "approved" && accessLevel !== "admin")
    ) {
      setUsage(null);
      return;
    }

    return subscribeBenefitUsagePeriod(
      {
        userId: user.uid,
        benefitId: benefit.id,
        periodKey,
        monthlyLimit,
      },
      setUsage,
      () => setUsage(null),
    );
  }, [
    accessLevel,
    benefit.id,
    isMonthlyLimited,
    monthlyLimit,
    periodKey,
    user?.uid,
  ]);

  if (!isMonthlyLimited) {
    return (
      <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        월 제한 없음
      </span>
    );
  }

  const usedCount = usage?.usedCount ?? 0;
  const remaining = Math.max(0, monthlyLimit - usedCount);

  return (
    <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-cream-100 px-2.5 py-1 text-xs font-semibold text-brand-700">
      <RotateCcw className="h-3.5 w-3.5" aria-hidden />
      월 {monthlyLimit}회 · 남은 {remaining}회
    </span>
  );
}
