import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";

export const metadata: Metadata = { title: "운영센터 대시보드" };

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminShell current="대시보드">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-ink">운영 요약</h2>
          <p className="mt-1 text-sm text-ink-soft">
            입주민 승인, 공동구매 신청, 제휴업체 문의, 아파트 도입 문의를 한
            화면에서 확인합니다.
          </p>
        </div>
        <AdminDashboard />
      </AdminShell>
    </AdminGuard>
  );
}
