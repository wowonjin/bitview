import { createContext, useContext, useState, useEffect } from 'react'
import { 
  onAuthStateChange, 
  signUpUser, 
  signInUser, 
  signOutUser, 
  changeUserPassword,
  getUserProfile,
  updateUserProfile,
  getUserFavorites,
  addFavoriteCoin,
  removeFavoriteCoin,
  getFirebaseErrorMessage,
  setPremiumMembership,
  setVipMembership,
  expireMembership,
  updateExchangeRegistration,
  checkMembershipStatus
} from '../utils/firebase-auth'
import { auth } from '../firebase/config'

const AuthContext = createContext()

export { AuthContext }

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [favoriteCoins, setFavoriteCoins] = useState([])

  useEffect(() => {
    // Firebase 인증 상태 변경 리스너
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      console.log('🔧 Firebase 인증 상태 변경:', firebaseUser ? `로그인: ${firebaseUser.email}` : '로그아웃')
      
      if (firebaseUser) {
        // 사용자가 로그인된 경우
        setUser(firebaseUser)
        console.log('✅ Firebase 사용자 상태 설정 완료')
        
        // 회원가입/로그인 페이지에 있으면 즉시 홈으로 이동
        if (window.location.pathname === '/signup' || window.location.pathname === '/login') {
          console.log('🔧 인증 완료 - 자동 홈 이동')
          setTimeout(() => {
            window.location.href = '/'
          }, 100)
        }
        
        try {
          // Firestore에서 사용자 프로필 가져오기
          let profile = await getUserProfile(firebaseUser.uid)
          console.log('🔧 Firestore 프로필 조회 결과:', profile ? '프로필 존재' : '프로필 없음')
          
          // 프로필이 있지만 displayName이 없는 경우 Firebase Auth의 displayName 사용
          if (profile && !profile.displayName && firebaseUser.displayName) {
            profile.displayName = firebaseUser.displayName
            console.log('🔧 Firebase Auth displayName으로 보완:', firebaseUser.displayName)
          }
          
          // 프로필이 없으면 자동 생성 (Firebase 콘솔에서 생성한 계정의 경우)
          if (!profile) {
            try {
              const { createUserProfile } = await import('../utils/firebase-auth')
              const isAdmin = firebaseUser.email === 'admin@gmail.com'
              
              console.log('🔧 새 프로필 생성 중...')
              await createUserProfile(firebaseUser, {
                displayName: isAdmin ? 'Admin' : firebaseUser.displayName || 'User',
                isAdmin: isAdmin,
                role: isAdmin ? 'admin' : 'user',
                is_premium: isAdmin,
                exchange_registered: false
              })
              
              // 다시 프로필 가져오기
              profile = await getUserProfile(firebaseUser.uid)
              console.log('✅ 새 프로필 생성 완료')
            } catch (profileError) {
              console.error('프로필 생성 중 오류:', profileError)
              
              // 오프라인 오류인 경우 기본 프로필 생성
              if (profileError.message?.includes('네트워크 연결을 확인해 주세요')) {
                const isAdmin = firebaseUser.email === 'admin@gmail.com'
                profile = {
                  id: firebaseUser.uid,
                  displayName: isAdmin ? 'Admin' : firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                  email: firebaseUser.email,
                  isAdmin: isAdmin,
                  role: isAdmin ? 'admin' : 'user',
                  is_premium: isAdmin,
                  exchange_registered: false,
                  createdAt: new Date(),
                  last_login: new Date(),
                  _isOfflineProfile: true // 오프라인 프로필임을 표시
                }
                console.log('🔧 오프라인 상태로 임시 프로필 생성:', profile)
                
                if (isAdmin) {
                  console.log('✅ 오프라인 상태에서 관리자 권한 부여 완료')
                }
              }
            }
          }
          
          // 관리자 계정인 경우 권한 강제 부여
          if (firebaseUser.email === 'admin@gmail.com' && profile) {
            // 관리자 권한이 없는 경우 강제 부여
            if (!profile.isAdmin || profile.role !== 'admin') {
              console.log('🔧 관리자 권한 강제 부여 중...')
              
              profile = {
                ...profile,
                isAdmin: true,
                role: 'admin',
                is_premium: true,
                displayName: profile.displayName || 'Admin'
              }
              
              // Firestore 업데이트 시도 (오프라인 상태여도 로컬 상태는 업데이트)
              try {
                await updateUserProfile(firebaseUser.uid, {
                  isAdmin: true,
                  role: 'admin',
                  is_premium: true
                })
                console.log('✅ 관리자 권한 Firestore 업데이트 완료')
              } catch (updateError) {
                console.log('⚠️ 관리자 권한 Firestore 업데이트 실패 (오프라인 상태일 수 있음):', updateError.message)
              }
            }
          }
          
          setUserProfile(profile)
          console.log('✅ 사용자 프로필 상태 설정 완료:', {
            profileDisplayName: profile?.displayName,
            profileName: profile?.name,
            profileEmail: profile?.email,
            firebaseDisplayName: firebaseUser.displayName
          })
          
          // 관리자 권한 디버깅 로그
          if (firebaseUser.email === 'admin@gmail.com') {
            console.log('🔧 관리자 계정 로그인 디버깅:', {
              firebaseEmail: firebaseUser.email,
              profileEmail: profile?.email,
              isAdmin: profile?.isAdmin,
              role: profile?.role,
              profileData: profile
            })
          }
          
          // 즐겨찾기 목록 로드
          const favorites = await getUserFavorites(firebaseUser.uid)
          setFavoriteCoins(favorites)
          console.log('✅ 즐겨찾기 목록 로드 완료')
          
        } catch (error) {
          console.error('사용자 데이터 로드 실패:', error)
          setUserProfile(null)
          setFavoriteCoins([])
        }
      } else {
        // 사용자가 로그아웃된 경우
        console.log('🔧 사용자 로그아웃 처리 중...')
        setUser(null)
        setUserProfile(null)
        setFavoriteCoins([])
      }
      setLoading(false)
      console.log('✅ 인증 상태 변경 처리 완료')
    })

    // 컴포넌트 언마운트 시 리스너 정리
    return () => unsubscribe()
  }, [])

  const login = async (email, password) => {
    try {
      const result = await signInUser(email, password)
      return { success: true }
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error)
      return { success: false, message: errorMessage }
    }
  }

  const signup = async (userData) => {
    try {
      const { email, password } = userData
      console.log('🔧 AuthContext signup 시작:', { email })
      
      const result = await signUpUser(email, password)
      console.log('✅ Firebase 회원가입 완료:', result)
      
      return { success: true }
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error)
      return { success: false, message: errorMessage }
    }
  }

  const logout = async () => {
    try {
      await signOutUser()
      // 상태는 onAuthStateChange에서 자동으로 업데이트됨
    } catch (error) {
      console.error('로그아웃 실패:', error)
    }
  }

  // 관리자 권한 확인 (다중 조건)
  const isAdmin = userProfile?.isAdmin || 
                  userProfile?.role === 'admin' || 
                  userProfile?.email === 'admin@gmail.com' ||
                  user?.email === 'admin@gmail.com' ||
                  false

  // 관리자 권한 상태 디버깅 로그 (상세)
  if (user?.email === 'admin@gmail.com') {
    console.log('🔧 관리자 권한 상태 확인 (상세):', {
      isAdmin,
      userProfileIsAdmin: userProfile?.isAdmin,
      userProfileRole: userProfile?.role,
      userProfileEmail: userProfile?.email,
      firebaseEmail: user?.email,
      userProfileExists: !!userProfile,
      userProfileData: userProfile
    })
    
    // 관리자 권한이 없는 경우 경고
    if (!isAdmin) {
      console.warn('⚠️ admin@gmail.com 계정이지만 관리자 권한이 없습니다!')
      console.warn('다음 중 하나를 실행해주세요:')
      console.warn('1. setupAdminAccount("admin@gmail.com", "admin123!")')
      console.warn('2. URL에 ?setup=admin 추가')
    }
  }

  // 프리미엄 상태 확인 (관리자 제외한 순수 프리미엄 상태)
  const isPremium = userProfile?.exchange_registered || 
                   userProfile?.is_premium || 
                   false

  // 프리미엄 활성화 (거래소 가입 완료 시 호출)
  const activatePremium = async (exchangeEmail = null, exchangeType = null) => {
    if (!user) return { success: false, message: '로그인이 필요합니다' }

    try {
      const updates = {
        exchange_registered: true,
        is_premium: true,
        ...(exchangeEmail && { exchange_email: exchangeEmail }),
        ...(exchangeType && { exchange_type: exchangeType })
      }
      
      await updateUserProfile(user.uid, updates)
      
      // 로컬 상태 업데이트
      setUserProfile(prev => ({
        ...prev,
        ...updates
      }))
      
      return { success: true }
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error)
      return { success: false, message: errorMessage }
    }
  }

  // 관심 코인 추가/제거
  const toggleFavoriteCoin = async (coinId) => {
    if (!user) return { success: false, message: '로그인이 필요합니다' }

    const isCurrentlyFavorite = favoriteCoins.includes(coinId)
    
    try {
      if (isCurrentlyFavorite) {
        await removeFavoriteCoin(user.uid, coinId)
        setFavoriteCoins(prev => prev.filter(id => id !== coinId))
      } else {
        await addFavoriteCoin(user.uid, coinId)
        setFavoriteCoins(prev => [...prev, coinId])
      }
      
      return { success: true }
    } catch (error) {
      console.error('즐겨찾기 토글 실패:', error)
      return { success: false, message: getFirebaseErrorMessage(error) }
    }
  }

  // 사용자 정보 업데이트
  const updateUser = async (updatedData) => {
    if (!user) return { success: false, message: '로그인이 필요합니다' }

    try {
      // Firestore 업데이트
      await updateUserProfile(user.uid, updatedData)
      
      // displayName이 변경된 경우 Firebase Auth도 업데이트
      if (updatedData.displayName && auth.currentUser) {
        try {
          const { updateProfile } = await import('firebase/auth')
          await updateProfile(auth.currentUser, {
            displayName: updatedData.displayName
          })
          console.log('✅ Firebase Auth displayName 업데이트 완료')
        } catch (authError) {
          console.log('⚠️ Firebase Auth displayName 업데이트 실패:', authError.message)
        }
      }
      
      // 로컬 상태 업데이트
      setUserProfile(prev => ({
        ...prev,
        ...updatedData
      }))
      
      return { success: true }
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error)
      return { success: false, message: errorMessage }
    }
  }

  // 비밀번호 변경
  const changePassword = async (passwordData) => {
    try {
      const { newPassword } = passwordData
      await changeUserPassword(newPassword)
      return { success: true }
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error)
      return { success: false, message: errorMessage }
    }
  }

  // 즐겨찾기 새로고침
  const loadUserFavorites = async () => {
    if (!user) return

    try {
      const favorites = await getUserFavorites(user.uid)
      setFavoriteCoins(favorites)
    } catch (error) {
      console.error('즐겨찾기 로드 실패:', error)
    }
  }

  // 프리미엄 회원 등급 설정
  const setPremium = async (durationDays = 30) => {
    if (!user) return { success: false, message: '로그인이 필요합니다' }

    try {
      const result = await setPremiumMembership(user.uid, durationDays)
      
      // 로컬 상태 업데이트
      setUserProfile(prev => ({
        ...prev,
        is_premium: true,
        premium_expires: result.expires.toISOString(),
        membership_type: 'premium'
      }))
      
      return { success: true, expires: result.expires }
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error)
      return { success: false, message: errorMessage }
    }
  }

  // VIP 회원 등급 설정
  const setVip = async (durationDays = 365) => {
    if (!user) return { success: false, message: '로그인이 필요합니다' }

    try {
      const result = await setVipMembership(user.uid, durationDays)
      
      // 로컬 상태 업데이트
      setUserProfile(prev => ({
        ...prev,
        is_premium: true,
        is_vip: true,
        premium_expires: result.expires.toISOString(),
        membership_type: 'vip'
      }))
      
      return { success: true, expires: result.expires }
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error)
      return { success: false, message: errorMessage }
    }
  }

  // 거래소 등록 상태 업데이트
  const updateExchangeStatus = async (exchangeEmail, exchangeType = null) => {
    if (!user) return { success: false, message: '로그인이 필요합니다' }

    try {
      await updateExchangeRegistration(user.uid, exchangeEmail, exchangeType)
      
      // 로컬 상태 업데이트
      setUserProfile(prev => ({
        ...prev,
        exchange_registered: true,
        exchange_email: exchangeEmail,
        ...(exchangeType && { exchange_type: exchangeType })
      }))
      
      return { success: true }
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error)
      return { success: false, message: errorMessage }
    }
  }

  // 회원 등급 상태 확인
  const getMembershipStatus = async () => {
    if (!user) return null

    try {
      const status = await checkMembershipStatus(user.uid)
      
      // 만료된 경우 로컬 상태도 업데이트
      if (status?.expired) {
        setUserProfile(prev => ({
          ...prev,
          is_premium: false,
          is_vip: false,
          premium_expires: null,
          membership_type: 'basic'
        }))
      }
      
      return status
    } catch (error) {
      console.error('회원 등급 상태 확인 실패:', error)
      return null
    }
  }

  // Firebase Auth 사용자 정보와 Firestore 프로필 정보를 결합
  const combinedUser = user ? {
    ...(userProfile || {}),
    email: user.email, // Firebase Auth의 email 사용 (항상 존재)
    uid: user.uid,
    displayName: userProfile?.displayName || user.displayName || user.email?.split('@')[0] || 'User'
  } : null

  // 디버깅을 위한 로그
  if (user && process.env.NODE_ENV === 'development') {
    console.log('🔧 AuthContext - 사용자 정보 결합:', {
      hasFirebaseUser: !!user,
      hasUserProfile: !!userProfile,
      firebaseEmail: user.email,
      profileEmail: userProfile?.email,
      combinedUserEmail: combinedUser?.email,
      combinedUser
    })
  }

  const value = {
    user: combinedUser, // 결합된 사용자 정보
    firebaseUser: user, // Firebase 인증 사용자 정보
    login,
    signup,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin,
    isPremium,
    activatePremium,
    favoriteCoins,
    toggleFavoriteCoin,
    updateUser,
    changePassword,
    loadUserFavorites,
    // 회원 등급 관리 함수들
    setPremium,
    setVip,
    updateExchangeStatus,
    getMembershipStatus
  }

  // 개발 환경에서 브라우저 콘솔에서 관리자 권한 상태를 확인할 수 있는 전역 함수
  if (process.env.NODE_ENV === 'development') {
    window.checkAdminStatus = () => {
      console.log('🔧 관리자 권한 상태 확인:', {
        isAdmin,
        isPremium,
        isAuthenticated: !!user,
        firebaseUser: user,
        userProfile: userProfile,
        adminConditions: {
          profileIsAdmin: userProfile?.isAdmin,
          profileRole: userProfile?.role,
          profileEmail: userProfile?.email,
          firebaseEmail: user?.email
        }
      })
    }
    

  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 