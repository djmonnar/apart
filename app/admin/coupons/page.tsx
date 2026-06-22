import type { Metadata } from "next";
import { AdminCoupons } from "@/components/admin-coupons";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";

export const metadata: Metadata = { title: "쿠폰 사용내역" };

export default function AdminCouponsPage() {
  return (
    <AdminGuard>
      <AdminShell current="쿠폰 사용내역">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-ink">쿠폰 사용내역</h2>
          <p className="mt-1 text-sm text-ink-soft">
            입주민 쿠폰 발급, 만료, 사용 완료 처리 내역을 확인합니다.
          </p>
        </div>
        <AdminCoupons />
      </AdminShell>
    </AdminGuard>
  );
}
