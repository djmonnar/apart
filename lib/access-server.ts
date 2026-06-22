import "server-only";
import { cookies } from "next/headers";
import { ACCESS_COOKIE, parseAccessLevel, type AccessLevel } from "./access";

/**
 * 서버 컴포넌트에서 현재 요청의 권한 레벨을 읽는다.
 * 이 값으로 서버에서 혜택을 정제하므로, 미승인 사용자의 브라우저에는
 * 상세 혜택 데이터가 전송되지 않는다.
 */
export function getServerAccessLevel(): AccessLevel {
  return parseAccessLevel(cookies().get(ACCESS_COOKIE)?.value);
}
