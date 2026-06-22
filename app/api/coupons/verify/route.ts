import { NextResponse } from "next/server";
import type { Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import type { CouponStatus } from "@/lib/types";

export const runtime = "nodejs";

type CouponData = {
  code?: string;
  benefitTitle?: string;
  partnerName?: string;
  status?: CouponStatus;
  expiresAt?: Timestamp;
  usedAt?: Timestamp | null;
};

function normalizeCode(value: unknown) {
  return String(value ?? "").trim().toUpperCase();
}

function serializeTimestamp(value: Timestamp | null | undefined) {
  return value ? value.toDate().toISOString() : null;
}

async function findCouponByCode(code: string) {
  const snap = await getFirebaseAdminDb()
    .collection("coupons")
    .where("code", "==", code)
    .limit(1)
    .get();

  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ref: doc.ref, data: doc.data() as CouponData };
}

function safePayload(input: {
  valid: boolean;
  couponId?: string;
  data?: CouponData;
  status: CouponStatus | "not_found";
  message: string;
}) {
  return {
    valid: input.valid,
    couponId: input.couponId,
    code: input.data?.code ?? null,
    benefitTitle: input.data?.benefitTitle ?? null,
    partnerName: input.data?.partnerName ?? null,
    status: input.status,
    expiresAt: serializeTimestamp(input.data?.expiresAt),
    usedAt: serializeTimestamp(input.data?.usedAt ?? null),
    message: input.message,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { code?: unknown };
    const code = normalizeCode(body.code);

    if (!code) {
      return NextResponse.json(
        safePayload({
          valid: false,
          status: "not_found",
          message: "쿠폰번호를 입력해주세요.",
        }),
        { status: 400 },
      );
    }

    const coupon = await findCouponByCode(code);
    if (!coupon) {
      return NextResponse.json(
        safePayload({
          valid: false,
          status: "not_found",
          message: "존재하지 않는 쿠폰번호입니다.",
        }),
      );
    }

    const status = coupon.data.status ?? "issued";
    const expiresAt = coupon.data.expiresAt?.toMillis() ?? 0;

    if (status === "issued" && expiresAt > 0 && expiresAt <= Date.now()) {
      await coupon.ref.update({ status: "expired" }).catch(() => undefined);
      return NextResponse.json(
        safePayload({
          valid: false,
          couponId: coupon.id,
          data: { ...coupon.data, status: "expired" },
          status: "expired",
          message: "만료된 쿠폰입니다.",
        }),
      );
    }

    if (status === "used") {
      return NextResponse.json(
        safePayload({
          valid: false,
          couponId: coupon.id,
          data: coupon.data,
          status,
          message: "이미 사용 완료된 쿠폰입니다.",
        }),
      );
    }

    if (status === "expired") {
      return NextResponse.json(
        safePayload({
          valid: false,
          couponId: coupon.id,
          data: coupon.data,
          status,
          message: "만료된 쿠폰입니다.",
        }),
      );
    }

    if (status === "cancelled") {
      return NextResponse.json(
        safePayload({
          valid: false,
          couponId: coupon.id,
          data: coupon.data,
          status,
          message: "취소된 쿠폰입니다.",
        }),
      );
    }

    return NextResponse.json(
      safePayload({
        valid: true,
        couponId: coupon.id,
        data: coupon.data,
        status: "issued",
        message: "혜택 적용 가능",
      }),
    );
  } catch (error) {
    console.error("[coupons.verify]", error);
    return NextResponse.json(
      {
        valid: false,
        message:
          "쿠폰 인증 중 오류가 발생했습니다. 서버 Firebase Admin 설정을 확인해주세요.",
      },
      { status: 500 },
    );
  }
}
