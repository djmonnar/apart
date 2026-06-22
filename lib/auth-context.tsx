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
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import type { MemberStatus, User } from "./types";
import { ACCESS_COOKIE, getUserAccessLevel } from "./access";

/**
 * Firebase 기반 인증 컨텍스트.
 * - 이메일/비밀번호 회원가입·로그인
 * - 자동 로그인(브라우저 로컬 퍼시스턴스 + onAuthStateChanged)
 * - 입주민 프로필(Firestore users/{uid})과 admin 커스텀 클레임으로 권한 산정
 * - 산정된 권한을 danji-access 쿠키로 동기화해 서버 컴포넌트의 정보 정제(SSR)를 유지
 */

interface AuthState {
  user: User | null;
  status: MemberStatus;
  isAdmin: boolean;
}

export interface SignupInput {
  email: string;
  password: string;
  name: string;
  dong: string;
  ho: string;
  phone: string;
}

interface AuthContextValue extends AuthState {
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
  logout: () => Promise<void>;
  /** 개발/시연 전용: 인증 상태를 로컬에서만 강제 전환 (Firebase 미반영) */
  setDemoStatus: (status: MemberStatus) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const guestState: AuthState = { user: null, status: "guest", isAdmin: false };

function writeAccessCookie(status: MemberStatus) {
  const level = getUserAccessLevel({ status } as User);
  document.cookie = `${ACCESS_COOKIE}=${level}; path=/; max-age=2592000; samesite=lax`;
}

/** Firebase 사용자 + Firestore 프로필 → 앱 User 모델/상태 산정 */
async function resolveUser(fbUser: FirebaseUser): Promise<AuthState> {
  const tokenResult = await fbUser.getIdTokenResult();
  const isAdmin = tokenResult.claims.admin === true;

  let profile: Record<string, unknown> | null = null;
  try {
    const snap = await getDoc(doc(db, "users", fbUser.uid));
    profile = snap.exists() ? (snap.data() as Record<string, unknown>) : null;
  } catch {
    profile = null;
  }

  const profileStatus = profile?.status as MemberStatus | undefined;
  const status: MemberStatus = isAdmin
    ? "approved"
    : profileStatus ?? "pending";

  const user: User = {
    id: fbUser.uid,
    apartmentId: (profile?.apartmentId as string) ?? "apt-pradium",
    name: (profile?.name as string) ?? (isAdmin ? "관리자" : fbUser.email ?? "입주민"),
    dong: (profile?.dong as string) ?? "",
    ho: (profile?.ho as string) ?? "",
    phone: (profile?.phone as string) ?? "",
    status,
    appliedAt: (profile?.appliedAt as string) ?? "",
    approvedAt: profile?.approvedAt as string | undefined,
    lastLoginAt: fbUser.metadata.lastSignInTime
      ? new Date(fbUser.metadata.lastSignInTime).toISOString().slice(0, 10)
      : undefined,
    email: fbUser.email ?? undefined,
  };

  return { user, status, isAdmin };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>(guestState);
  const [loading, setLoading] = useState(true);

  // 자동 로그인: 퍼시스턴스 설정 후 인증 상태 구독
  useEffect(() => {
    let active = true;
    setPersistence(auth, browserLocalPersistence).catch(() => {});
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        if (!active) return;
        setState(guestState);
        writeAccessCookie("guest");
        setLoading(false);
        router.refresh();
        return;
      }
      const next = await resolveUser(fbUser);
      if (!active) return;
      setState(next);
      writeAccessCookie(next.status);
      setLoading(false);
      router.refresh();
    });
    return () => {
      active = false;
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    // 이후 onAuthStateChanged가 상태/쿠키 동기화
  }, []);

  const signup = useCallback(async (input: SignupInput) => {
    const cred = await createUserWithEmailAndPassword(
      auth,
      input.email,
      input.password,
    );
    const today = new Date().toISOString().slice(0, 10);
    await setDoc(doc(db, "users", cred.user.uid), {
      uid: cred.user.uid,
      email: input.email,
      name: input.name,
      dong: input.dong,
      ho: input.ho,
      phone: input.phone,
      status: "pending",
      role: "resident",
      apartmentId: "apt-pradium",
      appliedAt: today,
      createdAt: today,
    });
    // 프로필 작성 후 상태 재산정
    const next = await resolveUser(cred.user);
    setState(next);
    writeAccessCookie(next.status);
    router.refresh();
  }, [router]);

  const logout = useCallback(async () => {
    await signOut(auth);
    setState(guestState);
    writeAccessCookie("guest");
    router.refresh();
  }, [router]);

  const setDemoStatus = useCallback(
    (status: MemberStatus) => {
      if (status === "guest") {
        setState(guestState);
        writeAccessCookie("guest");
        router.refresh();
        return;
      }
      const base: User =
        state.user ?? {
          id: "demo",
          apartmentId: "apt-pradium",
          name: "홍길동",
          dong: "102",
          ho: "1203",
          phone: "010-1234-5678",
          status,
          appliedAt: "2026-05-01",
        };
      setState({ user: { ...base, status }, status, isAdmin: state.isAdmin });
      writeAccessCookie(status);
      router.refresh();
    },
    [router, state.user, state.isAdmin],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, loading, login, signup, logout, setDemoStatus }),
    [state, loading, login, signup, logout, setDemoStatus],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
