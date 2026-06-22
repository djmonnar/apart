"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  ClipboardList,
  Loader2,
  Store,
  UserCheck,
  Users,
} from "lucide-react";
import { groupBuys } from "@/data/group-buys";
import { subscribeAdminUsers } from "@/lib/admin-users";
import { subscribeApartmentInquiries } from "@/lib/apartment-inquiries";
import { subscribeAllGroupBuyApplications } from "@/lib/group-buy-applications";
import { subscribePartnerInquiries } from "@/lib/partner-inquiries";
import { formatFirestoreDate } from "@/lib/format";
import type {
  ApartmentInquiry,
  GroupBuyApplication,
  PartnerInquiry,
  UserProfile,
} from "@/lib/types";

function toDate(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

function isToday(value: unknown) {
  const date = toDate(value);
  if (!date) return false;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function AdminDashboard() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [applications, setApplications] = useState<GroupBuyApplication[]>([]);
  const [partnerInquiries, setPartnerInquiries] = useState<PartnerInquiry[]>([]);
  const [apartmentInquiries, setApartmentInquiries] = useState<ApartmentInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribers: Array<() => void> = [];
    const loaded = {
      users: false,
      applications: false,
      partnerInquiries: false,
      apartmentInquiries: false,
    };
    const markLoaded = (key: keyof typeof loaded) => {
      loaded[key] = true;
      if (Object.values(loaded).every(Boolean)) setLoading(false);
    };

    try {
      unsubscribers.push(
        subscribeAdminUsers(
          (next) => {
            setUsers(next);
            markLoaded("users");
          },
          () => {
            setError("입주민 데이터를 불러오지 못했습니다.");
            markLoaded("users");
          },
        ),
      );
      unsubscribers.push(
        subscribeAllGroupBuyApplications(
          (next) => {
            setApplications(next);
            markLoaded("applications");
          },
          () => {
            setError("공동구매 신청 데이터를 불러오지 못했습니다.");
            markLoaded("applications");
          },
        ),
      );
      unsubscribers.push(
        subscribePartnerInquiries(
          (next) => {
            setPartnerInquiries(next);
            markLoaded("partnerInquiries");
          },
          () => {
            setError("제휴업체 문의 데이터를 불러오지 못했습니다.");
            markLoaded("partnerInquiries");
          },
        ),
      );
      unsubscribers.push(
        subscribeApartmentInquiries(
          (next) => {
            setApartmentInquiries(next);
            markLoaded("apartmentInquiries");
          },
          () => {
            setError("아파트 도입 문의 데이터를 불러오지 못했습니다.");
            markLoaded("apartmentInquiries");
          },
        ),
      );
    } catch {
      setError("Firebase 환경변수가 설정되지 않았습니다.");
      setLoading(false);
    }

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  const summary = useMemo(() => {
    const pendingUsers = users.filter((item) => item.approvalStatus === "pending");
    const approvedUsers = users.filter(
      (item) => item.approvalStatus === "approved",
    );
    const todayApplications = applications.filter((item) =>
      isToday(item.createdAt),
    );
    const openPartnerInquiries = partnerInquiries.filter(
      (item) => item.status !== "done",
    );
    const openApartmentInquiries = apartmentInquiries.filter(
      (item) => item.status !== "done",
    );
    const activeGroupBuys = groupBuys.filter((item) =>
      ["survey", "recruiting", "achieved"].includes(item.status),
    );

    return {
      pendingUsers,
      approvedUsers,
      todayApplications,
      openPartnerInquiries,
      openApartmentInquiries,
      activeGroupBuys,
    };
  }, [apartmentInquiries, applications, partnerInquiries, users]);

  const cards = [
    {
      icon: UserCheck,
      label: "승인 대기 입주민",
      value: summary.pendingUsers.length,
      href: "/admin/users",
      sub: "가입 승인 요청",
    },
    {
      icon: ClipboardList,
      label: "오늘 신규 공동구매 신청",
      value: summary.todayApplications.length,
      href: "/admin/group-buy",
      sub: "오늘 접수",
    },
    {
      icon: Store,
      label: "미처리 제휴업체 문의",
      value: summary.openPartnerInquiries.length,
      href: "/admin/partner-inquiries",
      sub: "신규/확인중",
    },
    {
      icon: Building2,
      label: "미처리 아파트 도입 문의",
      value: summary.openApartmentInquiries.length,
      href: "/admin/apartment-inquiries",
      sub: "신규/확인중",
    },
    {
      icon: Users,
      label: "전체 승인 입주민",
      value: summary.approvedUsers.length,
      href: "/admin/users",
      sub: "approved 기준",
    },
    {
      icon: ClipboardList,
      label: "진행 중 공동구매",
      value: summary.activeGroupBuys.length,
      href: "/admin/group-buy",
      sub: "수요조사/모집/목표달성",
    },
  ];

  const todos = [
    ...summary.pendingUsers.slice(0, 3).map((item) => ({
      label: "입주민 승인 대기",
      title: `${item.name} / ${item.building}동 ${item.unit}호`,
      href: "/admin/users",
      date: formatFirestoreDate(item.createdAt),
    })),
    ...applications
      .filter((item) => item.status === "applied")
      .slice(0, 3)
      .map((item) => ({
        label: "공동구매 신청 확인",
        title: `${item.groupBuyTitle} / ${item.userName}`,
        href: "/admin/group-buy",
        date: formatFirestoreDate(item.createdAt),
      })),
    ...partnerInquiries
      .filter((item) => item.status === "new")
      .slice(0, 2)
      .map((item) => ({
        label: "신규 제휴업체 문의",
        title: item.businessName,
        href: "/admin/partner-inquiries",
        date: formatFirestoreDate(item.createdAt),
      })),
    ...apartmentInquiries
      .filter((item) => item.status === "new")
      .slice(0, 2)
      .map((item) => ({
        label: "신규 아파트 도입 문의",
        title: item.apartmentName,
        href: "/admin/apartment-inquiries",
        date: formatFirestoreDate(item.createdAt),
      })),
  ].slice(0, 8);

  return (
    <div>
      {error && (
        <p className="mb-4 flex items-start gap-1.5 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs leading-relaxed text-rose-600">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="card-base flex items-center gap-4 p-5 hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sand-100 text-brand-500">
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-sm text-ink-soft">{card.label}</p>
                <p className="text-2xl font-bold text-ink">
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
                  ) : (
                    card.value
                  )}
                </p>
                <p className="text-xs text-ink-faint">{card.sub}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <section className="mt-6 card-base p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-ink">오늘 할 일</h2>
            <p className="mt-1 text-xs text-ink-faint">
              바로 처리하면 좋은 운영 항목입니다.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-dashed border-line py-10 text-center text-sm text-ink-soft">
            <Loader2 className="mr-2 inline h-4 w-4 animate-spin" aria-hidden />
            운영 데이터를 불러오는 중...
          </div>
        ) : todos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line py-10 text-center text-sm text-ink-soft">
            지금 바로 처리할 신규 항목이 없습니다.
          </div>
        ) : (
          <div className="divide-y divide-line">
            {todos.map((todo, index) => (
              <Link
                key={`${todo.label}-${todo.title}-${index}`}
                href={todo.href}
                className="grid gap-2 py-3 text-sm hover:bg-cream-50 sm:grid-cols-[180px_1fr_100px] sm:items-center"
              >
                <span className="font-semibold text-brand-700">{todo.label}</span>
                <span className="font-medium text-ink">{todo.title}</span>
                <span className="text-xs text-ink-faint sm:text-right">
                  {todo.date}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
