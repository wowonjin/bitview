import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Users, 
  Trash2, 
  Crown, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Shield, 
  UserCheck, 
  UserX,
  RefreshCw,
  AlertTriangle,
  Calendar,
  Mail,
  MapPin,
  Award
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { useAuth } from '../context/AuthContext'
import { 
  getAllUsers, 
  deleteUserFromFirestore, 
  updateUserRole, 
  setPremiumMembership, 
  setVipMembership, 
  expireMembership 
} from '../utils/firebase-auth'

const Admin = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [membershipFilter, setMembershipFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    vipUsers: 0,
    todaySignups: 0
  })
  
  const navigate = useNavigate()
  const { user: currentUser, userProfile } = useAuth()

  useEffect(() => {
    // 관리자 권한 확인
    if (!currentUser) {
      navigate('/login')
      return
    }

    if (currentUser.email !== 'admin@gmail.com' && !userProfile?.isAdmin) {
      alert('관리자 권한이 필요합니다.')
      navigate('/')
      return
    }

    document.title = 'BitView - 회원 관리'
    loadUsers()
  }, [currentUser, userProfile, navigate])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter, membershipFilter])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError('')
      
      const usersData = await getAllUsers()
      setUsers(usersData)
      
      // 통계 계산
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const todaySignups = usersData.filter(user => {
        const createdAt = user.createdAt?.toDate() || new Date(user.createdAt)
        return createdAt >= today
      }).length
      
      setStats({
        totalUsers: usersData.length,
        premiumUsers: usersData.filter(user => user.is_premium).length,
        vipUsers: usersData.filter(user => user.is_vip).length,
        todaySignups
      })
      
    } catch (err) {
      console.error('사용자 목록 로딩 실패:', err)
      setError('사용자 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(user => {
        const name = user.displayName || user.name || ''
        const email = user.email || ''
        
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               email.toLowerCase().includes(searchTerm.toLowerCase())
      })
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter || (!user.role && roleFilter === 'user'))
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

  const handleDeleteUser = async (userId, userName) => {
    if (userId === currentUser.uid) {
      alert('자신의 계정은 삭제할 수 없습니다.')
      return
    }

    if (window.confirm(`정말로 "${userName}" 사용자를 삭제하시겠습니까?`)) {
      try {
        await deleteUserFromFirestore(userId)
        await loadUsers()
        alert('사용자가 성공적으로 삭제되었습니다.')
      } catch (err) {
        console.error('사용자 삭제 실패:', err)
        alert('사용자 삭제에 실패했습니다.')
      }
    }
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setShowEditModal(true)
  }

  const handleUpdateUser = async (userId, updates) => {
    try {
      await updateUserRole(userId, updates.role, updates.is_premium)
      await loadUsers()
      setShowEditModal(false)
      setSelectedUser(null)
      alert('사용자 정보가 성공적으로 업데이트되었습니다.')
    } catch (err) {
      console.error('사용자 업데이트 실패:', err)
      alert('사용자 정보 업데이트에 실패했습니다.')
    }
  }

  const handleSetPremium = async (userId, duration) => {
    try {
      await setPremiumMembership(userId, duration)
      await loadUsers()
      alert(`프리미엄 회원으로 설정되었습니다. (${duration}일)`)
    } catch (err) {
      console.error('프리미엄 설정 실패:', err)
      alert('프리미엄 설정에 실패했습니다.')
    }
  }

  const handleSetVip = async (userId, duration) => {
    try {
      await setVipMembership(userId, duration)
      await loadUsers()
      alert(`VIP 회원으로 설정되었습니다. (${duration}일)`)
    } catch (err) {
      console.error('VIP 설정 실패:', err)
      alert('VIP 설정에 실패했습니다.')
    }
  }

  const handleExpireMembership = async (userId) => {
    try {
      await expireMembership(userId)
      await loadUsers()
      alert('회원 등급이 만료되었습니다.')
    } catch (err) {
      console.error('회원 등급 만료 실패:', err)
      alert('회원 등급 만료에 실패했습니다.')
    }
  }

  const exportToExcel = () => {
    const exportData = filteredUsers.map(user => ({
      '이름': user.displayName || user.name || '',
      '이메일': user.email || '',
      '역할': user.role || 'user',
      '프리미엄': user.is_premium ? '예' : '아니오',
      'VIP': user.is_vip ? '예' : '아니오',
      '가입일': user.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString('ko-KR') : '',
      '최근 로그인': user.last_login ? new Date(user.last_login.toDate()).toLocaleDateString('ko-KR') : '',
      '거래소 등록': user.exchange_registered ? '예' : '아니오'
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

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return <span className="admin-badge">관리자</span>
    }
    return <span className="user-badge">사용자</span>
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
            <Crown size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.premiumUsers}</div>
            <div className="stat-label">프리미엄 회원</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Award size={24} />
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
            placeholder="이름 또는 이메일로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">모든 역할</option>
            <option value="admin">관리자</option>
            <option value="user">사용자</option>
          </select>
          <select value={membershipFilter} onChange={(e) => setMembershipFilter(e.target.value)}>
            <option value="all">모든 등급</option>
            <option value="basic">일반</option>
            <option value="premium">프리미엄</option>
            <option value="vip">VIP</option>
          </select>
        </div>
      </div>

      {/* 사용자 목록 */}
      <div className="users-grid">
        {filteredUsers.map((user) => (
          <div key={user.id} className="user-card">
            <div className="user-card-header">
              <div className="user-avatar">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} />
                ) : (
                  <div className="avatar-placeholder">
                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="user-info">
                <div className="user-name">{user.displayName || user.name || '이름 없음'}</div>
                <div className="user-email">{user.email}</div>
                <div className="user-badges">
                  {getRoleBadge(user.role)}
                  {getMembershipBadge(user)}
                </div>
              </div>
            </div>
            
            <div className="user-details">
              <div className="detail-row">
                <Calendar size={14} />
                <span>가입일: {formatDate(user.createdAt)}</span>
              </div>
              <div className="detail-row">
                <MapPin size={14} />
                <span>최근 접속: {formatDate(user.last_login)}</span>
              </div>
              {user.exchange_registered && (
                <div className="detail-row">
                  <Mail size={14} />
                  <span>거래소 이메일: {user.exchange_email || '등록됨'}</span>
                </div>
              )}
            </div>

            <div className="user-actions">
              <button
                className="edit-btn"
                onClick={() => handleEditUser(user)}
              >
                <Edit size={14} />
                수정
              </button>
              
              {!user.is_premium && (
                <button
                  className="premium-btn"
                  onClick={() => handleSetPremium(user.id, 30)}
                >
                  <Crown size={14} />
                  프리미엄
                </button>
              )}
              
              {!user.is_vip && (
                <button
                  className="vip-btn"
                  onClick={() => handleSetVip(user.id, 365)}
                >
                  <Award size={14} />
                  VIP
                </button>
              )}
              
              {(user.is_premium || user.is_vip) && (
                <button
                  className="expire-btn"
                  onClick={() => handleExpireMembership(user.id)}
                >
                  <UserX size={14} />
                  등급 해제
                </button>
              )}
              
              {user.id !== currentUser.uid && (
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteUser(user.id, user.displayName || user.email)}
                >
                  <Trash2 size={14} />
                  삭제
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="no-users">
          <Users size={48} />
          <p>표시할 사용자가 없습니다.</p>
        </div>
      )}

      {/* 사용자 수정 모달 */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>사용자 정보 수정</h3>
            <div className="modal-body">
              <div className="form-group">
                <label>이름:</label>
                <input
                  type="text"
                  value={selectedUser.displayName || ''}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label>이메일:</label>
                <input
                  type="email"
                  value={selectedUser.email || ''}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label>역할:</label>
                <select
                  value={selectedUser.role || 'user'}
                  onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
                >
                  <option value="user">사용자</option>
                  <option value="admin">관리자</option>
                </select>
              </div>
              <div className="form-group">
                <label>프리미엄 회원:</label>
                <input
                  type="checkbox"
                  checked={selectedUser.is_premium || false}
                  onChange={(e) => setSelectedUser({...selectedUser, is_premium: e.target.checked})}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="save-btn"
                onClick={() => handleUpdateUser(selectedUser.id, {
                  role: selectedUser.role,
                  is_premium: selectedUser.is_premium
                })}
              >
                저장
              </button>
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedUser(null)
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #eee;
        }

        .admin-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .admin-title h1 {
          margin: 0;
          color: #333;
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
          background: #f8f9fa;
          color: #495057;
        }

        .refresh-btn:hover {
          background: #e9ecef;
        }

        .export-btn {
          background: #007bff;
          color: white;
        }

        .export-btn:hover {
          background: #0056b3;
        }

        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
          text-align: center;
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
          background: #f8d7da;
          color: #721c24;
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
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .stat-icon {
          padding: 12px;
          border-radius: 10px;
          background: #f8f9fa;
          color: #495057;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #333;
        }

        .stat-label {
          font-size: 14px;
          color: #6c757d;
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
          color: #6c757d;
        }

        .search-box input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
        }

        .filter-group {
          display: flex;
          gap: 12px;
        }

        .filter-group select {
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          min-width: 120px;
        }

        .users-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .user-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          padding: 20px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .user-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }

        .user-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .user-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          overflow: hidden;
        }

        .user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          background: #007bff;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 600;
        }

        .user-name {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }

        .user-email {
          font-size: 14px;
          color: #6c757d;
        }

        .user-badges {
          display: flex;
          gap: 6px;
          margin-top: 4px;
        }

        .admin-badge {
          background: #dc3545;
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 500;
        }

        .user-badge {
          background: #6c757d;
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 500;
        }

        .vip-badge {
          background: #ff6b35;
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 500;
        }

        .premium-badge {
          background: #ffc107;
          color: #212529;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 500;
        }

        .basic-badge {
          background: #e9ecef;
          color: #495057;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 500;
        }

        .user-details {
          margin-bottom: 16px;
        }

        .detail-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #6c757d;
          margin-bottom: 4px;
        }

        .user-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .user-actions button {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .edit-btn {
          background: #f8f9fa;
          color: #495057;
        }

        .edit-btn:hover {
          background: #e9ecef;
        }

        .premium-btn {
          background: #ffc107;
          color: #212529;
        }

        .premium-btn:hover {
          background: #e0a800;
        }

        .vip-btn {
          background: #ff6b35;
          color: white;
        }

        .vip-btn:hover {
          background: #e55a2b;
        }

        .expire-btn {
          background: #6c757d;
          color: white;
        }

        .expire-btn:hover {
          background: #5a6268;
        }

        .delete-btn {
          background: #dc3545;
          color: white;
        }

        .delete-btn:hover {
          background: #c82333;
        }

        .no-users {
          text-align: center;
          padding: 60px 20px;
          color: #6c757d;
        }

        .no-users svg {
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          padding: 24px;
          width: 400px;
          max-width: 90vw;
        }

        .modal-content h3 {
          margin: 0 0 20px 0;
          color: #333;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 4px;
          font-weight: 500;
          color: #333;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }

        .form-group input[type="checkbox"] {
          width: auto;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
        }

        .save-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .save-btn:hover {
          background: #0056b3;
        }

        .cancel-btn {
          background: #6c757d;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .cancel-btn:hover {
          background: #5a6268;
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