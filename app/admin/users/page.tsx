import type { Metadata } from "next";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import { AdminUsersManager } from "@/components/admin-users-manager";

export const metadata: Metadata = { title: "입주민 승인 관리" };

export default function AdminUsersPage() {
  return (
    <AdminGuard>
      <AdminShell current="입주민 승인">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-ink">입주민 승인 관리</h2>
          <p className="mt-1 text-sm text-ink-soft">
            회원가입 신청자의 이름, 연락처, 동·호수를 확인하고 승인 상태를
            관리합니다.
          </p>
        </div>
        <AdminUsersManager />
      </AdminShell>
    </AdminGuard>
  );
}
