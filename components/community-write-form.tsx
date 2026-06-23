"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, Loader2, PenLine, ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  COMMUNITY_CATEGORIES,
  createCommunityPost,
  ensureCommunityNickname,
} from "@/lib/community";
import type { CommunityCategory } from "@/lib/types";

export function CommunityWriteForm() {
  const router = useRouter();
  const { accessLevel, profile, user, loading } = useAuth();
  const [category, setCategory] = useState<CommunityCategory>("free");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canWrite = accessLevel === "approved" || accessLevel === "admin";

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!user || !canWrite) {
      setError("승인 완료 입주민만 글을 작성할 수 있습니다.");
      return;
    }
    if (title.trim().length < 2) {
      setError("제목을 2자 이상 입력해 주세요.");
      return;
    }
    if (content.trim().length < 5) {
      setError("내용을 5자 이상 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const nickname = await ensureCommunityNickname(user.uid, profile);
      const postId = await createCommunityPost({
        category,
        title,
        content,
        authorId: user.uid,
        authorNickname: nickname,
      });
      router.push(`/community/${postId}`);
    } catch {
      setError("게시글 저장 중 오류가 발생했습니다. 권한 또는 네트워크를 확인해 주세요.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="card-base p-8 text-center text-sm text-ink-soft">권한 확인 중입니다.</div>;
  }

  if (!canWrite) {
    return (
      <div className="card-base p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <ShieldAlert className="h-7 w-7" aria-hidden />
        </span>
        <h2 className="mt-4 text-lg font-bold text-ink">
          승인 완료 입주민만 글쓰기가 가능합니다
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          로그인 후 관리자 승인이 완료되면 게시글과 댓글을 작성할 수 있습니다.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/login" className="btn-secondary">
            로그인
          </Link>
          <Link href="/mypage" className="btn-primary">
            승인 상태 확인
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card-base space-y-5 p-5 sm:p-7">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">카테고리</span>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as CommunityCategory)}
          className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
        >
          {COMMUNITY_CATEGORIES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">제목</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={80}
          placeholder="게시글 제목을 입력해 주세요"
          className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">내용</span>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={12}
          maxLength={3000}
          placeholder="실명, 동·호수, 연락처 등 개인정보가 포함되지 않도록 주의해 주세요."
          className="w-full resize-y rounded-xl border border-line bg-white px-4 py-3 text-sm leading-relaxed text-ink outline-none placeholder:text-ink-faint focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
        />
      </label>

      <p className="rounded-xl bg-cream-100 px-4 py-3 text-xs leading-relaxed text-ink-soft">
        게시판에는 닉네임만 표시됩니다. 실명, 동·호수, 전화번호 등 개인정보는
        본문에 직접 입력하지 마세요.
      </p>

      {error && (
        <p className="flex items-start gap-1.5 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs leading-relaxed text-rose-600">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link href="/community" className="btn-secondary">
          취소
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <PenLine className="h-4 w-4" aria-hidden />
          )}
          게시글 등록
        </button>
      </div>
    </form>
  );
}
