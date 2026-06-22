import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { DemoStatusSwitcher } from "./demo-status-switcher";

/** 소비자(입주민) 화면 공통 셸: 헤더 + 본문 + 푸터 + 데모 컨트롤 */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <DemoStatusSwitcher />
    </div>
  );
}
