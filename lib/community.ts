import {
  collection,
  doc,
  increment,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type QuerySnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import type {
  CommunityCategory,
  CommunityComment,
  CommunityContentStatus,
  CommunityPost,
  CommunityReport,
  CommunityReportReason,
  UserProfile,
} from "./types";

const POSTS_COLLECTION = "communityPosts";
const COMMENTS_COLLECTION = "communityComments";
const REPORTS_COLLECTION = "communityReports";
const USERS_COLLECTION = "users";
const APARTMENT_ID = "pradium";

export const COMMUNITY_CATEGORIES: {
  id: CommunityCategory;
  label: string;
}[] = [
  { id: "free", label: "자유게시판" },
  { id: "group_request", label: "공동구매 제안" },
  { id: "market", label: "나눔/중고" },
  { id: "local_info", label: "생활정보/추천" },
];

export const COMMUNITY_CATEGORY_LABEL: Record<CommunityCategory, string> = {
  free: "자유게시판",
  group_request: "공동구매 제안",
  market: "나눔/중고",
  local_info: "생활정보/추천",
};

export const COMMUNITY_STATUS_LABEL: Record<CommunityContentStatus, string> = {
  published: "게시중",
  hidden: "숨김",
  deleted: "삭제",
};

export const COMMUNITY_REPORT_REASONS: {
  id: CommunityReportReason;
  label: string;
}[] = [
  { id: "spam", label: "광고/스팸" },
  { id: "abuse", label: "욕설/비방" },
  { id: "privacy", label: "개인정보 노출" },
  { id: "commercial", label: "부적절한 거래" },
  { id: "etc", label: "기타" },
];

export const COMMUNITY_REPORT_REASON_LABEL: Record<CommunityReportReason, string> = {
  spam: "광고/스팸",
  abuse: "욕설/비방",
  privacy: "개인정보 노출",
  commercial: "부적절한 거래",
  etc: "기타",
};

function asCategory(value: unknown): CommunityCategory {
  if (
    value === "free" ||
    value === "group_request" ||
    value === "market" ||
    value === "local_info"
  ) {
    return value;
  }
  return "free";
}

function asStatus(value: unknown): CommunityContentStatus {
  if (value === "published" || value === "hidden" || value === "deleted") {
    return value;
  }
  return "published";
}

function asReportReason(value: unknown): CommunityReportReason {
  if (
    value === "spam" ||
    value === "abuse" ||
    value === "privacy" ||
    value === "commercial" ||
    value === "etc"
  ) {
    return value;
  }
  return "etc";
}

function toMillis(value: unknown) {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "toMillis" in value &&
    typeof (value as { toMillis: unknown }).toMillis === "function"
  ) {
    return (value as { toMillis: () => number }).toMillis();
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().getTime();
  }
  return 0;
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : 0;
}

export function generatedCommunityNickname(uid: string) {
  return `입주민${uid.slice(-4).toUpperCase()}`;
}

export function normalizeCommunityPost(
  id: string,
  data: Record<string, unknown>,
): CommunityPost {
  return {
    id: (data.id as string | undefined) ?? id,
    apartmentId: "pradium",
    category: asCategory(data.category),
    title: (data.title as string | undefined) ?? "",
    content: (data.content as string | undefined) ?? "",
    authorId: (data.authorId as string | undefined) ?? "",
    authorNickname: (data.authorNickname as string | undefined) ?? "입주민",
    status: asStatus(data.status),
    isNotice: data.isNotice === true,
    isPinned: data.isPinned === true,
    commentCount: numberValue(data.commentCount),
    likeCount: numberValue(data.likeCount),
    reportCount: numberValue(data.reportCount),
    viewCount: numberValue(data.viewCount),
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}

export function normalizeCommunityComment(
  id: string,
  data: Record<string, unknown>,
): CommunityComment {
  return {
    id: (data.id as string | undefined) ?? id,
    postId: (data.postId as string | undefined) ?? "",
    apartmentId: "pradium",
    content: (data.content as string | undefined) ?? "",
    authorId: (data.authorId as string | undefined) ?? "",
    authorNickname: (data.authorNickname as string | undefined) ?? "입주민",
    status: asStatus(data.status),
    reportCount: numberValue(data.reportCount),
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}

export function normalizeCommunityReport(
  id: string,
  data: Record<string, unknown>,
): CommunityReport {
  const targetType = data.targetType === "comment" ? "comment" : "post";
  return {
    id: (data.id as string | undefined) ?? id,
    targetType,
    targetId: (data.targetId as string | undefined) ?? "",
    postId: (data.postId as string | undefined) ?? "",
    reporterId: (data.reporterId as string | undefined) ?? "",
    reason: asReportReason(data.reason),
    message: (data.message as string | undefined) ?? "",
    createdAt: data.createdAt ?? null,
  };
}

function sortPosts(items: CommunityPost[]) {
  return [...items].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    if (a.isNotice !== b.isNotice) return a.isNotice ? -1 : 1;
    return toMillis(b.createdAt) - toMillis(a.createdAt);
  });
}

function sortByCreatedAtAsc<T extends { createdAt: unknown }>(items: T[]) {
  return [...items].sort((a, b) => toMillis(a.createdAt) - toMillis(b.createdAt));
}

function sortByCreatedAtDesc<T extends { createdAt: unknown }>(items: T[]) {
  return [...items].sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
}

function normalizePostsSnapshot(snap: QuerySnapshot<DocumentData>) {
  return sortPosts(
    snap.docs
      .map((item) => normalizeCommunityPost(item.id, item.data()))
      .filter((item) => item.apartmentId === APARTMENT_ID),
  );
}

function normalizeCommentsSnapshot(snap: QuerySnapshot<DocumentData>) {
  return sortByCreatedAtAsc(
    snap.docs
      .map((item) => normalizeCommunityComment(item.id, item.data()))
      .filter((item) => item.apartmentId === APARTMENT_ID),
  );
}

function normalizeReportsSnapshot(snap: QuerySnapshot<DocumentData>) {
  return sortByCreatedAtDesc(
    snap.docs.map((item) => normalizeCommunityReport(item.id, item.data())),
  );
}

export async function ensureCommunityNickname(
  userId: string,
  profile: UserProfile | null,
) {
  const current = profile?.nickname?.trim();
  if (current) return current;

  const nickname = generatedCommunityNickname(userId);
  await updateDoc(doc(getFirebaseDb(), USERS_COLLECTION, userId), { nickname });
  return nickname;
}

export function subscribeCommunityPosts(
  input: { category?: CommunityCategory | "all"; admin?: boolean },
  onChange: (items: CommunityPost[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const db = getFirebaseDb();
  const q = input.admin
    ? query(collection(db, POSTS_COLLECTION))
    : query(collection(db, POSTS_COLLECTION), where("status", "==", "published"));

  return onSnapshot(
    q,
    (snap) => {
      const items = normalizePostsSnapshot(snap).filter((item) =>
        input.category && input.category !== "all"
          ? item.category === input.category
          : true,
      );
      onChange(items);
    },
    onError,
  );
}

export function subscribeCommunityPost(
  postId: string,
  onChange: (item: CommunityPost | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(getFirebaseDb(), POSTS_COLLECTION, postId),
    (snap) => {
      onChange(
        snap.exists() ? normalizeCommunityPost(snap.id, snap.data()) : null,
      );
    },
    onError,
  );
}

export async function createCommunityPost(input: {
  category: CommunityCategory;
  title: string;
  content: string;
  authorId: string;
  authorNickname: string;
}) {
  const db = getFirebaseDb();
  const ref = doc(collection(db, POSTS_COLLECTION));
  await setDoc(ref, {
    id: ref.id,
    apartmentId: APARTMENT_ID,
    category: input.category,
    title: input.title.trim(),
    content: input.content.trim(),
    authorId: input.authorId,
    authorNickname: input.authorNickname.trim(),
    status: "published",
    isNotice: false,
    isPinned: false,
    commentCount: 0,
    likeCount: 0,
    reportCount: 0,
    viewCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCommunityPost(input: {
  postId: string;
  category: CommunityCategory;
  title: string;
  content: string;
}) {
  await updateDoc(doc(getFirebaseDb(), POSTS_COLLECTION, input.postId), {
    category: input.category,
    title: input.title.trim(),
    content: input.content.trim(),
    updatedAt: serverTimestamp(),
  });
}

export async function softDeleteCommunityPost(postId: string) {
  await updateDoc(doc(getFirebaseDb(), POSTS_COLLECTION, postId), {
    status: "deleted",
    updatedAt: serverTimestamp(),
  });
}

export async function adminUpdateCommunityPost(
  postId: string,
  data: Partial<Pick<CommunityPost, "status" | "isNotice" | "isPinned">>,
) {
  await updateDoc(doc(getFirebaseDb(), POSTS_COLLECTION, postId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeCommunityComments(
  input: { postId: string; admin?: boolean },
  onChange: (items: CommunityComment[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const db = getFirebaseDb();
  const q = input.admin
    ? query(collection(db, COMMENTS_COLLECTION), where("postId", "==", input.postId))
    : query(
        collection(db, COMMENTS_COLLECTION),
        where("postId", "==", input.postId),
        where("status", "==", "published"),
      );
  return onSnapshot(q, (snap) => onChange(normalizeCommentsSnapshot(snap)), onError);
}

export function subscribeAllCommunityComments(
  onChange: (items: CommunityComment[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    collection(getFirebaseDb(), COMMENTS_COLLECTION),
    (snap) => onChange(sortByCreatedAtDesc(normalizeCommentsSnapshot(snap))),
    onError,
  );
}

export async function createCommunityComment(input: {
  postId: string;
  content: string;
  authorId: string;
  authorNickname: string;
}) {
  const db = getFirebaseDb();
  const commentRef = doc(collection(db, COMMENTS_COLLECTION));
  const postRef = doc(db, POSTS_COLLECTION, input.postId);
  await runTransaction(db, async (transaction) => {
    transaction.set(commentRef, {
      id: commentRef.id,
      postId: input.postId,
      apartmentId: APARTMENT_ID,
      content: input.content.trim(),
      authorId: input.authorId,
      authorNickname: input.authorNickname.trim(),
      status: "published",
      reportCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    transaction.update(postRef, {
      commentCount: increment(1),
      updatedAt: serverTimestamp(),
    });
  });
}

export async function softDeleteCommunityComment(commentId: string) {
  await updateDoc(doc(getFirebaseDb(), COMMENTS_COLLECTION, commentId), {
    status: "deleted",
    updatedAt: serverTimestamp(),
  });
}

export async function adminUpdateCommunityComment(
  commentId: string,
  status: CommunityContentStatus,
) {
  await updateDoc(doc(getFirebaseDb(), COMMENTS_COLLECTION, commentId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export function communityReportId(input: {
  targetType: "post" | "comment";
  targetId: string;
  reporterId: string;
}) {
  return `${input.targetType}_${input.targetId}_${input.reporterId}`;
}

export async function reportCommunityTarget(input: {
  targetType: "post" | "comment";
  targetId: string;
  postId: string;
  reporterId: string;
  reason: CommunityReportReason;
  message: string;
}): Promise<"created" | "duplicate"> {
  const db = getFirebaseDb();
  const id = communityReportId(input);
  const reportRef = doc(db, REPORTS_COLLECTION, id);
  const targetRef = doc(
    db,
    input.targetType === "post" ? POSTS_COLLECTION : COMMENTS_COLLECTION,
    input.targetId,
  );

  return runTransaction(db, async (transaction) => {
    const existing = await transaction.get(reportRef);
    if (existing.exists()) return "duplicate";

    transaction.set(reportRef, {
      id,
      targetType: input.targetType,
      targetId: input.targetId,
      postId: input.postId,
      reporterId: input.reporterId,
      reason: input.reason,
      message: input.message.trim(),
      createdAt: serverTimestamp(),
    });
    transaction.update(targetRef, {
      reportCount: increment(1),
      updatedAt: serverTimestamp(),
    });
    return "created";
  });
}

export function subscribeCommunityReports(
  onChange: (items: CommunityReport[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    collection(getFirebaseDb(), REPORTS_COLLECTION),
    (snap) => onChange(normalizeReportsSnapshot(snap)),
    onError,
  );
}
