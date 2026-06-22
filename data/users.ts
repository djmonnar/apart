import type { User } from "@/lib/types";

/** 입주민 목업 — 관리자 승인/반려 데모용 */
export const users: User[] = [
  {
    id: "usr-hong",
    apartmentId: "apt-pradium",
    name: "홍길동",
    dong: "102",
    ho: "1203",
    phone: "010-1234-5678",
    status: "approved",
    appliedAt: "2026-05-01",
    approvedAt: "2026-05-02",
    lastLoginAt: "2026-06-22",
  },
  {
    id: "usr-kim",
    apartmentId: "apt-pradium",
    name: "김진수",
    dong: "101",
    ho: "1003",
    phone: "010-1234-5678",
    status: "pending",
    appliedAt: "2026-06-20",
  },
  {
    id: "usr-lee",
    apartmentId: "apt-pradium",
    name: "이서연",
    dong: "102",
    ho: "203",
    phone: "010-2345-6789",
    status: "pending",
    appliedAt: "2026-06-21",
  },
  {
    id: "usr-park",
    apartmentId: "apt-pradium",
    name: "박민준",
    dong: "103",
    ho: "1502",
    phone: "010-3456-7890",
    status: "pending",
    appliedAt: "2026-06-21",
  },
];

/** 데모 기본 로그인 사용자 (승인 완료 입주민) */
export const demoApprovedUser = users[0];
