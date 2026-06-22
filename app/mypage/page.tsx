"use client";

import Link from "next/link";
import { Ticket, UserRound, Home, Phone, CalendarClock } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/page-hero";
import { AuthStatusCard } from "@/components/auth-status-card";
import { useAuth } from "@/lib/auth-context";
import { getCouponsByUser } from "@/data/coupons";
import { getBenefit } from "@/data/benefits";
import { getPartner } from "@/data/partners";
import { demoApprovedUser } from "@/data/users";

const COUPON_STATUS = {
  issued: { label: "사용 가능", cls: "bg-emerald-100 text-emerald-700" },
  used: { label: "사용 완료", cls: "bg-sand-200 text-brand-500" },
  expired: { label: "기간 만료", cls: "bg-rose-100 text-rose-600" },
};

export default function MyPage() {
  const { status, user } = useAuth();

  if (status === "guest") {
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

  // 승인된 데모 사용자의 쿠폰 (실제로는 로그인 유저 기준)
  const coupons =
    status === "approved" ? getCouponsByUser(demoApprovedUser.id) : [];

  return (
    <SiteShell>
      <PageHero
        eyebrow="MY PAGE"
        title={`${user?.name ?? "입주민"}님, 환영합니다`}
        description="입주민 인증 상태와 발급받은 쿠폰을 확인하실 수 있습니다."
      />

      <section className="container-pad py-10">
        <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
          {/* 좌측: 상태 + 프로필 */}
          <div className="space-y-6">
            <AuthStatusCard />

            <div className="card-base p-6">
              <h3 className="text-base font-bold text-ink">내 정보</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <Row icon={UserRound} label="이름" value={user?.name ?? "-"} />
                <Row
                  icon={Home}
                  label="동·호수"
                  value={user ? `${user.dong}동 ${user.ho}호` : "-"}
                />
                <Row
                  icon={Phone}
                  label="연락처"
                  value={user ? maskPhone(user.phone) : "-"}
                />
                <Row
                  icon={CalendarClock}
                  label="신청일"
                  value={user?.appliedAt ?? "-"}
                />
              </dl>
            </div>
          </div>

          {/* 우측: 쿠폰 */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-ink">
              <Ticket className="h-5 w-5 text-brand-500" aria-hidden />내 쿠폰함
            </h2>

            {status !== "approved" ? (
              <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-ink-soft">
                관리자 승인 완료 후 쿠폰을 발급받을 수 있습니다.
              </div>
            ) : coupons.length > 0 ? (
              <ul className="space-y-3">
                {coupons.map((coupon) => {
                  const benefit = getBenefit(coupon.benefitId);
                  const partner = benefit
                    ? getPartner(benefit.partnerId)
                    : undefined;
                  const meta = COUPON_STATUS[coupon.status];
                  return (
                    <li
                      key={coupon.id}
                      className="card-base flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-ink">
                            {partner?.name}
                          </span>
                          <span className={`badge ${meta.cls}`}>
                            {meta.label}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-ink-soft">
                          {benefit?.title}
                        </p>
                        <p className="mt-1 font-mono text-xs text-ink-faint">
                          {coupon.code}
                        </p>
                      </div>
                      {benefit && (
                        <Link
                          href={`/benefits/${benefit.id}`}
                          className="btn-secondary shrink-0"
                        >
                          혜택 보기
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-ink-soft">
                아직 발급받은 쿠폰이 없습니다.{" "}
                <Link href="/benefits" className="font-semibold text-brand-700">
                  혜택 보러 가기
                </Link>
              </div>
            )}
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
    <div className="flex items-center justify-between">
      <dt className="flex items-center gap-2 text-ink-faint">
        <Icon className="h-4 w-4" aria-hidden />
        {label}
      </dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}

function maskPhone(phone: string) {
  return phone.replace(/(\d{3})-?(\d{3,4})-?(\d{4})/, "$1-****-$3");
}
