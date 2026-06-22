"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";

interface SafeImageProps {
  src: string;
  alt: string;
  /** src 로드 실패 시 시도할 대체 이미지 (예: 아직 준비 안 된 신규 이미지의 기존 대체본) */
  fallbackSrc?: string;
  /** 비율 컨테이너용 추가 클래스 */
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * object-fit: cover 기반 이미지.
 * src → fallbackSrc → 따뜻한 톤의 fallback UI 순으로 단계적으로 처리한다.
 * (예정 이미지 파일을 src로 지정해두면, 파일 추가 시 자동으로 교체됨)
 * 부모가 position/aspect 비율을 지정한다는 전제(fill)로 동작.
 */
export function SafeImage({
  src,
  alt,
  fallbackSrc,
  className = "",
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority,
}: SafeImageProps) {
  const [current, setCurrent] = useState(src);
  const [failed, setFailed] = useState(false);

  // src가 바뀌면 상태 초기화
  useEffect(() => {
    setCurrent(src);
    setFailed(false);
  }, [src]);

  const handleError = () => {
    if (fallbackSrc && current !== fallbackSrc) {
      setCurrent(fallbackSrc); // 1단계: 대체 이미지로 교체
    } else {
      setFailed(true); // 2단계: fallback UI
    }
  };

  if (failed) {
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
      src={current}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      onError={handleError}
      className={`object-cover ${className}`}
    />
  );
}
