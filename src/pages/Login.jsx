import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
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

    // 관리자 계정 체크
    if (formData.email === 'admin@gmail.com' && formData.password === 'admin123') {
      const adminUser = {
        email: formData.email,
        role: 'admin'
      }
      login(adminUser)
      navigate('/admin')
      return
    }

    // 일반 사용자 로그인 체크
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const user = users.find(u => u.email === formData.email && u.password === formData.password)

    if (user) {
      const userData = {
        email: user.email,
        name: user.name,
        role: 'user'
      }
      login(userData)
      navigate('/')
    } else {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <motion.div
          className="login-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="login-header">
            <h1>로그인</h1>
            <p>BitView에 오신 것을 환영합니다</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
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
                  placeholder="비밀번호를 입력해주세요"
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

            <div className="remember-me">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkmark"></span>
                로그인 정보 저장하기
              </label>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="login-btn">
              로그인
            </button>
          </form>

          <div className="login-footer">
            <p>계정이 없으신가요? <a href="/signup">회원가입</a></p>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          background: #111111;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px 20px 20px;
        }

        .login-container {
          width: 100%;
          max-width: 400px;
        }

        .login-card {
          background: rgba(51, 65, 85, 0.3);
          border: 1px solid #475569;
          border-radius: 12px;
          padding: 2rem;
          backdrop-filter: blur(10px);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-header h1 {
          color: white;
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .login-header p {
          color: #cbd5e1;
          font-size: 0.9rem;
        }

        .login-form {
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

        .login-btn {
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

        .login-btn:hover {
          background: #5a6efc;
          transform: translateY(-1px);
        }

        .remember-me {
          display: flex;
          align-items: center;
          margin: 0.5rem 0;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          cursor: pointer;
          color: #cbd5e1;
          font-size: 0.9rem;
          gap: 0.5rem;
        }

        .checkbox-label input[type="checkbox"] {
          display: none;
        }

        .checkmark {
          width: 18px;
          height: 18px;
          border: 2px solid #475569;
          border-radius: 3px;
          position: relative;
          transition: all 0.3s ease;
        }

        .checkbox-label input[type="checkbox"]:checked + .checkmark {
          background: #6680fd;
          border-color: #6680fd;
        }

        .checkbox-label input[type="checkbox"]:checked + .checkmark::after {
          content: '';
          position: absolute;
          left: 5px;
          top: 2px;
          width: 4px;
          height: 8px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .login-footer {
          text-align: center;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #475569;
        }

        .login-footer p {
          color: #cbd5e1;
          font-size: 0.9rem;
        }

        .login-footer a {
          color: #6680fd;
          text-decoration: none;
          font-weight: 500;
        }

        .login-footer a:hover {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 1.5rem;
          }

          .login-header h1 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  )
}

export default Login 