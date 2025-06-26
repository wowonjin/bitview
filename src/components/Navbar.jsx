import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Menu, X, User, LogOut, ChevronDown, Settings } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { user, logout, isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const dropdownRef = useRef(null)

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
            <Link to="/chart" className={`chart-link ${location.pathname === '/chart' ? 'active' : ''}`}>
              차트 보기
            </Link>
            <Link to="/trading" className={`chart-link ${location.pathname === '/trading' ? 'active' : ''}`}>
              차트 백테스트
            </Link>
          </div>

          {/* 사용자 메뉴 */}
          <div className="navbar-right desktop-menu">
            {isAuthenticated ? (
              <div className="user-menu" ref={dropdownRef}>
                <button className="user-dropdown-btn" onClick={toggleDropdown}>
                  <User size={20} />
                  <span>{user?.name || user?.email}</span>
                  {isAdmin && <span className="admin-badge">관리자</span>}
                  <ChevronDown size={16} className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`} />
                </button>
                
                {dropdownOpen && (
                  <div className="dropdown-menu">
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
              to="/chart"
              className="mobile-menu-link"
              onClick={() => setIsOpen(false)}
            >
              차트 보기
            </Link>
            
            <Link
              to="/trading"
              className="mobile-menu-link"
              onClick={() => setIsOpen(false)}
            >
              차트 백테스트
            </Link>
            
            {isAuthenticated ? (
              <>
                <div className="mobile-user-info">
                  <User size={20} />
                  <span>{user?.name || user?.email}</span>
                  {isAdmin && <span className="admin-badge">관리자</span>}
                </div>
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

      <style jsx>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(17, 17, 17, 0.65);
          backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .navbar-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 0;
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
          background: rgba(255, 255, 255, 0.1);
        }

        .admin-badge {
          background: #6680fd;
          color: white;
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
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
          border-top: 1px solid #475569;
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
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(128, 128, 128, 0.01));
          border: 1px solid #374151;
          border-radius: 8px;
          color: var(--text-primary);
          font-weight: 600;
          position: relative;
          overflow: hidden;
          transition: all 0.4s ease;
          backdrop-filter: blur(20px);
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.15),
            0 0 20px rgba(59, 130, 246, 0.15),
            0 0 40px rgba(59, 130, 246, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }



        .login-btn::after {
          content: '';
          position: absolute;
          top: -1px;
          left: -1px;
          right: -1px;
          bottom: -1px;
          background: linear-gradient(135deg, 
            rgba(59, 130, 246, 0.15) 0%, 
            rgba(14, 165, 233, 0.1) 50%, 
            rgba(6, 182, 212, 0.08) 100%);
          border-radius: 9px;
          z-index: -1;
          opacity: 0.6;
          filter: blur(0.5px);
          animation: buttonGlow 4s ease-in-out infinite;
        }

        @keyframes buttonGlow {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.002);
          }
        }

        .login-btn:hover {
          transform: translateY(-2px);
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
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(128, 128, 128, 0.01));
          border: 1px solid #374151;
          border-radius: 8px;
          color: var(--text-primary);
          font-weight: 600;
          position: relative;
          overflow: hidden;
          transition: all 0.4s ease;
          backdrop-filter: blur(20px);
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.15),
            0 0 20px rgba(59, 130, 246, 0.15),
            0 0 40px rgba(59, 130, 246, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .mobile-menu-btn.login-btn::after {
          content: '';
          position: absolute;
          top: -1px;
          left: -1px;
          right: -1px;
          bottom: -1px;
          background: linear-gradient(135deg, 
            rgba(59, 130, 246, 0.15) 0%, 
            rgba(14, 165, 233, 0.1) 50%, 
            rgba(6, 182, 212, 0.08) 100%);
          border-radius: 9px;
          z-index: -1;
          opacity: 0.6;
          filter: blur(0.5px);
          animation: buttonGlow 4s ease-in-out infinite;
        }

        .mobile-menu-btn.login-btn:hover {
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
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
        }
      `}</style>
    </nav>
  )
}

export default Navbar 