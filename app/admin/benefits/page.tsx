import type { Metadata } from "next";
import { AdminBenefitsManager } from "@/components/admin-benefits-manager";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";

export const metadata: Metadata = { title: "혜택 관리" };

export default function AdminBenefitsPage() {
  return (
    <AdminGuard>
      <AdminShell current="혜택 관리">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-ink">혜택 관리</h2>
          <p className="text-xs text-ink-faint">
            업체별 혜택과 월 사용 가능 횟수, 노출 상태를 관리합니다.
          </p>
        </div>
        <AdminBenefitsManager />
      </AdminShell>
    </AdminGuard>
  );
}
