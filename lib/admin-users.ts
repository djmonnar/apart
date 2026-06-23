import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type QuerySnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import type { ApprovalStatus, UserProfile, UserRole } from "./types";

const COLLECTION = "users";

export const USER_APPROVAL_STATUSES: ApprovalStatus[] = [
  "pending",
  "approved",
  "rejected",
  "suspended",
];

function asRole(value: unknown): UserRole {
  if (value === "admin" || value === "partner" || value === "resident") {
    return value;
  }
  return "resident";
}

function asApprovalStatus(value: unknown): ApprovalStatus {
  if (
    value === "pending" ||
    value === "approved" ||
    value === "rejected" ||
    value === "suspended"
  ) {
    return value;
  }
  return "pending";
}

export function normalizeUserProfile(
  id: string,
  data: Record<string, unknown>,
): UserProfile {
  return {
    uid: (data.uid as string | undefined) ?? id,
    email: (data.email as string | undefined) ?? "",
    name: (data.name as string | undefined) ?? "-",
    nickname: (data.nickname as string | undefined) ?? "",
    phone: (data.phone as string | undefined) ?? "-",
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

function createdAtMillis(item: UserProfile) {
  const value = item.createdAt;
  if (
    typeof value === "object" &&
    value !== null &&
    "toMillis" in value &&
    typeof (value as { toMillis: unknown }).toMillis === "function"
  ) {
    return (value as { toMillis: () => number }).toMillis();
  }
  return 0;
}

function normalizeSnapshot(snap: QuerySnapshot<DocumentData>) {
  return snap.docs
    .map((item) => normalizeUserProfile(item.id, item.data()))
    .sort((a, b) => createdAtMillis(b) - createdAtMillis(a));
}

export function subscribeAdminUsers(
  onChange: (items: UserProfile[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const q = query(collection(getFirebaseDb(), COLLECTION));
  return onSnapshot(q, (snap) => onChange(normalizeSnapshot(snap)), onError);
}

export async function updateUserApprovalStatus(
  uid: string,
  status: ApprovalStatus,
  adminUid: string | null | undefined,
) {
  await updateDoc(doc(getFirebaseDb(), COLLECTION, uid), {
    approvalStatus: status,
    approvedAt: status === "approved" ? serverTimestamp() : null,
    approvedBy: status === "approved" ? adminUid ?? null : null,
  });
}
