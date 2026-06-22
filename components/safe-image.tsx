"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageOff } from "lucide-react";

interface SafeImageProps {
  src: string;
  alt: string;
  /** 비율 컨테이너용 추가 클래스 */
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * object-fit: cover 기반 이미지. 로드 실패 시 따뜻한 톤의 fallback UI를 렌더링한다.
 * 부모가 position/aspect 비율을 지정한다는 전제(fill)로 동작.
 */
export function SafeImage({
  src,
  alt,
  className = "",
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority,
}: SafeImageProps) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-sand-100 to-sand-200 text-brand-300 ${className}`}
        role="img"
        aria-label={`${alt} (이미지를 불러올 수 없습니다)`}
      >
        <ImageOff className="h-7 w-7" aria-hidden />
        <span className="px-3 text-center text-xs font-medium text-brand-400">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      onError={() => setErrored(true)}
      className={`object-cover ${className}`}
    />
  );
}
