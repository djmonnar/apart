"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Eye,
  Lock,
  MessageCircle,
  Megaphone,
  PenLine,
  Pin,
  Search,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  COMMUNITY_ALL_TAGS,
  COMMUNITY_CATEGORIES,
  COMMUNITY_CATEGORY_LABEL,
  COMMUNITY_TAG_LABEL,
  subscribeCommunityPosts,
} from "@/lib/community";
import { formatFirestoreDate } from "@/lib/format";
import type { CommunityCategory, CommunityPost, CommunityTag } from "@/lib/types";

type CategoryFilter = "all" | CommunityCategory;
type TagFilter = "all" | CommunityTag;

export function CommunityList() {
  const { accessLevel, status } = useAuth();
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [tag, setTag] = useState<TagFilter>("all");
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const canWrite = accessLevel === "approved" || accessLevel === "admin";

  useEffect(() => {
    setLoading(true);
    setError(null);
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

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return posts.filter((post) => {
      if (tag !== "all" && !post.tags.includes(tag)) return false;
      if (!normalizedQuery) return true;
      const haystack = [
        post.title,
        post.content,
        post.authorNickname,
        COMMUNITY_CATEGORY_LABEL[post.category],
        ...post.tags.map((item) => COMMUNITY_TAG_LABEL[item]),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [posts, query, tag]);

  const pinnedPosts = filteredPosts.filter(
    (post) => post.isNotice || post.isPinned,
  );
  const regularPosts = filteredPosts.filter(
    (post) => !post.isNotice && !post.isPinned,
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

  const WriteButton = canWrite ? (
    <Link href="/community/write" className="btn-primary h-11 whitespace-nowrap">
      <PenLine className="h-4 w-4" aria-hidden />
      글쓰기
    </Link>
  ) : (
    <button type="button" onClick={blockWrite} className="btn-secondary h-11">
      <Lock className="h-4 w-4" aria-hidden />
      글쓰기
    </button>
  );

  return (
    <div className="mx-auto max-w-5xl overflow-hidden">
      <div className="mb-5 flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-eyebrow">COMMUNITY</p>
          <h1 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">
            입주민 커뮤니티
          </h1>
          <p className="mt-2 max-w-2xl break-words text-sm leading-relaxed text-ink-soft">
            닉네임만 표시되며 실명, 동·호수, 연락처는 노출되지 않습니다.
          </p>
        </div>
        <div className="hidden sm:block">{WriteButton}</div>
      </div>

      <div className="sticky top-16 z-20 -mx-4 border-y border-line bg-cream/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:bg-white/95">
        <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setCategory(tab.id);
                setTag("all");
              }}
              className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                category === tab.id
                  ? "bg-brand-600 text-cream-50"
                  : "border border-line bg-white text-ink-soft hover:border-brand-200 hover:text-brand-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto] md:items-center">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 pl-9 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
              placeholder="제목, 내용, 태그 검색"
            />
          </label>
          <div className="flex min-w-0 gap-2 overflow-x-auto [scrollbar-width:none] md:max-w-[440px]">
            <TagButton active={tag === "all"} label="전체 태그" onClick={() => setTag("all")} />
            {COMMUNITY_ALL_TAGS.map((item) => (
              <TagButton
                key={item}
                active={tag === item}
                label={COMMUNITY_TAG_LABEL[item]}
                onClick={() => setTag(item)}
              />
            ))}
          </div>
        </div>
      </div>

      {notice && (
        <p className="mt-4 flex items-start gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {notice}
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </p>
      )}

      <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <div className="hidden grid-cols-[1fr_110px_90px_90px] border-b border-line bg-cream-100 px-5 py-3 text-xs font-semibold text-ink-faint md:grid">
          <span>제목</span>
          <span>작성자</span>
          <span>댓글/조회</span>
          <span>작성일</span>
        </div>

        {loading ? (
          <div className="px-5 py-14 text-center text-sm text-ink-soft">
            게시글을 불러오는 중입니다.
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="font-bold text-ink">아직 게시글이 없습니다.</p>
            <p className="mt-2 text-sm text-ink-soft">
              승인 완료 입주민이 첫 글을 남길 수 있습니다.
            </p>
          </div>
        ) : (
          <>
            {pinnedPosts.map((post) => (
              <CommunityPostRow key={post.id} post={post} highlighted />
            ))}
            {regularPosts.map((post) => (
              <CommunityPostRow key={post.id} post={post} />
            ))}
          </>
        )}
      </div>

      <div className="fixed bottom-5 right-5 z-30 sm:hidden">
        {canWrite ? (
          <Link
            href="/community/write"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-700 text-cream-50 shadow-card"
            aria-label="글쓰기"
          >
            <PenLine className="h-5 w-5" aria-hidden />
          </Link>
        ) : (
          <button
            type="button"
            onClick={blockWrite}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-brand-700 shadow-card ring-1 ring-line"
            aria-label="글쓰기"
          >
            <Lock className="h-5 w-5" aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}

function TagButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition-colors ${
        active
          ? "bg-sand-200 text-brand-800"
          : "border border-line bg-white text-ink-faint hover:text-brand-700"
      }`}
    >
      #{label}
    </button>
  );
}

function CommunityPostRow({
  post,
  highlighted,
}: {
  post: CommunityPost;
  highlighted?: boolean;
}) {
  return (
    <Link
      href={`/community/${post.id}`}
      className={`grid gap-2 border-b border-line/70 px-4 py-4 transition-colors last:border-b-0 hover:bg-cream-50 md:grid-cols-[1fr_110px_90px_90px] md:items-center md:px-5 ${
        highlighted ? "bg-amber-50/45" : "bg-white"
      }`}
    >
      <div className="min-w-0">
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
          <span className="rounded-md bg-brand-50 px-2 py-1 text-[11px] font-bold text-brand-700">
            {COMMUNITY_CATEGORY_LABEL[post.category]}
          </span>
          {post.isNotice && (
            <span className="inline-flex items-center gap-1 rounded-md bg-gold/20 px-2 py-1 text-[11px] font-bold text-brand-700">
              <Megaphone className="h-3 w-3" aria-hidden />
              공지
            </span>
          )}
          {post.isPinned && (
            <span className="inline-flex items-center gap-1 rounded-md bg-sand-100 px-2 py-1 text-[11px] font-bold text-brand-700">
              <Pin className="h-3 w-3" aria-hidden />
              고정
            </span>
          )}
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-md bg-cream-100 px-2 py-1 text-[11px] font-semibold text-ink-faint">
              #{COMMUNITY_TAG_LABEL[tag]}
            </span>
          ))}
        </div>
        <h3 className="line-clamp-1 text-[15px] font-bold text-ink">
          {post.title}
          {post.commentCount > 0 && (
            <span className="ml-1 text-brand-600">[{post.commentCount}]</span>
          )}
        </h3>
        <p className="mt-1 line-clamp-1 text-xs leading-relaxed text-ink-faint md:hidden">
          {post.content}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-faint md:hidden">
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
      <span className="hidden truncate text-sm text-ink-soft md:block">
        {post.authorNickname}
      </span>
      <span className="hidden text-xs text-ink-faint md:flex md:items-center md:gap-2">
        <MessageCircle className="h-3.5 w-3.5" aria-hidden />
        {post.commentCount}
        <Eye className="h-3.5 w-3.5" aria-hidden />
        {post.viewCount}
      </span>
      <span className="hidden text-xs text-ink-faint md:block">
        {formatFirestoreDate(post.createdAt)}
      </span>
    </Link>
  );
}
