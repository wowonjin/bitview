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

// 재시도 헬퍼 함수 (타임아웃 추가)
const retryWithBackoff = async (fn, maxRetries = 3, delay = 1000, timeout = 30000) => {
  const startTime = Date.now();
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      // 타임아웃 체크
      if (Date.now() - startTime > timeout) {
        throw new Error('작업 시간이 초과되었습니다. 네트워크 연결을 확인해 주세요.');
      }
      
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
        
        const retryDelay = delay * Math.pow(2, i);
        console.log(`${retryDelay}ms 후 재시도합니다...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
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

      // additionalData에서 displayName이 전달되면 그것을 우선 사용
      const finalDisplayName = additionalData.displayName || displayName || 'User';

      const userData = {
        displayName: finalDisplayName,
        email,
        photoURL,
        createdAt,
        exchange_registered: false,
        is_premium: false,
        premium_expires: null,
        last_login: serverTimestamp(),
        ...additionalData,
        // displayName은 마지막에 다시 설정해서 덮어쓰기 방지
        displayName: finalDisplayName
      };

      // 디버깅 로그 추가
      console.log('🔧 Firestore 프로필 생성 데이터:', {
        userId: user.uid,
        email: userData.email,
        displayName: userData.displayName,
        additionalDisplayName: additionalData.displayName,
        userDisplayName: displayName,
        finalDisplayName: finalDisplayName
      });

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
      
      console.log('✅ Firestore 프로필 저장 완료:', {
        userId: user.uid,
        displayName: userData.displayName
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
      const userData = { id: userDoc.id, ...userDoc.data() };
      console.log('🔧 Firestore에서 가져온 사용자 데이터:', {
        userId: userData.id,
        displayName: userData.displayName,
        name: userData.name,
        email: userData.email
      });
      return userData;
    }
    
    console.log('🔧 Firestore에서 사용자 프로필을 찾을 수 없음:', userId);
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

// 사용자 회원가입 (Firebase 인증 + Firestore 프로필 생성)
export const signUpUser = async (email, password, name) => {
  console.log('🔧 회원가입 시작:', { email, name });
  
  try {
    // Firebase 인증
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('✅ Firebase 인증 성공:', user.uid);

    // Firestore 프로필 생성 (권한 오류 시 무시)
    try {
      console.log('🔧 Firestore 프로필 생성 시작:', { 
        userId: user.uid,
        name: name
      });
      
      await createUserProfile(user, { 
        displayName: name || 'User',
        name: name || 'User'
      });
      console.log('✅ Firestore 프로필 생성 완료');
    } catch (firestoreError) {
      console.log('⚠️ Firestore 프로필 생성 실패:', firestoreError.message);
      
      // 권한 오류인 경우 특별 처리
      if (firestoreError.code === 'permission-denied') {
        console.log('🔧 Firestore 권한 오류 - Firebase Console에서 보안 규칙 확인 필요');
        console.log('임시로 Firebase Authentication만으로 회원가입 완료');
      }
      
      // Firestore 실패해도 회원가입은 성공으로 처리 (Authentication은 성공했으므로)
    }

    // Firebase 인증 성공하면 즉시 성공 반환
    return { success: true, user };
    
  } catch (error) {
    console.error('❌ 회원가입 실패:', error);
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

// 프리미엄 회원 등급 설정
export const setPremiumMembership = async (userId, durationDays = 30) => {
  if (!userId) throw new Error('사용자 ID가 필요합니다');

  try {
    const premiumExpires = new Date();
    premiumExpires.setDate(premiumExpires.getDate() + durationDays);

    const updates = {
      is_premium: true,
      premium_expires: premiumExpires.toISOString(),
      membership_type: 'premium',
      premium_activated_at: serverTimestamp()
    };

    await updateUserProfile(userId, updates);
    console.log(`✅ 프리미엄 회원 등급 설정 완료 (${durationDays}일)`);
    
    return { success: true, expires: premiumExpires };
  } catch (error) {
    console.error('프리미엄 회원 등급 설정 실패:', error);
    throw error;
  }
};

// VIP 회원 등급 설정
export const setVipMembership = async (userId, durationDays = 365) => {
  if (!userId) throw new Error('사용자 ID가 필요합니다');

  try {
    const vipExpires = new Date();
    vipExpires.setDate(vipExpires.getDate() + durationDays);

    const updates = {
      is_premium: true,
      is_vip: true,
      premium_expires: vipExpires.toISOString(),
      membership_type: 'vip',
      vip_activated_at: serverTimestamp()
    };

    await updateUserProfile(userId, updates);
    console.log(`✅ VIP 회원 등급 설정 완료 (${durationDays}일)`);
    
    return { success: true, expires: vipExpires };
  } catch (error) {
    console.error('VIP 회원 등급 설정 실패:', error);
    throw error;
  }
};

// 회원 등급 만료 처리
export const expireMembership = async (userId) => {
  if (!userId) throw new Error('사용자 ID가 필요합니다');

  try {
    const updates = {
      is_premium: false,
      is_vip: false,
      premium_expires: null,
      membership_type: 'basic',
      membership_expired_at: serverTimestamp()
    };

    await updateUserProfile(userId, updates);
    console.log('✅ 회원 등급 만료 처리 완료');
    
    return { success: true };
  } catch (error) {
    console.error('회원 등급 만료 처리 실패:', error);
    throw error;
  }
};

// 거래소 등록 상태 업데이트
export const updateExchangeRegistration = async (userId, exchangeEmail) => {
  if (!userId) throw new Error('사용자 ID가 필요합니다');

  try {
    const updates = {
      exchange_registered: true,
      exchange_email: exchangeEmail,
      exchange_registered_at: serverTimestamp()
    };

    await updateUserProfile(userId, updates);
    console.log('✅ 거래소 등록 상태 업데이트 완료');
    
    return { success: true };
  } catch (error) {
    console.error('거래소 등록 상태 업데이트 실패:', error);
    throw error;
  }
};

// 회원 등급 확인
export const checkMembershipStatus = async (userId) => {
  if (!userId) return null;

  try {
    const userProfile = await getUserProfile(userId);
    if (!userProfile) return null;

    const now = new Date();
    const premiumExpires = userProfile.premium_expires ? new Date(userProfile.premium_expires) : null;
    const isExpired = premiumExpires && now > premiumExpires;

    // 만료된 경우 자동으로 등급 변경
    if (isExpired && userProfile.is_premium) {
      await expireMembership(userId);
      return { 
        membership_type: 'basic', 
        is_premium: false, 
        is_vip: false,
        expired: true 
      };
    }

    return {
      membership_type: userProfile.membership_type || 'basic',
      is_premium: userProfile.is_premium || false,
      is_vip: userProfile.is_vip || false,
      premium_expires: userProfile.premium_expires,
      exchange_registered: userProfile.exchange_registered || false,
      expired: false
    };
  } catch (error) {
    console.error('회원 등급 확인 실패:', error);
    return null;
  }
};

// 모든 사용자 목록 가져오기 (관리자 전용)
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await retryWithBackoff(async () => {
      return await getDocs(usersRef);
    });
    
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    return users;
  } catch (error) {
    console.error('사용자 목록 가져오기 실패:', error);
    throw error;
  }
};

// 사용자 삭제 (관리자 전용)
export const deleteUserFromFirestore = async (userId) => {
  if (!userId) throw new Error('사용자 ID가 필요합니다');

  try {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
    
    return { success: true };
  } catch (error) {
    console.error('사용자 삭제 실패:', error);
    throw error;
  }
};

// 사용자 권한 업데이트 (관리자 전용)
export const updateUserRole = async (userId, role, isPremium = false) => {
  if (!userId || !role) throw new Error('사용자 ID와 역할이 필요합니다');

  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role,
      is_premium: isPremium,
      updated_at: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('사용자 권한 업데이트 실패:', error);
    throw error;
  }
}; 