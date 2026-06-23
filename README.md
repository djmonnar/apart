# 진주역 스카이시티프라디움 입주민 복지몰 (단지라운지)

아파트 단지 전용 프리미엄 복지몰. 입주민만 누리는 제휴 혜택을 인증하고, 매장에서 손님 휴대폰으로 사용 완료 처리하는 폐쇄형 서비스입니다.

## 스택

- **Next.js 14 (App Router)** + **TypeScript**
- **Tailwind CSS** (따뜻한 크림/베이지/브라운 디자인 토큰)
- **Pretendard** (한글 가변 폰트, CDN 다이내믹 서브셋)
- **lucide-react** (라인 아이콘)
- **Firebase Auth + Firestore users 컬렉션** (입주민 가입/로그인/관리자 승인)
- **Firestore partners/benefits 컬렉션** (업체·혜택 관리형 CMS)
- 공동구매 콘텐츠는 일부 **mock 데이터** 유지 (추후 Firestore 전환 예정)

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
| `/benefits/[id]` | 혜택 상세 + 손님 폰 사용 완료 처리 | ★ 완성 |
| `/login`, `/signup` | 로그인 / 입주민 가입 신청 | ★ 완성 |
| `/mypage` | 인증 현황·내 정보·이번 달 혜택 이용 현황 | ★ 완성 |
| `/privacy`, `/terms` | 개인정보처리방침 / 이용약관 | 기본 |
| `/partner` | 업체용 이용 안내 + 고급 인증센터 링크 | 골격 (확장 예정) |
| `/admin` | 관리자 대시보드 (입주민 승인/반려 등) | 골격 (확장 예정) |
| `/admin/partners` | 업체 등록·수정·상태 관리 | ★ 완성 |
| `/admin/benefits` | 혜택 등록·수정·월 사용 횟수 관리 | ★ 완성 |

## 디렉터리

```
app/                # 라우트 (App Router)
components/         # UI 컴포넌트 (헤더/푸터/카드/히어로/쿠폰패널 등)
lib/
  types.ts          # 도메인 타입
  constants.ts      # 카테고리·상태 메타, 서비스명
  queries.ts        # 혜택+업체 조인 뷰 모델
  benefit-cms.ts    # Firestore 업체/혜택 CMS 클라이언트 유틸
  seed-data.ts      # Firestore 초기 입력용 업체/혜택 데이터
  auth-context.tsx  # Firebase Auth + Firestore 프로필 기반 인증 컨텍스트
data/               # fallback/seed 데이터 (partners/benefits) + mock 데이터
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
- **미승인**: 혜택 열람은 가능하지만 상세 조건과 혜택 사용 불가
- **승인완료**: 혜택 상세에서 사용 확인 화면을 열고, 매장 직원이 손님 휴대폰에서 사용 완료 처리

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

기본 MVP 흐름에서 업체는 별도 로그인, 쿠폰번호 입력, QR 스캔을 하지 않습니다.
매장 직원은 손님 휴대폰의 혜택 사용 화면에서 **혜택명과 사용 처리 상태만** 확인합니다.
입주민의 동·호수·연락처 등 개인정보는 업체에 **일절 제공되지 않습니다.**

## 업체/혜택 CMS

- 관리자는 `/admin/partners`에서 업체를 등록하고 `active / paused / draft` 상태를 관리합니다.
- 관리자는 `/admin/benefits`에서 업체별 혜택과 `monthlyLimitPerUser`를 설정합니다.
- 입주민 화면의 `/benefits`, `/benefits/[id]`는 Firestore의 `active` 혜택만 표시합니다.
- Firestore가 비어 있거나 Admin SDK 환경이 없으면 `data/partners.ts`, `data/benefits.ts` fallback 데이터가 표시됩니다.

## 실서비스 확장 가이드

- 고급 인증센터(`/partner/verify`) → 추후 쿠폰번호/QR 인증이 필요해질 때 확장
- 공동구매 콘텐츠 → 추후 Firestore CMS로 전환
