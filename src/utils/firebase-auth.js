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

// 사용자 프로필 생성 (회원가입 시)
export const createUserProfile = async (user, additionalData = {}) => {
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    const { displayName, email, photoURL } = user;
    const createdAt = serverTimestamp();

    try {
      await setDoc(userRef, {
        displayName,
        email,
        photoURL,
        createdAt,
        exchange_registered: false,
        is_premium: false,
        premium_expires: null,
        last_login: serverTimestamp(),
        ...additionalData
      });
    } catch (error) {
      console.error('사용자 프로필 생성 실패:', error);
      throw error;
    }
  }

  return userRef;
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
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    
    return null;
  } catch (error) {
    console.error('사용자 정보 가져오기 실패:', error);
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

    // Firestore에 사용자 정보 저장
    await createUserProfile(user, { displayName });

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