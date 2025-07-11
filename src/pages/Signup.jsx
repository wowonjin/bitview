import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Check, X, User } from 'lucide-react'
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

  const [isLoading, setIsLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const navigate = useNavigate()
  const { signup } = useAuth()

  // 개발 환경에서 브라우저 콘솔에서 강제 이동할 수 있는 함수
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      window.forceGoHome = () => {
        console.log('🔧 강제 홈 이동 실행')
        window.location.href = '/'
        window.location.replace('/')
      }
    }
  }, [])





  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    if (error) setError('')
  }

  const validatePassword = (password) => {
    const minLength = password.length >= 8
    const hasNumber = /\d/.test(password)
    const hasLetter = /[a-zA-Z]/.test(password)
    return { minLength, hasNumber, hasLetter }
  }

  const passwordValidation = validatePassword(formData.password)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    console.log('🔧 회원가입 폼 제출 시작:', formData.email)

    // 안전장치: 10초 후 무조건 로딩 해제 (더 짧게 설정)
    const safetyTimeout = setTimeout(() => {
      console.error('⚠️ 회원가입 안전장치 발동 - 로딩 상태 강제 해제')
      setIsLoading(false)
      setError('회원가입 처리 중 문제가 발생했습니다. 다시 시도해 주세요.')
    }, 10000)

    // 유효성 검사
    if (!agreedToTerms) {
      setError('서비스 약관에 동의해주세요.')
      setIsLoading(false)
      return
    }

    if (!passwordValidation.minLength || !passwordValidation.hasNumber || !passwordValidation.hasLetter) {
      setError('비밀번호 조건을 모두 만족해주세요.')
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      setIsLoading(false)
      return
    }



    // 간단한 회원가입 처리 - Firebase 인증만 성공하면 바로 이동
    try {
      console.log('🔧 회원가입 시작:', { 
        email: formData.email
      })
      
      const result = await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      })
      
      // 성공하든 실패하든 안전장치 해제
      clearTimeout(safetyTimeout)
      
      if (result.success) {
        console.log('✅ 회원가입 성공 - 즉시 이동')
        
        // 즉시 로딩 해제
        setIsLoading(false)
        
        // 경고 메시지가 있어도 바로 이동
        if (result.warning) {
          console.log('⚠️ 경고 메시지:', result.warning)
        }
        
        // 즉시 강제 이동 (React Router 사용 안 함)
        console.log('🔧 즉시 강제 이동 실행')
        
        // 여러 방법으로 확실하게 이동
        window.location.href = '/'
        window.location.replace('/')
        
      } else {
        setError(result.message || '회원가입에 실패했습니다.')
        setIsLoading(false)
      }
      
    } catch (error) {
      clearTimeout(safetyTimeout)
      console.error('❌ 회원가입 오류:', error)
      setError('회원가입 중 오류가 발생했습니다. 다시 시도해 주세요.')
      setIsLoading(false)
    }
  }

  const termsContent = `
    서비스 약관

    제1조 (목적)
    이 약관은 BitView(이하 "회사"라 함)이 제공하는 암호화폐 분석 서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.

    제2조 (용어의 정의)
    1. "서비스"란 회사가 제공하는 암호화폐 시세 정보, 차트 분석, 백테스팅 등의 서비스를 의미합니다.
    2. "이용자"란 이 약관에 따라 회사가 제공하는 서비스를 받는 자를 의미합니다.

    제3조 (약관의 효력 및 변경)
    1. 이 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력을 발생합니다.
    2. 회사는 필요한 경우 이 약관을 변경할 수 있으며, 변경된 약관은 공지사항을 통해 공지합니다.

    제4조 (서비스의 제공)
    1. 회사는 이용자에게 암호화폐 관련 정보 및 분석 도구를 제공합니다.
    2. 서비스는 연중무휴 1일 24시간 제공함을 원칙으로 하나, 시스템 점검 등 필요한 경우 서비스를 일시 중단할 수 있습니다.

    제5조 (이용자의 의무)
    1. 이용자는 정확한 정보를 제공해야 합니다.
    2. 이용자는 서비스를 이용함에 있어 관련 법령을 준수해야 합니다.
    3. 이용자는 서비스를 통해 얻은 정보를 투자 결정의 유일한 근거로 사용해서는 안 됩니다.

    제6조 (면책조항)
    1. 회사는 이용자가 서비스를 이용하여 발생한 투자 손실에 대해 책임지지 않습니다.
    2. 회사는 서비스에 표시된 정보의 정확성을 보장하지 않습니다.
  `

  const privacyContent = `
    개인정보 처리방침

    BitView는 개인정보보호법에 따라 이용자의 개인정보 보호 및 권익을 보호하고 개인정보와 관련한 이용자의 고충을 원활하게 처리할 수 있도록 다음과 같은 처리방침을 두고 있습니다.

    1. 개인정보의 처리목적
    BitView는 다음의 목적을 위하여 개인정보를 처리합니다.
    - 회원 가입 및 관리
    - 서비스 제공
    - 고객 문의 응답
    - 마케팅 및 광고 활용

    2. 개인정보의 처리 및 보유기간
    - 처리목적: 회원 가입 및 관리
    - 보유기간: 회원 탈퇴 시까지

    3. 개인정보의 제3자 제공
    BitView는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다.
    - 이용자들이 사전에 동의한 경우
    - 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우

    4. 개인정보처리의 위탁
    BitView는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.
    - 위탁업체: 클라우드 서비스 제공업체
    - 위탁업무: 데이터 저장 및 백업

    5. 정보주체의 권리·의무 및 행사방법
    이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다.
    - 개인정보 처리정지 요구권
    - 개인정보 열람요구권
    - 개인정보 정정·삭제요구권
    - 개인정보 처리정지 요구권

    6. 개인정보의 안전성 확보조치
    BitView는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.
    - 관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육 등
    - 기술적 조치: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치
    - 물리적 조치: 전산실, 자료보관실 등의 접근통제
  `

  return (
    <div className="auth-page">
      <div className="auth-background">
        {/* 비트코인 효과 제거 */}
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
              회원 가입
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
              <label htmlFor="name">이름</label>
              <div className="input-container">
                <User size={20} className="input-icon" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="홍길동"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

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
              
              {formData.password && (
                <div className="password-requirements">
                  <div className={`requirement ${passwordValidation.minLength ? 'valid' : ''}`}>
                    <Check size={14} />
                    <span>8자 이상</span>
                  </div>
                  <div className={`requirement ${passwordValidation.hasNumber ? 'valid' : ''}`}>
                    <Check size={14} />
                    <span>숫자 포함</span>
                  </div>
                  <div className={`requirement ${passwordValidation.hasLetter ? 'valid' : ''}`}>
                    <Check size={14} />
                    <span>영문자 포함</span>
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">비밀번호 확인</label>
              <div className="input-container">
                <Lock size={20} className="input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <div className="password-mismatch">
                  비밀번호가 일치하지 않습니다
                </div>
              )}
            </div>

            <div className="terms-container">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  disabled={isLoading}
                />
                <span className="checkmark"></span>
                <span className="checkbox-text">
                  <button
                    type="button"
                    className="terms-link"
                    onClick={() => setShowTermsModal(true)}
                  >
                    서비스 약관
                  </button> 및{' '}
                  <button
                    type="button"
                    className="terms-link"
                    onClick={() => setShowPrivacyModal(true)}
                  >
                    개인정보 처리방침
                  </button>에 동의합니다
                </span>
              </label>
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
              disabled={isLoading || !agreedToTerms}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                <div className="loading-spinner" />
              ) : (
                <>
                  <Check size={18} />
                  계정 만들기
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
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="auth-link">
                로그인하기
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* 서비스 약관 모달 */}
      {showTermsModal && (
        <div className="modal-overlay" onClick={() => setShowTermsModal(false)}>
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>서비스 약관</h2>
              <button
                className="modal-close"
                onClick={() => setShowTermsModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="terms-content">
                {termsContent.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-primary full-width" 
                  onClick={() => setShowTermsModal(false)}
                >
                  확인
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* 개인정보 처리방침 모달 */}
      {showPrivacyModal && (
        <div className="modal-overlay" onClick={() => setShowPrivacyModal(false)}>
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>개인정보 처리방침</h2>
              <button
                className="modal-close"
                onClick={() => setShowPrivacyModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="terms-content">
                {privacyContent.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-primary full-width" 
                  onClick={() => setShowPrivacyModal(false)}
                >
                  확인
                </button>
              </div>
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

        .giant-bitcoin {
          position: absolute;
          bottom: 10%;
          right: 15%;
          font-size: 12rem;
          color: rgba(255, 193, 7, 0.15);
          z-index: 1;
          animation: bitcoinFloat 8s ease-in-out infinite;
          text-shadow: 
            0 0 20px rgba(255, 193, 7, 0.3),
            0 0 40px rgba(255, 193, 7, 0.2),
            0 0 60px rgba(255, 193, 7, 0.1);
          user-select: none;
        }

        @keyframes bitcoinFloat {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) rotate(5deg);
          }
          50% {
            transform: translateY(-10px) rotate(0deg);
          }
          75% {
            transform: translateY(-30px) rotate(-5deg);
          }
        }

        .bitcoin-fall {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 5;
        }

        .bitcoin {
          position: absolute;
          top: -50px;
          color: rgba(255, 193, 7, 0.7);
          font-weight: bold;
          animation: bitcoinfall linear infinite;
          text-shadow: 0 0 10px rgba(255, 193, 7, 0.5);
          user-select: none;
        }

        @keyframes bitcoinfall {
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
            transform: translateY(calc(100vh + 50px)) rotate(720deg);
            opacity: 0;
          }
        }

        .auth-container {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
          transform: translateY(40px);
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
          color: #9ca3af;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          color: #D1D5DB;
          font-weight: 500;
          font-size: 0.875rem;
          text-align: left;
          align-self: flex-start;
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

        .password-requirements {
          display: flex;
          gap: 1rem;
          margin-top: 0.5rem;
          font-size: 0.75rem;
        }

        .requirement {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #6B7280;
          transition: color 0.2s ease;
        }

        .requirement.valid {
          color: #3B82F6;
        }

        .requirement.valid svg {
          color: #3B82F6;
        }

        .password-mismatch {
          color: #EF4444;
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }

        .name-error-message {
          color: #EF4444;
          font-size: 0.875rem;
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(239, 68, 68, 0.1);
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .terms-container {
          margin: 0.5rem 0;
        }

        .checkbox-container {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          cursor: pointer;
          user-select: none;
          line-height: 1.4;
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
          flex-shrink: 0;
          margin-top: 0.125rem;
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
          font-size: 0.875rem;
        }

        .terms-link {
          color: #3b82f6;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
          font-size: inherit;
          transition: color 0.2s ease;
        }

        .terms-link:hover {
          color: #60A5FA;
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
          opacity: 0.5;
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
          max-width: 600px;
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

        .terms-content {
          color: #D1D5DB;
          line-height: 1.6;
          margin-bottom: 2rem;
          max-height: 400px;
          overflow-y: auto;
          padding-right: 1rem;
        }

        .terms-content p {
          margin-bottom: 0.8rem;
        }

        .terms-content p:empty {
          margin-bottom: 0.4rem;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
        }

        .btn-primary {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          background: linear-gradient(135deg, #3182F6, #1D4ED8);
          color: white;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #2563EB, #1E40AF);
        }

        .btn-primary.full-width {
          width: 100%;
        }

        /* 스크롤바 스타일 */
        .terms-content::-webkit-scrollbar {
          width: 6px;
        }

        .terms-content::-webkit-scrollbar-track {
          background: #2C2C34;
          border-radius: 3px;
        }

        .terms-content::-webkit-scrollbar-thumb {
          background: #3F3F46;
          border-radius: 3px;
        }

        .terms-content::-webkit-scrollbar-thumb:hover {
          background: #4B5563;
        }

        @media (max-width: 768px) {
          .auth-page {
            padding: 1rem;
            padding-top: 120px;
            margin-top: 0px;
          }

          .auth-container {
            max-width: 100%;
            transform: translateY(-10px);
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

          .password-requirements {
            flex-direction: row;
            gap: 0.5rem;
            flex-wrap: wrap;
          }

          .requirement {
            font-size: 0.65rem;
          }

          .password-mismatch {
            font-size: 0.65rem;
          }

          .name-error-message {
            font-size: 0.75rem;
            padding: 0.35rem 0.5rem;
          }

          .checkbox-text {
            font-size: 0.75rem;
            line-height: 1.3;
          }

          .terms-link {
            font-size: 0.75rem;
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

          .terms-content {
            max-height: 300px;
            font-size: 0.85rem;
          }
        }

        @media (max-width: 480px) {
          .auth-page {
            padding: 0.75rem;
            padding-top: 100px;
            margin-top: 0px;
          }

          .auth-container {
            transform: translateY(-15px);
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

          .form-group {
            gap: 0.25rem;
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

          .password-requirements {
            gap: 0.4rem;
            flex-wrap: wrap;
          }

          .requirement {
            font-size: 0.6rem;
          }

          .password-mismatch {
            font-size: 0.6rem;
          }

          .name-error-message {
            font-size: 0.7rem;
            padding: 0.3rem 0.4rem;
          }

          .checkbox-container {
            align-items: flex-start;
            gap: 0.3rem;
          }

          .checkmark {
            width: 12px;
            height: 12px;
            margin-top: 0.1rem;
          }

          .checkbox-text {
            font-size: 0.7rem;
            line-height: 1.2;
          }

          .terms-link {
            font-size: 0.7rem;
          }

          .auth-button {
            padding: 0.625rem;
            font-size: 0.8rem;
          }

          .error-message {
            padding: 0.625rem 0.75rem;
            font-size: 0.8rem;
          }

          .modal-overlay {
            padding: 0.5rem;
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

          .terms-content {
            max-height: 250px;
            font-size: 0.8rem;
            padding-right: 0.5rem;
          }

          .terms-content p {
            margin-bottom: 0.6rem;
          }

          .btn-primary {
            padding: 0.75rem 1.25rem;
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  )
}

export default Signup 