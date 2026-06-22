/**
 * 데모용 QR 미리보기.
 * 실제 QR 인코딩 대신 코드 문자열을 해시해 결정적(deterministic) 패턴을 그린다.
 * 실서비스에서는 QR 라이브러리로 교체.
 */
export function QrPreview({ value, size = 132 }: { value: string; size?: number }) {
  const cells = 21;
  // 간단한 해시 → 비트맵
  let seed = 0;
  for (let i = 0; i < value.length; i++) {
    seed = (seed * 31 + value.charCodeAt(i)) >>> 0;
  }
  const rand = (n: number) => {
    seed = (seed * 1103515245 + 12345 + n) >>> 0;
    return (seed >>> 16) & 1;
  };

  const isFinder = (r: number, c: number) => {
    const inBox = (br: number, bc: number) =>
      r >= br && r < br + 7 && c >= bc && c < bc + 7;
    return inBox(0, 0) || inBox(0, cells - 7) || inBox(cells - 7, 0);
  };
  const finderFill = (r: number, c: number) => {
    const local = (br: number, bc: number) => {
      const lr = r - br;
      const lc = c - bc;
      if (lr === 0 || lr === 6 || lc === 0 || lc === 6) return true;
      if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) return true;
      return false;
    };
    if (r < 7 && c < 7) return local(0, 0);
    if (r < 7 && c >= cells - 7) return local(0, cells - 7);
    if (r >= cells - 7 && c < 7) return local(cells - 7, 0);
    return false;
  };

  const px = size / cells;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="쿠폰 QR 코드 (데모)"
      className="rounded-lg bg-white"
    >
      {Array.from({ length: cells }).map((_, r) =>
        Array.from({ length: cells }).map((_, c) => {
          const on = isFinder(r, c)
            ? finderFill(r, c)
            : rand(r * cells + c) === 1;
          if (!on) return null;
          return (
            <rect
              key={`${r}-${c}`}
              x={c * px}
              y={r * px}
              width={px}
              height={px}
              fill="#33271A"
            />
          );
        }),
      )}
    </svg>
  );
}
