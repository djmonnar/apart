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
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "./firebase";
import type { ApprovalStatus, MemberStatus, UserProfile, UserRole } from "./types";
import { ACCESS_COOKIE, type AccessLevel } from "./access";

/**
 * Firebase 기반 인증 컨텍스트.
 * - Firebase Auth: 이메일/비밀번호 회원가입·로그인
 * - Firestore users/{uid}: 입주민 프로필과 관리자 승인 상태
 * - danji-access 쿠키: 서버 컴포넌트에서 mock 혜택/공동구매 데이터를 권한별 정제
 */

interface AuthState {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  status: MemberStatus;
  accessLevel: AccessLevel;
  isAdmin: boolean;
}

export interface SignupInput {
  email: string;
  password: string;
  name: string;
  building: string;
  unit: string;
  phone: string;
}

interface AuthContextValue extends AuthState {
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthState>;
  signup: (input: SignupInput) => Promise<AuthState>;
  logout: () => Promise<void>;
  /** 과거 데모 컨트롤 호환용. Firebase 권한에는 영향을 주지 않는다. */
  setDemoStatus: (status: MemberStatus) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const guestState: AuthState = {
  user: null,
  profile: null,
  status: "guest",
  accessLevel: "guest",
  isAdmin: false,
};

const DEFAULT_ADMIN_EMAILS = ["djmonnar4@gmail.com"];

const ADMIN_EMAILS = [
  ...DEFAULT_ADMIN_EMAILS,
  ...(process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "").split(","),
]
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

function isConfiguredAdminEmail(email: string | null | undefined): boolean {
  return Boolean(email && ADMIN_EMAILS.includes(email.toLowerCase()));
}

function writeAccessCookie(level: AccessLevel) {
  document.cookie = `${ACCESS_COOKIE}=${level}; path=/; max-age=2592000; samesite=lax`;
}

function asApprovalStatus(value: unknown): ApprovalStatus {
  if (
    value === "approved" ||
    value === "rejected" ||
    value === "suspended" ||
    value === "pending"
  ) {
    return value;
  }
  return "pending";
}

function asRole(value: unknown): UserRole {
  if (value === "admin" || value === "partner" || value === "resident") {
    return value;
  }
  return "resident";
}

function normalizeProfile(
  uid: string,
  email: string,
  data: Record<string, unknown>,
): UserProfile {
  return {
    uid,
    email: (data.email as string | undefined) ?? email,
    name: (data.name as string | undefined) ?? email,
    nickname: (data.nickname as string | undefined) ?? "",
    phone: (data.phone as string | undefined) ?? "",
    building:
      (data.building as string | undefined) ??
      (data.dong as string | undefined) ??
      "",
    unit:
      (data.unit as string | undefined) ??
      (data.ho as string | undefined) ??
      "",
    apartmentId: "pradium",
    role: asRole(data.role),
    approvalStatus: asApprovalStatus(data.approvalStatus ?? data.status),
    createdAt: data.createdAt ?? data.appliedAt ?? null,
    approvedAt: data.approvedAt ?? null,
    approvedBy: (data.approvedBy as string | null | undefined) ?? null,
  };
}

async function resolveAuthState(fbUser: FirebaseUser): Promise<AuthState> {
  const email = fbUser.email ?? "";
  const tokenResult = await fbUser.getIdTokenResult();
  const hasAdminClaim = tokenResult.claims.admin === true;

  let profile: UserProfile | null = null;
  try {
    const db = getFirebaseDb();
    const snap = await getDoc(doc(db, "users", fbUser.uid));
    if (snap.exists()) {
      profile = normalizeProfile(fbUser.uid, email, snap.data());
    }
  } catch {
    profile = null;
  }

  const isAdmin =
    hasAdminClaim ||
    profile?.role === "admin" ||
    isConfiguredAdminEmail(fbUser.email);
  const accessLevel: AccessLevel = isAdmin
    ? "admin"
    : profile?.approvalStatus === "approved"
      ? "approved"
      : "pending";
  const status: MemberStatus = isAdmin
    ? "approved"
    : profile?.approvalStatus ?? "pending";

  return { user: fbUser, profile, status, accessLevel, isAdmin };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>(guestState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    let firebaseAuth: ReturnType<typeof getFirebaseAuth>;
    try {
      firebaseAuth = getFirebaseAuth();
    } catch {
      setState(guestState);
      writeAccessCookie("guest");
      setLoading(false);
      return () => {
        active = false;
      };
    }

    setPersistence(firebaseAuth, browserLocalPersistence).catch(() => {});

    const unsub = onAuthStateChanged(firebaseAuth, async (fbUser) => {
      if (!fbUser) {
        if (!active) return;
        setState(guestState);
        writeAccessCookie("guest");
        setLoading(false);
        router.refresh();
        return;
      }

      const next = await resolveAuthState(fbUser);
      if (!active) return;
      setState(next);
      writeAccessCookie(next.accessLevel);
      setLoading(false);
      router.refresh();
    });

    return () => {
      active = false;
      unsub();
    };
  }, [router]);

  const login = useCallback(
    async (email: string, password: string) => {
      const cred = await signInWithEmailAndPassword(
        getFirebaseAuth(),
        email.trim(),
        password,
      );
      const next = await resolveAuthState(cred.user);
      setState(next);
      writeAccessCookie(next.accessLevel);
      router.refresh();
      return next;
    },
    [router],
  );

  const signup = useCallback(
    async (input: SignupInput) => {
      const email = input.email.trim();
      const cred = await createUserWithEmailAndPassword(
        getFirebaseAuth(),
        email,
        input.password,
      );

      await setDoc(doc(getFirebaseDb(), "users", cred.user.uid), {
        uid: cred.user.uid,
        email,
        name: input.name.trim(),
        nickname: `입주민${cred.user.uid.slice(-4).toUpperCase()}`,
        phone: input.phone.trim(),
        building: input.building.trim(),
        unit: input.unit.trim(),
        apartmentId: "pradium",
        role: "resident",
        approvalStatus: "pending",
        createdAt: serverTimestamp(),
        approvedAt: null,
        approvedBy: null,
      });

      const next = await resolveAuthState(cred.user);
      setState(next);
      writeAccessCookie(next.accessLevel);
      router.refresh();
      return next;
    },
    [router],
  );

  const logout = useCallback(async () => {
    await signOut(getFirebaseAuth());
    setState(guestState);
    writeAccessCookie("guest");
    router.refresh();
  }, [router]);

  const setDemoStatus = useCallback((_status: MemberStatus) => {
    // Firebase 전환 후 데모 상태는 실제 권한 판단에 영향을 주지 않는다.
  }, []);

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
