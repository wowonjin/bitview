// Firebase 인증 및 Firestore 관련 유틸리티
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  updatePassword,
  sendPasswordResetEmail,
  onAuthStateChanged 
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from "firebase/firestore";
import { auth, db } from "../firebase/config";

// 네트워크 연결 상태 체크
const checkNetworkConnection = () => {
  return navigator.onLine;
};

// 재시도 헬퍼 함수
const retryWithBackoff = async (fn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      const isOfflineError = error.code === 'unavailable' || 
                           error.message.includes('offline') ||
                           error.message.includes('Failed to get document') ||
                           error.message.includes('client is offline');
      
      if (isOfflineError && i < maxRetries - 1) {
        console.log(`재시도 ${i + 1}/${maxRetries} - 오프라인 오류:`, error.message);
        
        // 네트워크 연결 상태 확인
        if (!checkNetworkConnection()) {
          console.log('네트워크 연결이 끊어진 상태입니다.');
          throw new Error('네트워크 연결을 확인해 주세요.');
        }
        
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i))); // 지수 백오프
        continue;
      }
      throw error;
    }
  }
};

// 사용자 프로필 생성 (회원가입 시)
export const createUserProfile = async (user, additionalData = {}) => {
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  
  try {
    const userDoc = await retryWithBackoff(async () => {
      return await getDoc(userRef);
    });

    if (!userDoc.exists()) {
      const { displayName, email, photoURL } = user;
      const createdAt = serverTimestamp();

      const userData = {
        displayName,
        email,
        photoURL,
        createdAt,
        exchange_registered: false,
        is_premium: false,
        premium_expires: null,
        last_login: serverTimestamp(),
        ...additionalData
      };

      // 관리자 계정인 경우 디버깅 로그
      if (email === 'admin@gmail.com') {
        console.log('🔧 관리자 프로필 생성 중:', {
          email,
          userData,
          isAdmin: userData.isAdmin,
          role: userData.role
        });
      }

      await retryWithBackoff(async () => {
        await setDoc(userRef, userData);
      });
    }

    return userRef;
  } catch (error) {
    console.error('사용자 프로필 생성 실패:', error);
    
    // 오프라인 오류인 경우 더 자세한 정보 제공
    if (error.code === 'unavailable' || error.message.includes('offline')) {
      throw new Error('네트워크 연결을 확인해 주세요. 잠시 후 다시 시도해 주세요.');
    }
    
    throw error;
  }
};

// 사용자 프로필 업데이트
export const updateUserProfile = async (userId, updates) => {
  if (!userId) throw new Error('사용자 ID가 필요합니다');

  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updated_at: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('사용자 프로필 업데이트 실패:', error);
    throw error;
  }
};

// 사용자 정보 가져오기
export const getUserProfile = async (userId) => {
  if (!userId) return null;

  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await retryWithBackoff(async () => {
      return await getDoc(userRef);
    });
    
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    
    return null;
  } catch (error) {
    console.error('사용자 정보 가져오기 실패:', error);
    
    // 오프라인 오류인 경우 null 반환 (로그인 프로세스 중단 방지)
    if (error.code === 'unavailable' || error.message.includes('offline')) {
      console.log('오프라인 상태에서 사용자 정보 가져오기 실패 - null 반환');
      return null;
    }
    
    throw error;
  }
};

// 즐겨찾기 코인 추가
export const addFavoriteCoin = async (userId, coinId) => {
  if (!userId || !coinId) return;

  try {
    const favoritesRef = collection(db, 'favorites');
    await addDoc(favoritesRef, {
      userId,
      coinId,
      createdAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('즐겨찾기 추가 실패:', error);
    throw error;
  }
};

// 즐겨찾기 코인 제거
export const removeFavoriteCoin = async (userId, coinId) => {
  if (!userId || !coinId) return;

  try {
    const favoritesRef = collection(db, 'favorites');
    const q = query(favoritesRef, where('userId', '==', userId), where('coinId', '==', coinId));
    const querySnapshot = await getDocs(q);
    
    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
    
    return { success: true };
  } catch (error) {
    console.error('즐겨찾기 제거 실패:', error);
    throw error;
  }
};

// 사용자 즐겨찾기 목록 가져오기
export const getUserFavorites = async (userId) => {
  if (!userId) return [];

  try {
    const favoritesRef = collection(db, 'favorites');
    const q = query(favoritesRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const favorites = [];
    querySnapshot.forEach((doc) => {
      favorites.push(doc.data().coinId);
    });
    
    return favorites;
  } catch (error) {
    console.error('즐겨찾기 목록 가져오기 실패:', error);
    throw error;
  }
};

// 사용자 회원가입
export const signUpUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 사용자 프로필 업데이트
    await updateProfile(user, {
      displayName: displayName
    });

    // Firestore에 사용자 정보 저장 (재시도 로직 포함)
    try {
      await createUserProfile(user, { displayName });
    } catch (profileError) {
      console.error('프로필 생성 중 오류:', profileError);
      
      // 오프라인 오류인 경우 경고 메시지와 함께 성공 처리
      if (profileError.message?.includes('네트워크 연결을 확인해 주세요')) {
        console.log('오프라인 상태에서 회원가입 완료 - 프로필은 다음 로그인 시 생성됩니다.');
        return { 
          success: true, 
          user, 
          warning: '회원가입이 완료되었습니다. 프로필 설정은 다음 로그인 시 완료됩니다.'
        };
      }
      
      // 다른 오류인 경우 재시도 권장
      throw profileError;
    }

    return { success: true, user };
  } catch (error) {
    console.error('회원가입 실패:', error);
    throw error;
  }
};

// 사용자 로그인
export const signInUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 마지막 로그인 시간 업데이트
    await updateUserProfile(user.uid, {
      last_login: serverTimestamp()
    });

    return { success: true, user };
  } catch (error) {
    console.error('로그인 실패:', error);
    throw error;
  }
};

// 사용자 로그아웃
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('로그아웃 실패:', error);
    throw error;
  }
};

// 비밀번호 변경
export const changeUserPassword = async (newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('로그인된 사용자가 없습니다');

    await updatePassword(user, newPassword);
    return { success: true };
  } catch (error) {
    console.error('비밀번호 변경 실패:', error);
    throw error;
  }
};

// 비밀번호 재설정 이메일 발송
export const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('비밀번호 재설정 이메일 발송 실패:', error);
    throw error;
  }
};

// Firebase 인증 상태 변경 리스너
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// 에러 메시지 한국어 변환
export const getFirebaseErrorMessage = (error) => {
  switch (error.code) {
    case 'auth/user-not-found':
      return '등록되지 않은 이메일입니다.';
    case 'auth/wrong-password':
      return '비밀번호가 올바르지 않습니다.';
    case 'auth/email-already-in-use':
      return '이미 사용 중인 이메일입니다.';
    case 'auth/weak-password':
      return '비밀번호는 6자 이상이어야 합니다.';
    case 'auth/invalid-email':
      return '유효하지 않은 이메일 형식입니다.';
    case 'auth/too-many-requests':
      return '너무 많은 요청으로 인해 잠시 후 다시 시도해 주세요.';
    case 'auth/network-request-failed':
      return '네트워크 연결을 확인해 주세요.';
    default:
      return error.message || '알 수 없는 오류가 발생했습니다.';
  }
}; 

// 관리자 계정 생성 (개발용)
export const createAdminUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 관리자 프로필 생성
    await createUserProfile(user, { 
      displayName: 'Admin',
      isAdmin: true,
      role: 'admin' 
    });

    return { success: true, user };
  } catch (error) {
    console.error('관리자 계정 생성 실패:', error);
    throw error;
  }
}; 