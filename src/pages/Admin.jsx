import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Mail, Calendar, Trash2, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Admin = () => {
  const [users, setUsers] = useState([])
  const navigate = useNavigate()
  const { user: currentUser, logout, isAdmin } = useAuth()

  useEffect(() => {
    // 관리자 권한 체크
    if (!currentUser || !isAdmin) {
      navigate('/login')
      return
    }

    loadUsers()
  }, [currentUser, isAdmin, navigate])

  const loadUsers = () => {
    const usersData = JSON.parse(localStorage.getItem('users') || '[]')
    setUsers(usersData)
  }

  const deleteUser = (userId) => {
    if (window.confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
      const updatedUsers = users.filter(user => user.id !== userId)
      setUsers(updatedUsers)
      localStorage.setItem('users', JSON.stringify(updatedUsers))
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
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

  if (!currentUser) {
    return <div>로딩 중...</div>
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <motion.div
          className="admin-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="header-content">
            <div className="header-left">
              <h1>관리자 대시보드</h1>
              <p>BitView 사용자 관리</p>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={20} />
              로그아웃
            </button>
          </div>
        </motion.div>

        <motion.div
          className="stats-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="stat-card">
            <Users size={24} className="stat-icon" />
            <div className="stat-content">
              <h3>총 사용자</h3>
              <p>{users.length}명</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="users-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2>가입 사용자 목록</h2>
          
          {users.length === 0 ? (
            <div className="no-users">
              <Users size={48} />
              <p>아직 가입한 사용자가 없습니다.</p>
            </div>
          ) : (
            <div className="users-grid">
              {users.map((user, index) => (
                <motion.div
                  key={user.id}
                  className="user-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-details">
                      <h3>{user.name}</h3>
                      <div className="user-meta">
                        <div className="meta-item">
                          <Mail size={16} />
                          <span>{user.email}</span>
                        </div>
                        <div className="meta-item">
                          <Calendar size={16} />
                          <span>{formatDate(user.joinDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="delete-btn"
                    title="사용자 삭제"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <style jsx>{`
        .admin-page {
          min-height: 100vh;
          background: #111111;
          padding: 80px 20px 20px;
        }

        .admin-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .admin-header {
          margin-bottom: 2rem;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(51, 65, 85, 0.3);
          border: 1px solid #475569;
          border-radius: 12px;
          padding: 2rem;
          backdrop-filter: blur(10px);
        }

        .header-left h1 {
          color: white;
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .header-left p {
          color: #cbd5e1;
          font-size: 1rem;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #ef4444;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .logout-btn:hover {
          background: #dc2626;
          transform: translateY(-1px);
        }

        .stats-section {
          margin-bottom: 2rem;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(51, 65, 85, 0.3);
          border: 1px solid #475569;
          border-radius: 12px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
        }

        .stat-icon {
          color: #6680fd;
          background: rgba(102, 128, 253, 0.2);
          padding: 0.75rem;
          border-radius: 8px;
        }

        .stat-content h3 {
          color: #cbd5e1;
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }

        .stat-content p {
          color: white;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .users-section h2 {
          color: white;
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }

        .no-users {
          text-align: center;
          padding: 3rem;
          color: #64748b;
        }

        .no-users svg {
          margin-bottom: 1rem;
        }

        .users-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .user-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(51, 65, 85, 0.3);
          border: 1px solid #475569;
          border-radius: 12px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .user-card:hover {
          border-color: #6680fd;
          transform: translateY(-2px);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
        }

        .user-avatar {
          width: 48px;
          height: 48px;
          background: #6680fd;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .user-details h3 {
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .user-meta {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #cbd5e1;
          font-size: 0.85rem;
        }

        .meta-item svg {
          color: #64748b;
        }

        .delete-btn {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
          padding: 0.5rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.3);
          border-color: #ef4444;
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .users-grid {
            grid-template-columns: 1fr;
          }

          .user-card {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .user-info {
            justify-content: center;
          }

          .delete-btn {
            align-self: center;
          }
        }
      `}</style>
    </div>
  )
}

export default Admin 