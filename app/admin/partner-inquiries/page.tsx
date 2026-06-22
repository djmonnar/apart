import type { Metadata } from "next";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import { PartnerInquiriesAdmin } from "@/components/partner-inquiries-admin";

export const metadata: Metadata = { title: "제휴업체 문의 관리" };

export default function AdminPartnerInquiriesPage() {
  return (
    <AdminGuard>
      <AdminShell current="제휴업체 문의">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-ink">제휴업체 문의 관리</h2>
          <p className="text-xs text-ink-faint">
            입점 문의를 확인하고 상담 상태와 내부 메모를 관리합니다.
          </p>
        </div>
        <PartnerInquiriesAdmin />
      </AdminShell>
    </AdminGuard>
  );
}
