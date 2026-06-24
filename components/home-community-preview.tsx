"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  Eye,
  Loader2,
  MessageCircle,
  PenLine,
} from "lucide-react";
import {
  COMMUNITY_CATEGORY_LABEL,
  COMMUNITY_TAG_LABEL,
  subscribeCommunityPosts,
} from "@/lib/community";
import { formatFirestoreDate } from "@/lib/format";
import type { CommunityPost, CommunityTag } from "@/lib/types";

export function HomeCommunityPreview() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    return subscribeCommunityPosts(
      { category: "all" },
      (items) => {
        setPosts(items.slice(0, 5));
        setLoading(false);
      },
      () => {
        setError(true);
        setLoading(false);
      },
    );
  }, []);

  const topTags = useMemo(() => {
    const counts = new Map<CommunityTag, number>();
    posts.forEach((post) => {
      post.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([tag]) => tag);
  }, [posts]);

  return (
    <section className="container-pad py-10">
      <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-card">
        <div className="flex flex-col gap-4 border-b border-line bg-cream-100/70 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="section-eyebrow">COMMUNITY</p>
            <h2 className="mt-2 text-2xl font-bold text-ink">입주민 최신글</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              공동구매 제안, 생활정보, 나눔 소식을 커뮤니티에서 빠르게 확인하세요.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/community/write" className="btn-primary shrink-0">
              <PenLine className="h-4 w-4" aria-hidden />
              글쓰기
            </Link>
            <Link href="/community" className="btn-secondary shrink-0">
              최신글 보기
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>

        {topTags.length > 0 && (
          <div className="flex gap-2 overflow-x-auto border-b border-line px-5 py-3 [scrollbar-width:none]">
            {topTags.map((tag) => (
              <span
                key={tag}
                className="shrink-0 rounded-full bg-sand-100 px-3 py-1.5 text-xs font-semibold text-brand-800"
              >
                #{COMMUNITY_TAG_LABEL[tag]}
              </span>
            ))}
          </div>
        )}

        <div>
          {loading ? (
            <div className="flex items-center justify-center px-5 py-14 text-sm text-ink-soft">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              최신글을 불러오는 중입니다.
            </div>
          ) : error ? (
            <div className="px-5 py-14 text-center text-sm text-ink-soft">
              최신글을 불러오지 못했습니다.
            </div>
          ) : posts.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <p className="font-bold text-ink">아직 커뮤니티 글이 없습니다.</p>
              <p className="mt-2 text-sm text-ink-soft">
                승인 완료 입주민이 첫 글을 남길 수 있습니다.
              </p>
            </div>
          ) : (
            posts.map((post) => <PostRow key={post.id} post={post} />)
          )}
        </div>
      </div>
    </section>
  );
}

function PostRow({ post }: { post: CommunityPost }) {
  return (
    <Link
      href={`/community/${post.id}`}
      className="grid gap-2 border-b border-line/70 px-5 py-4 transition-colors last:border-b-0 hover:bg-cream-50 sm:grid-cols-[1fr_auto] sm:items-center"
    >
      <div className="min-w-0">
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
          <span className="rounded-md bg-brand-50 px-2 py-1 text-[11px] font-bold text-brand-700">
            {COMMUNITY_CATEGORY_LABEL[post.category]}
          </span>
          {post.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-cream-100 px-2 py-1 text-[11px] font-semibold text-ink-faint"
            >
              #{COMMUNITY_TAG_LABEL[tag]}
            </span>
          ))}
        </div>
        <h3 className="line-clamp-1 text-sm font-bold text-ink sm:text-[15px]">
          {post.title}
          {post.commentCount > 0 && (
            <span className="ml-1 text-brand-600">[{post.commentCount}]</span>
          )}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-faint">
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
      </div>
      <ChevronRight className="hidden h-5 w-5 text-ink-faint sm:block" aria-hidden />
    </Link>
  );
}
