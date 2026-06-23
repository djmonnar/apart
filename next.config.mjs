/** @type {import('next').NextConfig} */
const nextConfig = {
  // firebase-admin(및 ESM 전용 의존성 jose 등)을 번들하지 않고 Node 외부 모듈로 로드.
  // 서버 API 라우트에서 ERR_REQUIRE_ESM 방지.
  experimental: {
    serverComponentsExternalPackages: ["firebase-admin"],
  },
};

export default nextConfig;
