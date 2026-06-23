/**
 * 시연용 데모 데이터 seed 스크립트 (Firestore: partners / benefits)
 *
 * 실행:
 *   npm run seed:demo
 *   (내부적으로: tsx scripts/seed-demo-data.ts)
 *
 * 필요 환경변수 (.env.local 또는 셸 환경):
 *   FIREBASE_SERVICE_ACCOUNT_KEY = 서비스 계정 JSON 전체 문자열
 *   (또는) FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY
 *
 * 특징:
 * - slug 기준 결정적 문서 id(ptn-<slug> / bnf-<slug>)로 upsert → 중복 생성 없음
 * - 기존 문서가 있으면 createdAt은 보존하고 나머지 필드만 갱신
 */

import { config } from "dotenv";
config({ path: ".env.local" });
config();

import {
  cert,
  getApps,
  initializeApp,
  type ServiceAccount,
} from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

function getServiceAccount(): ServiceAccount {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (raw) {
    const parsed = JSON.parse(raw) as ServiceAccount;
    if (typeof parsed.privateKey === "string") {
      parsed.privateKey = parsed.privateKey.replace(/\\n/g, "\n");
    }
    return parsed;
  }
  const projectId =
    process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "환경변수가 없습니다. FIREBASE_SERVICE_ACCOUNT_KEY 또는 FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY 를 설정하세요.",
    );
  }
  return { projectId, clientEmail, privateKey };
}

const app =
  getApps()[0] ??
  initializeApp({ credential: cert(getServiceAccount()) });
const db = getFirestore(app);

/* ── 시연용 업체 ─────────────────────────────────────────────── */
interface SeedPartner {
  slug: string;
  name: string;
  category: string; // CategoryId
  region: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  status: "active" | "paused" | "draft";
  isFeatured: boolean;
}

export const demoPartners: SeedPartner[] = [
  {
    slug: "firsthair",
    name: "퍼스트헤어",
    category: "beauty",
    region: "진주역/가좌동",
    shortDescription: "진주역 인근 감성 헤어살롱",
    description:
      "입주민을 위한 펌, 염색, 클리닉 혜택을 제공하는 헤어살롱입니다.",
    imageUrl: "/assets/hair-salon.png",
    status: "active",
    isFeatured: true,
  },
  {
    slug: "onemanshair",
    name: "원맨즈헤어",
    category: "beauty",
    region: "진주/가좌동",
    shortDescription: "남성 전용 1인 헤어샵",
    description:
      "남성 커트, 펌, 다운펌, 스타일링을 전문으로 하는 남성 헤어샵입니다.",
    imageUrl: "/assets/barbershop.png",
    status: "active",
    isFeatured: true,
  },
  {
    slug: "9992-chicken",
    name: "9992 누룽지통닭",
    category: "food",
    region: "진주 가좌동",
    shortDescription: "고소한 누룽지통닭 포장 혜택",
    description:
      "입주민을 위한 포장 할인 혜택을 제공하는 누룽지통닭 매장입니다.",
    imageUrl: "/assets/fried-chicken.png",
    status: "active",
    isFeatured: true,
  },
  {
    slug: "gungjung-suragan",
    name: "궁중수라간",
    category: "food",
    region: "진주/사천",
    shortDescription: "집밥 같은 반찬 정기배송",
    description:
      "조리일에 맞춰 신선한 반찬을 받아볼 수 있는 반찬 정기배송 서비스입니다.",
    imageUrl: "/assets/korean-table.png",
    status: "active",
    isFeatured: true,
  },
  {
    slug: "3h-namgang",
    name: "3H 지압침대 남강센터",
    category: "health",
    region: "진주 남강",
    shortDescription: "입주민 전용 무료 체험 상담",
    description:
      "지압침대와 건강관리 제품을 매장에서 직접 체험할 수 있는 센터입니다.",
    imageUrl: "/assets/spa-lounge.png",
    status: "active",
    isFeatured: false,
  },
  {
    slug: "aircon-cleaning",
    name: "프리미엄 에어컨 청소",
    category: "living",
    region: "진주",
    shortDescription: "아파트 세대 맞춤 에어컨 청소",
    description:
      "벽걸이, 스탠드, 시스템 에어컨 청소 서비스를 제공합니다.",
    imageUrl: "/assets/group-buy/group-aircon-cleaning.png",
    status: "active",
    isFeatured: false,
  },
  {
    slug: "car-interior-cleaning",
    name: "차량 실내세차",
    category: "car",
    region: "진주",
    shortDescription: "입주민 전용 차량 실내세차 혜택",
    description: "차량 내부 청소와 실내 케어 서비스를 제공합니다.",
    imageUrl: "/assets/group-buy/group-carwash.png",
    status: "active",
    isFeatured: false,
  },
];

/* ── 시연용 혜택 ─────────────────────────────────────────────── */
interface SeedBenefit {
  partnerSlug: string;
  category: string;
  title: string;
  summary: string;
  description: string;
  benefitType: "discount" | "gift" | "service" | "group" | "other";
  discountText: string;
  monthlyLimitPerUser: number;
  status: "active" | "paused" | "draft";
  isFeatured: boolean;
  conditions: string[];
  usageGuide: string[];
}

const DEFAULT_USAGE_GUIDE = [
  "복지몰에서 혜택 사용하기를 누릅니다.",
  "매장 직원에게 화면을 보여주세요.",
  "직원 확인 후 사용 완료 처리됩니다.",
];

export const demoBenefits: SeedBenefit[] = [
  {
    partnerSlug: "firsthair",
    category: "beauty",
    title: "입주민 전용 펌·염색 20% 할인",
    summary: "진주역 인근 헤어살롱에서 입주민 전용 할인",
    description:
      "진주역 스카이시티프라디움 입주민 인증 시 펌 또는 염색 시술 20% 할인 혜택을 제공합니다.",
    benefitType: "discount",
    discountText: "20% 할인",
    monthlyLimitPerUser: 1,
    status: "active",
    isFeatured: true,
    conditions: [
      "커트 단품 제외",
      "네이버페이 또는 현장 결제 가능",
      "다른 이벤트와 중복 적용 불가",
    ],
    usageGuide: DEFAULT_USAGE_GUIDE,
  },
  {
    partnerSlug: "onemanshair",
    category: "beauty",
    title: "남성 펌·다운펌 입주민 20% 할인",
    summary: "남성 전용 헤어샵 입주민 혜택",
    description:
      "남성 펌, 다운펌, 스타일링 시 입주민 인증 고객에게 20% 할인 혜택을 제공합니다.",
    benefitType: "discount",
    discountText: "20% 할인",
    monthlyLimitPerUser: 1,
    status: "active",
    isFeatured: true,
    conditions: ["남성 펌·다운펌·스타일링 대상", "다른 이벤트와 중복 적용 불가"],
    usageGuide: DEFAULT_USAGE_GUIDE,
  },
  {
    partnerSlug: "9992-chicken",
    category: "food",
    title: "포장 주문 2,000원 할인",
    summary: "누룽지통닭 포장 주문 입주민 할인",
    description: "입주민 인증 후 포장 주문 시 2,000원 할인 혜택을 제공합니다.",
    benefitType: "discount",
    discountText: "2,000원 할인",
    monthlyLimitPerUser: 3,
    status: "active",
    isFeatured: true,
    conditions: ["포장 주문 한정", "배달앱 주문 시 적용 불가"],
    usageGuide: DEFAULT_USAGE_GUIDE,
  },
  {
    partnerSlug: "gungjung-suragan",
    category: "food",
    title: "반찬 정기배송 첫 주문 10% 할인",
    summary: "입주민 전용 반찬 배송 혜택",
    description:
      "신선한 반찬 정기배송 첫 주문 시 입주민 전용 10% 할인 혜택을 제공합니다.",
    benefitType: "discount",
    discountText: "첫 주문 10% 할인",
    monthlyLimitPerUser: 2,
    status: "active",
    isFeatured: true,
    conditions: ["첫 주문 한정", "정기배송 신청 고객 대상"],
    usageGuide: DEFAULT_USAGE_GUIDE,
  },
  {
    partnerSlug: "3h-namgang",
    category: "health",
    title: "입주민 전용 무료 체험 예약",
    summary: "건강관리 제품 무료 체험 상담",
    description:
      "입주민 인증 고객에게 지압침대 무료 체험 및 맞춤 상담을 제공합니다.",
    benefitType: "service",
    discountText: "무료 체험",
    monthlyLimitPerUser: 1,
    status: "active",
    isFeatured: false,
    conditions: ["1인 1회 체험", "예약 후 방문"],
    usageGuide: DEFAULT_USAGE_GUIDE,
  },
  {
    partnerSlug: "aircon-cleaning",
    category: "living",
    title: "에어컨 청소 입주민 공동 할인",
    summary: "세대 맞춤 에어컨 청소 할인",
    description:
      "입주민 전용으로 벽걸이, 스탠드, 시스템 에어컨 청소 할인 혜택을 제공합니다.",
    benefitType: "service",
    discountText: "입주민 특별가",
    monthlyLimitPerUser: 1,
    status: "active",
    isFeatured: false,
    conditions: ["방문 견적 후 진행", "에어컨 종류에 따라 가격 상이"],
    usageGuide: DEFAULT_USAGE_GUIDE,
  },
  {
    partnerSlug: "car-interior-cleaning",
    category: "car",
    title: "차량 실내세차 5,000원 할인",
    summary: "입주민 차량관리 혜택",
    description:
      "입주민 인증 후 차량 실내세차 이용 시 5,000원 할인 혜택을 제공합니다.",
    benefitType: "discount",
    discountText: "5,000원 할인",
    monthlyLimitPerUser: 2,
    status: "active",
    isFeatured: false,
    conditions: ["차량 실내세차 한정", "예약 후 방문"],
    usageGuide: DEFAULT_USAGE_GUIDE,
  },
];

const partnerImage = (slug: string) =>
  demoPartners.find((p) => p.slug === slug)?.imageUrl ?? "/assets/gift-box.png";

async function upsertPartner(p: SeedPartner) {
  const id = `ptn-${p.slug}`;
  const ref = db.collection("partners").doc(id);
  const existing = await ref.get();
  await ref.set(
    {
      id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      region: p.region,
      shortDescription: p.shortDescription,
      description: p.description,
      phone: "",
      address: "",
      imageUrl: p.imageUrl,
      status: p.status,
      isFeatured: p.isFeatured,
      ...(existing.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  console.log(`  ✓ partner  ${id} (${p.name})`);
}

async function upsertBenefit(b: SeedBenefit) {
  const partner = demoPartners.find((p) => p.slug === b.partnerSlug)!;
  const id = `bnf-${b.partnerSlug}`;
  const ref = db.collection("benefits").doc(id);
  const existing = await ref.get();
  await ref.set(
    {
      id,
      partnerId: `ptn-${b.partnerSlug}`,
      partnerName: partner.name,
      partnerSlug: b.partnerSlug,
      category: b.category,
      title: b.title,
      summary: b.summary,
      description: b.description,
      benefitType: b.benefitType,
      originalPrice: "",
      benefitPrice: "",
      discountText: b.discountText,
      conditions: b.conditions,
      usageGuide: b.usageGuide,
      imageUrl: partnerImage(b.partnerSlug),
      status: b.status,
      isFeatured: b.isFeatured,
      monthlyLimitPerUser: b.monthlyLimitPerUser,
      isMonthlyLimited: true,
      resetDay: 1,
      ...(existing.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  console.log(`  ✓ benefit  ${id} (${b.title})`);
}

async function main() {
  console.log("▶ partners upsert");
  for (const p of demoPartners) await upsertPartner(p);
  console.log("▶ benefits upsert");
  for (const b of demoBenefits) await upsertBenefit(b);
  console.log(
    `\n완료: partners ${demoPartners.length}건, benefits ${demoBenefits.length}건 (slug 기준 upsert)`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("seed 실패:", err);
    process.exit(1);
  });
