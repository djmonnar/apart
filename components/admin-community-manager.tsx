"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Eye,
  Loader2,
  MessageSquareWarning,
  Pin,
  Search,
  ShieldAlert,
} from "lucide-react";
import { subscribeAdminUsers } from "@/lib/admin-users";
import {
  COMMUNITY_CATEGORIES,
  COMMUNITY_CATEGORY_LABEL,
  COMMUNITY_REPORT_REASON_LABEL,
  COMMUNITY_STATUS_LABEL,
  COMMUNITY_TAG_LABEL,
  adminUpdateCommunityComment,
  adminUpdateCommunityPost,
  subscribeAllCommunityComments,
  subscribeCommunityPosts,
  subscribeCommunityReports,
} from "@/lib/community";
import { formatFirestoreDateTime } from "@/lib/format";
import type {
  CommunityCategory,
  CommunityComment,
  CommunityContentStatus,
  CommunityPost,
  CommunityReport,
  UserProfile,
} from "@/lib/types";

const FILTER_ALL = "all";

const inputCls =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100";

export function AdminCommunityManager() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    CommunityCategory | typeof FILTER_ALL
  >(FILTER_ALL);
  const [statusFilter, setStatusFilter] = useState<
    CommunityContentStatus | typeof FILTER_ALL
  >(FILTER_ALL);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribers: Array<() => void> = [];
    const loaded = {
      posts: false,
      comments: false,
      reports: false,
      users: false,
    };
    const markLoaded = (key: keyof typeof loaded) => {
      loaded[key] = true;
      if (Object.values(loaded).every(Boolean)) setLoading(false);
    };

    setLoading(true);
    setError(null);

    try {
      unsubscribers.push(
        subscribeCommunityPosts(
          { admin: true },
          (next) => {
            setPosts(next);
            markLoaded("posts");
          },
          () => {
            setError("게시글 목록을 불러오지 못했습니다.");
            markLoaded("posts");
          },
        ),
      );
      unsubscribers.push(
        subscribeAllCommunityComments(
          (next) => {
            setComments(next);
            markLoaded("comments");
          },
          () => {
            setError("댓글 목록을 불러오지 못했습니다.");
            markLoaded("comments");
          },
        ),
      );
      unsubscribers.push(
        subscribeCommunityReports(
          (next) => {
            setReports(next);
            markLoaded("reports");
          },
          () => {
            setError("신고 내역을 불러오지 못했습니다.");
            markLoaded("reports");
          },
        ),
      );
      unsubscribers.push(
        subscribeAdminUsers(
          (next) => {
            setUsers(next);
            markLoaded("users");
          },
          () => {
            setError("작성자 회원 정보를 불러오지 못했습니다.");
            markLoaded("users");
          },
        ),
      );
    } catch {
      setError("Firebase 환경변수가 설정되지 않았습니다.");
      setLoading(false);
    }

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  const usersById = useMemo(() => {
    const map = new Map<string, UserProfile>();
    users.forEach((user) => map.set(user.uid, user));
    return map;
  }, [users]);

  const commentsByPostId = useMemo(() => {
    const map = new Map<string, CommunityComment[]>();
    comments.forEach((comment) => {
      const list = map.get(comment.postId) ?? [];
      list.push(comment);
      map.set(comment.postId, list);
    });
    return map;
  }, [comments]);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return posts.filter((post) => {
      if (categoryFilter !== FILTER_ALL && post.category !== categoryFilter) {
        return false;
      }
      if (statusFilter !== FILTER_ALL && post.status !== statusFilter) {
        return false;
      }
      if (!normalizedQuery) return true;

      const author = usersById.get(post.authorId);
      const haystack = [
        post.title,
        post.content,
        post.authorNickname,
        post.authorId,
        ...post.tags.map((tag) => COMMUNITY_TAG_LABEL[tag]),
        author?.name,
        author?.building,
        author?.unit,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [categoryFilter, posts, query, statusFilter, usersById]);

  const reportedPosts = useMemo(
    () => posts.filter((post) => post.reportCount > 0),
    [posts],
  );

  const postMap = useMemo(() => {
    const map = new Map<string, CommunityPost>();
    posts.forEach((post) => map.set(post.id, post));
    return map;
  }, [posts]);

  const updatePost = async (
    postId: string,
    data: Partial<Pick<CommunityPost, "status" | "isNotice" | "isPinned">>,
  ) => {
    setUpdatingId(`post-${postId}`);
    setError(null);
    try {
      await adminUpdateCommunityPost(postId, data);
    } catch {
      setError("게시글 상태를 저장하지 못했습니다.");
    } finally {
      setUpdatingId(null);
    }
  };

  const updateComment = async (
    commentId: string,
    status: CommunityContentStatus,
  ) => {
    setUpdatingId(`comment-${commentId}`);
    setError(null);
    try {
      await adminUpdateCommunityComment(commentId, status);
    } catch {
      setError("댓글 상태를 저장하지 못했습니다.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="card-base p-8 text-center text-sm text-ink-soft">
        <Loader2 className="mr-2 inline h-4 w-4 animate-spin" aria-hidden />
        커뮤니티 데이터를 불러오는 중입니다.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="전체 게시글" value={posts.length} />
        <SummaryCard
          label="게시중"
          value={posts.filter((post) => post.status === "published").length}
        />
        <SummaryCard label="신고 게시글" value={reportedPosts.length} />
        <SummaryCard label="댓글" value={comments.length} />
      </div>

      <section className="card-base p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-ink">
              <MessageSquareWarning className="h-5 w-5 text-brand-500" aria-hidden />
              게시글 관리
            </h2>
            <p className="mt-1 text-xs text-ink-faint">
              전체 {posts.length}건 · 현재 표시 {filteredPosts.length}건
            </p>
          </div>
          <div className="grid gap-2 xl:grid-cols-[220px_160px_160px]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className={`${inputCls} pl-9`}
                placeholder="제목, 닉네임, 사용자 검색"
              />
            </label>
            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value as CommunityCategory | typeof FILTER_ALL,
                )
              }
              className={inputCls}
              aria-label="카테고리 필터"
            >
              <option value={FILTER_ALL}>전체 카테고리</option>
              {COMMUNITY_CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as CommunityContentStatus | typeof FILTER_ALL,
                )
              }
              className={inputCls}
              aria-label="상태 필터"
            >
              <option value={FILTER_ALL}>전체 상태</option>
              {Object.entries(COMMUNITY_STATUS_LABEL).map(([status, label]) => (
                <option key={status} value={status}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p className="mb-4 flex items-start gap-1.5 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs leading-relaxed text-rose-600">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            {error}
          </p>
        )}

        {filteredPosts.length === 0 ? (
          <EmptyBox label="조건에 맞는 게시글이 없습니다." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-ink-faint">
                  <th className="py-2.5 font-medium">게시글</th>
                  <th className="py-2.5 font-medium">작성자</th>
                  <th className="py-2.5 font-medium">관리자용 회원 정보</th>
                  <th className="py-2.5 font-medium">상태</th>
                  <th className="py-2.5 font-medium">반응</th>
                  <th className="py-2.5 font-medium">작성일</th>
                  <th className="py-2.5 font-medium">처리</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => {
                  const author = usersById.get(post.authorId);
                  const disabled = updatingId === `post-${post.id}`;
                  return (
                    <tr key={post.id} className="border-b border-line/60 align-top">
                      <td className="max-w-[320px] py-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="badge bg-brand-50 text-brand-700">
                          {COMMUNITY_CATEGORY_LABEL[post.category]}
                          </span>
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-md bg-cream-100 px-2 py-1 text-[11px] font-semibold text-ink-faint"
                            >
                              #{COMMUNITY_TAG_LABEL[tag]}
                            </span>
                          ))}
                          {post.isPinned && (
                            <span className="badge bg-sand-100 text-brand-700">
                              <Pin className="h-3.5 w-3.5" aria-hidden />
                              고정
                            </span>
                          )}
                          {post.isNotice && (
                            <span className="badge bg-amber-50 text-amber-700">
                              공지
                            </span>
                          )}
                        </div>
                        <Link
                          href={`/community/${post.id}`}
                          className="mt-2 block font-semibold text-ink hover:text-brand-700"
                        >
                          {post.title || "제목 없음"}
                        </Link>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-faint">
                          {post.content}
                        </p>
                      </td>
                      <td className="py-3 text-ink-soft">
                        <p className="font-semibold text-ink">{post.authorNickname}</p>
                        <p className="mt-1 max-w-[160px] truncate font-mono text-xs">
                          {post.authorId}
                        </p>
                      </td>
                      <td className="py-3 text-ink-soft">
                        {author ? (
                          <>
                            <p className="font-semibold text-ink">{author.name}</p>
                            <p className="text-xs">
                              {author.building}동 {author.unit}호 · {author.phone}
                            </p>
                          </>
                        ) : (
                          <span className="text-xs">회원 정보 없음</span>
                        )}
                      </td>
                      <td className="py-3">
                        <span className={statusBadge(post.status)}>
                          {COMMUNITY_STATUS_LABEL[post.status]}
                        </span>
                      </td>
                      <td className="py-3 text-xs text-ink-soft">
                        <p>댓글 {commentsByPostId.get(post.id)?.length ?? 0}</p>
                        <p>신고 {post.reportCount}</p>
                        <p className="inline-flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" aria-hidden />
                          {post.viewCount}
                        </p>
                      </td>
                      <td className="py-3 text-ink-soft">
                        {formatFirestoreDateTime(post.createdAt)}
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <SmallAction
                            label={post.status === "hidden" ? "복구" : "숨김"}
                            disabled={disabled}
                            onClick={() =>
                              updatePost(post.id, {
                                status:
                                  post.status === "hidden" ? "published" : "hidden",
                              })
                            }
                          />
                          <SmallAction
                            label={post.status === "deleted" ? "복구" : "삭제"}
                            disabled={disabled}
                            danger={post.status !== "deleted"}
                            onClick={() =>
                              updatePost(post.id, {
                                status:
                                  post.status === "deleted" ? "published" : "deleted",
                              })
                            }
                          />
                          <SmallAction
                            label={post.isPinned ? "고정해제" : "고정"}
                            disabled={disabled}
                            onClick={() =>
                              updatePost(post.id, { isPinned: !post.isPinned })
                            }
                          />
                          <SmallAction
                            label={post.isNotice ? "공지해제" : "공지"}
                            disabled={disabled}
                            onClick={() =>
                              updatePost(post.id, { isNotice: !post.isNotice })
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="card-base p-5 sm:p-6">
          <h2 className="text-base font-bold text-ink">댓글 관리</h2>
          <p className="mt-1 text-xs text-ink-faint">
            최근 댓글 {comments.length}건을 확인하고 숨김/복구/삭제할 수 있습니다.
          </p>
          <div className="mt-4 space-y-3">
            {comments.length === 0 ? (
              <EmptyBox label="댓글이 없습니다." />
            ) : (
              comments.slice(0, 20).map((comment) => {
                const post = postMap.get(comment.postId);
                const disabled = updatingId === `comment-${comment.id}`;
                return (
                  <div key={comment.id} className="rounded-2xl bg-cream-100 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-ink">
                          {comment.authorNickname}
                        </p>
                        <p className="mt-1 text-xs text-ink-faint">
                          {post?.title ?? "게시글 없음"} ·{" "}
                          {formatFirestoreDateTime(comment.createdAt)}
                        </p>
                      </div>
                      <span className={statusBadge(comment.status)}>
                        {COMMUNITY_STATUS_LABEL[comment.status]}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
                      {comment.content}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <SmallAction
                        label={comment.status === "hidden" ? "복구" : "숨김"}
                        disabled={disabled}
                        onClick={() =>
                          updateComment(
                            comment.id,
                            comment.status === "hidden" ? "published" : "hidden",
                          )
                        }
                      />
                      <SmallAction
                        label={comment.status === "deleted" ? "복구" : "삭제"}
                        disabled={disabled}
                        danger={comment.status !== "deleted"}
                        onClick={() =>
                          updateComment(
                            comment.id,
                            comment.status === "deleted" ? "published" : "deleted",
                          )
                        }
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="card-base p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-base font-bold text-ink">
            <ShieldAlert className="h-5 w-5 text-rose-500" aria-hidden />
            신고 내역
          </h2>
          <p className="mt-1 text-xs text-ink-faint">
            신고 내역은 관리자에게만 표시됩니다.
          </p>
          <div className="mt-4 space-y-3">
            {reports.length === 0 ? (
              <EmptyBox label="신고 내역이 없습니다." />
            ) : (
              reports.slice(0, 30).map((report) => {
                const post = postMap.get(report.postId);
                return (
                  <div key={report.id} className="rounded-2xl bg-rose-50 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="badge bg-white text-rose-600">
                        {report.targetType === "post" ? "게시글" : "댓글"}
                      </span>
                      <span className="badge bg-white text-ink-soft">
                        {COMMUNITY_REPORT_REASON_LABEL[report.reason]}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-ink">
                      {post?.title ?? report.postId}
                    </p>
                    {report.message && (
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
                        {report.message}
                      </p>
                    )}
                    <p className="mt-3 text-xs text-ink-faint">
                      신고자 {report.reporterId} ·{" "}
                      {formatFirestoreDateTime(report.createdAt)}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card-base p-5">
      <p className="text-xs font-semibold text-ink-faint">{label}</p>
      <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}

function EmptyBox({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line py-10 text-center text-sm text-ink-soft">
      {label}
    </div>
  );
}

function SmallAction({
  label,
  disabled,
  danger,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${
        danger
          ? "border-rose-100 bg-rose-50 text-rose-600"
          : "border-line bg-white text-ink-soft hover:text-brand-700"
      }`}
    >
      {label}
    </button>
  );
}

function statusBadge(status: CommunityContentStatus) {
  if (status === "published") return "badge bg-emerald-50 text-emerald-700";
  if (status === "hidden") return "badge bg-amber-50 text-amber-700";
  return "badge bg-rose-50 text-rose-600";
}
