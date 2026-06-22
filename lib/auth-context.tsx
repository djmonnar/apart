"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { MemberStatus, User } from "./types";
import { users as mockUsers } from "@/data/users";

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
  const [state, setState] = useState<AuthState>(guestState);

  // 새로고침 시 상태 복원
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {
      /* noop */
    }
  }, []);

  const persist = useCallback((next: AuthState) => {
    setState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
  }, []);

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
