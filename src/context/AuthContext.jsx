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
  getFirebaseErrorMessage
} from '../utils/firebase-auth'

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
      if (firebaseUser) {
        // 사용자가 로그인된 경우
        setUser(firebaseUser)
        
        try {
          // Firestore에서 사용자 프로필 가져오기
          let profile = await getUserProfile(firebaseUser.uid)
          
          // 프로필이 없으면 자동 생성 (Firebase 콘솔에서 생성한 계정의 경우)
          if (!profile) {
            const { createUserProfile } = await import('../utils/firebase-auth')
            const isAdmin = firebaseUser.email === 'admin@gmail.com'
            
            await createUserProfile(firebaseUser, {
              displayName: isAdmin ? 'Admin' : firebaseUser.displayName || 'User',
              isAdmin: isAdmin,
              role: isAdmin ? 'admin' : 'user',
              is_premium: isAdmin,
              exchange_registered: false
            })
            
            // 다시 프로필 가져오기
            profile = await getUserProfile(firebaseUser.uid)
          }
          
          setUserProfile(profile)
          
          // 즐겨찾기 목록 로드
          const favorites = await getUserFavorites(firebaseUser.uid)
          setFavoriteCoins(favorites)
        } catch (error) {
          console.error('사용자 데이터 로드 실패:', error)
          setUserProfile(null)
          setFavoriteCoins([])
        }
      } else {
        // 사용자가 로그아웃된 경우
        setUser(null)
        setUserProfile(null)
        setFavoriteCoins([])
      }
      setLoading(false)
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
      const { email, password, displayName } = userData
      const result = await signUpUser(email, password, displayName)
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

  // 프리미엄 상태 확인
  const isPremium = userProfile?.exchange_registered || 
                   userProfile?.is_premium || 
                   userProfile?.email === 'admin@gmail.com' || 
                   false

  // 프리미엄 활성화 (거래소 가입 완료 시 호출)
  const activatePremium = async (exchangeEmail = null) => {
    if (!user) return { success: false, message: '로그인이 필요합니다' }

    try {
      const updates = {
        exchange_registered: true,
        is_premium: true,
        ...(exchangeEmail && { exchange_email: exchangeEmail })
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
      await updateUserProfile(user.uid, updatedData)
      
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

  const value = {
    user: userProfile, // Firestore의 사용자 프로필 정보
    firebaseUser: user, // Firebase 인증 사용자 정보
    login,
    signup,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: userProfile?.email === 'admin@gmail.com',
    isPremium,
    activatePremium,
    favoriteCoins,
    toggleFavoriteCoin,
    updateUser,
    changePassword,
    loadUserFavorites
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 