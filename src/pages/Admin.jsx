import { useState, useEffect } from 'react'
import { 
  Users, 
  Trash2, 
  Search, 
  Filter, 
  Download, 
  Shield, 
  RefreshCw,
  AlertTriangle,
  Calendar,
  Mail,
  MapPin
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { useAuth } from '../context/AuthContext'
import { 
  getAllUsers, 
  deleteUserFromFirestore
} from '../utils/firebase-auth'

const Admin = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  const [membershipFilter, setMembershipFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [stats, setStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    vipUsers: 0,
    todaySignups: 0
  })
  
  const { user: currentUser, userProfile } = useAuth()

  useEffect(() => {
    document.title = 'BitView - 회원 관리'
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, membershipFilter])

  const loadUsers = async () => {
    console.log('🔧 사용자 목록 로딩 시작...')
    
    try {
      setLoading(true)
      setError('')
      
      console.log('🔧 getAllUsers 호출 중...')
      const usersData = await getAllUsers()
      console.log('✅ 사용자 데이터 로딩 완료:', usersData?.length || 0, '명')
      
      setUsers(usersData || [])
      
      // 통계 계산
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const todaySignups = (usersData || []).filter(user => {
        if (!user.createdAt) return false
        const createdAt = user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt)
        return createdAt >= today
      }).length
      
      const newStats = {
        totalUsers: (usersData || []).length,
        premiumUsers: (usersData || []).filter(user => user.is_premium).length,
        vipUsers: (usersData || []).filter(user => user.is_vip).length,
        todaySignups
      }
      
      console.log('📊 통계 계산 완료:', newStats)
      setStats(newStats)
      
    } catch (err) {
      console.error('❌ 사용자 목록 로딩 실패:', err)
      setError(`사용자 목록을 불러오는데 실패했습니다: ${err.message}`)
      setUsers([]) // 에러 시 빈 배열 설정
    } finally {
      console.log('🔧 로딩 상태 해제')
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(user => {
        const email = user.email || ''
        const userId = user.id || ''
        
        return email.toLowerCase().includes(searchTerm.toLowerCase()) ||
               userId.toLowerCase().includes(searchTerm.toLowerCase())
      })
    }

    if (membershipFilter !== 'all') {
      if (membershipFilter === 'premium') {
        filtered = filtered.filter(user => user.is_premium && !user.is_vip)
      } else if (membershipFilter === 'vip') {
        filtered = filtered.filter(user => user.is_vip)
      } else if (membershipFilter === 'basic') {
        filtered = filtered.filter(user => !user.is_premium)
      }
    }

    setFilteredUsers(filtered)
  }

  // 개발 환경에서 디버깅 함수 추가
  if (process.env.NODE_ENV === 'development') {
    window.checkAdminPageState = () => {
      console.log('🔧 Admin 페이지 상태:', {
        loading,
        error,
        currentUser: currentUser ? {
          email: currentUser.email,
          uid: currentUser.uid
        } : null,
        userProfile,
        usersCount: users.length,
        filteredUsersCount: filteredUsers.length,
        stats
      })
    }

    window.checkUserExchangeInfo = (userIndex = 0) => {
      const user = filteredUsers[userIndex]
      if (user) {
        console.log('🔧 사용자 거래소 정보:', {
          email: user.email,
          exchange_email: user.exchange_email,
          exchange_type: user.exchange_type,
          exchange_source: user.exchange_source,
          exchange_registered: user.exchange_registered,
          is_premium: user.is_premium,
          is_vip: user.is_vip,
          calculatedExchange: getExchangeName(user)
        })
      } else {
        console.log('❌ 사용자를 찾을 수 없습니다. 인덱스:', userIndex)
      }
    }
  }

  const handleDeleteUser = async (userId, userName) => {
    if (userId === currentUser?.uid) {
      alert('자신의 계정은 삭제할 수 없습니다.')
      return
    }

    try {
      console.log('🔧 사용자 삭제 시작:', userId)
      await deleteUserFromFirestore(userId)
      console.log('✅ 사용자 삭제 완료')
      await loadUsers()
    } catch (err) {
      console.error('❌ 사용자 삭제 실패:', err)
      alert(`사용자 삭제에 실패했습니다: ${err.message}`)
    }
  }



  const exportToExcel = () => {
    const exportData = filteredUsers.map(user => ({
      'ID': user.id || '',
      '이메일': user.email || '',
      'VIP 이메일': user.exchange_email || '',
      '프리미엄': user.is_premium ? '예' : '아니오',
      'VIP': user.is_vip ? '예' : '아니오',
      '가입일': user.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString('ko-KR') : '',
      '최근 로그인': user.last_login ? new Date(user.last_login.toDate()).toLocaleDateString('ko-KR') : '',
      '거래소': getExchangeName(user)
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '회원목록')
    
    const fileName = `BitView_회원목록_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return '-'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getMembershipBadge = (user) => {
    if (user.is_vip) {
      return <span className="vip-badge">VIP</span>
    } else if (user.is_premium) {
      return <span className="premium-badge">프리미엄</span>
    }
    return <span className="basic-badge">일반</span>
  }

  const getExchangeName = (user) => {
    // 먼저 exchange_type 필드 확인 (가장 정확한 정보)
    if (user.exchange_type) {
      if (user.exchange_type === 'binance') {
        return '바이낸스'
      }
      if (user.exchange_type === 'bybit') {
        return '바이비트'
      }
    }
    
    // VIP/거래소 이메일이 있으면 이메일 패턴으로 거래소 구분
    if (user.exchange_email) {
      const email = user.exchange_email.toLowerCase()
      
      // 바이낸스 관련 패턴 확인
      if (email.includes('binance') || 
          email.includes('@binance.') ||
          user.exchange_source === 'binance') {
        return '바이낸스'
      }
      
      // 바이비트 관련 패턴 확인
      if (email.includes('bybit') || 
          email.includes('@bybit.') ||
          user.exchange_source === 'bybit') {
        return '바이비트'
      }
      
      // 구체적인 거래소 구분이 안 되는 경우
      return '등록됨'
    }
    
    // 프리미엄 회원이지만 거래소 정보가 없는 경우
    if (user.is_premium && user.exchange_registered) {
      return '등록됨'
    }
    
    // 거래소 등록하지 않음
    return '미등록'
  }

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-spinner">
          <RefreshCw className="spin" />
          <p>사용자 목록을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="admin-title">
          <Users size={28} />
          <h1>회원 관리</h1>
        </div>
        <div className="admin-actions">
          <button className="refresh-btn" onClick={loadUsers}>
            <RefreshCw size={16} />
            새로고침
          </button>
          <button className="export-btn" onClick={exportToExcel}>
            <Download size={16} />
            엑셀 다운로드
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* 통계 카드 */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">총 회원</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Shield size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.premiumUsers}</div>
            <div className="stat-label">프리미엄 회원</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Mail size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.vipUsers}</div>
            <div className="stat-label">VIP 회원</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.todaySignups}</div>
            <div className="stat-label">오늘 가입</div>
          </div>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="filters-container">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="이메일 또는 ID로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select value={membershipFilter} onChange={(e) => setMembershipFilter(e.target.value)}>
            <option value="all">모든 등급</option>
            <option value="basic">일반</option>
            <option value="premium">프리미엄</option>
            <option value="vip">VIP</option>
          </select>
        </div>
      </div>

      {/* 사용자 목록 테이블 */}
      <div className="users-table-container">
        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>이메일</th>
                <th>등급</th>
                <th>가입일</th>
                <th>최근 접속</th>
                <th>거래소</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-info">
                        <div className="user-id">ID: {user.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="email-cell">
                      <div className="email-primary">{user.email}</div>
                      {user.exchange_email && (
                        <div className="email-secondary">VIP: {user.exchange_email}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="membership-cell">
                      {getMembershipBadge(user)}
                    </div>
                  </td>
                  <td>
                    <div className="date-cell">
                      {formatDate(user.createdAt)}
                    </div>
                  </td>
                  <td>
                    <div className="date-cell">
                      {formatDate(user.last_login)}
                    </div>
                  </td>
                  <td>
                    <div className="exchange-cell">
                      {user.exchange_registered ? (
                        <div className="exchange-registered">
                          <span>{getExchangeName(user)}</span>
                        </div>
                      ) : (
                        <div className="exchange-not-registered">
                          <span>미등록</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="actions-cell">
                      {user.id && user.id !== currentUser?.uid && (
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteUser(user.id, user.email || '사용자')}
                          title="삭제"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && filteredUsers.length === 0 && (
        <div className="users-table-container">
          <div className="empty-table">
            <Users size={48} />
            <p>표시할 사용자가 없습니다.</p>
          </div>
        </div>
      )}



      <style jsx>{`
        .admin-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 20px 20px 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #0a0a0a;
          color: #ffffff;
          min-height: 100vh;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #374151;
        }

        .admin-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .admin-title h1 {
          margin: 0;
          color: #ffffff;
          font-size: 28px;
          font-weight: 600;
        }

        .admin-actions {
          display: flex;
          gap: 12px;
        }

        .refresh-btn, .export-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .refresh-btn {
          background: #374151;
          color: #d1d5db;
        }

        .refresh-btn:hover {
          background: #4b5563;
        }

        .export-btn {
          background: #3b82f6;
          color: white;
        }

        .export-btn:hover {
          background: #2563eb;
        }

        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
          text-align: center;
          color: #9ca3af;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: #7f1d1d;
          color: #fecaca;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: transparent;
          border-radius: 12px;
          box-shadow: none;
          border: 1px solid #374151;
        }

        .stat-icon {
          padding: 12px;
          border-radius: 10px;
          background: #374151;
          color: #9ca3af;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #ffffff;
        }

        .stat-label {
          font-size: 14px;
          color: #9ca3af;
        }

        .filters-container {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 250px;
        }

        .search-box svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .search-box input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          border: 1px solid #374151;
          border-radius: 8px;
          font-size: 14px;
          background: transparent;
          color: #ffffff;
        }

        .search-box input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }

        .search-box input::placeholder {
          color: #6b7280;
        }

        .filter-group {
          display: flex;
          gap: 12px;
        }

        .filter-group select {
          padding: 12px;
          border: 1px solid #374151;
          border-radius: 8px;
          font-size: 14px;
          min-width: 120px;
          background: transparent;
          color: #ffffff;
        }

        .filter-group select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }

        .users-table-container {
          background: transparent;
          border-radius: 12px;
          box-shadow: none;
          overflow: hidden;
          border: 1px solid #374151;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .users-table thead {
          background: transparent;
          border-bottom: 2px solid #4b5563;
        }

        .users-table th {
          padding: 16px 12px;
          text-align: left;
          font-weight: 600;
          color: #ffffff;
          white-space: nowrap;
        }

        .users-table tbody tr {
          border-bottom: 1px solid #374151;
          transition: background-color 0.2s;
          background: transparent;
        }

        .users-table tbody tr:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }

        .users-table td {
          padding: 16px 12px;
          vertical-align: middle;
          text-align: left;
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }



        .user-info {
          min-width: 0;
        }



        .user-id {
          font-size: 12px;
          color: #9ca3af;
        }

        .email-cell {
          font-size: 14px;
          color: #d1d5db;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .email-primary {
          font-size: 14px;
          color: #d1d5db;
          font-weight: 500;
          margin-bottom: 2px;
        }

        .email-secondary {
          font-size: 12px;
          color: #94a3b8;
          font-weight: 400;
        }

        .membership-cell {
          text-align: left;
        }

        .date-cell {
          font-size: 13px;
          color: #9ca3af;
          white-space: nowrap;
        }

        .exchange-cell {
          text-align: left;
        }

        .exchange-registered {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #10b981;
          font-size: 12px;
        }

        .exchange-not-registered {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #9ca3af;
          font-size: 12px;
        }

        .actions-cell {
          display: flex;
          gap: 4px;
          justify-content: flex-start;
          flex-wrap: wrap;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          padding: 0;
        }



        .vip-badge {
          background: #f97316;
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 500;
        }

        .premium-badge {
          background: #fbbf24;
          color: #1f2937;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 500;
        }

        .basic-badge {
          background: #4b5563;
          color: #d1d5db;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 500;
        }



        .action-btn.delete-btn {
          background: #dc2626;
          color: white;
        }

        .action-btn.delete-btn:hover {
          background: #b91c1c;
        }

        /* 테이블 반응형 스타일 */
        @media (max-width: 1024px) {
          .users-table th,
          .users-table td {
            padding: 12px 8px;
          }
          
          .email-cell {
            max-width: 150px;
          }
          
          .actions-cell {
            flex-direction: column;
            gap: 2px;
          }
          
          .action-btn {
            width: 28px;
            height: 28px;
          }
        }

        @media (max-width: 768px) {
          .users-table {
            font-size: 12px;
          }
          
          .users-table th,
          .users-table td {
            padding: 8px 4px;
          }
          

          
          .user-id {
            font-size: 10px;
          }
          
          .email-cell {
            max-width: 120px;
            font-size: 12px;
          }
          
          .date-cell {
            font-size: 11px;
          }
          
          .exchange-registered,
          .exchange-not-registered {
            font-size: 10px;
          }
          
          .action-btn {
            width: 24px;
            height: 24px;
          }
          
          .action-btn svg {
            width: 12px;
            height: 12px;
          }
        }

        /* 테이블 줄무늬 효과 */
        .users-table tbody tr:nth-child(even) {
          background-color: transparent;
        }

        .users-table tbody tr:nth-child(even):hover {
          background-color: rgba(255, 255, 255, 0.05);
        }

        /* 테이블 헤더 그림자 */
        .users-table thead {
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        /* 빈 테이블 상태 */
        .empty-table {
          text-align: center;
          padding: 60px 20px;
          color: #9ca3af;
          background: transparent;
        }

        .empty-table svg {
          margin-bottom: 16px;
          opacity: 0.5;
        }





        @media (max-width: 768px) {
          .admin-container {
            padding: 10px;
          }

          .admin-header {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .admin-actions {
            justify-content: center;
          }

          .filters-container {
            flex-direction: column;
          }

          .filter-group {
            flex-direction: column;
          }

          .users-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default Admin