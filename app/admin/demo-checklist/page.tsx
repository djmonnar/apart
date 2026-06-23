import type { Metadata } from "next";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import { DemoChecklist } from "@/components/demo-checklist";

export const metadata: Metadata = { title: "시연 체크리스트" };

export default function DemoChecklistPage() {
  return (
    <AdminGuard>
      <AdminShell current="시연 체크리스트">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-ink">시연 준비 체크리스트</h2>
          <p className="mt-1 text-sm text-ink-soft">
            회장님·입주자대표회의·제휴업체 시연 전 준비 상태를 점검합니다.
          </p>
        </div>
        <DemoChecklist />
      </AdminShell>
    </AdminGuard>
  );
}
