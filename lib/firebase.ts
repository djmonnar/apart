import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * Firebase 클라이언트 초기화.
 * 아래 값은 Firebase 웹 앱의 "공개(publishable) 설정"으로, 클라이언트에 노출되어도
 * 안전한 식별자입니다. 실제 데이터 보호는 Firestore 보안 규칙으로 합니다.
 * (env로 덮어쓰고 싶으면 NEXT_PUBLIC_FIREBASE_* 사용)
 */
const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ??
    "AIzaSyB6BZVN4C9RTH_F_YHBUHBLrn1W_AdNhZc",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ??
    "city-5725d.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "city-5725d",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    "city-5725d.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "1032897296540",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ??
    "1:1032897296540:web:38f51ba5fd32297abe5559",
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
