import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, Check, Gift, Star, Zap, Shield, Users, Award, TrendingUp, Brain, Bell, PieChart, ShieldCheck, Headphones, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Premium = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const { activatePremium, isPremium, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  
  const binanceRef = "https://www.binance.com/activity/referral-entry/CPA?ref=CPA_00WJ27SBVM"
  const bybitRef = "https://www.bybit.com/invite?ref=71367"
  
  const exchangeType = searchParams.get('exchange') // 'binance' or 'bybit'

  // 거래소 버튼 클릭 핸들러
  const handleExchangeClick = (exchange, url) => {
    if (!isAuthenticated) {
      // 비로그인 상태일 때 알림 표시
      alert('로그인 후 이용이 가능합니다.')
      // 현재 URL을 state로 전달하여 로그인 후 돌아올 수 있게 함
      navigate('/login', { state: { from: '/premium' } })
      return
    }
    // 로그인 상태일 때 기존 로직 실행
    window.open(url, '_blank')
    setSearchParams({ exchange })
  }

  // 이메일 제출 핸들러
  const handleEmailSubmit = (e) => {
    e.preventDefault()
    if (email.trim()) {
      // 프리미엄 활성화 (이메일 정보와 거래소 타입 포함)
      activatePremium(email.trim(), exchangeType)
      // 성공 메시지 표시 후 홈으로 이동
      alert('프리미엄 기능이 활성화되었습니다!')
      navigate('/')
    }
  }

  // 기존 화면으로 돌아가기
  const handleBackToMain = () => {
    setSearchParams({})
    setEmail('')
    
    // 페이지 상단으로 스크롤 이동
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
    // 애니메이션 리셋을 위해 잠깐 기다린 후 reveal-up 클래스 제거
    setTimeout(() => {
      const elements = document.querySelectorAll('.reveal-on-scroll');
      elements.forEach(el => {
        el.classList.remove('reveal-up');
      });
    }, 50);
  }

  const binanceBenefits = [
    {
      text: "거래 수수료 20% 할인 (평생 혜택)",
      hasOnly: true,
      blueText: ["20% 할인", "(평생 혜택)"]
    },
    {
      text: "신규 가입자 전용 100 USDT<br />보너스",
      hasOnly: true,
      blueText: ["100 USDT"]
    },
    {
      text: "바이낸스 론치패드 우선 참여 기회",
      hasOnly: false,
      blueText: []
    },
    {
      text: "스테이킹 보상 추가 혜택",
      hasOnly: false,
      blueText: []
    },
    {
      text: "VIP 레벨 승격 시 추가 할인",
      hasOnly: false,
      blueText: []
    },
    {
      text: "바이낸스 카드 무료 발급",
      hasOnly: false,
      blueText: []
    }
  ]

  const bybitBenefits = [
    {
      text: "거래 수수료 20% 할인 (60일간)",
      hasOnly: true,
      blueText: ["20% 할인", "(60일간)"]
    },
    {
      text: "신규 가입자 최대 30,050 USDT (40,725,500KRW) 보너스",
      hasOnly: true,
      blueText: ["30,050 USDT (40,725,500KRW)"]
    },
    {
      text: "무료 합약 체험금 제공",
      hasOnly: false,
      blueText: []
    },
    {
      text: "전용 VIP 고객 서비스",
      hasOnly: false,
      blueText: []
    },
    {
      text: "독점 거래 도구 및 분석 리포트",
      hasOnly: false,
      blueText: []
    },
    {
      text: "바이비트 론치패드 우선 접근권",
      hasOnly: false,
      blueText: []
    }
  ]

  const ourBenefits = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "고급 백테스팅 시스템",
      description: "다양한 전략(MACD, RSI, 볼린저밴드)을 활용한 정교한 백테스팅으로 수익성을 정확히 분석합니다."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "전문 차트 분석 도구",
      description: "TradingView 프로차트와 드로잉 도구를 활용한 전문적인 기술적 분석을 지원합니다."
    },
    {
      icon: <PieChart className="w-6 h-6" />,
      title: "선물 수익 계산기",
      description: "바이낸스/바이비트 선물거래 수익을 정확히 계산하고 복리 효과까지 시뮬레이션합니다."
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "실시간 코인 데이터",
      description: "주요 암호화폐의 실시간 가격, 거래량, 변동률 등 핵심 데이터를 한눈에 확인하세요."
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "고급 트레이딩 전략",
      description: "검증된 트레이딩 전략과 리스크 관리 도구로 안전하고 수익성 높은 거래를 실현합니다."
    },
    {
      icon: <Headphones className="w-6 h-6" />,
      title: "무제한 기능 이용",
      description: "모든 프리미엄 도구를 횟수 제한 없이 자유롭게 이용하고 전문적인 분석을 수행하세요."
    }
  ]

  // 페이지 로드 시 최상단으로 스크롤
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // scroll reveal effect
  useEffect(() => {
    const elements = document.querySelectorAll('.reveal-on-scroll');
    const obsOptions = { threshold: 0.15 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-up');
          observer.unobserve(entry.target);
        }
      });
    }, obsOptions);
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [exchangeType]); // exchangeType이 변경될 때마다 다시 실행

  // 이메일 입력 화면 렌더링
  if (exchangeType) {
    const exchangeName = exchangeType === 'binance' ? '바이낸스' : '바이비트'
    const exchangeColor = exchangeType === 'binance' ? '#F0B90B' : '#F7931A'
    
    return (
      <div className="premium-page">
        <section className="modern-verification-section">
          <div className="verification-container">
            {/* Progress indicator */}
            <div className="progress-indicator">
              <div className="progress-step completed-blue">
                <div className="step-circle">
                  <span>1</span>
                </div>
                <span className="step-label">거래소 가입</span>
              </div>
              <div className="progress-line"></div>
              <div className="progress-step active">
                <div className="step-circle">
                  <span>2</span>
                </div>
                <span className="step-label">이메일 인증</span>
              </div>
              <div className="progress-line"></div>
              <div className="progress-step">
                <div className="step-circle">
                  <span>3</span>
                </div>
                <span className="step-label">프리미엄 활성화</span>
              </div>
            </div>

            <div className="verification-content">
              {/* Success animation */}
              <div className="success-animation">
                <div className="celebration-icon">🎉</div>
                <div className="exchange-badge" style={{ '--exchange-color': exchangeColor }}>
                  <img 
                    src={exchangeType === 'binance' 
                      ? "https://s2.coinmarketcap.com/static/img/exchanges/64x64/270.png"
                      : "https://upload.wikimedia.org/wikipedia/commons/1/14/Bybit_Logo.svg"
                    } 
                    alt={`${exchangeName} logo`}
                    className="exchange-logo-small"
                  />
                  <span>{exchangeName}</span>
                </div>
              </div>
              
              <div className="main-content">
                <h1 className="modern-title">
                  거의 완료되었어요!
                </h1>
                <p className="modern-subtitle">
                  {exchangeName} 가입이 확인되었습니다.<br/>
                  마지막 단계로 가입 시 사용한 이메일을 입력해주세요.
                </p>
                
                <form onSubmit={handleEmailSubmit} className="modern-form">
                  <div className="input-group">
                    <div className="modern-input-wrapper">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        className="modern-input"
                        required
                      />
                                            <div className="input-icon">
                        <Mail className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                  
                  <button type="submit" className="modern-submit-button">
                    <span>프리미엄 시작하기</span>
                    <div className="button-icon">
                      <Zap className="w-5 h-5" />
                    </div>
                  </button>
                </form>
                

              </div>
            </div>
            

          </div>
        </section>
        
        <style jsx global>{`
          .modern-verification-section {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #0a0a0a;
            padding: 2rem;
            position: relative;
            overflow: hidden;
          }
          
          .modern-verification-section::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, #0a0a0a 0%, #111111 100%);
            z-index: 0;
          }
          
          .modern-verification-section::after {
            content: '';
            position: absolute;
            top: 20%;
            left: 10%;
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%);
            border-radius: 50%;
            filter: blur(100px);
            animation: float 6s ease-in-out infinite;
            z-index: 1;
          }
          
          .verification-container::before {
            content: '';
            position: absolute;
            bottom: -100px;
            right: -100px;
            width: 200px;
            height: 200px;
            background: radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%);
            border-radius: 50%;
            filter: blur(80px);
            animation: float 4s ease-in-out infinite reverse;
            z-index: -1;
          }
          
          .verification-container {
            max-width: 480px;
            width: 100%;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            backdrop-filter: blur(20px);
            box-shadow: 
              0 20px 25px -5px rgba(0, 0, 0, 0.4),
              0 10px 10px -5px rgba(0, 0, 0, 0.2);
            overflow: hidden;
            animation: slideUp 0.6s ease-out;
            position: relative;
            z-index: 2;
            display: flex;
            flex-direction: column;
            min-height: 400px;
            margin-top: -4rem;
          }
          
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -30px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          
          .progress-indicator {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem 2rem 1rem;
          }
          
          @media (max-width: 768px) {
            .progress-indicator {
              padding: 1.5rem 1.5rem 0.8rem;
            }
            
            .verification-content {
              padding: 1.5rem;
            }
            
            .modern-title {
              font-size: 1.5rem;
            }
            
            .modern-subtitle {
              font-size: 0.9rem;
              margin-bottom: 1.5rem;
            }
            
            .celebration-icon {
              font-size: 2.5rem;
              margin-bottom: 0.8rem;
            }
            
            .success-animation {
              margin-bottom: 1.5rem;
            }
            
            .verification-container {
              max-width: 400px;
              min-height: 350px;
              margin-top: -8rem;
            }
            
            .step-circle {
              width: 28px;
              height: 28px;
              font-size: 0.8rem;
            }
            
            .step-label {
              font-size: 0.7rem;
            }
            
            .progress-line {
              width: 30px;
              margin: 0 0.5rem;
            }
          }
          
          @media (max-width: 480px) {
            .progress-indicator {
              padding: 1.2rem 1rem 0.5rem;
            }
            
            .verification-content {
              padding: 1.2rem;
            }
            
            .modern-title {
              font-size: 1.3rem;
            }
            
            .modern-subtitle {
              font-size: 0.8rem;
              margin-bottom: 1.2rem;
            }
            
            .celebration-icon {
              font-size: 2rem;
              margin-bottom: 0.5rem;
            }
            
            .success-animation {
              margin-bottom: 1.2rem;
            }
            
            .verification-container {
              max-width: 350px;
              min-height: 300px;
            }
            
            .step-circle {
              width: 24px;
              height: 24px;
              font-size: 0.7rem;
            }
            
            .step-label {
              font-size: 0.65rem;
            }
            
            .progress-line {
              width: 25px;
              margin: 0 0.3rem;
            }
          }
          
          .progress-step {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            opacity: 0.4;
            transition: all 0.3s ease;
          }
          
          .progress-step.completed,
          .progress-step.active,
          .progress-step.completed-blue {
            opacity: 1;
          }
          
          .step-circle {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.875rem;
            font-weight: 600;
            transition: all 0.3s ease;
          }
          
          .progress-step.completed .step-circle {
            background: #10b981;
            color: white;
            animation: completedPulse 1s ease-out;
          }
          
          .progress-step.active .step-circle {
            background: #3b82f6;
            color: white;
            animation: activePulse 2s ease-in-out infinite;
          }
          
          .progress-step.completed-blue .step-circle {
            background: #3b82f6;
            color: white;
          }
          
          .progress-step .step-circle {
            background: rgba(255, 255, 255, 0.08);
            color: #64748b;
          }
          
          @keyframes completedPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          
          @keyframes activePulse {
            0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
            50% { transform: scale(1.05); box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
          }
          
          .step-label {
            font-size: 0.75rem;
            font-weight: 500;
            color: #64748b;
            text-align: center;
          }
          
          .progress-step.completed .step-label,
          .progress-step.active .step-label,
          .progress-step.completed-blue .step-label {
            color: #e2e8f0;
            font-weight: 600;
          }
          
          .progress-line {
            width: 40px;
            height: 2px;
            background: rgba(255, 255, 255, 0.08);
            margin: 0 1rem;
            border-radius: 1px;
          }
          
          .verification-content {
            padding: 2rem;
            text-align: center;
            flex: 1;
            display: flex;
            flex-direction: column;
          }
          
          .success-animation {
            margin-bottom: 2rem;
            animation: fadeInUp 0.8s ease-out 0.2s both;
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .celebration-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            animation: bounce 1s ease-in-out infinite;
          }
          
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
          }
          
          .exchange-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            font-size: 0.875rem;
            font-weight: 600;
            color: #e2e8f0;
          }
          
          .exchange-logo-small {
            width: 20px;
            height: 20px;
            border-radius: 4px;
          }
          
          .main-content {
            animation: fadeInUp 0.8s ease-out 0.4s both;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          
          .modern-title {
            font-size: 2rem;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 0.75rem;
            line-height: 1.2;
          }
          
          .modern-subtitle {
            font-size: 1rem;
            color: #94a3b8;
            margin-bottom: 2rem;
            line-height: 1.5;
          }
          
          .modern-form {
            margin-bottom: 0;
          }
          
          .input-group {
            margin-bottom: 1.5rem;
            text-align: left;
          }
          
          .input-label {
            display: block;
            font-size: 0.875rem;
            font-weight: 600;
            color: #f8fafc;
            margin-bottom: 0.5rem;
          }
          
          .modern-input-wrapper {
            position: relative;
          }
          
          .modern-input {
            width: 100%;
            padding: 1rem 3rem 1rem 1rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            font-size: 1rem;
            color: #ffffff;
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(10px);
            transition: all 0.2s ease;
            outline: none;
            height: 52px;
            line-height: 1.5;
          }
          
          .modern-input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
            background: rgba(255, 255, 255, 0.12);
          }
          
          .modern-input::placeholder {
            color: #64748b;
          }
          
          .input-icon {
            position: absolute;
            right: 1rem;
            top: 0;
            color: #64748b;
            transition: color 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 52px;
            pointer-events: none;
          }
          
          .modern-input:focus + .input-icon {
            color: #3b82f6;
          }
          
          .modern-submit-button {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            padding: 1rem 2rem;
            background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
            border: none;
            border-radius: 12px;
            color: white;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 14px rgba(91, 107, 246, 0.3);
          }
          
          .modern-submit-button:hover {
            background: linear-gradient(135deg, #7c4ee3 0%, #2a75e6 100%);
            transform: translateY(-2px);
            box-shadow: 0 12px 24px rgba(91, 107, 246, 0.3);
          }
          
          .modern-submit-button:active {
            transform: translateY(0);
          }
          
          .button-icon {
            transition: transform 0.2s ease;
          }
          
          .modern-submit-button:hover .button-icon {
            transform: translateX(2px);
          }
          
          .benefits-preview {
            display: flex;
            gap: 0.5rem;
            justify-content: center;
            flex-wrap: wrap;
            margin: 1.5rem 0 2rem;
          }
          
          .benefit-tag {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.375rem 0.75rem;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
            color: #e2e8f0;
          }
          
          .benefit-tag svg {
            width: 14px;
            height: 14px;
          }
          
          .modern-back-button {
            width: 100%;
            padding: 1.5rem 1rem;
            background: transparent;
            border: none;
            color: #64748b;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            margin-top: auto;
          }
          
          .modern-back-button:hover {
            background: rgba(255, 255, 255, 0.03);
            color: #e2e8f0;
          }
          
          @media (max-width: 640px) {
            .verification-container {
              margin: 1rem;
              border-radius: 20px;
              min-height: 350px;
            }
            
            .progress-indicator {
              padding: 1.5rem 1rem 0.5rem;
            }
            
            .progress-line {
              width: 30px;
              margin: 0 0.5rem;
            }
            
            .step-label {
              font-size: 0.7rem;
            }
            
            .verification-content {
              padding: 1.5rem;
            }
            
            .modern-title {
              font-size: 1.75rem;
            }
            
            .celebration-icon {
              font-size: 2.5rem;
            }
            
            .modern-back-button {
              padding: 1rem;
            }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="premium-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>
        
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <Shield className="w-4 h-4" />
              <span>Premium Experience</span>
            </div>
            
            <h1 className="hero-title">
              <span className="gradient-text">BitView Premium</span>
              <br />
              <span className="hero-subtitle">차세대 암호화폐 거래 플랫폼</span>
            </h1>
            
            <p className="hero-description">
              AI 기반 분석과 전문가 도구로 더 스마트한 투자를 시작하세요.<br/>
              프리미엄 기능으로 수익률을 극대화하고 리스크를 최소화하세요.
            </p>

            <div className="hero-stats">
              <div className="stat-card">
                <div className="stat-number">99.9%</div>
                <div className="stat-label">정확도</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">10K+</div>
                <div className="stat-label">활성 사용자</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">#1</div>
                <div className="stat-label">백테스팅 툴</div>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="floating-card">
              <div className="card-header">
                <div className="status-dot"></div>
                <span>실시간 분석</span>
              </div>
              <div className="chart-placeholder">
                <div className="chart-line"></div>
                <div className="chart-bars">
                  <div className="bar" style={{height: '60%'}}></div>
                  <div className="bar" style={{height: '80%'}}></div>
                  <div className="bar" style={{height: '40%'}}></div>
                  <div className="bar" style={{height: '90%'}}></div>
                  <div className="bar" style={{height: '70%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Exchange Partners Section */}
      <section className="partners-section">
        <div className="container">
          <div className="section-header">
            <div className="animated-icon animated-gift-icon">🎁</div>
            <h2>파트너 거래소 특별 혜택</h2>
            <p><span className="white-highlight">신규 가입</span>하시면,<br className="mobile-break"/>BitView의 모든 프리미엄 기능이 <span className="white-highlight">즉시 활성화</span>됩니다.</p>
          </div>

          <div className="exchanges-container">
            {/* Binance Card */}
            <div className="exchange-card reveal-on-scroll" style={{ '--delay': '0s' }}>
              <div className="card-glow binance-glow"></div>
              <div className="exchange-header">
                <div className="exchange-logo binance-logo">
                  <img src="https://s2.coinmarketcap.com/static/img/exchanges/64x64/270.png" alt="Binance Logo" />
                </div>
                <div className="exchange-info">
                  <h3>Binance</h3>
                </div>
              </div>
              
              <div className="benefits-container">
                {binanceBenefits.map((benefit, index) => (
                  <div key={index} className="benefit-row">
                    <Check className="w-2 h-2 benefit-check flex-shrink-0" />
                    <div className="benefit-content">
                      {benefit.hasOnly && <span className="only-badge">Only</span>}
                      <span className="benefit-text">
                        {(() => {
                          if (benefit.blueText.length === 0) return benefit.text;
                          
                          let result = benefit.text;
                          benefit.blueText.forEach((blueText) => {
                            result = result.replace(blueText, `<span class="blue-text">${blueText}</span>`);
                          });
                          
                          return <span dangerouslySetInnerHTML={{ __html: result }} />;
                        })()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={() => handleExchangeClick('binance', binanceRef)} className="cta-button binance-button reveal-on-scroll" style={{ '--delay': '0s' }}>
                <Gift className="w-5 h-5" />
                <span>바이낸스 가입하고 혜택받기</span>
                <div className="button-shine"></div>
              </button>
            </div>

            {/* Bybit Card */}
            <div className="exchange-card reveal-on-scroll" style={{ '--delay': '0.3s' }}>
              <div className="card-glow bybit-glow"></div>
              <div className="exchange-header">
                <div className="exchange-logo bybit-logo">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/1/14/Bybit_Logo.svg" alt="Bybit logo" />
                </div>
                <div className="exchange-info">
                  <h3>Bybit</h3>
                </div>
              </div>
              
              <div className="benefits-container">
                {bybitBenefits.map((benefit, index) => (
                  <div key={index} className="benefit-row">
                    <Check className="w-2 h-2 benefit-check flex-shrink-0" />
                    <div className="benefit-content">
                      {benefit.hasOnly && <span className="only-badge">Only</span>}
                      <span className="benefit-text">
                        {(() => {
                          if (benefit.blueText.length === 0) return benefit.text;
                          
                          let result = benefit.text;
                          benefit.blueText.forEach((blueText) => {
                            result = result.replace(blueText, `<span class="blue-text">${blueText}</span>`);
                          });
                          
                          return <span dangerouslySetInnerHTML={{ __html: result }} />;
                        })()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={() => handleExchangeClick('bybit', bybitRef)} className="cta-button bybit-button reveal-on-scroll" style={{ '--delay': '0.2s' }}>
                <Gift className="w-5 h-5" />
                <span>바이비트 가입하고 혜택받기</span>
                <div className="button-shine"></div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <div className="animated-icon lightning-icon">⚡️</div>
            <h2>비트뷰 프리미엄 전용 기능</h2>
            <p>파트너 거래소 신규 가입만으로 <span className="white-highlight">전문가급 프리미엄 도구</span>가 <span className="white-highlight">즉시 활성화</span>됩니다.</p>
          </div>

          <div className="features-grid">
            {ourBenefits.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <div className="feature-hover-effect"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="final-cta">
        <div className="cta-background-glow"></div>
        <div className="container">
          <div className="cta-content-wrapper">
            <div className="cta-text-content">
              <div className="cta-icon-wrapper">
                <Zap size={24} />
              </div>
              <h2>지금 바로 시작하세요</h2>
              <p>파트너 거래소 신규 가입 즉시 BitView의 모든 프리미엄 기능이<br className="mobile-break"/> 자동으로 활성화됩니다.</p>
            </div>
            <div className="cta-buttons-wrapper">
              <button onClick={() => handleExchangeClick('binance', binanceRef)} className="cta-action-button reveal-on-scroll" style={{ '--delay': '0s' }}>
                <span>바이낸스 가입하고 혜택받기</span>
                <div className="button-arrow">→</div>
              </button>
              <button onClick={() => handleExchangeClick('bybit', bybitRef)} className="cta-action-button reveal-on-scroll" style={{ '--delay': '0.2s' }}>
                <span>바이비트 가입하고 혜택받기</span>
                <div className="button-arrow">→</div>
              </button>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        /* Global Reset for Full Background Coverage */
        html, body {
          margin: 0;
          padding: 0;
          min-height: 100%;
          background: #0a0a0a;
        }

        #root {
          min-height: 100vh;
          background: #0a0a0a;
        }

        * {
          box-sizing: border-box;
        }

        .premium-page {
          background: #0a0a0a;
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif;
          line-height: 1.6;
          overflow-x: hidden;
          min-height: 100vh;
          width: 100%;
          position: relative;
        }

        /* Hero Section */
        .hero-section {
          min-height: 80vh;
          display: flex;
          align-items: center;
          position: relative;
          padding: 1rem 0;
          background: #0a0a0a;
        }

        .hero-background {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 0;
          background: #0a0a0a;
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.6;
          animation: float 6s ease-in-out infinite;
        }

        .orb-1 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, #3b82f6 0%, transparent 70%);
          top: 10%;
          left: -10%;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, #8b5cf6 0%, transparent 70%);
          bottom: 20%;
          right: -5%;
          animation-delay: 2s;
        }

        .orb-3 {
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, #06b6d4 0%, transparent 70%);
          top: 50%;
          left: 50%;
          animation-delay: 4s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        .hero-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50px;
          font-size: 0.875rem;
          font-weight: 500;
          backdrop-filter: blur(10px);
          margin-bottom: 2rem;
          color: #e2e8f0;
        }

        .hero-title {
          font-size: 4rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          letter-spacing: -0.02em;
        }

        .gradient-text {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          color: #ffffff;
          font-weight: 600;
          font-size: 2rem;
        }

        .hero-description {
          font-size: 1.125rem;
          color: #cbd5e1;
          max-width: 500px;
          margin-bottom: 3rem;
          line-height: 1.7;
        }

        .hero-stats {
          display: flex;
          gap: 1.5rem;
        }

        .stat-card {
          text-align: center;
          padding: 1.5rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          flex: 1;
        }

        .stat-card:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-2px);
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          color: #3b82f6;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #94a3b8;
          font-weight: 500;
        }

        .hero-visual {
          display: flex;
          justify-content: flex-start;
          align-items: center;
        }

        .floating-card {
          width: 100%;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          padding: 2rem;
          backdrop-filter: blur(20px);
          animation: cardFloat 4s ease-in-out infinite;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        @keyframes cardFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(1deg); }
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          color: #e2e8f0;
          font-weight: 500;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.2); }
        }

        .chart-placeholder {
          height: 120px;
          position: relative;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1rem;
          overflow: hidden;
        }

        .chart-line {
          position: absolute;
          top: 30%;
          left: 1rem;
          right: 1rem;
          height: 2px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4);
          border-radius: 1px;
        }

        .chart-bars {
          display: flex;
          gap: 8px;
          align-items: end;
          height: 60px;
          margin-top: 2rem;
        }

        .bar {
          flex: 1;
          background: linear-gradient(to top, #3b82f6, #8b5cf6);
          border-radius: 2px;
          animation: barGrow 3s ease-in-out infinite;
        }

        .bar:nth-child(2) { animation-delay: 0.5s; }
        .bar:nth-child(3) { animation-delay: 1s; }
        .bar:nth-child(4) { animation-delay: 1.5s; }
        .bar:nth-child(5) { animation-delay: 2s; }

        @keyframes barGrow {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.2); }
        }

        /* Partners Section */
        .partners-section {
          padding: 2rem 0 6rem;
          background: linear-gradient(180deg, #0a0a0a 0%, #111111 100%);
          width: 100%;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-header h2 {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #ffffff 0%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Force white text for specific section titles */
        .partners-section .section-header h2,
        .features-section .section-header h2 {
          background: none;
          -webkit-text-fill-color: #ffffff;
          color: #ffffff;
        }

        .animated-icon {
          font-size: 4rem;
          display: inline-block;
          animation: pop-in 0.7s cubic-bezier(0.68, -0.6, 0.32, 1.6) forwards,
                     float-animation 3s ease-in-out infinite 0.7s;
          transform: scale(0);
        }

        .animated-gift-icon {
          filter: drop-shadow(0 10px 10px rgba(253, 224, 71, 0.3));
        }

        .lightning-icon {
          filter: drop-shadow(0 10px 10px rgba(91, 107, 246, 0.4));
        }

        @keyframes pop-in {
          to {
            transform: scale(1);
          }
        }

        @keyframes float-animation {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .section-header p {
          font-size: 1.125rem;
          color: #64748b;
          max-width: none;
          white-space: nowrap;
          margin: 0 auto;
        }

        .exchanges-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .exchanges-container {
            margin-top: -2rem;
          }
        }

        .exchange-card {
          position: relative;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 2.5rem;
          backdrop-filter: blur(20px);
          transition: all 0.4s ease;
          overflow: hidden;
          opacity: 0;
          transform: translateY(40px);
          transition: transform 0.7s ease-out var(--delay), opacity 0.7s ease-out var(--delay);
        }

        .exchange-card:hover {
          transform: none;
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.08);
        }

        .card-glow {
          position: absolute;
          inset: -2px;
          border-radius: 24px;
          padding: 2px;
          background: linear-gradient(45deg, transparent, rgba(59, 130, 246, 0.3), transparent);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .exchange-card:hover .card-glow {
          opacity: 0;
        }

        .exchange-header {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 2rem;
          align-items: center;
        }

        .exchange-logo {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.25rem;
          color: white;
          overflow: hidden;
          background: white;
          padding: 8px;
        }

        .exchange-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .binance-logo {
          background: none;
        }

        .bybit-logo {
          background: #ffffff;
          padding: 6px;
          border-radius: 12px;
        }

        .bybit-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .exchange-info h3 {
          font-size: 1.75rem;
          font-weight: 600;
          color: #f8fafc;
        }

        .exchange-info p,
        .rating {
          display: none;
        }

        .benefits-container {
          margin-bottom: 2rem;
        }

        .benefit-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .benefit-row:last-child {
          border-bottom: none;
        }

        .benefit-row span {
          color: #e2e8f0;
          font-size: 0.9rem;
        }

        .cta-button {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          width: 100%;
          padding: 1rem 2rem;
          border-radius: 16px;
          font-weight: 600;
          font-size: 1rem;
          text-decoration: none;
          color: white;
          border: none;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.3s ease;
          opacity: 0;
          transform: translateY(30px);
          transition: transform 0.6s ease-out var(--delay,0s), opacity 0.6s ease-out var(--delay,0s);
        }

        .cta-button.reveal-up {
          opacity: 1;
          transform: translateY(0);
        }

        .binance-button,
        .bybit-button {
          background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
        }

        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(91, 107, 246, 0.3);
        }

        .binance-button:hover,
        .bybit-button:hover {
          background: linear-gradient(135deg, #7c4ee3 0%, #2a75e6 100%);
        }

        .button-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .cta-button:hover .button-shine {
          left: 100%;
        }

        /* Features Section */
        .features-section {
          padding: 6rem 0;
          background: linear-gradient(180deg, #111111 0%, #0f172a 100%);
          width: 100%;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          position: relative;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 2.5rem;
          transition: all 0.4s ease;
          overflow: hidden;
          text-align: center;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 20px;
          padding: 1px;
          background: linear-gradient(135deg, transparent, rgba(59, 130, 246, 0.2), transparent);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: xor;
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .feature-card:hover::before {
          opacity: 1;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.04);
        }

        .feature-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          color: white;
        }

        .feature-card h3 {
          font-size: 1.375rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #f8fafc;
        }

        .feature-card p {
          color: #94a3b8;
          line-height: 1.6;
        }

        /* Final CTA */
        .final-cta {
          padding: 8rem 0;
          position: relative;
          overflow: hidden;
          background-color: #0f172a;
        }
        
        .cta-background-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 40%, transparent 70%);
          transform: translate(-50%, -50%);
          animation: pulse-glow 8s infinite ease-in-out;
        }

        @keyframes pulse-glow {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
        }

        .cta-content-wrapper {
          position: relative;
          z-index: 2;
          background: rgba(10, 10, 10, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 32px;
          padding: 4rem;
          backdrop-filter: blur(24px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }

        .cta-text-content {
          max-width: 60%;
        }

        .cta-icon-wrapper {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          color: white;
        }

        .cta-content-wrapper h2 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 1rem 0;
          color: #f8fafc;
          line-height: 1.2;
        }

        .cta-content-wrapper p {
          font-size: 1rem;
          color: #94a3b8;
          margin: 0;
          line-height: 1.6;
        }

        .cta-buttons-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          min-width: 240px;
        }
        
        .button-arrow {
          transition: transform 0.3s ease;
          font-size: 1.25rem;
        }

        .cta-action-button:hover .button-arrow {
          transform: translateX(4px);
        }

        .instant-activation {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: #10b981;
          font-size: 0.9rem;
          font-weight: 500;
        }

        /* Restore button gradient style */
        .cta-action-button {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 2rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1.125rem;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          color: white;
          background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
          opacity: 0;
          transform: translateY(30px);
          transition: transform 0.6s ease-out var(--delay,0s), opacity 0.6s ease-out var(--delay,0s);
        }

        .cta-action-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(91, 107, 246, 0.3);
          background: linear-gradient(135deg, #7c4ee3 0%, #2a75e6 100%);
        }

        .cta-action-button.reveal-up {
          opacity: 1;
          transform: translateY(0);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .hero-container {
            grid-template-columns: 1fr;
            gap: 3rem;
            text-align: center;
          }

          .hero-title {
            font-size: 3rem;
          }

          .section-header h2 {
            font-size: 2.5rem;
          }

          .exchanges-container {
            grid-template-columns: 1fr;
          }

          .features-grid {
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          }
          
          .cta-content-wrapper {
            flex-direction: column;
            text-align: center;
            padding: 3rem;
          }

          .cta-text-content {
            max-width: 100%;
          }

          .cta-icon-wrapper {
            margin-left: auto;
            margin-right: auto;
          }

          .cta-buttons-wrapper {
            width: 100%;
            margin-top: 2rem;
          }
        }

        @media (max-width: 768px) {
          .premium-page {
            padding-top: 60px;
          }

          .hero-section {
            min-height: 50vh;
            padding: 1rem 0;
          }

          .hero-container {
            grid-template-columns: 1fr;
            gap: 2rem;
            padding: 0 1rem;
          }

          .hero-badge {
            margin-bottom: 1.5rem;
          }

          .hero-title {
            font-size: 1.8rem;
            line-height: 1.2;
            margin-bottom: 1rem;
          }

          .hero-subtitle {
            font-size: 1.1rem;
          }

          .hero-description {
            font-size: 0.85rem;
            margin-bottom: 2rem;
          }

          .hero-stats {
            flex-direction: row;
            gap: 0.8rem;
            justify-content: center;
          }
          
          .stat-card {
            flex: 1;
            min-width: 0;
            padding: 1rem 0.8rem;
          }
          
          .stat-number {
            font-size: 1.5rem;
          }
          
          .stat-label {
            font-size: 0.75rem;
          }

          .section-header h2 {
            font-size: 1.5rem;
          }

          .section-header p {
            font-size: 0.85rem;
          }

          .cta-card {
            padding: 1.5rem 1rem;
          }

          .cta-content-wrapper h2 {
            font-size: 1.3rem;
          }

          .cta-content-wrapper p {
            font-size: 0.8rem;
          }

          .cta-buttons {
            flex-direction: column;
            align-items: center;
            gap: 0.8rem;
          }

          .primary-cta, .secondary-cta {
            width: 100%;
            max-width: 280px;
            padding: 0.8rem 1.5rem;
            font-size: 0.9rem;
          }

          .exchanges-container {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          
          .benefit-check {
            width: 1rem;
            height: 1rem;
          }
          
          .only-badge {
            padding: 0.08rem 0.25rem;
            font-size: 0.7rem;
          }

          .exchange-card {
            padding: 1.2rem;
          }
          
          .exchange-header {
            gap: 1rem;
            margin-bottom: 1.5rem;
          }
          
          .exchange-logo {
            width: 50px;
            height: 50px;
          }
          
          .exchange-info h3 {
            font-size: 1.3rem;
          }
          
          .benefit-row {
            padding: 0.5rem 0;
            gap: 0.5rem;
          }
          
          .benefit-row span {
            font-size: 0.8rem;
          }
          
          .cta-button {
            padding: 0.8rem 1.5rem;
            font-size: 0.9rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 0.8rem;
            margin-top: -2rem;
          }

          .cta-buttons-wrapper {
            margin-top: 0rem;
          }

          .cta-content-wrapper {
            padding: 1.5rem;
            gap: 1rem;
          }

          .feature-card {
            padding: 1.2rem;
          }
          
          .feature-icon {
            width: 48px;
            height: 48px;
            margin-bottom: 0.8rem;
          }
          
          .feature-card h3 {
            font-size: 1.2rem;
            margin-bottom: 0.8rem;
          }
          
          .feature-card p {
            font-size: 0.85rem;
            line-height: 1.5;
          }
          
          .feature-icon svg {
            width: 20px;
            height: 20px;
          }

          .cta-content-wrapper {
            padding: 1.2rem;
          }
          
          .cta-action-button {
            padding: 0.9rem 1.5rem;
            font-size: 0.95rem;
          }
          
          .cta-icon-wrapper {
            width: 40px;
            height: 40px;
          }
          
          .floating-card {
            display: none;
          }
          
          .cta-button .w-5 {
            width: 1rem;
            height: 1rem;
          }
          
          .animated-gift-icon {
            font-size: 2rem;
          }
          
          .lightning-icon {
            font-size: 2rem;
          }
          
          .section {
            padding: 2.5rem 0;
          }
          
          .partners-section {
            padding: 8rem 0 6rem;
          }

          .features-section {
            padding: 8rem 0 6rem;
          }

          .cta-section {
            padding: 2rem 0;
          }
        }

        @media (max-width: 480px) {
          .premium-page {
            padding-top: 50px;
          }

          .container {
            padding: 0 1rem;
          }

          .hero-section {
            min-height: 40vh;
            padding: 0.5rem 0;
          }

          .hero-container {
            gap: 1.5rem;
            padding: 0 0.5rem;
          }

          .hero-badge {
            margin-bottom: 1rem;
            font-size: 0.8rem;
          }

          .hero-title {
            font-size: 1.5rem;
            line-height: 1.2;
            margin-bottom: 0.8rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .hero-description {
            font-size: 0.8rem;
            margin-bottom: 1.5rem;
          }

          .hero-stats {
            flex-direction: row;
            gap: 0.5rem;
            justify-content: center;
          }
          
          .stat-card {
            flex: 1;
            min-width: 0;
            padding: 0.8rem 0.5rem;
          }
          
          .stat-number {
            font-size: 1.2rem;
          }
          
          .stat-label {
            font-size: 0.65rem;
          }

          .floating-card {
            display: none;
          }
          
          .cta-button .w-5 {
            width: 0.9rem;
            height: 0.9rem;
          }
          
          .animated-gift-icon {
            font-size: 1.5rem;
          }
          
          .lightning-icon {
            font-size: 1.5rem;
          }

          .section-header h2 {
            font-size: 1.3rem;
          }

          .section-header p {
            font-size: 0.8rem;
          }

          .cta-card {
            padding: 1.2rem 0.8rem;
          }

          .cta-content-wrapper {
            padding: 1rem;
          }

          .cta-content-wrapper h2 {
            font-size: 1.1rem;
          }

          .cta-content-wrapper p {
            font-size: 0.7rem;
          }

          .exchange-card {
            padding: 1rem;
            text-align: left !important;
          }

          .benefits-container {
            text-align: left !important;
          }

          .exchange-header {
            gap: 0.6rem;
            margin-bottom: 1rem;
          }

          .exchange-logo {
            width: 35px;
            height: 35px;
          }

          .exchange-info h3 {
            font-size: 1.1rem;
          }

          .benefit-row {
            padding: 0.25rem 0;
            gap: 0.4rem;
          }

          .benefit-row span {
            font-size: 0.75rem;
          }

          .benefit-text {
            text-align: left !important;
            justify-self: flex-start !important;
            text-indent: 0 !important;
            padding-left: 0 !important;
            margin-left: 0 !important;
          }

          .benefit-content {
            align-items: flex-start !important;
            justify-content: flex-start !important;
            text-align: left !important;
            padding-left: 0 !important;
            margin-left: 0 !important;
          }

          .benefit-content span {
            text-indent: 0 !important;
            padding-left: 0 !important;
            margin-left: 0 !important;
            display: block !important;
            text-align: left !important;
          }

          .benefit-row {
            text-align: left !important;
            justify-content: flex-start !important;
          }

          .cta-button {
            padding: 0.6rem 1rem;
            font-size: 0.8rem;
          }
          
          .benefits-container {
            margin-bottom: 1rem;
            text-align: left !important;
          }
          
          .benefit-check {
            width: 0.8rem;
            height: 0.8rem;
          }
          
          .only-badge {
            padding: 0.05rem 0.2rem;
            font-size: 0.6rem;
          }

          .feature-card {
            padding: 1rem;
          }

          .feature-icon {
            width: 30px;
            height: 30px;
            margin-bottom: 0.6rem;
          }

          .feature-card h3 {
            font-size: 1rem;
            margin-bottom: 0.6rem;
          }

          .feature-card p {
            font-size: 0.75rem;
            line-height: 1.4;
          }
          
          .feature-icon svg {
            width: 16px;
            height: 16px;
          }

          .cta-action-button {
            padding: 0.7rem 1rem;
            font-size: 0.85rem;
          }

          .cta-icon-wrapper {
            width: 35px;
            height: 35px;
          }

          .instant-activation {
            font-size: 0.7rem;
          }

          .final-cta {
            padding: 1.5rem 0;
          }
          
          .section {
            padding: 2rem 0;
          }
          
          .partners-section {
            padding: 9rem 0 6rem;
          }

          .features-section {
            padding: 9rem 0 6rem;
          }

          .cta-section {
            padding: 1.5rem 0;
          }
          
          .features-grid {
            gap: 0.6rem;
          }

          .cta-background-glow {
            width: 500px;
            height: 500px;
          }
        }

        .reveal-up {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }

        .white-highlight {
          color: #ffffff;
        }

        .benefit-check {
          color: #ffffff !important;
        }

        .benefit-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .only-badge {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          padding: 0.1rem 0.25rem;
          border-radius: 8px;
          font-size: 0.15rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.2px;
        }

        .benefit-text {
          color: #ffffff;
          flex: 1;
        }

        .blue-text {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6) !important;
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
          background-clip: text !important;
          font-weight: 600;
        }

        /* PC에서는 모바일 줄바꿈 숨기기 */
        @media (min-width: 769px) {
          .mobile-break {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}

export default Premium 