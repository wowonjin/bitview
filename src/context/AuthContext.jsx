import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, getToken, setToken, removeToken, handleAPIError } from '../utils/api'
import { getMigrationStatus, runMigration } from '../utils/migration'

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
  const [loading, setLoading] = useState(true)
  const [favoriteCoins, setFavoriteCoins] = useState([])

  useEffect(() => {
    // 페이지 로드 시 토큰으로 사용자 정보 확인 및 마이그레이션 실행
    const initializeAuth = async () => {
      // 마이그레이션 상태 확인
      const migrationStatus = getMigrationStatus()
      
      if (migrationStatus.needsMigration) {
        console.log('기존 데이터 마이그레이션을 시작합니다...')
        try {
          const migrationResult = await runMigration()
          if (migrationResult.success) {
            console.log('마이그레이션이 완료되었습니다.', migrationResult)
          } else {
            console.error('마이그레이션 실패:', migrationResult.message)
          }
        } catch (error) {
          console.error('마이그레이션 중 오류 발생:', error)
        }
      }

      // 인증 초기화
      const token = getToken()
      if (token) {
        try {
          const response = await authAPI.getMe()
          setUser(response.user)
          // 즐겨찾기 목록 로드
          loadUserFavorites()
        } catch (error) {
          console.error('사용자 정보 로드 실패:', error)
          removeToken()
          setUser(null)
        }
      }
      setLoading(false)
    }

    initializeAuth()
  }, [])

  // 사용자별 관심 코인 로드
  const loadUserFavorites = async () => {
    if (user) {
      try {
        const response = await authAPI.getFavorites()
        setFavoriteCoins(response.favorites)
      } catch (error) {
        console.error('즐겨찾기 로드 실패:', error)
        setFavoriteCoins([])
      }
    }
  }

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password })
      setToken(response.token)
      setUser(response.user)
      // 로그인 시 관심 코인 로드
      loadUserFavorites()
      return { success: true }
    } catch (error) {
      const errorMessage = handleAPIError(error)
      return { success: false, message: errorMessage }
    }
  }

  const signup = async (userData) => {
    try {
      const response = await authAPI.signup(userData)
      setToken(response.token)
      setUser(response.user)
      // 회원가입 시 관심 코인 로드
      loadUserFavorites()
      return { success: true }
    } catch (error) {
      const errorMessage = handleAPIError(error)
      return { success: false, message: errorMessage }
    }
  }

  const logout = () => {
    setUser(null)
    setFavoriteCoins([])
    removeToken()
  }

  // 프리미엄 상태 확인 (거래소 가입 여부로 판단)
  const isPremium = user?.exchange_registered || user?.is_premium || user?.email === 'admin@gmail.com' || false

  // 프리미엄 활성화 (거래소 가입 완료 시 호출)
  const activatePremium = async (exchangeEmail = null) => {
    if (user) {
      try {
        const response = await authAPI.updateProfile({
          exchangeRegistered: true,
          ...(exchangeEmail && { exchangeEmail })
        })
        setUser(response.user)
        return { success: true }
      } catch (error) {
        const errorMessage = handleAPIError(error)
        return { success: false, message: errorMessage }
      }
    }
  }

  // 관심 코인 추가/제거
  const toggleFavoriteCoin = async (coinId) => {
    if (!user) return

    const action = favoriteCoins.includes(coinId) ? 'remove' : 'add'
    
    try {
      await authAPI.toggleFavorite(coinId, action)
      
      const newFavorites = action === 'add'
        ? [...favoriteCoins, coinId]
        : favoriteCoins.filter(id => id !== coinId)
      
      setFavoriteCoins(newFavorites)
      return { success: true }
    } catch (error) {
      console.error('즐겨찾기 토글 실패:', error)
      return { success: false, message: handleAPIError(error) }
    }
  }

  // 사용자 정보 업데이트
  const updateUser = async (updatedData) => {
    if (!user) return

    try {
      const response = await authAPI.updateProfile(updatedData)
      setUser(response.user)
      return { success: true }
    } catch (error) {
      const errorMessage = handleAPIError(error)
      return { success: false, message: errorMessage }
    }
  }

  // 비밀번호 변경
  const changePassword = async (passwordData) => {
    try {
      await authAPI.changePassword(passwordData)
      return { success: true }
    } catch (error) {
      const errorMessage = handleAPIError(error)
      return { success: false, message: errorMessage }
    }
  }

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.email === 'admin@gmail.com',
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