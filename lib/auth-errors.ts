/** Firebase Auth 에러를 한국어 안내 문구로 변환 */
export function firebaseAuthErrorMessage(err: unknown): string {
  const code =
    typeof err === "object" && err !== null && "code" in err
      ? String((err as { code: unknown }).code)
      : "";

  switch (code) {
    case "auth/invalid-email":
      return "이메일 형식이 올바르지 않습니다.";
    case "auth/missing-password":
      return "비밀번호를 입력해 주세요.";
    case "auth/weak-password":
      return "비밀번호는 6자 이상이어야 합니다.";
    case "auth/email-already-in-use":
      return "이미 가입된 이메일입니다. 로그인해 주세요.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "이메일 또는 비밀번호가 올바르지 않습니다.";
    case "auth/too-many-requests":
      return "잠시 후 다시 시도해 주세요. (요청이 많습니다)";
    case "auth/network-request-failed":
      return "네트워크 연결을 확인해 주세요.";
    default:
      return "처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
  }
}
