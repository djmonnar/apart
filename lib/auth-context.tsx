"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { MemberStatus, User } from "./types";
import { users as mockUsers } from "@/data/users";
import { ACCESS_COOKIE, getUserAccessLevel } from "./access";

/**
 * 목업 인증 컨텍스트.
 * 실제 백엔드 없이 입주민 인증 상태(guest/pending/approved)를 시뮬레이션한다.
 * 추후 실제 인증(API/Firebase)으로 교체 시 이 Provider 내부만 변경하면 된다.
 */

interface AuthState {
  user: User | null;
  status: MemberStatus;
}

interface AuthContextValue extends AuthState {
  /** 로그인 (데모: 승인된 입주민으로 로그인) */
  login: () => void;
  /** 로그아웃 */
  logout: () => void;
  /** 회원가입 신청 (데모: 승인 대기 상태가 됨) */
  signup: (input: SignupInput) => void;
  /** 데모용 상태 강제 전환 */
  setDemoStatus: (status: MemberStatus) => void;
}

export interface SignupInput {
  name: string;
  dong: string;
  ho: string;
  phone: string;
}

const STORAGE_KEY = "danji-lounge-auth";

const AuthContext = createContext<AuthContextValue | null>(null);

const guestState: AuthState = { user: null, status: "guest" };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>(guestState);

  const writeCookie = useCallback((next: AuthState) => {
    // 서버 컴포넌트가 권한을 읽어 혜택을 정제하도록 쿠키에 레벨 동기화
    const level = getUserAccessLevel(next.user);
    document.cookie = `${ACCESS_COOKIE}=${level}; path=/; max-age=2592000; samesite=lax`;
  }, []);

  // 새로고침 시 상태 복원 (+ 쿠키 동기화)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const restored: AuthState = raw ? JSON.parse(raw) : guestState;
      setState(restored);
      writeCookie(restored);
      router.refresh();
    } catch {
      /* noop */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = useCallback(
    (next: AuthState) => {
      setState(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* noop */
      }
      writeCookie(next);
      // 서버 컴포넌트(혜택 정제)를 새 권한으로 다시 렌더
      router.refresh();
    },
    [router, writeCookie],
  );

  const login = useCallback(() => {
    const approved = mockUsers.find((u) => u.status === "approved") ?? null;
    persist({ user: approved, status: approved?.status ?? "guest" });
  }, [persist]);

  const logout = useCallback(() => persist(guestState), [persist]);

  const signup = useCallback(
    (input: SignupInput) => {
      const newUser: User = {
        id: `usr-${Date.now()}`,
        apartmentId: "apt-pradium",
        name: input.name,
        dong: input.dong,
        ho: input.ho,
        phone: input.phone,
        status: "pending",
        appliedAt: new Date().toISOString().slice(0, 10),
      };
      persist({ user: newUser, status: "pending" });
    },
    [persist],
  );

  const setDemoStatus = useCallback(
    (status: MemberStatus) => {
      if (status === "guest") {
        persist(guestState);
        return;
      }
      const base =
        state.user ?? mockUsers.find((u) => u.status === "approved")!;
      persist({ user: { ...base, status }, status });
    },
    [persist, state.user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, logout, signup, setDemoStatus }),
    [state, login, logout, signup, setDemoStatus],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
