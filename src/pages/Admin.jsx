import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { 
  Users, Trash2, Crown, Search, Filter, Download, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { useAuth } from '../context/AuthContext'

const Admin = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showPremiumOnly, setShowPremiumOnly] = useState(false)
  const [showChart, setShowChart] = useState(false)
  const [exchangeFilter, setExchangeFilter] = useState('all') // 'all', 'binance', 'bybit'
  const [isMobile, setIsMobile] = useState(false)
  const [showStats, setShowStats] = useState(false)
  
  const navigate = useNavigate()
  const { user: currentUser, isAdmin } = useAuth()

  useEffect(() => {
    document.body.classList.add('admin-body')
    
    loadUsers()
    
    // 모바일 감지
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    // 주기적으로 사용자 데이터 새로고침 (VIP 상태 변경 감지)
    const interval = setInterval(() => {
      loadUsers()
    }, 5000) // 5초마다 새로고침
    
    return () => {
      document.body.classList.remove('admin-body')
      window.removeEventListener('resize', checkMobile)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, showPremiumOnly, exchangeFilter])

  const loadUsers = () => {
    const usersData = JSON.parse(localStorage.getItem('users') || '[]')
    setUsers(usersData)
  }

  const filterUsers = () => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(user => {
        const name = user.name || ''
        const email = user.email || ''
        const username = user.username || ''
        
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               email.toLowerCase().includes(searchTerm.toLowerCase()) ||
               username.toLowerCase().includes(searchTerm.toLowerCase())
      })
    }

    if (showPremiumOnly) {
      filtered = filtered.filter(user => user.exchangeRegistered === true)
    }

    if (exchangeFilter === 'binance') {
      filtered = filtered.filter((user, index) => user.exchangeRegistered && index % 2 === 0)
    } else if (exchangeFilter === 'bybit') {
      filtered = filtered.filter((user, index) => user.exchangeRegistered && index % 2 === 1)
    }

    setFilteredUsers(filtered)
  }

  const deleteUser = (userId, userName) => {
    if (window.confirm(`정말로 "${userName}" 사용자를 삭제하시겠습니까?`)) {
      const updatedUsers = users.filter(user => user.id !== userId)
      setUsers(updatedUsers)
      localStorage.setItem('users', JSON.stringify(updatedUsers))
      
      // 삭제된 사용자가 현재 로그인한 사용자와 같다면 로그아웃 처리
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      if (currentUser.id === userId) {
        localStorage.removeItem('user')
        window.location.reload()
      }
    }
  }

  const exportToExcel = () => {
    const exportData = filteredUsers.map(user => ({
      '이름': user.name,
      '사용자명': user.username,
      '이메일': user.email,
      '비밀번호': user.password,
      '프리미엄 이메일': user.exchangeEmail || '',
      '가입일': formatDate(user.joinDate),
      '회원등급': user.exchangeRegistered ? '프리미엄' : '일반',
      '관리자 여부': user.role === 'admin' ? '예' : '아니오'
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '회원목록')
    
    const fileName = `BitView_회원목록_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 오늘 가입한 회원 계산
  const getTodayJoinedCount = () => {
    const today = new Date().toDateString()
    return users.filter(user => {
      const joinDate = new Date(user.joinDate).toDateString()
      return joinDate === today
    }).length
  }

  // 오늘 가입한 프리미엄 회원 계산
  const getTodayJoinedPremiumCount = () => {
    const today = new Date().toDateString()
    return users.filter(user => {
      const joinDate = new Date(user.joinDate).toDateString()
      return joinDate === today && user.exchangeRegistered
    }).length
  }

  const getTodayPremiumByExchange = () => {
    const today = new Date().toDateString()
    const todayPremium = users.filter(user => {
      const joinDate = new Date(user.joinDate).toDateString()
      return joinDate === today && user.exchangeRegistered
    })
    // 임시로 랜덤하게 바이낸스/바이비트 분배 (실제로는 사용자 데이터에서 가져와야 함)
    const binanceCount = Math.floor(todayPremium.length * 0.6)
    const bybitCount = todayPremium.length - binanceCount
    return { binance: binanceCount, bybit: bybitCount }
  }

  const getTotalPremiumByExchange = () => {
    const totalPremium = users.filter(user => user.exchangeRegistered)
    // 임시로 랜덤하게 바이낸스/바이비트 분배 (실제로는 사용자 데이터에서 가져와야 함)
    const binanceCount = Math.floor(totalPremium.length * 0.7)
    const bybitCount = totalPremium.length - binanceCount
    return { binance: binanceCount, bybit: bybitCount }
  }

  const getChartData = () => {
    // 최근 7일간의 데이터 생성
    const data = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toDateString()
      
      const dayUsers = users.filter(user => {
        const joinDate = new Date(user.joinDate).toDateString()
        return joinDate === dateStr
      }).length
      
      data.push({
        date: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        users: dayUsers
      })
    }
    return data
  }

  const UserCard = ({ user, index }) => (
    <div className="user-card">
      <div className="user-card-header">
        <div className="user-card-info">
          <div className="user-name">{user.name}</div>
          <div className="user-email">{user.email}</div>
        </div>
        <div className="user-card-actions">
          <button 
            className="delete-btn"
            onClick={() => deleteUser(user.id, user.name)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="user-card-body">
        <div className="user-card-row">
          <span className="label">비밀번호:</span>
          <span className="password-text">{user.password}</span>
        </div>
        <div className="user-card-row">
          <span className="label">가입일:</span>
          <span>{new Date(user.joinDate).toLocaleDateString('ko-KR')}</span>
        </div>
        <div className="user-card-row">
          <span className="label">회원등급:</span>
          <div className="premium-status">
            {user.exchangeRegistered ? (
              <span className="premium-badge">
                <Crown size={12} />
                프리미엄
              </span>
            ) : (
              <span className="regular-badge">일반</span>
            )}
          </div>
        </div>
        {user.exchangeRegistered && (
          <div className="user-card-row">
            <span className="label">거래소:</span>
            <span className={`exchange-badge ${index % 2 === 0 ? 'binance' : 'bybit'}`}>
              {index % 2 === 0 ? '바이낸스' : '바이비트'}
            </span>
          </div>
        )}
        {user.exchangeEmail && (
          <div className="user-card-row">
            <span className="label">프리미엄 이메일:</span>
            <span className="premium-email">{user.exchangeEmail}</span>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div className="admin-title-section">
            <h1>관리자 페이지</h1>
            {!isMobile && (
              <div className="referral-links">
                <a href="https://www.binance.com/en/activity/referral/offers?stopRedirectToActivity=true" target="_blank" rel="noopener noreferrer">
                  바이낸스 <ExternalLink size={16} />
                </a>
                <a href="https://www.bybit.com/en/referral/dashboard/?utm_source=uj_header" target="_blank" rel="noopener noreferrer">
                  바이비트 <ExternalLink size={16} />
                </a>
              </div>
            )}
          </div>
          
          {isMobile ? (
            <div className="mobile-stats">
              <button 
                className="stats-toggle"
                onClick={() => setShowStats(!showStats)}
              >
                통계 {showStats ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {showStats && (
                <div className="stats-dropdown">
                  <div className="stat-item">
                    <span className="stat-label">오늘 가입 회원</span>
                    <span className="stat-value">{getTodayJoinedCount()}명</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">오늘 가입 프리미엄</span>
                    <span className="stat-value">{getTodayJoinedPremiumCount()}명</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">전체 회원</span>
                    <span className="stat-value">{users.length}명</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">프리미엄 회원</span>
                    <span className="stat-value">{users.filter(u => u.exchangeRegistered).length}명</span>
                  </div>
                  <div className="referral-links mobile-referral">
                    <a href="https://www.binance.com/en/activity/referral/offers?stopRedirectToActivity=true" target="_blank" rel="noopener noreferrer">
                      바이낸스 <ExternalLink size={14} />
                    </a>
                    <a href="https://www.bybit.com/en/referral/dashboard/?utm_source=uj_header" target="_blank" rel="noopener noreferrer">
                      바이비트 <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="admin-stats">
              <div className="stat-item">
                <span className="stat-label">오늘 가입한 회원</span>
                <span className="stat-value">{getTodayJoinedCount()}명</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">오늘 가입한 프리미엄 회원</span>
                <span className="stat-value">{getTodayJoinedPremiumCount()}명</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">전체 회원</span>
                <span className="stat-value">{users.length}명</span>
              </div>
              <div 
                className="stat-item clickable-stat"
                onClick={() => setShowChart(!showChart)}
              >
                <span className="stat-label premium-label-container">
                  프리미엄 회원
                  <div className="tooltip-right">
                    <div className="tooltip-row">
                      <strong className="tooltip-label">오늘 가입</strong>
                      <div className="tooltip-data">
                        바이낸스: {getTodayPremiumByExchange().binance}명<br />
                        바이비트: {getTodayPremiumByExchange().bybit}명
                      </div>
                    </div>
                    <div className="tooltip-row">
                      <strong className="tooltip-label">전체</strong>
                      <div className="tooltip-data">
                        바이낸스: {getTotalPremiumByExchange().binance}명<br />
                        바이비트: {getTotalPremiumByExchange().bybit}명
                      </div>
                    </div>
                  </div>
                </span>
                <span className="stat-value">{users.filter(u => u.exchangeRegistered).length}명</span>
              </div>
            </div>
          )}
        </div>

        <div className="admin-divider"></div>

        {showChart && (
          <div className="chart-section">
            <div className="chart-header">
              <h3>일자별 총 회원 가입 현황</h3>
              <button className="close-chart" onClick={() => setShowChart(false)}>✕</button>
            </div>
            <div className="chart-container">
              <div className="chart-area">
                {getChartData().map((data, index) => (
                  <div key={index} className="chart-bar-container">
                    <div 
                      className="chart-bar" 
                      style={{ height: `${Math.max(data.users * 20, 10)}px` }}
                    ></div>
                    <div className="chart-value">{data.users}</div>
                    <div className="chart-label">{data.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="users-section">
          <div className="users-header">
            <h2>회원 목록</h2>
            <div className="users-controls">
              <div className="search-box">
                <Search size={20} />
                <input
                  type="text"
                  placeholder="이름, 이메일로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="control-buttons">
                <button
                  className={`filter-btn ${showPremiumOnly ? 'active' : ''}`}
                  onClick={() => setShowPremiumOnly(!showPremiumOnly)}
                >
                  <Filter size={18} />
                  {isMobile ? (showPremiumOnly ? '전체' : '프리미엄') : (showPremiumOnly ? '전체 보기' : '프리미엄만')}
                </button>
                <button className="export-btn" onClick={exportToExcel}>
                  <Download size={18} />
                  {isMobile ? 'Excel' : '엑셀 내보내기'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="users-list">
            {filteredUsers.length === 0 ? (
              <div className="no-users">
                <Users size={48} />
                <p>조건에 맞는 사용자가 없습니다.</p>
              </div>
            ) : (
              <>
                {isMobile ? (
                  <div className="mobile-users-list">
                    {filteredUsers.map((user, index) => (
                      <UserCard key={user.id} user={user} index={index} />
                    ))}
                  </div>
                ) : (
                  <div className="users-table">
                    <div className="table-header">
                      <div className="table-cell">번호</div>
                      <div className="table-cell">이름</div>
                      <div className="table-cell">이메일</div>
                      <div className="table-cell">비밀번호</div>
                      <div className="table-cell">가입일</div>
                      <div className="table-cell">프리미엄</div>
                      <div className="table-cell clickable-header" onClick={() => {
                        const nextFilter = exchangeFilter === 'all' ? 'binance' : 
                                         exchangeFilter === 'binance' ? 'bybit' : 'all'
                        setExchangeFilter(nextFilter)
                      }}>
                        가입 거래소 {exchangeFilter === 'all' ? '(전체)' : 
                                    exchangeFilter === 'binance' ? '(바이낸스)' : '(바이비트)'}
                      </div>
                      <div className="table-cell">삭제</div>
                    </div>
                    <div className="table-body">
                      {filteredUsers.map((user, index) => (
                        <div
                          key={user.id}
                          className="table-row"
                        >
                          <div className="table-cell">
                            {index + 1}
                          </div>
                          <div className="table-cell">
                            <div className="user-name">
                              <span>{user.name}</span>
                            </div>
                          </div>
                          <div className="table-cell">
                            <div className="email-info">
                              <div className="email-id">{user.email}</div>
                              <div className="premium-email">{user.exchangeEmail || '-'}</div>
                            </div>
                          </div>
                          <div className="table-cell">
                            <span className="password-text">{user.password}</span>
                          </div>
                          <div className="table-cell">
                            {new Date(user.joinDate).toLocaleDateString('ko-KR')}
                          </div>
                          <div className="table-cell">
                            <div className="premium-status">
                              {user.exchangeRegistered ? (
                                <span className="premium-badge">
                                  <Crown size={14} />
                                  프리미엄
                                </span>
                              ) : (
                                <span className="regular-badge">일반</span>
                              )}
                            </div>
                          </div>
                          <div className="table-cell">
                            <div className="exchange-info">
                              {user.exchangeRegistered ? (
                                <span className={`exchange-badge ${index % 2 === 0 ? 'binance' : 'bybit'}`}>
                                  {/* 임시로 인덱스 기반으로 거래소 배정 */}
                                  {index % 2 === 0 ? '바이낸스' : '바이비트'}
                                </span>
                              ) : (
                                <span className="no-exchange">-</span>
                              )}
                            </div>
                          </div>
                          <div className="table-cell">
                            <button 
                              className="delete-btn"
                              onClick={() => deleteUser(user.id, user.name)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-page {
          min-height: 100vh;
          padding: 120px 20px 20px;
          position: relative;
          z-index: 2;
        }

        body.admin-body::before,
        body.admin-body::after {
          display: none !important;
        }
        
        .admin-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
        }

        .admin-header h1 {
          color: #f9fafb;
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
        }

        .admin-stats {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .admin-divider {
          height: 1px;
          background: #374151;
          margin: 2rem 0;
        }

        .admin-title-section {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .referral-links {
          display: flex;
          gap: 2rem;
        }

        .referral-links a {
          color: #f9fafb;
          text-decoration: none;
          font-size: 1rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .referral-links a:hover {
          text-decoration: underline;
        }

        .mobile-referral {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #374151;
        }

        .mobile-referral a {
          font-size: 0.9rem;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .stat-label {
          color: #9ca3af;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .stat-value {
          color: #f9fafb;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .clickable-stat {
          cursor: pointer;
        }

        .premium-label-container {
          position: relative;
          cursor: pointer;
        }

        .tooltip-right {
          position: absolute;
          left: 100%;
          top: 100%;
          transform: translateY(-50%);
          color: #f9fafb;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 0.875rem;
          white-space: nowrap;
          border: 1px solid #374151;
          z-index: 9999;
          margin-left: 10px;
          min-width: 200px;
          background: #1f2937;
        }

        .tooltip-right::before {
          content: '';
          position: absolute;
          right: 100%;
          top: 50%;
          transform: translateY(-50%);
          border: 6px solid transparent;
          border-right-color: #374151;
        }

        .tooltip-row {
          display: flex;
          align-items: flex-start;
          margin-bottom: 8px;
          gap: 12px;
        }

        .tooltip-row:last-child {
          margin-bottom: 0;
        }

        .tooltip-label {
          color: #f9fafb;
          font-weight: 600;
          min-width: 60px;
          flex-shrink: 0;
        }

        .tooltip-data {
          flex: 1;
          color: #9ca3af;
        }

        .mobile-stats {
          position: relative;
        }

        .stats-toggle {
          background: #1f2937;
          border: 1px solid #374151;
          color: #f9fafb;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }

        .stats-toggle:hover {
          background: #374151;
        }

        .stats-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          width: 280px;
          background: #1f2937;
          border: 1px solid #374151;
          border-radius: 8px;
          padding: 1rem;
          margin-top: 0.5rem;
          z-index: 10;
        }

        .stats-dropdown .stat-item {
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid #374151;
        }

        .stats-dropdown .stat-item:last-child {
          border-bottom: none;
        }

        .stats-dropdown .stat-label {
          font-size: 0.875rem;
        }

        .stats-dropdown .stat-value {
          font-size: 1.1rem;
        }

        .chart-section {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid #374151;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .chart-header h3 {
          color: #f9fafb;
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
        }

        .close-chart {
          background: none;
          border: none;
          color: #9ca3af;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s;
        }

        .close-chart:hover {
          background: #374151;
          color: #f9fafb;
        }

        .chart-container {
          height: 200px;
          display: flex;
          align-items: end;
          justify-content: center;
        }

        .chart-area {
          display: flex;
          align-items: end;
          gap: 1rem;
        }

        .chart-bar-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .chart-bar {
          width: 40px;
          background: linear-gradient(to top, #3b82f6, #60a5fa);
          border-radius: 4px 4px 0 0;
          transition: all 0.3s;
        }

        .chart-bar:hover {
          background: linear-gradient(to top, #2563eb, #3b82f6);
        }

        .chart-value {
          color: #f9fafb;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .chart-label {
          color: #9ca3af;
          font-size: 0.75rem;
        }

        .users-section {
          margin-top: 2rem;
        }

        .users-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .users-header h2 {
          color: #f9fafb;
          font-size: 2rem;
          font-weight: 600;
        }

        .users-controls {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: #1f2937;
          border: 1px solid #374151;
          border-radius: 4px;
          padding: 0.5rem 0.75rem;
          min-width: 250px;
        }

        .search-box svg {
          color: #9ca3af;
        }

        .search-box input {
          background: transparent;
          border: none;
          color: #f9fafb;
          outline: none;
          width: 100%;
        }

        .search-box input::placeholder {
          color: #6b7280;
        }

        .control-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .filter-btn, .export-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #1f2937;
          border: 1px solid #374151;
          color: #f9fafb;
          padding: 0.5rem 0.75rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }

        .filter-btn:hover, .export-btn:hover {
          background: #374151;
        }

        .filter-btn.active {
          background: #1e40af;
          border-color: #3b82f6;
          color: #dbeafe;
        }

        .export-btn {
          background: #059669;
          border-color: #059669;
          color: white;
        }

        .export-btn:hover {
          background: #047857;
          border-color: #047857;
        }

        .mobile-users-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .user-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid #374151;
          border-radius: 8px;
          padding: 1rem;
        }

        .user-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .user-card-info .user-name {
          color: #f9fafb;
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .user-card-info .user-email {
          color: #9ca3af;
          font-size: 0.875rem;
        }

        .user-card-body {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .user-card-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .user-card-row .label {
          color: #9ca3af;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .users-table {
          border-collapse: collapse;
          width: 100%;
          background: transparent;
        }

        .users-table .table-header {
          display: grid;
          grid-template-columns: 0.5fr 1.5fr 3fr 2fr 1.5fr 1.5fr 1.5fr 1fr;
          background: transparent;
          border-bottom: 2px solid #374151;
        }

        .users-table .table-header .table-cell {
          background: transparent;
          color: #f9fafb;
          font-weight: 600;
          font-size: 0.875rem;
          padding: 0.75rem 0.5rem;
          text-align: center;
        }

        .clickable-header {
          cursor: pointer;
          user-select: none;
          transition: background-color 0.2s;
        }

        .clickable-header:hover {
          background: rgba(55, 65, 81, 0.5);
        }

        .table-body .table-row {
          display: grid;
          grid-template-columns: 0.5fr 1.5fr 3fr 2fr 1.5fr 1.5fr 1.5fr 1fr;
          border-bottom: 1px solid #374151;
          background: transparent;
        }

        .table-body .table-row:nth-child(even) {
          background: transparent;
        }

        .table-body .table-row .table-cell {
          background: inherit;
          color: #f9fafb;
          padding: 0.75rem 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-size: 0.875rem;
        }

        .user-name {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .premium-status {
          display: flex;
          justify-content: center;
        }

        .email-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .email-id {
          color: #f9fafb;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .premium-email {
          color: #9ca3af;
          font-size: 0.75rem;
          font-style: italic;
        }

        .exchange-info {
          display: flex;
          justify-content: center;
        }

        .exchange-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
        }

        .exchange-badge.binance {
          background: #f59e0b;
          border: 1px solid #d97706;
        }

        .exchange-badge.bybit {
          background: #ea580c;
          border: 1px solid #dc2626;
        }

        .no-exchange {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .premium-badge, .regular-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 2px;
          font-size: 0.75rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .premium-badge {
          background: #451a03;
          color: #fbbf24;
          border: 1px solid #92400e;
        }

        .regular-badge {
          background: #374151;
          color: #9ca3af;
          border: 1px solid #4b5563;
        }

        .delete-btn {
          background: #dc2626;
          border: 1px solid #b91c1c;
          color: white;
          padding: 0.5rem;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .delete-btn:hover {
          background: #b91c1c;
          transform: scale(1.05);
        }

        .password-text {
          font-family: monospace;
          font-size: 0.8rem;
          color: #9ca3af;
          background: rgba(31, 41, 55, 0.5);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          border: 1px solid #374151;
        }

        .no-users {
          text-align: center;
          padding: 4rem 2rem;
          color: #9ca3af;
        }

        .no-users svg {
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        @media (max-width: 1024px) {
          .admin-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .admin-stats {
            justify-content: center;
            gap: 1rem;
          }

          .stat-item {
            min-width: 120px;
          }

          .users-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .users-controls {
            width: 100%;
            justify-content: flex-start;
          }

          .search-box {
            min-width: 200px;
          }

          .referral-links {
            gap: 1rem;
          }
        }

        @media (max-width: 768px) {
          .admin-page {
            padding: 80px 16px 20px;
          }

          .admin-header {
            align-items: stretch;
          }

          .admin-header h1 {
            font-size: 1.5rem;
          }

          .users-header {
            flex-direction: column;
            align-items: stretch;
          }

          .users-header h2 {
            font-size: 1.5rem;
          }

          .users-controls {
            flex-direction: column;
            gap: 1rem;
          }

          .search-box {
            min-width: auto;
            width: 100%;
          }

          .control-buttons {
            justify-content: center;
          }

          .chart-container {
            height: 150px;
          }

          .chart-area {
            gap: 0.5rem;
          }

          .chart-bar {
            width: 30px;
          }

          .tooltip-right {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .admin-page {
            padding: 70px 12px 20px;
          }

          .admin-header h1 {
            font-size: 1.25rem;
          }

          .users-header h2 {
            font-size: 1.25rem;
          }

          .control-buttons {
            flex-direction: column;
            width: 100%;
          }

          .filter-btn, .export-btn {
            width: 100%;
            justify-content: center;
          }

          .user-card {
            padding: 0.75rem;
          }

          .user-card-header {
            flex-direction: column;
            gap: 0.5rem;
          }

          .user-card-actions {
            align-self: flex-end;
          }

          .stats-dropdown {
            width: 100vw;
            left: 50%;
            transform: translateX(-50%);
            right: auto;
          }
        }
      `}</style>
    </div>
  )
}

export default Admin