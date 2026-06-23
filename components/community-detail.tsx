"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Eye,
  Flag,
  Loader2,
  MessageCircle,
  Pencil,
  Pin,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  COMMUNITY_CATEGORIES,
  COMMUNITY_CATEGORY_LABEL,
  COMMUNITY_REPORT_REASONS,
  COMMUNITY_REPORT_REASON_LABEL,
  COMMUNITY_STATUS_LABEL,
  COMMUNITY_TAG_LABEL,
  COMMUNITY_TAGS_BY_CATEGORY,
  adminUpdateCommunityPost,
  createCommunityComment,
  ensureCommunityNickname,
  reportCommunityTarget,
  softDeleteCommunityComment,
  softDeleteCommunityPost,
  subscribeCommunityComments,
  subscribeCommunityPost,
  updateCommunityPost,
} from "@/lib/community";
import { formatFirestoreDateTime } from "@/lib/format";
import type {
  CommunityCategory,
  CommunityComment,
  CommunityPost,
  CommunityReportReason,
  CommunityTag,
} from "@/lib/types";

export function CommunityDetail({ postId }: { postId: string }) {
  const { accessLevel, isAdmin, profile, user, loading: authLoading } = useAuth();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editCategory, setEditCategory] = useState<CommunityCategory>("free");
  const [editTags, setEditTags] = useState<CommunityTag[]>([]);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [reportTarget, setReportTarget] = useState<
    | { type: "post"; id: string; postId: string }
    | { type: "comment"; id: string; postId: string }
    | null
  >(null);

  const canInteract = accessLevel === "approved" || accessLevel === "admin";
  const isOwner = Boolean(user && post?.authorId === user.uid);
  const canEdit = Boolean(isOwner || isAdmin);

  useEffect(() => {
    setLoading(true);
    return subscribeCommunityPost(
      postId,
      (item) => {
        setPost(item);
        setLoading(false);
        if (item) {
          setEditCategory(item.category);
          setEditTags(item.tags);
          setEditTitle(item.title);
          setEditContent(item.content);
        }
      },
      () => {
        setError("게시글을 불러오지 못했습니다.");
        setLoading(false);
      },
    );
  }, [postId]);

  useEffect(() => {
    if (!post) return;
    setCommentsLoading(true);
    return subscribeCommunityComments(
      { postId: post.id, admin: isAdmin },
      (items) => {
        setComments(items);
        setCommentsLoading(false);
      },
      () => {
        setNotice("댓글을 불러오지 못했습니다.");
        setCommentsLoading(false);
      },
    );
  }, [isAdmin, post]);

  const visiblePost = useMemo(() => {
    if (!post) return null;
    if (post.status === "published" || isAdmin || isOwner) return post;
    return null;
  }, [isAdmin, isOwner, post]);

  const submitComment = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice(null);
    if (!user || !profile || !visiblePost) {
      setNotice("로그인 후 댓글을 작성할 수 있습니다.");
      return;
    }
    if (!canInteract) {
      setNotice("관리자 승인 후 댓글을 작성할 수 있습니다.");
      return;
    }
    if (commentContent.trim().length < 2) {
      setNotice("댓글 내용을 2자 이상 입력해 주세요.");
      return;
    }

    setSubmittingComment(true);
    try {
      const nickname = await ensureCommunityNickname(user.uid, profile);
      await createCommunityComment({
        postId: visiblePost.id,
        content: commentContent,
        authorId: user.uid,
        authorNickname: nickname,
      });
      setCommentContent("");
    } catch {
      setNotice("댓글 저장 중 오류가 발생했습니다.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const submitEdit = async () => {
    if (!visiblePost || !canEdit) return;
    if (editTitle.trim().length < 2 || editContent.trim().length < 5) {
      setNotice("제목은 2자 이상, 내용은 5자 이상 입력해 주세요.");
      return;
    }
    try {
      await updateCommunityPost({
        postId: visiblePost.id,
        category: editCategory,
        tags: editTags,
        title: editTitle,
        content: editContent,
      });
      setEditing(false);
    } catch {
      setNotice("게시글 수정 중 오류가 발생했습니다.");
    }
  };

  const deletePost = async () => {
    if (!visiblePost || !canEdit) return;
    if (!window.confirm("게시글을 삭제 처리할까요?")) return;
    try {
      await softDeleteCommunityPost(visiblePost.id);
      setNotice("게시글이 삭제 처리되었습니다.");
    } catch {
      setNotice("게시글 삭제 중 오류가 발생했습니다.");
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!window.confirm("댓글을 삭제 처리할까요?")) return;
    try {
      await softDeleteCommunityComment(commentId);
    } catch {
      setNotice("댓글 삭제 중 오류가 발생했습니다.");
    }
  };

  const toggleEditTag = (tag: CommunityTag) => {
    setEditTags((current) => {
      if (current.includes(tag)) return current.filter((item) => item !== tag);
      if (current.length >= 3) return current;
      return [...current, tag];
    });
  };

  if (loading || authLoading) {
    return <div className="card-base p-8 text-center text-sm text-ink-soft">게시글을 불러오는 중입니다.</div>;
  }

  if (error) {
    return <div className="card-base p-8 text-center text-sm text-rose-600">{error}</div>;
  }

  if (!visiblePost) {
    return (
      <div className="card-base p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <ShieldAlert className="h-7 w-7" aria-hidden />
        </span>
        <h2 className="mt-4 text-lg font-bold text-ink">게시글을 볼 수 없습니다</h2>
        <p className="mt-2 text-sm text-ink-soft">
          삭제되었거나 관리자에 의해 숨김 처리된 게시글입니다.
        </p>
        <Link href="/community" className="btn-secondary mt-6">
          목록으로
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <article className="card-base p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge bg-brand-50 text-brand-700">
            {COMMUNITY_CATEGORY_LABEL[visiblePost.category]}
          </span>
          {visiblePost.isPinned && (
            <span className="badge bg-sand-100 text-brand-700">
              <Pin className="h-3.5 w-3.5" aria-hidden />
              고정
            </span>
          )}
          {visiblePost.status !== "published" && (
            <span className="badge bg-rose-50 text-rose-600">
              {COMMUNITY_STATUS_LABEL[visiblePost.status]}
            </span>
          )}
        </div>

        {editing ? (
          <div className="mt-5 space-y-4">
            <select
              value={editCategory}
              onChange={(event) => {
                setEditCategory(event.target.value as CommunityCategory);
                setEditTags([]);
              }}
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
            >
              {COMMUNITY_CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-ink">태그</span>
                <span className="text-xs text-ink-faint">최대 3개 선택</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {COMMUNITY_TAGS_BY_CATEGORY[editCategory].map((tag) => {
                  const active = editTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleEditTag(tag)}
                      className={`rounded-full px-3 py-2 text-xs font-semibold transition-colors ${
                        active
                          ? "bg-brand-600 text-cream-50"
                          : "border border-line bg-white text-ink-soft hover:text-brand-700"
                      }`}
                    >
                      #{COMMUNITY_TAG_LABEL[tag]}
                    </button>
                  );
                })}
              </div>
            </div>
            <input
              value={editTitle}
              onChange={(event) => setEditTitle(event.target.value)}
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
            />
            <textarea
              value={editContent}
              onChange={(event) => setEditContent(event.target.value)}
              rows={10}
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm leading-relaxed text-ink outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary">
                취소
              </button>
              <button type="button" onClick={submitEdit} className="btn-primary">
                저장
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="mt-4 text-2xl font-bold leading-tight text-ink">
              {visiblePost.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-faint">
              <span>{visiblePost.authorNickname}</span>
              <span>{formatFirestoreDateTime(visiblePost.createdAt)}</span>
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" aria-hidden />
                {visiblePost.viewCount}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                {comments.length}
              </span>
            </div>
            {visiblePost.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {visiblePost.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-cream-100 px-3 py-1.5 text-xs font-semibold text-ink-soft"
                  >
                    #{COMMUNITY_TAG_LABEL[tag]}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-7 whitespace-pre-wrap break-words text-sm leading-7 text-ink sm:text-base">
              {visiblePost.content}
            </div>
          </>
        )}

        {notice && (
          <p className="mt-5 flex items-start gap-1.5 rounded-xl bg-amber-50 px-3.5 py-2.5 text-xs leading-relaxed text-amber-700">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            {notice}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              setReportTarget({ type: "post", id: visiblePost.id, postId: visiblePost.id })
            }
            className="btn-secondary rounded-lg px-3 py-2 text-xs"
          >
            <Flag className="h-3.5 w-3.5" aria-hidden />
            신고
          </button>
          {canEdit && (
            <>
              <button
                type="button"
                onClick={() => setEditing((value) => !value)}
                className="btn-secondary rounded-lg px-3 py-2 text-xs"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden />
                수정
              </button>
              <button
                type="button"
                onClick={deletePost}
                className="btn-secondary rounded-lg px-3 py-2 text-xs text-rose-600"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                삭제
              </button>
            </>
          )}
          {isAdmin && (
            <>
              <AdminPostButton
                label={visiblePost.status === "hidden" ? "복구" : "숨김"}
                onClick={() =>
                  adminUpdateCommunityPost(visiblePost.id, {
                    status:
                      visiblePost.status === "hidden" ? "published" : "hidden",
                  })
                }
              />
              <AdminPostButton
                label={visiblePost.isPinned ? "고정 해제" : "고정"}
                onClick={() =>
                  adminUpdateCommunityPost(visiblePost.id, {
                    isPinned: !visiblePost.isPinned,
                  })
                }
              />
              <AdminPostButton
                label={visiblePost.isNotice ? "공지 해제" : "공지"}
                onClick={() =>
                  adminUpdateCommunityPost(visiblePost.id, {
                    isNotice: !visiblePost.isNotice,
                  })
                }
              />
            </>
          )}
        </div>
      </article>

      <section className="card-base p-5 sm:p-7">
        <h2 className="text-lg font-bold text-ink">댓글 {comments.length}</h2>
        <div className="mt-5 space-y-3">
          {commentsLoading ? (
            <p className="text-sm text-ink-soft">댓글을 불러오는 중입니다.</p>
          ) : comments.length === 0 ? (
            <p className="rounded-2xl bg-cream-100 p-4 text-sm text-ink-soft">
              아직 댓글이 없습니다.
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="rounded-2xl bg-cream-100 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-ink-faint">
                    <span className="font-bold text-ink">{comment.authorNickname}</span>
                    <span>{formatFirestoreDateTime(comment.createdAt)}</span>
                    {comment.status !== "published" && (
                      <span className="text-rose-600">
                        {COMMUNITY_STATUS_LABEL[comment.status]}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setReportTarget({
                          type: "comment",
                          id: comment.id,
                          postId: visiblePost.id,
                        })
                      }
                      className="rounded-lg px-2 py-1 text-xs font-semibold text-ink-faint hover:bg-white hover:text-brand-700"
                    >
                      신고
                    </button>
                    {(isAdmin || comment.authorId === user?.uid) && (
                      <button
                        type="button"
                        onClick={() => deleteComment(comment.id)}
                        className="rounded-lg px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-white"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink">
                  {comment.content}
                </p>
              </div>
            ))
          )}
        </div>

        {canInteract ? (
          <form onSubmit={submitComment} className="mt-5">
            <textarea
              value={commentContent}
              onChange={(event) => setCommentContent(event.target.value)}
              rows={4}
              placeholder="댓글을 입력해 주세요. 개인정보는 입력하지 마세요."
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm leading-relaxed text-ink outline-none placeholder:text-ink-faint focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
            />
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={submittingComment}
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submittingComment && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                )}
                댓글 등록
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-700">
            댓글은 승인 완료 입주민만 작성할 수 있습니다.
          </div>
        )}
      </section>

      {reportTarget && user && (
        <ReportDialog
          target={reportTarget}
          reporterId={user.uid}
          onClose={() => setReportTarget(null)}
          onDone={(message) => {
            setNotice(message);
            setReportTarget(null);
          }}
        />
      )}
    </div>
  );
}

function AdminPostButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await onClick();
        } finally {
          setLoading(false);
        }
      }}
      className="btn-secondary rounded-lg px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
    >
      {label}
    </button>
  );
}

function ReportDialog({
  target,
  reporterId,
  onClose,
  onDone,
}: {
  target:
    | { type: "post"; id: string; postId: string }
    | { type: "comment"; id: string; postId: string };
  reporterId: string;
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const [reason, setReason] = useState<CommunityReportReason>("spam");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await reportCommunityTarget({
        targetType: target.type,
        targetId: target.id,
        postId: target.postId,
        reporterId,
        reason,
        message,
      });
      onDone(
        result === "duplicate"
          ? "이미 신고한 항목입니다."
          : "신고가 접수되었습니다. 관리자가 확인합니다.",
      );
    } catch {
      setError("신고 처리 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/55 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="community-report-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card"
      >
        <h2 id="community-report-title" className="text-lg font-bold text-ink">
          신고하기
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          신고 내용은 관리자에게만 전달됩니다.
        </p>
        <label className="mt-5 block">
          <span className="mb-1.5 block text-sm font-medium text-ink">신고 사유</span>
          <select
            value={reason}
            onChange={(event) => setReason(event.target.value as CommunityReportReason)}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
          >
            {COMMUNITY_REPORT_REASONS.map((item) => (
              <option key={item.id} value={item.id}>
                {COMMUNITY_REPORT_REASON_LABEL[item.id]}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium text-ink">상세 내용</span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={4}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm leading-relaxed text-ink outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
            placeholder="선택 입력"
          />
        </label>
        {error && <p className="mt-3 text-xs text-rose-600">{error}</p>}
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="btn-secondary flex-1"
          >
            취소
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            신고 접수
          </button>
        </div>
      </div>
    </div>
  );
}
