import type { Metadata } from "next";
import { AdminGuard } from "@/components/admin-guard";
import { AdminPartnersManager } from "@/components/admin-partners-manager";
import { AdminShell } from "@/components/admin-shell";

export const metadata: Metadata = { title: "업체 관리" };

export default function AdminPartnersPage() {
  return (
    <AdminGuard>
      <AdminShell current="업체 관리">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-ink">업체 관리</h2>
          <p className="text-xs text-ink-faint">
            복지몰에 노출할 제휴업체를 등록, 수정, 비활성화합니다.
          </p>
        </div>
        <AdminPartnersManager />
      </AdminShell>
    </AdminGuard>
  );
}
