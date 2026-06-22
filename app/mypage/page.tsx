"use client";

import Link from "next/link";
import { CalendarClock, Home, Loader2, Phone, UserRound } from "lucide-react";
import { AuthStatusCard } from "@/components/auth-status-card";
import { MyCoupons } from "@/components/my-coupons";
import { MyGroupBuyApplications } from "@/components/my-group-buy-applications";
import { PageHero } from "@/components/page-hero";
import { SiteShell } from "@/components/site-shell";
import { useAuth } from "@/lib/auth-context";
import { formatFirestoreDate } from "@/lib/format";

export default function MyPage() {
  const { accessLevel, loading, status, profile, user } = useAuth();

  if (loading) {
    return (
      <SiteShell>
        <PageHero eyebrow="MY PAGE" title="마이페이지" />
        <section className="container-pad py-16">
          <div className="flex items-center justify-center text-sm text-ink-soft">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            인증 상태를 확인하는 중입니다.
          </div>
        </section>
      </SiteShell>
    );
  }

  if (accessLevel === "guest") {
    return (
      <SiteShell>
        <PageHero eyebrow="MY PAGE" title="마이페이지" />
        <section className="container-pad py-16">
          <div className="mx-auto max-w-md rounded-2xl border border-dashed border-line bg-white p-10 text-center">
            <UserRound className="mx-auto h-8 w-8 text-brand-300" aria-hidden />
            <p className="mt-3 font-semibold text-ink">로그인이 필요합니다</p>
            <p className="mt-2 text-sm text-ink-soft">
              입주민 인증 후 마이페이지를 이용하실 수 있습니다.
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <Link href="/login" className="btn-secondary">
                로그인
              </Link>
              <Link href="/signup" className="btn-primary">
                회원가입
              </Link>
            </div>
          </div>
        </section>
      </SiteShell>
    );
  }

  const statusMessage = {
    pending:
      "입주민 인증 신청이 접수되었습니다. 관리자 승인 후 혜택 이용이 가능합니다.",
    approved:
      "입주민 인증이 완료되었습니다. 모든 혜택과 공동구매를 이용하실 수 있습니다.",
    rejected:
      "입주민 인증 신청이 반려되었습니다. 입력 정보를 확인 후 다시 신청해주세요.",
    suspended:
      "입주민 인증 상태가 일시 정지되었습니다. 관리자에게 문의해주세요.",
    guest: "",
  }[status];

  return (
    <SiteShell>
      <PageHero
        eyebrow="MY PAGE"
        title={`${profile?.name ?? user?.email ?? "입주민"}님 환영합니다`}
        description="입주민 인증 상태와 이번 달 혜택 이용 현황, 공동구매 신청 내역을 확인하실 수 있습니다."
      />

      <section className="container-pad py-10">
        <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
          <div className="space-y-6">
            <AuthStatusCard />

            {statusMessage && (
              <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-5 text-sm font-medium leading-relaxed text-brand-800">
                {statusMessage}
              </div>
            )}

            <div className="card-base p-6">
              <h3 className="text-base font-bold text-ink">내 정보</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <Row icon={UserRound} label="이름" value={profile?.name ?? "-"} />
                <Row
                  icon={Home}
                  label="동·호수"
                  value={profile ? `${profile.building}동 ${profile.unit}호` : "-"}
                />
                <Row
                  icon={Phone}
                  label="연락처"
                  value={profile ? maskPhone(profile.phone) : "-"}
                />
                <Row
                  icon={CalendarClock}
                  label="신청일"
                  value={formatFirestoreDate(profile?.createdAt)}
                />
              </dl>
            </div>
          </div>

          <div>
            <MyCoupons />
            <MyGroupBuyApplications />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="flex items-center gap-2 text-ink-faint">
        <Icon className="h-4 w-4" aria-hidden />
        {label}
      </dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}

function maskPhone(phone: string) {
  return phone.replace(/(\d{3})-?(\d{3,4})-?(\d{4})/, "$1-****-$3");
}
