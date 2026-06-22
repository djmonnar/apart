# 진주역 스카이시티프라디움 입주민 복지몰 (단지라운지)

아파트 단지 전용 프리미엄 복지몰. 입주민만 누리는 제휴 혜택을 인증·발급·사용하는 폐쇄형 서비스입니다.

## 스택

- **Next.js 14 (App Router)** + **TypeScript**
- **Tailwind CSS** (따뜻한 크림/베이지/브라운 디자인 토큰)
- **Pretendard** (한글 가변 폰트, CDN 다이내믹 서브셋)
- **lucide-react** (라인 아이콘)
- **Firebase Auth + Firestore users 컬렉션** (입주민 가입/로그인/관리자 승인)
- 혜택/공동구매 콘텐츠는 **mock 데이터** 유지 (실서비스 확장 시 데이터 레이어만 교체)

## 실행

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 프로덕션 빌드 (전체 타입 체크)
```

> 개발 서버 실행 중에는 `npm run build`를 돌리지 마세요. `.next`가 덮어써져 dev 서버 청크가 깨집니다.

## 라우트

| 경로 | 설명 | 완성도 |
| --- | --- | --- |
| `/` | 소비자 메인 (히어로·카테고리·추천혜택·인증현황·이용방법·공지·FAQ) | ★ 완성 |
| `/benefits` | 혜택 목록 (카테고리 필터 + 검색) | ★ 완성 |
| `/benefits/[id]` | 혜택 상세 + 쿠폰 발급(쿠폰번호/QR) | ★ 완성 |
| `/login`, `/signup` | 로그인 / 입주민 가입 신청 | ★ 완성 |
| `/mypage` | 인증 현황·내 정보·쿠폰함 | ★ 완성 |
| `/privacy`, `/terms` | 개인정보처리방침 / 이용약관 | 기본 |
| `/partner` | 업체용 혜택 인증센터 | 골격 (확장 예정) |
| `/admin` | 관리자 대시보드 (입주민 승인/반려 등) | 골격 (확장 예정) |

## 디렉터리

```
app/                # 라우트 (App Router)
components/         # UI 컴포넌트 (헤더/푸터/카드/히어로/쿠폰패널 등)
lib/
  types.ts          # 도메인 타입
  constants.ts      # 카테고리·상태 메타, 서비스명
  queries.ts        # 혜택+업체 조인 뷰 모델
  auth-context.tsx  # Firebase Auth + Firestore 프로필 기반 인증 컨텍스트
data/               # mock 데이터 (apartments/users/partners/benefits/coupons/notices)
public/assets/      # 이미지 자산 (아파트 외관, 업체 사진 등)
```

## 환경변수

`.env.example`을 참고해 `.env.local`에 Firebase 웹 앱 설정을 넣어야 가입/로그인이 동작합니다.

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_ADMIN_EMAILS=djmonnar4@gmail.com
```

## 인증 상태 모델

소비자 인증 상태는 Firebase Auth 사용자와 Firestore `users/{uid}` 문서 기준으로
`guest → pending(승인대기) → approved(승인완료)`를 판단합니다.
- **미승인**: 혜택 열람은 가능하지만 쿠폰 발급/사용 불가
- **승인완료**: 혜택 상세에서 1회용 쿠폰번호/QR 발급

Firestore `users/{uid}` 기본 구조는 다음과 같습니다.

```ts
{
  uid: string;
  email: string;
  name: string;
  phone: string;
  building: string;
  unit: string;
  apartmentId: "pradium";
  role: "resident" | "admin" | "partner";
  approvalStatus: "pending" | "approved" | "rejected" | "suspended";
  createdAt: serverTimestamp;
  approvedAt: null;
  approvedBy: null;
}
```

## 개인정보 보호 원칙

업체용 화면(`/partner`)은 쿠폰의 **유효성과 혜택 적용 가능 여부만** 확인합니다.
입주민의 동·호수·연락처 등 개인정보는 업체에 **일절 제공되지 않습니다.**

## 실서비스 확장 가이드

- `data/*` → 실제 API/Firestore 조회로 교체 (타입은 그대로 사용)
- `lib/auth-context.tsx` → 실제 인증으로 교체 (Provider 내부만 변경)
- 쿠폰 발급/검증 → 서버에서 단건 발급·1회 사용 처리로 이관
