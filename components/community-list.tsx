"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Eye,
  MessageCircle,
  Megaphone,
  PenLine,
  Pin,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  COMMUNITY_CATEGORIES,
  COMMUNITY_CATEGORY_LABEL,
  subscribeCommunityPosts,
} from "@/lib/community";
import { formatFirestoreDate } from "@/lib/format";
import type { CommunityCategory, CommunityPost } from "@/lib/types";

type CategoryFilter = "all" | CommunityCategory;

export function CommunityList() {
  const { accessLevel, status } = useAuth();
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const canWrite = accessLevel === "approved" || accessLevel === "admin";

  useEffect(() => {
    setLoading(true);
    return subscribeCommunityPosts(
      { category },
      (items) => {
        setPosts(items);
        setLoading(false);
      },
      () => {
        setError("게시글을 불러오지 못했습니다.");
        setLoading(false);
      },
    );
  }, [category]);

  const tabs = useMemo(
    () => [{ id: "all" as const, label: "전체" }, ...COMMUNITY_CATEGORIES],
    [],
  );

  const blockWrite = () => {
    if (accessLevel === "guest") {
      setNotice("로그인 후 입주민 승인까지 완료되면 글쓰기가 가능합니다.");
      return;
    }
    if (status !== "approved" && accessLevel !== "admin") {
      setNotice("관리자 승인 후 커뮤니티 글쓰기를 이용할 수 있습니다.");
      return;
    }
    setNotice("승인 완료 입주민만 글쓰기가 가능합니다.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-line bg-white p-5 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="text-lg font-bold text-ink">입주민 게시글</h2>
          <p className="mt-1 text-sm text-ink-soft">
            닉네임으로만 소통하며 실명, 동·호수, 연락처는 노출되지 않습니다.
          </p>
        </div>
        {canWrite ? (
          <Link href="/community/write" className="btn-primary whitespace-nowrap">
            <PenLine className="h-4 w-4" aria-hidden />
            글쓰기
          </Link>
        ) : (
          <button type="button" onClick={blockWrite} className="btn-secondary">
            <PenLine className="h-4 w-4" aria-hidden />
            글쓰기
          </button>
        )}
      </div>

      {notice && (
        <p className="flex items-start gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {notice}
        </p>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setCategory(tab.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              category === tab.id
                ? "bg-brand-600 text-cream-50"
                : "border border-line bg-white text-ink-soft hover:border-brand-200 hover:text-brand-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </p>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="card-base p-8 text-center text-sm text-ink-soft">
            게시글을 불러오는 중입니다.
          </div>
        ) : posts.length === 0 ? (
          <div className="card-base p-8 text-center">
            <p className="font-bold text-ink">아직 게시글이 없습니다.</p>
            <p className="mt-2 text-sm text-ink-soft">
              승인 완료 입주민이 첫 글을 남길 수 있습니다.
            </p>
          </div>
        ) : (
          posts.map((post) => <CommunityPostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}

function CommunityPostCard({ post }: { post: CommunityPost }) {
  return (
    <Link
      href={`/community/${post.id}`}
      className="block rounded-2xl border border-line bg-white p-5 shadow-card transition-colors hover:border-brand-200 hover:bg-cream-50"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge bg-brand-50 text-brand-700">
          {COMMUNITY_CATEGORY_LABEL[post.category]}
        </span>
        {post.isNotice && (
          <span className="badge bg-gold/20 text-brand-700">
            <Megaphone className="h-3.5 w-3.5" aria-hidden />
            공지
          </span>
        )}
        {post.isPinned && (
          <span className="badge bg-sand-100 text-brand-700">
            <Pin className="h-3.5 w-3.5" aria-hidden />
            고정
          </span>
        )}
      </div>
      <h3 className="mt-3 line-clamp-2 text-lg font-bold text-ink">
        {post.title}
      </h3>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-faint">
        <span>{post.authorNickname}</span>
        <span>{formatFirestoreDate(post.createdAt)}</span>
        <span className="inline-flex items-center gap-1">
          <MessageCircle className="h-3.5 w-3.5" aria-hidden />
          {post.commentCount}
        </span>
        <span className="inline-flex items-center gap-1">
          <Eye className="h-3.5 w-3.5" aria-hidden />
          {post.viewCount}
        </span>
      </div>
    </Link>
  );
}
