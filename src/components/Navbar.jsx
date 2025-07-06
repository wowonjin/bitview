import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Menu, X, User, LogOut, ChevronDown, Settings, UserCircle, Eye, EyeOff, Edit2, Check, X as XIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [userInfoModalOpen, setUserInfoModalOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [tempName, setTempName] = useState('')
  const [nameError, setNameError] = useState('')
  const { user, logout, isAuthenticated, isAdmin, isPremium, updateUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const dropdownRef = useRef(null)

  // 프리미엄 버튼 클릭 핸들러
  const handlePremiumClick = (e) => {
    e.preventDefault()
    navigate('/premium')
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsOpen(false)
    setDropdownOpen(false)
  }

  const handleUserInfoClick = () => {
    setUserInfoModalOpen(true)
    setDropdownOpen(false)
    setTempName(user?.name || '')
    setNameError('')
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleEditName = () => {
    setIsEditingName(true)
    setNameError('')
  }

  const handleSaveName = () => {
    const trimmedName = tempName.trim()
    
    if (!trimmedName) {
      setNameError('닉네임을 입력해주세요.')
      return
    }

    // 기존 이름과 같다면 바로 저장
    if (trimmedName.toLowerCase() === user?.name?.toLowerCase()) {
      setIsEditingName(false)
      setNameError('')
      return
    }

    // 중복 이름 확인
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const existingName = users.find(u => u.name && u.name.toLowerCase() === trimmedName.toLowerCase())

    if (existingName) {
      setNameError('이미 사용 중인 닉네임입니다. 다른 닉네임을 선택해주세요.')
      return
    }

    updateUser({ name: trimmedName })
    setIsEditingName(false)
    setNameError('')
  }

  const handleCancelEditName = () => {
    setTempName(user?.name || '')
    setIsEditingName(false)
    setNameError('')
  }

  const handleNameChange = (e) => {
    setTempName(e.target.value)
    if (nameError) {
      setNameError('')
    }
  }

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <>
      {/* 공지글 배너 - 메인페이지에서만 표시, 프리미엄 사용자에게는 표시하지 않음 */}
      {!isPremium && location.pathname === '/' && (
        <div className="notice-banner" onClick={handlePremiumClick}>
          <div className="notice-content">
            <span className="notice-text">
              🎉 <strong>[프리미엄] 지금 가입하면 BitView 한정 즉시 거래 수수료 20% 할인!</strong>
            </span>
          </div>
        </div>
      )}

      <nav className="navbar">
        <div className="container">
          <div className="navbar-content">
            {/* 로고와 차트보기 */}
            <div className="navbar-left">
              <Link to="/" className="navbar-logo">
                <span className="logo-text">
                  BitView<span className="logo-dot">.</span>
                </span>
              </Link>
              <Link to="/live-coins" className={`chart-link ${location.pathname === '/live-coins' ? 'active' : ''}`}>
                실시간 코인 가격
              </Link>
              <Link to="/chart" className={`chart-link ${location.pathname === '/chart' ? 'active' : ''}`}>
                실시간 차트
              </Link>

              <Link to="/profit-calculator" className={`chart-link ${location.pathname === '/profit-calculator' ? 'active' : ''}`}>
                수익 복리 계산기
              </Link>
              <Link to="/funding-calculator" className={`chart-link ${location.pathname === '/funding-calculator' ? 'active' : ''}`}>
                펀딩비 계산기
              </Link>
              <Link to="/advanced-backtest" className={`chart-link ${location.pathname === '/advanced-backtest' ? 'active' : ''}`}>
                백테스트
              </Link>
            </div>

            {/* 사용자 메뉴 */}
            <div className="navbar-right desktop-menu">
              {!isPremium && !isAdmin && (
                <button onClick={handlePremiumClick} className={`premium-link ${location.pathname === '/premium' ? 'active' : ''}`}>
                  <span className="premium-text">💎 프리미엄</span>
                </button>
              )}
              {isAuthenticated ? (
                <div className="user-menu" ref={dropdownRef}>
                  <button className="user-dropdown-btn" onClick={toggleDropdown}>
                    <User size={20} />
                    <span>{user?.name || user?.email}</span>
                    {isAdmin && <span className="admin-badge">관리자</span>}
                    {isPremium && !isAdmin && <span className="vip-badge">💎 VIP</span>}
                    <ChevronDown size={16} className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`} />
                  </button>
                  
                  {dropdownOpen && (
                    <div className="dropdown-menu">
                      <button onClick={handleUserInfoClick} className="dropdown-item">
                        <UserCircle size={16} />
                        회원 정보
                      </button>
                      {isAdmin && (
                        <Link 
                          to="/admin" 
                          className="dropdown-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <Settings size={16} />
                          관리자 대시보드
                        </Link>
                      )}
                      <button onClick={handleLogout} className="dropdown-item logout">
                        <LogOut size={16} />
                        로그아웃
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/signup" className="auth-btn signup-btn">회원가입</Link>
                  <Link to="/login" className="auth-btn login-btn">로그인</Link>
                </>
              )}
            </div>

            {/* 모바일 메뉴 토글 */}
            <button
              className="mobile-menu-toggle"
              onClick={toggleMenu}
              aria-label="메뉴 토글"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* 모바일 메뉴 */}
          <motion.div
            className={`mobile-menu ${isOpen ? 'mobile-menu-open' : ''}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: isOpen ? 1 : 0,
              height: isOpen ? 'auto' : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="mobile-menu-content">
              <Link
                to="/live-coins"
                className="mobile-menu-link"
                onClick={() => setIsOpen(false)}
              >
                실시간 코인 가격
              </Link>
              
              <Link
                to="/chart"
                className="mobile-menu-link"
                onClick={() => setIsOpen(false)}
              >
                실시간 차트
              </Link>
              
              <Link
                to="/profit-calculator"
                className="mobile-menu-link"
                onClick={() => setIsOpen(false)}
              >
                수익 복리 계산기
              </Link>
              
              <Link
                to="/funding-calculator"
                className="mobile-menu-link"
                onClick={() => setIsOpen(false)}
              >
                펀딩비 계산기
              </Link>
              
              <Link
                to="/advanced-backtest"
                className="mobile-menu-link"
                onClick={() => setIsOpen(false)}
              >
                백테스트
              </Link>
              
              {isAuthenticated ? (
                <>
                  <div className="mobile-user-info">
                    <User size={20} />
                    <span>{user?.name || user?.email}</span>
                    {isAdmin && <span className="admin-badge">관리자</span>}
                    {isPremium && !isAdmin && <span className="vip-badge">💎 VIP</span>}
                  </div>
                  {!isPremium && !isAdmin && (
                    <button
                      onClick={(e) => {
                        handlePremiumClick(e)
                        setIsOpen(false)
                      }}
                      className="mobile-menu-link premium-mobile-link"
                    >
                      💎 프리미엄
                    </button>
                  )}
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      className="mobile-menu-link"
                      onClick={() => setIsOpen(false)}
                    >
                      관리자 대시보드
                    </Link>
                  )}
                  <button onClick={handleLogout} className="mobile-logout-btn">
                    <LogOut size={16} />
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={(e) => {
                      handlePremiumClick(e)
                      setIsOpen(false)
                    }}
                    className="mobile-menu-link premium-mobile-link"
                  >
                    💎 프리미엄
                  </button>
                  <Link 
                    to="/signup" 
                    className="mobile-menu-btn signup-btn"
                    onClick={() => setIsOpen(false)}
                  >
                    회원가입
                  </Link>
                  <Link 
                    to="/login" 
                    className="mobile-menu-btn login-btn"
                    onClick={() => setIsOpen(false)}
                  >
                    로그인
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </nav>

      {/* 회원 정보 모달 */}
      {userInfoModalOpen && (
        <div className="user-info-modal-overlay" onClick={() => setUserInfoModalOpen(false)}>
          <div className="user-info-modal" onClick={(e) => e.stopPropagation()}>
            <div className="user-info-modal-header">
              <h2>회원 정보</h2>
              <button onClick={() => setUserInfoModalOpen(false)} className="close-btn">
                <X size={20} />
              </button>
            </div>
            <div className="user-info-modal-content">
              <div className="user-info-item">
                <label>아이디:</label>
                <span>{user?.email}</span>
              </div>
              <div className="user-info-item">
                <label>비밀번호:</label>
                <div className="password-container">
                  <span className="password-display">
                    {showPassword ? user?.password || '설정되지 않음' : '••••••••'}
                  </span>
                  <button 
                    onClick={togglePasswordVisibility}
                    className="password-toggle-btn"
                    title={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="user-info-item">
                <label>닉네임:</label>
                <div className="name-container">
                  {isEditingName ? (
                    <div className="name-edit-container">
                      <div className="name-edit-input-container">
                        <input
                          type="text"
                          value={tempName}
                          onChange={handleNameChange}
                          className="name-input"
                          placeholder="닉네임을 입력하세요"
                          autoFocus
                        />
                        <div className="name-edit-buttons">
                          <button onClick={handleSaveName} className="save-btn" title="저장">
                            <Check size={16} />
                          </button>
                          <button onClick={handleCancelEditName} className="cancel-btn" title="취소">
                            <XIcon size={16} />
                          </button>
                        </div>
                      </div>
                      {nameError && (
                        <div className="name-error">
                          {nameError}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="name-display-container">
                      <span>{user?.name || '닉네임 설정되지 않음'}</span>
                      <button onClick={handleEditName} className="edit-btn" title="닉네임 변경">
                        <Edit2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="user-info-item">
                <label>계정 유형:</label>
                <span>
                  {isAdmin ? '관리자' : isPremium ? '프리미엄' : '일반'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .notice-banner {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1001;
          background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
          color: white;
          padding: 0.5rem 0;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .notice-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          position: relative;
        }

        .notice-text {
          font-size: 0.9rem;
          font-weight: 500;
          text-align: center;
          flex: 1;
        }



        .navbar {
          position: fixed;
          top: ${!isPremium && location.pathname === '/' ? '2.75rem' : '0'};
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(17, 17, 17, 0.65);
          backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          transition: top 0.3s ease;
        }

        .navbar-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 0;
        }

        .navbar-content-fullwidth {
          padding-left: 2rem;
          padding-right: 2rem;
        }

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .navbar-logo {
          display: flex;
          align-items: center;
          text-decoration: none;
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
        }

        .logo-dot {
          color: #6680fd;
        }

        .chart-link {
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 500;
          position: relative;
          transition: color var(--transition-normal);
        }

        .chart-link:hover,
        .chart-link.active {
          color: #ffffff;
        }



        .desktop-menu {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-menu {
          position: relative;
        }

        .user-dropdown-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          border: none;
          color: white;
          font-weight: 500;
          cursor: pointer;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          transition: all 0.3s ease;
        }

        .user-dropdown-btn:hover {
          background: transparent;
        }

        .admin-badge {
          background: #6680fd;
          color: white;
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .vip-badge {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
          animation: vipGlow 2s ease-in-out infinite;
        }

        @keyframes vipGlow {
          0%, 100% {
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 4px 16px rgba(59, 130, 246, 0.5);
          }
        }

        .dropdown-arrow {
          transition: transform 0.3s ease;
        }

        .dropdown-arrow.open {
          transform: rotate(180deg);
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: rgba(17, 17, 17, 0.70);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          backdrop-filter: blur(18px);
          min-width: 200px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
          z-index: 1000;
          margin-top: 0.5rem;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.75rem 1rem;
          background: transparent;
          border: none;
          color: white;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
        }

        .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .dropdown-item.logout {
          color: white;
        }

        .dropdown-item.logout:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .auth-btn {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-normal);
          border: 1px solid transparent;
          text-decoration: none;
          display: inline-block;
          text-align: center;
        }

        .signup-btn {
          background: transparent;
          color: var(--text-secondary);
          border-color: transparent;
        }

        .signup-btn:hover {
          background: transparent;
          color: #ffffff;
          border-color: transparent;
        }

        .login-btn {
          background: transparent;
          color: var(--text-secondary);
          border-color: transparent;
        }

        .login-btn:hover {
          background: transparent;
          color: #ffffff;
          border-color: transparent;
        }

        .mobile-menu-toggle {
          display: none;
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.5rem;
          transition: background-color var(--transition-normal);
        }

        .mobile-menu-toggle:hover {
          background: var(--bg-card);
        }

        .mobile-menu {
          overflow: hidden;
        }

        .mobile-menu-content {
          padding: 1rem 0;
          border-top: 1px solid var(--border-color);
          display: none;
          flex-direction: column;
          gap: 1rem;
        }

        .mobile-menu-open .mobile-menu-content {
          display: flex;
        }

        .mobile-menu-link {
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 500;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          border: none;
          background: transparent;
          cursor: pointer;
          width: 100%;
          text-align: left;
          font-size: inherit;
          font-family: inherit;
          transition: all var(--transition-normal);
        }

        .mobile-menu-link:hover {
          color: var(--secondary-cyan);
          background: var(--bg-card);
        }

        .mobile-user-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: white;
          font-weight: 500;
          padding: 0.75rem 1rem;
          background: rgba(51, 65, 85, 0.3);
          border-radius: 0.5rem;
        }

        .mobile-logout-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          border: 1px solid #ef4444;
          color: #ef4444;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
        }

        .mobile-logout-btn:hover {
          background: #ef4444;
          color: white;
        }

        .mobile-menu-btn {
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-normal);
          border: 1px solid transparent;
          text-align: left;
          text-decoration: none;
          display: block;
        }

        .mobile-menu-btn.signup-btn {
          background: transparent;
          color: var(--text-secondary);
          border-color: transparent;
        }

        .mobile-menu-btn.signup-btn:hover {
          background: transparent;
          color: #ffffff;
          border-color: transparent;
        }

        .mobile-menu-btn.login-btn {
          background: transparent;
          color: var(--text-secondary);
          border-color: transparent;
        }

        .mobile-menu-btn.login-btn:hover {
          background: transparent;
          color: #ffffff;
          border-color: transparent;
        }

        /* 프리미엄 링크 스타일 */
        .premium-link {
          position: relative;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white !important;
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          box-shadow: 
            0 4px 12px rgba(59, 130, 246, 0.3),
            0 0 20px rgba(59, 130, 246, 0.1);
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .premium-link::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.6s ease;
        }

        .premium-link:hover {
          transform: translateY(-2px);
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          box-shadow: 
            0 6px 16px rgba(59, 130, 246, 0.4),
            0 0 30px rgba(59, 130, 246, 0.2);
        }

        .premium-link:hover::before {
          left: 100%;
        }

        .premium-text {
          position: relative;
          z-index: 1;
        }

        .premium-mobile-link {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white !important;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          text-align: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .premium-mobile-link:hover {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }

        /* 회원 정보 모달 스타일 */
        .user-info-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeIn 0.3s ease;
        }

        .user-info-modal {
          background: #1a1a1a;
          border-radius: 12px;
          padding: 2rem;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          animation: slideIn 0.3s ease;
        }

        .user-info-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .user-info-modal-header h2 {
          color: white;
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 4px;
          transition: color 0.3s ease;
        }

        .close-btn:hover {
          color: white;
        }

        .user-info-modal-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .user-info-item {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          gap: 1rem;
        }

        .user-info-item:last-child {
          border-bottom: none;
        }

        .user-info-item label {
          color: #cccccc;
          font-weight: 500;
          font-size: 0.9rem;
          min-width: 80px;
          flex-shrink: 0;
        }

        .user-info-item span {
          color: white;
          font-weight: 600;
        }

        .user-info-item > span,
        .user-info-item > div {
          flex: 1;
          display: flex;
          justify-content: flex-end;
        }

        /* 비밀번호 표시/숨기기 스타일 */
        .password-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .password-display {
          color: white;
          font-weight: 600;
          font-family: monospace;
          min-width: 100px;
          text-align: right;
        }

        .password-toggle-btn {
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: color 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .password-toggle-btn:hover {
          color: #3b82f6;
        }

        /* 이름 편집 스타일 */
        .name-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          min-width: 200px;
          justify-content: flex-end;
        }

        .name-display-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
          justify-content: flex-end;
        }

        .name-edit-container {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.5rem;
          flex: 1;
        }

        .name-edit-input-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .name-input {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          color: white;
          padding: 0.5rem 0.75rem;
          font-size: 0.9rem;
          width: 150px;
          text-align: right;
        }

        .name-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }

        .name-edit-buttons {
          display: flex;
          gap: 0.25rem;
        }

        .edit-btn,
        .save-btn,
        .cancel-btn {
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: color 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .edit-btn:hover {
          color: #3b82f6;
        }

        .save-btn:hover {
          color: #10b981;
        }

        .cancel-btn:hover {
          color: #ef4444;
        }

        .name-error {
          color: #ef4444;
          font-size: 0.8rem;
          margin-top: 0.25rem;
          text-align: right;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .notice-text {
            font-size: 0.8rem;
          }

          .navbar-left {
            gap: 1rem;
          }

          .chart-link {
            font-size: 0.9rem;
          }

          .desktop-menu {
            display: none;
          }

          .mobile-menu-toggle {
            display: block;
          }

          .user-info-modal {
            max-width: 350px;
            padding: 1.5rem;
          }
        }
      `}</style>
    </>
  )
}

export default Navbar