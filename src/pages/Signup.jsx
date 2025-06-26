import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    // 유효성 검사
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    if (formData.password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      return
    }

    // 기존 사용자 확인
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const existingUser = users.find(u => u.email === formData.email)

    if (existingUser) {
      setError('이미 가입된 이메일입니다.')
      return
    }

    // 새 사용자 추가
    const newUser = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      password: formData.password,
      joinDate: new Date().toISOString()
    }

    users.push(newUser)
    localStorage.setItem('users', JSON.stringify(users))

    // 자동 로그인
    const userData = {
      email: newUser.email,
      name: newUser.name,
      role: 'user'
    }
    login(userData)

    navigate('/')
  }

  return (
    <div className="signup-page">
      <div className="signup-container">
        <motion.div
          className="signup-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="signup-header">
            <h1>회원가입</h1>
            <p>BitView와 함께 암호화폐 투자를 시작하세요</p>
          </div>

          <form onSubmit={handleSubmit} className="signup-form">
            <div className="form-group">
              <label htmlFor="name">이름</label>
              <div className="input-wrapper">
                <User size={20} className="input-icon" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="이름을 입력해주세요"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">이메일</label>
              <div className="input-wrapper">
                <Mail size={20} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="이메일을 입력해주세요"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">비밀번호</label>
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="비밀번호를 입력해주세요 (6자 이상)"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">비밀번호 확인</label>
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="비밀번호를 다시 입력해주세요"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="signup-btn">
              회원가입
            </button>
          </form>

          <div className="signup-footer">
            <p>이미 계정이 있으신가요? <a href="/login">로그인</a></p>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .signup-page {
          min-height: 100vh;
          background: #111111;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px 20px 20px;
        }

        .signup-container {
          width: 100%;
          max-width: 400px;
        }

        .signup-card {
          background: rgba(51, 65, 85, 0.3);
          border: 1px solid #475569;
          border-radius: 12px;
          padding: 2rem;
          backdrop-filter: blur(10px);
        }

        .signup-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .signup-header h1 {
          color: white;
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .signup-header p {
          color: #cbd5e1;
          font-size: 0.9rem;
        }

        .signup-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          color: #cbd5e1;
          font-weight: 500;
          font-size: 0.9rem;
          text-align: left;
          align-self: flex-start;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-wrapper input {
          width: 100%;
          padding: 12px 16px 12px 45px;
          background: rgba(17, 17, 17, 0.8);
          border: 1px solid #475569;
          border-radius: 8px;
          color: white;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .input-wrapper input:focus {
          outline: none;
          border-color: #6680fd;
          box-shadow: 0 0 0 3px rgba(102, 128, 253, 0.1);
        }

        .input-wrapper input::placeholder {
          color: #64748b;
        }

        .input-icon {
          position: absolute;
          left: 15px;
          color: #64748b;
          pointer-events: none;
        }

        .password-toggle {
          position: absolute;
          right: 15px;
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .password-toggle:hover {
          color: #cbd5e1;
        }

        .error-message {
          color: #ef4444;
          font-size: 0.85rem;
          text-align: center;
          padding: 0.5rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 6px;
        }

        .signup-btn {
          background: #6680fd;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .signup-btn:hover {
          background: #5a6efc;
          transform: translateY(-1px);
        }

        .signup-footer {
          text-align: center;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #475569;
        }

        .signup-footer p {
          color: #cbd5e1;
          font-size: 0.9rem;
        }

        .signup-footer a {
          color: #6680fd;
          text-decoration: none;
          font-weight: 500;
        }

        .signup-footer a:hover {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .signup-card {
            padding: 1.5rem;
          }

          .signup-header h1 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  )
}

export default Signup 