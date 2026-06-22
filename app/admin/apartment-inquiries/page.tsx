import type { Metadata } from "next";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import { ApartmentInquiriesAdmin } from "@/components/apartment-inquiries-admin";

export const metadata: Metadata = { title: "아파트 도입 문의 관리" };

export default function AdminApartmentInquiriesPage() {
  return (
    <AdminGuard>
      <AdminShell current="아파트 도입 문의">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-ink">아파트 도입 문의 관리</h2>
          <p className="text-xs text-ink-faint">
            단지 도입 상담 요청을 확인하고 처리 상태와 내부 메모를 관리합니다.
          </p>
        </div>
        <ApartmentInquiriesAdmin />
      </AdminShell>
    </AdminGuard>
  );
}
