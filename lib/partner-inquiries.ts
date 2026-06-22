import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type QuerySnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import type { PartnerInquiry, PartnerInquiryStatus } from "./types";

const COLLECTION = "partnerInquiries";

export const PARTNER_INQUIRY_STATUSES: PartnerInquiryStatus[] = [
  "new",
  "checking",
  "done",
];

function asStatus(value: unknown): PartnerInquiryStatus {
  if (value === "new" || value === "checking" || value === "done") {
    return value;
  }
  return "new";
}

export function normalizePartnerInquiry(
  id: string,
  data: Record<string, unknown>,
): PartnerInquiry {
  return {
    id,
    businessName: (data.businessName as string | undefined) ?? "",
    category: (data.category as string | undefined) ?? "",
    contactName: (data.contactName as string | undefined) ?? "",
    phone: (data.phone as string | undefined) ?? "",
    region: (data.region as string | undefined) ?? "",
    message: (data.message as string | undefined) ?? "",
    internalMemo: (data.internalMemo as string | undefined) ?? "",
    status: asStatus(data.status),
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}

function normalizeSnapshot(snap: QuerySnapshot<DocumentData>) {
  return snap.docs.map((item) => normalizePartnerInquiry(item.id, item.data()));
}

export async function createPartnerInquiry(input: {
  businessName: string;
  category: string;
  contactName: string;
  phone: string;
  region: string;
  message: string;
}) {
  const ref = await addDoc(collection(getFirebaseDb(), COLLECTION), {
    businessName: input.businessName,
    category: input.category,
    contactName: input.contactName,
    phone: input.phone,
    region: input.region,
    message: input.message,
    internalMemo: "",
    status: "new",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export function subscribePartnerInquiries(
  onChange: (items: PartnerInquiry[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const q = query(
    collection(getFirebaseDb(), COLLECTION),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(q, (snap) => onChange(normalizeSnapshot(snap)), onError);
}

export async function updatePartnerInquiry(input: {
  id: string;
  status?: PartnerInquiryStatus;
  internalMemo?: string;
}) {
  await updateDoc(doc(getFirebaseDb(), COLLECTION, input.id), {
    ...(input.status ? { status: input.status } : {}),
    ...(input.internalMemo !== undefined
      ? { internalMemo: input.internalMemo }
      : {}),
    updatedAt: serverTimestamp(),
  });
}
