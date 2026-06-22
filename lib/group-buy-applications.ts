import {
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type QuerySnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import type { GroupBuyApplication, GroupBuyApplicationStatus } from "./types";

const COLLECTION = "groupBuyApplications";

export const GROUP_BUY_APPLICATION_STATUSES: GroupBuyApplicationStatus[] = [
  "applied",
  "checking",
  "confirmed",
  "cancelled",
];

export function groupBuyApplicationId(groupBuyId: string, userId: string) {
  return `${groupBuyId}_${userId}`;
}

function asStatus(value: unknown): GroupBuyApplicationStatus {
  if (
    value === "applied" ||
    value === "checking" ||
    value === "confirmed" ||
    value === "cancelled"
  ) {
    return value;
  }
  return "applied";
}

export function normalizeGroupBuyApplication(
  id: string,
  data: Record<string, unknown>,
): GroupBuyApplication {
  return {
    id: (data.id as string | undefined) ?? id,
    groupBuyId: (data.groupBuyId as string | undefined) ?? "",
    groupBuyTitle: (data.groupBuyTitle as string | undefined) ?? "",
    apartmentId: "pradium",
    userId: (data.userId as string | undefined) ?? "",
    userName:
      (data.userName as string | undefined) ??
      (data.name as string | undefined) ??
      "",
    phone: (data.phone as string | undefined) ?? "",
    building: (data.building as string | undefined) ?? "",
    unit: (data.unit as string | undefined) ?? "",
    memo: (data.memo as string | undefined) ?? "",
    status: asStatus(data.status),
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}

function sortByCreatedAtDesc(items: GroupBuyApplication[]) {
  return [...items].sort((a, b) => {
    const aValue =
      typeof a.createdAt === "object" &&
      a.createdAt !== null &&
      "toMillis" in a.createdAt &&
      typeof (a.createdAt as { toMillis: unknown }).toMillis === "function"
        ? (a.createdAt as { toMillis: () => number }).toMillis()
        : 0;
    const bValue =
      typeof b.createdAt === "object" &&
      b.createdAt !== null &&
      "toMillis" in b.createdAt &&
      typeof (b.createdAt as { toMillis: unknown }).toMillis === "function"
        ? (b.createdAt as { toMillis: () => number }).toMillis()
        : 0;
    return bValue - aValue;
  });
}

function normalizeSnapshot(snap: QuerySnapshot<DocumentData>) {
  return sortByCreatedAtDesc(
    snap.docs.map((item) => normalizeGroupBuyApplication(item.id, item.data())),
  );
}

export async function createGroupBuyApplication(input: {
  groupBuyId: string;
  groupBuyTitle: string;
  userId: string;
  userName: string;
  phone: string;
  building: string;
  unit: string;
  memo: string;
}): Promise<"created" | "duplicate"> {
  const db = getFirebaseDb();
  const id = groupBuyApplicationId(input.groupBuyId, input.userId);
  const ref = doc(db, COLLECTION, id);

  return runTransaction(db, async (transaction) => {
    const existing = await transaction.get(ref);

    if (existing.exists()) {
      return "duplicate";
    }

    transaction.set(ref, {
      id,
      groupBuyId: input.groupBuyId,
      groupBuyTitle: input.groupBuyTitle,
      apartmentId: "pradium",
      userId: input.userId,
      userName: input.userName,
      phone: input.phone,
      building: input.building,
      unit: input.unit,
      memo: input.memo,
      status: "applied",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return "created";
  });
}

export function subscribeMyGroupBuyApplications(
  userId: string,
  onChange: (items: GroupBuyApplication[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const db = getFirebaseDb();
  const q = query(collection(db, COLLECTION), where("userId", "==", userId));
  return onSnapshot(q, (snap) => onChange(normalizeSnapshot(snap)), onError);
}

export function subscribeAllGroupBuyApplications(
  onChange: (items: GroupBuyApplication[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const db = getFirebaseDb();
  return onSnapshot(collection(db, COLLECTION), (snap) => {
    onChange(normalizeSnapshot(snap));
  }, onError);
}

export function subscribeGroupBuyApplicationsByGroup(
  groupBuyId: string,
  onChange: (items: GroupBuyApplication[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const db = getFirebaseDb();
  const q = query(
    collection(db, COLLECTION),
    where("groupBuyId", "==", groupBuyId),
  );
  return onSnapshot(q, (snap) => onChange(normalizeSnapshot(snap)), onError);
}

export async function updateGroupBuyApplicationStatus(
  id: string,
  status: GroupBuyApplicationStatus,
) {
  await updateDoc(doc(getFirebaseDb(), COLLECTION, id), {
    status,
    updatedAt: serverTimestamp(),
  });
}
