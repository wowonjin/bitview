// Firebase 설정 및 초기화
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyAyOTNyk7S8ZY6sTsvUGCrxlQhPfjKYK_Y",
  authDomain: "bitview-7f55b.firebaseapp.com",
  projectId: "bitview-7f55b",
  storageBucket: "bitview-7f55b.firebasestorage.app",
  messagingSenderId: "878897672847",
  appId: "1:878897672847:web:489d377654fe6a695df6fa",
  measurementId: "G-XM53B38KP1"
};

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