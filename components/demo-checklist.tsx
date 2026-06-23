"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Loader2,
  UserCheck,
} from "lucide-react";
import { subscribeAdminUsers } from "@/lib/admin-users";
import { subscribeApartmentInquiries } from "@/lib/apartment-inquiries";
import { subscribeBenefits, subscribePartners } from "@/lib/benefit-cms";
import {
  subscribeAllBenefitRedemptions,
  subscribeAllBenefitUsagePeriods,
} from "@/lib/benefit-redemptions";
import { subscribeAllGroupBuyApplications } from "@/lib/group-buy-applications";
import { subscribePartnerInquiries } from "@/lib/partner-inquiries";
import type {
  ApartmentInquiry,
  Benefit,
  BenefitRedemption,
  BenefitUsagePeriod,
  GroupBuyApplication,
  Partner,
  PartnerInquiry,
  UserProfile,
} from "@/lib/types";

const DEMO_STEPS = [
  {
    title: "1단계. 비로그인 상태",
    desc: "/benefits에서 혜택은 보이지만 상세 조건과 사용 버튼이 잠겨 있음을 보여줍니다.",
    href: "/benefits",
    cta: "혜택 목록 열기",
  },
  {
    title: "2단계. 입주민 가입",
    desc: "/signup에서 이름, 연락처, 동·호수로 가입 신청 후 승인대기 상태를 확인합니다.",
    href: "/signup",
    cta: "가입 화면 열기",
  },
  {
    title: "3단계. 관리자 승인",
    desc: "/admin/users에서 pending 입주민을 approved로 변경합니다.",
    href: "/admin/users",
    cta: "입주민 승인 관리",
  },
  {
    title: "4단계. 승인완료 입주민 혜택 사용",
    desc: "혜택 상세에서 월 사용 가능 횟수를 확인하고 직원 확인 후 사용 완료 처리합니다.",
    href: "/benefits",
    cta: "혜택 사용 시연",
  },
  {
    title: "5단계. 관리자 사용내역 확인",
    desc: "/admin/coupons에서 사용 완료 기록과 월별 사용 횟수 차감을 확인합니다.",
    href: "/admin/coupons",
    cta: "사용내역 보기",
  },
  {
    title: "6단계. 아파트 도입 문의",
    desc: "/apartment에서 단지 도입 문의 폼과 개인정보 안내를 보여줍니다.",
    href: "/apartment",
    cta: "도입 문의 페이지",
  },
  {
    title: "7단계. 업체/혜택 관리",
    desc: "관리자가 업체와 혜택을 직접 추가, 수정, 활성화할 수 있음을 보여줍니다.",
    href: "/admin/benefits",
    cta: "혜택 관리 열기",
  },
] as const;

export function DemoChecklist() {
  const [users, setUsers] = useState<UserProfile[] | null>(null);
  const [partners, setPartners] = useState<Partner[] | null>(null);
  const [benefits, setBenefits] = useState<Benefit[] | null>(null);
  const [redemptions, setRedemptions] = useState<BenefitRedemption[] | null>(null);
  const [usagePeriods, setUsagePeriods] = useState<BenefitUsagePeriod[] | null>(null);
  const [groupBuyApplications, setGroupBuyApplications] = useState<
    GroupBuyApplication[] | null
  >(null);
  const [apartmentInquiries, setApartmentInquiries] = useState<
    ApartmentInquiry[] | null
  >(null);
  const [partnerInquiries, setPartnerInquiries] = useState<PartnerInquiry[] | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const report = (label: string) => (error: Error) => {
      setError((prev) => prev ?? `${label}: ${error.message}`);
    };

    const unsubs = [
      subscribeAdminUsers(setUsers, report("입주민")),
      subscribePartners(setPartners, report("업체")),
      subscribeBenefits(setBenefits, report("혜택")),
      subscribeAllBenefitRedemptions(setRedemptions, report("혜택 사용내역")),
      subscribeAllBenefitUsagePeriods(setUsagePeriods, report("월 사용 현황")),
      subscribeAllGroupBuyApplications(
        setGroupBuyApplications,
        report("공동구매 신청"),
      ),
      subscribeApartmentInquiries(setApartmentInquiries, report("아파트 도입 문의")),
      subscribePartnerInquiries(setPartnerInquiries, report("제휴업체 문의")),
    ];

    return () => {
      unsubs.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  const loading = [
    users,
    partners,
    benefits,
    redemptions,
    usagePeriods,
    groupBuyApplications,
    apartmentInquiries,
    partnerInquiries,
  ].some((items) => items === null);

  const checklist = useMemo(() => {
    const residentUsers = users?.filter((user) => user.role === "resident") ?? [];
    const pendingResidents = residentUsers.filter(
      (user) => user.approvalStatus === "pending",
    );
    const approvedResidents = residentUsers.filter(
      (user) => user.approvalStatus === "approved",
    );
    const activeBenefits =
      benefits?.filter((benefit) => benefit.status === "active") ?? [];
    const usedRedemptions =
      redemptions?.filter((redemption) => redemption.status === "used") ?? [];
    const usedUsagePeriods =
      usagePeriods?.filter((usage) => usage.usedCount > 0) ?? [];

    return [
      {
        id: "partners",
        label: "업체 5개 이상 등록",
        done: (partners?.length ?? 0) >= 5,
        detail: `현재 ${partners?.length ?? 0}개`,
        href: "/admin/partners",
      },
      {
        id: "benefits",
        label: "active 혜택 5개 이상 등록",
        done: activeBenefits.length >= 5,
        detail: `현재 active ${activeBenefits.length}개`,
        href: "/admin/benefits",
      },
      {
        id: "admin",
        label: "관리자 계정 로그인 가능",
        done: true,
        detail: "현재 관리자 화면 접근 중",
        href: "/admin",
      },
      {
        id: "pending-resident",
        label: "승인대기 입주민 계정 생성",
        done: pendingResidents.length >= 1,
        detail: `현재 pending ${pendingResidents.length}명`,
        href: "/admin/users",
      },
      {
        id: "approved-resident",
        label: "승인완료 입주민 계정 생성",
        done: approvedResidents.length >= 1,
        detail: `현재 approved ${approvedResidents.length}명`,
        href: "/admin/users",
      },
      {
        id: "benefit-used",
        label: "혜택 사용 1건 테스트 완료",
        done: usedRedemptions.length >= 1,
        detail: `사용 완료 ${usedRedemptions.length}건`,
        href: "/admin/coupons",
      },
      {
        id: "usage-count",
        label: "월 사용 횟수 차감 확인",
        done: usedUsagePeriods.length >= 1,
        detail: `차감 기록 ${usedUsagePeriods.length}건`,
        href: "/admin/coupons",
      },
      {
        id: "group-buy",
        label: "공동구매 신청 1건 테스트 완료",
        done: (groupBuyApplications?.length ?? 0) >= 1,
        detail: `현재 ${groupBuyApplications?.length ?? 0}건`,
        href: "/admin/group-buy",
      },
      {
        id: "apartment-inquiry",
        label: "아파트 도입 문의 1건 테스트 완료",
        done: (apartmentInquiries?.length ?? 0) >= 1,
        detail: `현재 ${apartmentInquiries?.length ?? 0}건`,
        href: "/admin/apartment-inquiries",
      },
      {
        id: "partner-inquiry",
        label: "제휴업체 문의 1건 테스트 완료",
        done: (partnerInquiries?.length ?? 0) >= 1,
        detail: `현재 ${partnerInquiries?.length ?? 0}건`,
        href: "/admin/partner-inquiries",
      },
    ];
  }, [
    apartmentInquiries,
    benefits,
    groupBuyApplications,
    partnerInquiries,
    partners,
    redemptions,
    usagePeriods,
    users,
  ]);

  const totalDone = checklist.filter((item) => item.done).length;
  const total = checklist.length;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-6">
        <div className="card-base p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">시연 준비 진행도</p>
              <p className="mt-1 text-xs text-ink-soft">
                Firestore 실데이터 기준으로 가능한 항목은 자동 판별합니다.
              </p>
            </div>
            <p className="text-2xl font-bold text-brand-700">
              {totalDone} / {total}
            </p>
          </div>
          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-sand-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all"
              style={{ width: `${total ? (totalDone / total) * 100 : 0}%` }}
            />
          </div>
        </div>

        {error && (
          <p className="flex items-start gap-1.5 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs leading-relaxed text-rose-600">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            데이터 연결 오류: {error}
          </p>
        )}

        <div>
          <h3 className="mb-2 text-sm font-bold text-ink">자동 점검 항목</h3>
          <ul className="card-base divide-y divide-line p-2">
            {checklist.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-cream-100"
                >
                  {loading ? (
                    <Loader2
                      className="h-5 w-5 shrink-0 animate-spin text-ink-faint"
                      aria-hidden
                    />
                  ) : item.done ? (
                    <CheckCircle2
                      className="h-5 w-5 shrink-0 text-emerald-500"
                      aria-hidden
                    />
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-ink-faint" aria-hidden />
                  )}
                  <span className="min-w-0 flex-1 text-sm font-medium text-ink">
                    {item.label}
                  </span>
                  <span
                    className={`shrink-0 text-xs ${
                      item.done ? "text-emerald-600" : "text-ink-faint"
                    }`}
                  >
                    {loading ? "확인 중..." : item.detail}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-base p-5 sm:p-6">
          <div className="flex items-center gap-2 text-brand-700">
            <UserCheck className="h-5 w-5" aria-hidden />
            <h3 className="font-bold">테스트 계정 준비 방법</h3>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              {
                title: "관리자 계정",
                body: "관리자 이메일로 로그인하면 운영센터 접근과 승인 처리가 가능합니다.",
                href: "/login",
                cta: "로그인",
              },
              {
                title: "승인대기 입주민",
                body: "/signup에서 테스트 이메일로 가입하면 users 문서가 pending으로 생성됩니다.",
                href: "/signup",
                cta: "가입 신청",
              },
              {
                title: "승인완료 입주민",
                body: "/admin/users에서 pending 계정을 approved로 변경하면 즉시 혜택 사용 시연이 가능합니다.",
                href: "/admin/users",
                cta: "상태 변경",
              },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="rounded-2xl border border-line bg-cream-100 p-4 transition-colors hover:border-brand-200 hover:bg-white"
              >
                <p className="font-bold text-ink">{item.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                  {item.body}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-700">
                  {item.cta}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </span>
              </Link>
            ))}
          </div>
          <p className="mt-4 rounded-xl bg-white px-4 py-3 text-xs leading-relaxed text-ink-soft">
            입주민 상태는 /admin/users에서 pending, approved, rejected, suspended로
            전환할 수 있습니다. 시연용 비밀번호는 코드에 저장하지 말고, 가입 시
            직접 정한 값으로 관리하세요.
          </p>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="card-base p-5 sm:p-6">
          <div className="flex items-center gap-2 text-brand-700">
            <ClipboardCheck className="h-5 w-5" aria-hidden />
            <h3 className="font-bold">시연 순서</h3>
          </div>
          <ol className="mt-4 space-y-3">
            {DEMO_STEPS.map((step) => (
              <li key={step.title} className="rounded-2xl bg-cream-100 p-4">
                <p className="text-sm font-bold text-ink">{step.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                  {step.desc}
                </p>
                <Link
                  href={step.href}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-700"
                >
                  {step.cta}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5">
          <p className="text-sm font-bold text-brand-800">QR 안내 페이지</p>
          <p className="mt-2 text-xs leading-relaxed text-brand-700/80">
            엘리베이터, 게시판, 단톡방 QR은 /welcome으로 연결하면 입주민에게
            가입 절차와 개인정보 안내를 바로 보여줄 수 있습니다.
          </p>
          <Link href="/welcome" className="btn-secondary mt-4 w-full rounded-lg py-2.5">
            /welcome 보기
          </Link>
        </div>
      </aside>
    </div>
  );
}
