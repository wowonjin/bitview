import { createContext, useContext, useState, useEffect } from 'react'

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
    // 페이지 로드 시 localStorage에서 사용자 정보 확인
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        // users 배열에서 최신 정보를 가져와서 동기화
        const users = JSON.parse(localStorage.getItem('users') || '[]')
        const latestUserInfo = users.find(u => u.email === parsedUser.email)
        
        if (latestUserInfo) {
          // users 배열의 최신 정보로 업데이트
          const updatedUser = {
            ...parsedUser,
            exchangeRegistered: latestUserInfo.exchangeRegistered || false,
            exchangeEmail: latestUserInfo.exchangeEmail || null,
            id: latestUserInfo.id
          }
          setUser(updatedUser)
          localStorage.setItem('user', JSON.stringify(updatedUser))
          // 사용자의 관심 코인 로드
          loadUserFavorites(updatedUser.email)
        } else {
          setUser(parsedUser)
          loadUserFavorites(parsedUser.email)
        }
      } catch (error) {
        console.error('Failed to parse user data:', error)
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  // 사용자별 관심 코인 로드
  const loadUserFavorites = (userEmail) => {
    if (userEmail) {
      const userFavorites = localStorage.getItem(`favorites_${userEmail}`)
      if (userFavorites) {
        setFavoriteCoins(JSON.parse(userFavorites))
      } else {
        setFavoriteCoins([])
      }
    }
  }

  const login = (userData) => {
    // users 배열에서 해당 사용자의 최신 정보를 가져옴
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const fullUserInfo = users.find(u => u.email === userData.email)
    
    let finalUserData = userData
    
    if (fullUserInfo) {
      // users 배열에 있는 사용자라면 모든 정보를 포함
      finalUserData = {
        ...userData,
        exchangeRegistered: fullUserInfo.exchangeRegistered || false,
        exchangeEmail: fullUserInfo.exchangeEmail || null,
        id: fullUserInfo.id
      }
    }
    
    setUser(finalUserData)
    localStorage.setItem('user', JSON.stringify(finalUserData))
    // 로그인 시 관심 코인 로드
    loadUserFavorites(finalUserData.email)
  }

  const logout = () => {
    setUser(null)
    setFavoriteCoins([])
    localStorage.removeItem('user')
  }

  // 프리미엄 상태 확인 (거래소 가입 여부로 판단)
  const isPremium = user?.exchangeRegistered || user?.email === 'admin@gmail.com' || false

  // 프리미엄 활성화 (거래소 가입 완료 시 호출)
  const activatePremium = (exchangeEmail = null) => {
    if (user) {
      const updatedUser = { 
        ...user, 
        exchangeRegistered: true,
        ...(exchangeEmail && { exchangeEmail })
      }
      
      // 현재 사용자 정보 업데이트
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      // users 배열에서도 해당 사용자 정보 업데이트
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const userIndex = users.findIndex(u => u.email === user.email)
      
      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          exchangeRegistered: true,
          ...(exchangeEmail && { exchangeEmail })
        }
        localStorage.setItem('users', JSON.stringify(users))
      }
    }
  }

  // 관심 코인 추가/제거
  const toggleFavoriteCoin = (coinId) => {
    if (!user) return

    const newFavorites = favoriteCoins.includes(coinId)
      ? favoriteCoins.filter(id => id !== coinId)
      : [...favoriteCoins, coinId]
    
    setFavoriteCoins(newFavorites)
    localStorage.setItem(`favorites_${user.email}`, JSON.stringify(newFavorites))
  }

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isPremium,
    activatePremium,
    favoriteCoins,
    toggleFavoriteCoin
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 