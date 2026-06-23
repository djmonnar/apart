import type { Metadata } from "next";
import { AdminCommunityManager } from "@/components/admin-community-manager";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";

export const metadata: Metadata = { title: "커뮤니티 관리" };

export default function AdminCommunityPage() {
  return (
    <AdminGuard>
      <AdminShell current="커뮤니티 관리">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-ink">커뮤니티 관리</h2>
          <p className="text-xs text-ink-faint">
            입주민 게시글, 댓글, 신고 내역을 확인하고 숨김/복구/삭제를 처리합니다.
          </p>
        </div>
        <AdminCommunityManager />
      </AdminShell>
    </AdminGuard>
  );
}
