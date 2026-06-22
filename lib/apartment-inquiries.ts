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
import type {
  ApartmentInquiry,
  ApartmentInquiryRole,
  ApartmentInquiryStatus,
} from "./types";

const COLLECTION = "apartmentInquiries";

export const APARTMENT_INQUIRY_ROLES: ApartmentInquiryRole[] = [
  "residentRepresentative",
  "managementOffice",
  "resident",
  "etc",
];

export const APARTMENT_INQUIRY_STATUSES: ApartmentInquiryStatus[] = [
  "new",
  "checking",
  "done",
];

function asRole(value: unknown): ApartmentInquiryRole {
  if (
    value === "residentRepresentative" ||
    value === "managementOffice" ||
    value === "resident" ||
    value === "etc"
  ) {
    return value;
  }
  return "etc";
}

function asStatus(value: unknown): ApartmentInquiryStatus {
  if (value === "new" || value === "checking" || value === "done") {
    return value;
  }
  return "new";
}

export function normalizeApartmentInquiry(
  id: string,
  data: Record<string, unknown>,
): ApartmentInquiry {
  return {
    id,
    apartmentName: (data.apartmentName as string | undefined) ?? "",
    region: (data.region as string | undefined) ?? "",
    householdCount: (data.householdCount as string | undefined) ?? "",
    contactName: (data.contactName as string | undefined) ?? "",
    role: asRole(data.role),
    phone: (data.phone as string | undefined) ?? "",
    message: (data.message as string | undefined) ?? "",
    internalMemo: (data.internalMemo as string | undefined) ?? "",
    status: asStatus(data.status),
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}

function normalizeSnapshot(snap: QuerySnapshot<DocumentData>) {
  return snap.docs.map((item) =>
    normalizeApartmentInquiry(item.id, item.data()),
  );
}

export async function createApartmentInquiry(input: {
  apartmentName: string;
  region: string;
  householdCount: string;
  contactName: string;
  role: ApartmentInquiryRole;
  phone: string;
  message: string;
}) {
  const ref = await addDoc(collection(getFirebaseDb(), COLLECTION), {
    apartmentName: input.apartmentName,
    region: input.region,
    householdCount: input.householdCount,
    contactName: input.contactName,
    role: input.role,
    phone: input.phone,
    message: input.message,
    internalMemo: "",
    status: "new",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export function subscribeApartmentInquiries(
  onChange: (items: ApartmentInquiry[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const q = query(
    collection(getFirebaseDb(), COLLECTION),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(q, (snap) => onChange(normalizeSnapshot(snap)), onError);
}

export async function updateApartmentInquiryStatus(
  id: string,
  status: ApartmentInquiryStatus,
) {
  await updateDoc(doc(getFirebaseDb(), COLLECTION, id), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function updateApartmentInquiry(input: {
  id: string;
  status?: ApartmentInquiryStatus;
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
