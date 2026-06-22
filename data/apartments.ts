import type { Apartment } from "@/lib/types";

export const apartments: Apartment[] = [
  {
    id: "apt-pradium",
    name: "진주역 스카이시티프라디움",
    shortName: "스카이시티프라디움",
    address: "경상남도 진주시 신안동 000번지",
    customerCenter: "055-123-4567",
    operatingHours: "평일 09:00 - 18:00 (점심 12:00 - 13:00) · 주말/공휴일 휴무",
  },
];

/** 현재 단지 (단일 단지 기준) */
export const currentApartment = apartments[0];
