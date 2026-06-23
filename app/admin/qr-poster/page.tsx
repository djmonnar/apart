import type { Metadata } from "next";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import { QrPosterManager } from "@/components/qr-poster-manager";

export const metadata: Metadata = { title: "QR 포스터" };

export default function AdminQrPosterPage() {
  return (
    <AdminGuard>
      <AdminShell current="QR 포스터">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-ink">입주민 공지용 QR 포스터</h2>
          <p className="mt-1 text-sm text-ink-soft">
            /welcome 안내 페이지로 연결되는 QR 코드와 게시판·엘리베이터 공지용
            포스터 이미지를 생성합니다.
          </p>
        </div>
        <QrPosterManager />
      </AdminShell>
    </AdminGuard>
  );
}
