import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Firebase 클라이언트 초기화.
 * Firebase 웹 앱 설정은 .env.local의 NEXT_PUBLIC_FIREBASE_* 값으로만 주입한다.
 * 실제 데이터 보호는 Firestore 보안 규칙으로 한다.
 */

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firestoreDb: Firestore | null = null;

function firebaseConfigError() {
  return Object.assign(
    new Error("Firebase 환경변수가 설정되지 않았습니다."),
    { code: "firebase/not-configured" },
  );
}

function getFirebaseConfig() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  if (Object.values(config).some((value) => !value)) {
    throw firebaseConfigError();
  }

  return config as {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
}

export function getFirebaseApp() {
  if (firebaseApp) return firebaseApp;
  firebaseApp = getApps().length ? getApp() : initializeApp(getFirebaseConfig());
  return firebaseApp;
}

export function getFirebaseAuth() {
  if (firebaseAuth) return firebaseAuth;
  firebaseAuth = getAuth(getFirebaseApp());
  return firebaseAuth;
}

export function getFirebaseDb() {
  if (firestoreDb) return firestoreDb;
  firestoreDb = getFirestore(getFirebaseApp());
  return firestoreDb;
}
