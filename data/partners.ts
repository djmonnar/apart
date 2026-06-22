import type { Partner } from "@/lib/types";

/** 제휴업체 목업 — 이미지가 없을 경우 SafeImage 컴포넌트가 fallback 처리 */
export const partners: Partner[] = [
  {
    id: "ptn-firsthair",
    apartmentId: "apt-pradium",
    name: "퍼스트헤어",
    category: "beauty",
    image: "/assets/hair-salon.png",
    region: "진주시 신안동",
    tagline: "모던 & 우아한 프리미엄 헤어살롱",
    description:
      "트렌디한 디자이너의 1:1 맞춤 스타일링을 입주민 특별가로 만나보세요. 펌·염색 시술 시 입주민 전용 할인이 적용됩니다.",
    phone: "055-211-0001",
    partneredAt: "2026-05-01",
    featured: true,
  },
  {
    id: "ptn-onemans",
    apartmentId: "apt-pradium",
    name: "원맨즈헤어",
    category: "beauty",
    image: "/assets/barbershop.png",
    region: "진주시 신안동",
    tagline: "남성 전용 모던 바버샵",
    description:
      "깔끔한 남성 커트와 그루밍 전문 바버샵. 입주민이라면 컷트와 염색을 더 합리적으로 이용하실 수 있습니다.",
    phone: "055-211-0002",
    partneredAt: "2026-05-01",
    featured: true,
  },
  {
    id: "ptn-surakan",
    apartmentId: "apt-pradium",
    name: "궁중수라간",
    category: "food",
    image: "/assets/korean-table.png",
    region: "진주시 초전동",
    tagline: "정성 가득한 한식 반상 정기배송",
    description:
      "건강한 집밥을 정기배송으로. 첫 방문 할인과 정기배송 할인으로 입주민 식탁을 든든하게 채워드립니다.",
    phone: "055-211-0003",
    partneredAt: "2026-04-30",
    featured: true,
  },
  {
    id: "ptn-3h",
    apartmentId: "apt-pradium",
    name: "3H 지압침대",
    category: "health",
    image: "/assets/spa-lounge.png",
    region: "진주시 신안동",
    tagline: "온열 지압으로 누리는 홈 힐링",
    description:
      "프리미엄 온열 지압 케어를 무료 체험으로 경험해 보세요. 구매 시 입주민 전용 사은품을 함께 드립니다.",
    phone: "055-211-0004",
    partneredAt: "2026-04-28",
    featured: true,
  },
  {
    id: "ptn-9992",
    apartmentId: "apt-pradium",
    name: "9992 누룽지통닭",
    category: "food",
    image: "/assets/fried-chicken.png",
    region: "진주시 상대동",
    tagline: "바삭한 누룽지 옷을 입은 통닭",
    description:
      "겉은 바삭, 속은 촉촉한 누룽지통닭. 전 메뉴 할인과 포장 주문 혜택을 입주민에게 제공합니다.",
    phone: "055-211-0005",
    partneredAt: "2026-04-26",
    featured: true,
  },
  {
    id: "ptn-skyfit",
    apartmentId: "apt-pradium",
    name: "스카이 휘트니스",
    category: "health",
    image: "/assets/spa-lounge.png",
    region: "진주시 신안동",
    tagline: "단지 바로 옆 프리미엄 피트니스",
    description:
      "최신 장비와 전문 트레이너가 함께하는 피트니스. 등록 시 1개월 추가, PT 할인 등 입주민 혜택을 누리세요.",
    phone: "055-211-0006",
    partneredAt: "2026-04-20",
    featured: true,
  },
];

export const getPartner = (id: string) => partners.find((p) => p.id === id);
