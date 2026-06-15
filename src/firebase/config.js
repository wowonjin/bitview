// Firebase 설정 및 초기화
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const env = (key, devFallback) =>
  import.meta.env[key] ?? (import.meta.env.DEV ? devFallback : undefined);

// Firebase 설정 — Vercel Production: VITE_* 필수 / 로컬: .env 또는 dev 기본값
const firebaseConfig = {
  apiKey: env("VITE_FIREBASE_API_KEY", "AIzaSyAyOTNyk7S8ZY6sTsvUGCrxlQhPfjKYK_Y"),
  authDomain: env("VITE_FIREBASE_AUTH_DOMAIN", "bitview-7f55b.firebaseapp.com"),
  projectId: env("VITE_FIREBASE_PROJECT_ID", "bitview-7f55b"),
  storageBucket: env("VITE_FIREBASE_STORAGE_BUCKET", "bitview-7f55b.firebasestorage.app"),
  messagingSenderId: env("VITE_FIREBASE_MESSAGING_SENDER_ID", "878897672847"),
  appId: env("VITE_FIREBASE_APP_ID", "1:878897672847:web:489d377654fe6a695df6fa"),
  measurementId: env("VITE_FIREBASE_MEASUREMENT_ID", "G-XM53B38KP1"),
};

if (!import.meta.env.DEV) {
  const required = [
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_APP_ID",
  ].filter((key) => !import.meta.env[key]);
  if (required.length > 0) {
    throw new Error(
      `Firebase 환경 변수가 없습니다: ${required.join(", ")}. Vercel Environment Variables를 설정하세요.`
    );
  }
}

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Firebase 서비스 초기화
export const auth = getAuth(app);
export const db = getFirestore(app);

// Firestore 오프라인 캐싱 설정 (개발 환경에서는 비활성화)
if (process.env.NODE_ENV === 'development') {
  try {
    // 개발 환경에서는 오프라인 캐싱을 비활성화
    import('firebase/firestore').then(({ disableNetwork, enableNetwork }) => {
      // 필요에 따라 네트워크 제어 가능
    });
  } catch (error) {
    console.log('Firestore 네트워크 설정 중 오류:', error);
  }
}

// Analytics (선택사항 - 개발 환경에서는 비활성화)
let analytics = null;
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  analytics = getAnalytics(app);
}
export { analytics };

export default app; 