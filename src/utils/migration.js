import { authAPI } from './api'

// 기존 localStorage 데이터 마이그레이션
export const migrateLocalStorageData = async () => {
  try {
    // 기존 사용자 데이터 확인
    const existingUsers = localStorage.getItem('users')
    if (!existingUsers) {
      console.log('마이그레이션할 사용자 데이터가 없습니다.')
      return { success: true, message: '마이그레이션할 데이터가 없습니다.' }
    }

    const users = JSON.parse(existingUsers)
    const migrationResults = []

    for (const user of users) {
      try {
        // 관리자 계정은 이미 데이터베이스에 있으므로 건너뜀
        if (user.email === 'admin@gmail.com') {
          continue
        }

        // 사용자 데이터 마이그레이션
        const signupResult = await authAPI.signup({
          name: user.name,
          email: user.email,
          password: user.password,
          confirmPassword: user.password
        })

        if (signupResult.success) {
          migrationResults.push({
            email: user.email,
            status: 'success',
            message: '성공적으로 마이그레이션되었습니다.'
          })

          // 즐겨찾기 데이터 마이그레이션
          const favoritesKey = `favorites_${user.email}`
          const userFavorites = localStorage.getItem(favoritesKey)
          
          if (userFavorites) {
            try {
              const favorites = JSON.parse(userFavorites)
              
              // 로그인하여 즐겨찾기 추가
              const loginResult = await authAPI.login({
                email: user.email,
                password: user.password
              })

              if (loginResult.success) {
                // 각 즐겨찾기 항목 추가
                for (const coinId of favorites) {
                  try {
                    await authAPI.toggleFavorite(coinId, 'add')
                  } catch (error) {
                    console.error(`즐겨찾기 마이그레이션 실패 (${coinId}):`, error)
                  }
                }
              }
            } catch (error) {
              console.error(`즐겨찾기 파싱 오류 (${user.email}):`, error)
            }
          }

          // 사용자 추가 정보 업데이트
          if (user.exchangeRegistered || user.exchangeEmail) {
            try {
              await authAPI.updateProfile({
                exchangeRegistered: user.exchangeRegistered || false,
                exchangeEmail: user.exchangeEmail || null
              })
            } catch (error) {
              console.error(`사용자 정보 업데이트 실패 (${user.email}):`, error)
            }
          }
        }
      } catch (error) {
        migrationResults.push({
          email: user.email,
          status: 'error',
          message: error.message || '마이그레이션 중 오류가 발생했습니다.'
        })
      }
    }

    return {
      success: true,
      message: '마이그레이션이 완료되었습니다.',
      results: migrationResults
    }
  } catch (error) {
    console.error('마이그레이션 오류:', error)
    return {
      success: false,
      message: '마이그레이션 중 오류가 발생했습니다.'
    }
  }
}

// 마이그레이션 후 정리 함수
export const cleanupLocalStorageData = () => {
  try {
    // 사용자 데이터 제거
    localStorage.removeItem('users')
    localStorage.removeItem('user')
    
    // 즐겨찾기 데이터 제거
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('favorites_')) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })

    return {
      success: true,
      message: '로컬 스토리지 데이터가 정리되었습니다.',
      removedKeys: keysToRemove.length + 2 // users, user + favorites
    }
  } catch (error) {
    console.error('로컬 스토리지 정리 오류:', error)
    return {
      success: false,
      message: '로컬 스토리지 정리 중 오류가 발생했습니다.'
    }
  }
}

// 마이그레이션 필요 여부 확인
export const checkMigrationNeeded = () => {
  const existingUsers = localStorage.getItem('users')
  const existingUser = localStorage.getItem('user')
  
  if (!existingUsers && !existingUser) {
    return false
  }
  
  if (existingUsers) {
    try {
      const users = JSON.parse(existingUsers)
      return users.length > 0
    } catch (error) {
      console.error('사용자 데이터 파싱 오류:', error)
      return false
    }
  }
  
  return !!existingUser
}

// 마이그레이션 상태 확인
export const getMigrationStatus = () => {
  const hasLocalData = checkMigrationNeeded()
  const migrationCompleted = localStorage.getItem('migration_completed')
  
  return {
    hasLocalData,
    migrationCompleted: migrationCompleted === 'true',
    needsMigration: hasLocalData && migrationCompleted !== 'true'
  }
}

// 마이그레이션 완료 표시
export const markMigrationCompleted = () => {
  localStorage.setItem('migration_completed', 'true')
}

// 전체 마이그레이션 프로세스 실행
export const runMigration = async () => {
  const status = getMigrationStatus()
  
  if (!status.needsMigration) {
    return {
      success: true,
      message: '마이그레이션이 필요하지 않습니다.',
      skipped: true
    }
  }
  
  try {
    const migrationResult = await migrateLocalStorageData()
    
    if (migrationResult.success) {
      markMigrationCompleted()
      
      // 옵션: 마이그레이션 후 자동 정리 (주의: 사용자 확인 후 실행 권장)
      // const cleanupResult = cleanupLocalStorageData()
      
      return {
        success: true,
        message: '마이그레이션이 성공적으로 완료되었습니다.',
        migrationResult,
        // cleanupResult
      }
    } else {
      return migrationResult
    }
  } catch (error) {
    console.error('마이그레이션 실행 오류:', error)
    return {
      success: false,
      message: '마이그레이션 실행 중 오류가 발생했습니다.'
    }
  }
} 