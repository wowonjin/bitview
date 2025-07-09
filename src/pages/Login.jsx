import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Check, Sparkles, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('')
  const [isEmailSending, setIsEmailSending] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // 로딩 애니메이션을 위한 지연
    await new Promise(resolve => setTimeout(resolve, 800))

    // 관리자 계정 체크
    if (formData.email === 'admin@gmail.com' && formData.password === 'admin123') {
      const adminUser = {
        email: formData.email,
        role: 'admin'
      }
      login(adminUser)
      navigate('/')
      setIsLoading(false)
      return
    }

    // 일반 사용자 로그인 체크
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const user = users.find(u => u.email === formData.email && u.password === formData.password)

    if (user) {
      const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        password: user.password,
        role: 'user',
        exchangeRegistered: user.exchangeRegistered || false,
        exchangeEmail: user.exchangeEmail || null
      }
      login(userData)
      // location.state에 from이 있으면 해당 페이지로, 없으면 홈으로 이동
      const redirectTo = location.state?.from || '/'
      navigate(redirectTo)
    } else {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
    }
    setIsLoading(false)
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!forgotPasswordEmail) {
      setForgotPasswordMessage('이메일을 입력해주세요.')
      return
    }
    
    setIsEmailSending(true)
    setForgotPasswordMessage('')

    try {
      // 먼저 이메일이 실제로 가입되어 있는지 확인
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const userExists = users.find(u => u.email === forgotPasswordEmail)
      
      if (!userExists) {
        setForgotPasswordMessage('등록되지 않은 이메일 주소입니다.')
        setIsEmailSending(false)
        return
      }

      // 백엔드 API 호출
      const response = await fetch('http://localhost:3001/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotPasswordEmail })
      })

      const data = await response.json()

      if (data.success) {
        setForgotPasswordMessage('비밀번호 재설정 링크가 이메일로 발송되었습니다. 이메일을 확인해주세요.')
        // 개발 환경에서는 토큰을 콘솔에 출력
        if (data.token) {
          console.log('🔐 개발용 인증 코드:', data.token)
          setForgotPasswordMessage(`비밀번호 재설정 링크가 이메일로 발송되었습니다.\n개발 환경 - 인증 코드: ${data.token}`)
        }
      } else {
        setForgotPasswordMessage(data.message || '이메일 전송 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('API 호출 오류:', error)
      setForgotPasswordMessage('서버 연결에 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.')
    } finally {
      setIsEmailSending(false)
    }
  }

  const resetForgotPasswordModal = () => {
    setShowForgotPasswordModal(false)
    setForgotPasswordEmail('')
    setForgotPasswordMessage('')
    setIsEmailSending(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-background">
        {/* 눈과 산 관련 코드 제거 */}
      </div>
      
      <div className="auth-container">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 0.8,
            type: "spring",
            stiffness: 100
          }}
        >
          <div className="auth-header">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="auth-title"
            >
              로그인하기
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="auth-subtitle"
            >
              BitView와 함께 당신의 자산을 지키세요.
            </motion.p>
          </div>

          <motion.form
            onSubmit={handleSubmit}
            className="auth-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="form-group">
              <label htmlFor="email">이메일 주소</label>
              <div className="input-container">
                <Mail size={20} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">비밀번호</label>
              <div className="input-container">
                <Lock size={20} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                <span className="checkmark"></span>
                <span className="checkbox-text">로그인 유지</span>
              </label>
              <button
                type="button"
                className="forgot-link"
                onClick={() => setShowForgotPasswordModal(true)}
              >
                비밀번호를 잊으셨나요?
              </button>
            </div>

            {error && (
              <motion.div
                className="error-message"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              className={`auth-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                <div className="loading-spinner" />
              ) : (
                <>
                  <Check size={18} />
                  로그인
                </>
              )}
            </motion.button>
          </motion.form>

          <motion.div
            className="auth-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p>
              아직 계정이 없으신가요?{' '}
              <Link to="/signup" className="auth-link">
                회원가입하기
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* 비밀번호 찾기 모달 */}
      {showForgotPasswordModal && (
        <div className="modal-overlay" onClick={resetForgotPasswordModal}>
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>비밀번호 찾기</h2>
              <button
                className="modal-close"
                onClick={resetForgotPasswordModal}
              >
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <p>가입할 때 사용한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.</p>
              <form onSubmit={handleForgotPassword}>
                <div className="form-group">
                  <label htmlFor="forgotEmail">이메일 주소</label>
                  <div className="input-container">
                    <Mail size={20} className="input-icon" />
                    <input
                      type="email"
                      id="forgotEmail"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      disabled={isEmailSending}
                    />
                  </div>
                </div>
                {forgotPasswordMessage && (
                  <div className={`message ${
                    forgotPasswordMessage.includes('발송되었습니다') || forgotPasswordMessage.includes('인증 코드') 
                      ? 'success' 
                      : 'error'
                  }`}>
                    {forgotPasswordMessage.split('\n').map((line, index) => (
                      <div key={index}>{line}</div>
                    ))}
                  </div>
                )}
                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={resetForgotPasswordModal}
                    disabled={isEmailSending}
                  >
                    취소
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={isEmailSending}
                  >
                    {isEmailSending ? (
                      <>
                        <div className="loading-spinner-small" />
                        전송 중...
                      </>
                    ) : (
                      '전송'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      <style jsx>{`
        .auth-page {
          padding-top: 150px;
          min-height: 100vh;
          padding-bottom: 50px;
          overflow: visible;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-left: 2rem;
          padding-right: 2rem;
          position: relative;
        }

        .auth-background {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 0;
        }

        .mountain-range {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 50%;
          overflow: hidden;
        }

        .mountain {
          position: absolute;
          bottom: 0;
        }

        .mountain-1 {
          left: -10%;
          width: 30%;
          height: 40%;
          background: linear-gradient(135deg, 
            rgba(148, 163, 184, 0.8) 0%,
            rgba(203, 213, 225, 0.6) 30%,
            rgba(248, 250, 252, 0.8) 60%,
            rgba(255, 255, 255, 0.9) 100%);
          clip-path: polygon(0% 100%, 30% 35%, 60% 55%, 100% 100%);
          filter: blur(1px);
        }

        .mountain-2 {
          left: 15%;
          width: 35%;
          height: 50%;
          background: linear-gradient(135deg, 
            rgba(100, 116, 139, 0.9) 0%,
            rgba(148, 163, 184, 0.7) 25%,
            rgba(203, 213, 225, 0.8) 50%,
            rgba(248, 250, 252, 0.9) 75%,
            rgba(255, 255, 255, 1) 100%);
          clip-path: polygon(0% 100%, 20% 70%, 40% 25%, 70% 45%, 100% 100%);
          filter: blur(0.5px);
        }

        .mountain-3 {
          left: 40%;
          width: 40%;
          height: 60%;
          background: linear-gradient(135deg, 
            rgba(71, 85, 105, 1) 0%,
            rgba(100, 116, 139, 0.8) 20%,
            rgba(148, 163, 184, 0.9) 40%,
            rgba(203, 213, 225, 0.9) 60%,
            rgba(248, 250, 252, 1) 80%,
            rgba(255, 255, 255, 1) 100%);
          clip-path: polygon(0% 100%, 15% 80%, 35% 40%, 50% 20%, 65% 35%, 85% 55%, 100% 100%);
        }

        .mountain-4 {
          left: 65%;
          width: 30%;
          height: 45%;
          background: linear-gradient(135deg, 
            rgba(100, 116, 139, 0.9) 0%,
            rgba(148, 163, 184, 0.7) 30%,
            rgba(203, 213, 225, 0.8) 60%,
            rgba(248, 250, 252, 0.9) 80%,
            rgba(255, 255, 255, 1) 100%);
          clip-path: polygon(0% 100%, 25% 65%, 50% 30%, 75% 50%, 100% 100%);
          filter: blur(0.5px);
        }

        .mountain-5 {
          left: 80%;
          width: 30%;
          height: 35%;
          background: linear-gradient(135deg, 
            rgba(148, 163, 184, 0.8) 0%,
            rgba(203, 213, 225, 0.6) 40%,
            rgba(248, 250, 252, 0.8) 70%,
            rgba(255, 255, 255, 0.9) 100%);
          clip-path: polygon(0% 100%, 35% 45%, 65% 60%, 100% 100%);
          filter: blur(1px);
        }

        .snowfall {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 5;
        }

        .snowflake {
          position: absolute;
          top: -50px;
          color: rgba(255, 255, 255, 0.8);
          font-weight: normal;
          animation: snowfall linear infinite;
          text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
          user-select: none;
        }

        @keyframes snowfall {
          0% {
            transform: translateY(-50px) rotate(0deg);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          95% {
            opacity: 1;
          }
          100% {
            transform: translateY(calc(100vh + 50px)) rotate(360deg);
            opacity: 0;
          }
        }

        .floating-shapes {
          position: absolute;
          inset: 0;
        }

        .floating-shape {
          position: absolute;
          width: 150px;
          height: 150px;
          background: linear-gradient(45deg, 
            rgba(59, 130, 246, 0.05), 
            rgba(147, 51, 234, 0.05)
          );
          border-radius: 50%;
          filter: blur(30px);
        }

        .floating-shape:nth-child(1) { left: 15%; top: 25%; }
        .floating-shape:nth-child(2) { right: 20%; top: 40%; }
        .floating-shape:nth-child(3) { left: 70%; top: 60%; }

        .auth-container {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
        }

        .auth-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid #374151;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          color: #E5E7EB;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .auth-title {
          color: #FFFFFF;
          font-size: 2rem;
        }

        .auth-subtitle {
          color: #9CA3AF;
          font-size: 1rem;
          margin-top: 0.5rem;
          font-weight: 400;
        }

        .auth-header p {
          color: #9CA3AF;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .auth-form {
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
          color: #D1D5DB;
          text-align: left;
          font-weight: 500;
          font-size: 0.875rem;
        }

        .input-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-container input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          background: #111111;
          border: 1px solid #374151;
          border-radius: 8px;
          color: #F9FAFB;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .input-container input:focus {
          outline: none;
          border-color: #3b82f6;
          background: #111111;
        }

        .input-container input::placeholder {
          color: #6b7280;
        }

        .input-container input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          color: #6B7280;
          z-index: 1;
        }

        .password-toggle {
          position: absolute;
          right: 1rem;
          background: none;
          border: none;
          color: #6B7280;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s ease;
        }

        .password-toggle:hover {
          color: #D1D5DB;
        }

        .password-toggle:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
        }

        .checkbox-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          user-select: none;
        }

        .checkbox-container input[type="checkbox"] {
          display: none;
        }

        .checkmark {
          width: 16px;
          height: 16px;
          border: 2px solid #374151;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .checkbox-container input[type="checkbox"]:checked + .checkmark {
          background: #3b82f6;
          border-color: #3b82f6;
        }

        .checkbox-container input[type="checkbox"]:checked + .checkmark::after {
          content: '✓';
          color: white;
          font-size: 10px;
        }

        .checkbox-text {
          color: #D1D5DB;
        }

        .forgot-link {
          color: #3b82f6;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          text-decoration: none;
          font-size: 0.875rem;
          transition: color 0.2s ease;
        }

        .forgot-link:hover {
          color: #60A5FA;
          text-decoration: underline;
        }

        .error-message {
          padding: 0.75rem 1rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px;
          color: #FCA5A5;
          font-size: 0.875rem;
          text-align: center;
        }

        .auth-button {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #3182F6, #1D4ED8);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .auth-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563EB, #1E40AF);
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(49, 130, 246, 0.4);
        }

        .auth-button:active {
          transform: translateY(0);
        }

        .auth-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .auth-button.loading {
          pointer-events: none;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 0.5rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .auth-footer {
          text-align: center;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #374151;
        }

        .auth-footer p {
          color: #9CA3AF;
          font-size: 0.875rem;
        }

        .auth-link {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .auth-link:hover {
          color: #60A5FA;
          text-decoration: underline;
        }

        /* 모달 스타일 */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
        }

        .modal-content {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid #374151;
          border-radius: 16px;
          width: 100%;
          max-width: 420px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #374151;
        }

        .modal-header h2 {
          color: #FFFFFF;
          font-size: 1.5rem;
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          color: #9CA3AF;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .modal-close:hover {
          background: #2C2C34;
          color: #FFFFFF;
        }

        .modal-body {
          padding: 2rem;
        }

        .modal-body p {
          color: #D1D5DB;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .message {
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          margin-top: 1rem;
          line-height: 1.4;
        }

        .message.success {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.2);
          color: #86EFAC;
        }

        .message.error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #FCA5A5;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .btn-secondary, .btn-primary {
          flex: 1;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-secondary {
          background: #2C2C34;
          color: #D1D5DB;
        }

        .btn-secondary:hover {
          background: #3F3F46;
        }

        .btn-primary {
          background: linear-gradient(135deg, #3182F6, #1D4ED8);
          color: white;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #2563EB, #1E40AF);
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .auth-page {
            padding: 1rem;
            padding-top: 120px;
            margin-top: 0px;
          }

          .auth-container {
            max-width: 100%;
          }

          .auth-card {
            padding: 1.25rem;
            border-radius: 10px;
          }

          .auth-title {
            font-size: 1.5rem;
          }

          .auth-subtitle {
            font-size: 0.85rem;
          }

          .form-group {
            gap: 0.3rem;
          }

          .form-group label {
            font-size: 0.75rem;
          }

          .input-container input {
            padding: 0.75rem 0.75rem 0.75rem 2.25rem;
            font-size: 0.85rem;
          }

          .input-icon {
            left: 0.625rem;
            width: 16px;
            height: 16px;
          }

          .password-toggle {
            right: 0.625rem;
            padding: 0.2rem;
          }

          .auth-button {
            padding: 0.75rem;
            font-size: 0.85rem;
          }

          .modal-overlay {
            padding: 1rem;
          }

          .modal-content {
            max-width: 100%;
          }

          .modal-header {
            padding: 1.25rem;
          }

          .modal-body {
            padding: 1.25rem;
          }

          .modal-header h2 {
            font-size: 1.25rem;
          }

          .modal-actions {
            flex-direction: column;
            gap: 0.75rem;
          }

          .checkbox-text {
            font-size: 0.8rem;
          }

          .form-options {
            flex-direction: column;
            gap: 0.75rem;
            align-items: flex-start;
          }
        }

        @media (max-width: 480px) {
          .auth-page {
            padding: 0.75rem;
            padding-top: 100px;
            margin-top: 0px;
          }

          .auth-card {
            padding: 1rem;
          }

          .auth-title {
            font-size: 1.25rem;
          }

          .auth-subtitle {
            font-size: 0.8rem;
          }

          .auth-form {
            gap: 0.8rem;
          }

          .form-group label {
            font-size: 0.7rem;
          }

          .input-container input {
            padding: 0.625rem 0.625rem 0.625rem 2rem;
            font-size: 0.8rem;
          }

          .input-icon {
            left: 0.5rem;
            width: 14px;
            height: 14px;
          }

          .password-toggle {
            right: 0.5rem;
          }

          .auth-button {
            padding: 0.625rem;
            font-size: 0.8rem;
          }

          .modal-overlay {
            padding: 0.75rem;
          }

          .modal-header {
            padding: 1rem;
          }

          .modal-body {
            padding: 1rem;
          }

          .modal-header h2 {
            font-size: 1.125rem;
          }

          .checkbox-text {
            font-size: 0.75rem;
            line-height: 1.4;
          }

          .forgot-link {
            font-size: 0.75rem;
          }

          .error-message {
            padding: 0.625rem 0.75rem;
            font-size: 0.8rem;
          }

          .message {
            padding: 0.625rem 0.75rem;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  )
}

export default Login