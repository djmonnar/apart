/** "90,000원" 같은 문자열에서 숫자만 추출 (실패 시 null) */
export function parseWon(value: string): number | null {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return null;
  return Number(digits);
}

/**
 * 정상가/공동구매가가 모두 숫자일 때만 할인율 라벨을 반환.
 * (예: "90,000원" / "69,000원" → "23% 할인")
 * 비숫자(방문견적, 입주민 특별가 등)면 null.
 */
export function formatDiscount(
  original: string,
  group: string,
): string | null {
  const o = parseWon(original);
  const g = parseWon(group);
  if (o === null || g === null || o <= 0 || g >= o) return null;
  const percent = Math.round((1 - g / o) * 100);
  if (percent <= 0) return null;
  return `${percent}% 할인`;
}

export function formatFirestoreDate(value: unknown): string {
  if (!value) return "-";

  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString().slice(0, 10);
  }

  return "-";
}

export function formatFirestoreDateTime(value: unknown): string {
  const date = toDate(value);
  if (!date) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function toDate(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Date) return value;

  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }

  return null;
}
