import { motion } from 'framer-motion'
import { ArrowRight, TrendingUp, Shield, Zap, BarChart3, Target, Sparkles, Check, LogIn } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

// Intersection Observer 커스텀 훅
const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const ref = useRef(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true)
          observer.disconnect() // 한 번만 실행되도록
        }
      },
      {
        threshold: 0.1,
        rootMargin: '-50px',
        ...options
      }
    )
    
    if (ref.current) {
      observer.observe(ref.current)
    }
    
    return () => observer.disconnect()
  }, [])
  
  return [ref, isIntersecting]
}

const Hero = () => {
  const { isAuthenticated } = useAuth()
  const [bitcoinPrice, setBitcoinPrice] = useState(65432)
  const [bitcoinChange, setBitcoinChange] = useState(2.34)
  const [ripplePrice, setRipplePrice] = useState(0.5234)
  const [rippleChange, setRippleChange] = useState(1.87)
  const [ethereumPrice, setEthereumPrice] = useState(3421.67)
  const [ethereumChange, setEthereumChange] = useState(1.87)
  const [solanaPrice, setSolanaPrice] = useState(187.23)
  const [solanaChange, setSolanaChange] = useState(5.67)
  const [nasdaqPrice, setNasdaqPrice] = useState(15234.56)
  const [nasdaqChange, setNasdaqChange] = useState(0.45)
  const [exchangeRate, setExchangeRate] = useState(1320)
  const [kimchiPremium, setKimchiPremium] = useState(2.5)
  const [totalAssets, setTotalAssets] = useState(12345678)
  const [portfolioValue, setPortfolioValue] = useState(1234567)
  const [bitcoinRain, setBitcoinRain] = useState([])
  const [isMobile, setIsMobile] = useState(false)
  
  // Intersection Observer 훅들
  const [titleRef, titleVisible] = useIntersectionObserver()
  const [descRef, descVisible] = useIntersectionObserver()
  const [statsRef, statsVisible] = useIntersectionObserver()
  const [visualRef, visualVisible] = useIntersectionObserver()

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 비트코인 떨어지는 효과 생성
  useEffect(() => {
    const createBitcoin = () => {
      const newBitcoin = {
        id: Date.now() + Math.random(),
        x: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 8 + Math.random() * 4,
        size: 0.8 + Math.random() * 0.4,
        opacity: 0.1 + Math.random() * 0.2
      }
      
      setBitcoinRain(prev => [...prev.slice(-19), newBitcoin])
    }

    // 초기 비트코인들 생성
    for (let i = 0; i < 10; i++) {
      setTimeout(() => createBitcoin(), i * 500)
    }

    // 지속적으로 비트코인 생성
    const interval = setInterval(createBitcoin, 1500)
    
    return () => clearInterval(interval)
  }, [])

  // 실시간 암호화폐 가격 WebSocket 연결
  useEffect(() => {
    // 환율 가져오기 (한 번만)
    const fetchExchangeRate = async () => {
      try {
        const exchangeResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
        const exchangeData = await exchangeResponse.json()
        
        if (exchangeData && exchangeData.rates && exchangeData.rates.KRW) {
          setExchangeRate(exchangeData.rates.KRW)
        }
      } catch (error) {
        console.log('환율 데이터 로딩 중...', error)
      }
    }

    fetchExchangeRate()

    // 바이낸스 WebSocket 연결 (실시간 가격)
    const binanceWs = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker/xrpusdt@ticker/ethusdt@ticker/solusdt@ticker')
    
    binanceWs.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data.s === 'BTCUSDT') {
        setBitcoinPrice(parseFloat(data.c)) // 현재 가격
        setBitcoinChange(parseFloat(data.P)) // 24시간 변동률
      } else if (data.s === 'XRPUSDT') {
        setRipplePrice(parseFloat(data.c))
        setRippleChange(parseFloat(data.P))
      } else if (data.s === 'ETHUSDT') {
        setEthereumPrice(parseFloat(data.c))
        setEthereumChange(parseFloat(data.P))
      } else if (data.s === 'SOLUSDT') {
        setSolanaPrice(parseFloat(data.c))
        setSolanaChange(parseFloat(data.P))
      }
    }

    // 나스닥 가격을 위한 별도 API 호출 (실시간 가격은 제한적이므로 정적 값 사용)
    const fetchNasdaqPrice = () => {
      // 실제 운영에서는 Yahoo Finance API 등을 사용할 수 있지만, 
      // 여기서는 시뮬레이션된 데이터를 사용합니다
      const randomChange = (Math.random() - 0.5) * 2 // -1% to +1%
      setNasdaqChange(prevChange => {
        const newChange = prevChange + randomChange * 0.1
        return Math.max(-5, Math.min(5, newChange)) // -5% to +5% 범위로 제한
      })
      setNasdaqPrice(prevPrice => {
        const changePercent = nasdaqChange / 100
        return prevPrice * (1 + changePercent * 0.01)
      })
    }

    // 나스닥 가격 주기적 업데이트 (30초마다)
    const nasdaqInterval = setInterval(fetchNasdaqPrice, 30000)
    fetchNasdaqPrice() // 초기 호출

    // 업비트 WebSocket 연결 (김치 프리미엄 계산용)
    const upbitWs = new WebSocket('wss://api.upbit.com/websocket/v1')
    
    upbitWs.onopen = () => {
      const subscribeData = [
        { ticket: 'test' },
        { type: 'ticker', codes: ['KRW-BTC'] }
      ]
      upbitWs.send(JSON.stringify(subscribeData))
    }

    upbitWs.onmessage = (event) => {
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result)
          if (data.code === 'KRW-BTC') {
            const upbitBTCPrice = data.trade_price
            
            // 김치 프리미엄 계산
            if (bitcoinPrice > 0 && exchangeRate > 0) {
              const binanceBTCKRW = bitcoinPrice * exchangeRate
              const premium = ((upbitBTCPrice - binanceBTCKRW) / binanceBTCKRW) * 100
              setKimchiPremium(Number(premium.toFixed(2)))
            }
          }
        } catch (error) {
          console.log('업비트 데이터 파싱 에러:', error)
        }
      }
      reader.readAsText(event.data)
    }

    // 환율은 5분마다 업데이트 (자주 변하지 않음)
    const exchangeInterval = setInterval(fetchExchangeRate, 300000)

    // 클린업
    return () => {
      binanceWs.close()
      upbitWs.close()
      clearInterval(exchangeInterval)
      clearInterval(nasdaqInterval)
    }
  }, [bitcoinPrice, exchangeRate])

  // 레버레지 효과 계산
  useEffect(() => {
    const leverageEffect = bitcoinChange * 10 // 10배 레버레지
    const baseAssets = 12345678
    const basePortfolio = 1234567
    
    setTotalAssets(Math.floor(baseAssets * (1 + leverageEffect / 100)))
    setPortfolioValue(Math.floor(basePortfolio * (1 + leverageEffect / 100)))
  }, [bitcoinChange])

  return (
    <section className="hero">
      <div className="bitcoin-rain">
        {bitcoinRain.map(bitcoin => (
          <div
            key={bitcoin.id}
            className="falling-bitcoin"
            style={{
              left: `${bitcoin.x}%`,
              animationDelay: `${bitcoin.delay}s`,
              animationDuration: `${bitcoin.duration}s`,
              fontSize: `${bitcoin.size}rem`,
              opacity: bitcoin.opacity
            }}
          >
            ₿
          </div>
        ))}
      </div>
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className={`hero-title fade-in-up ${titleVisible ? 'visible' : ''}`} ref={titleRef}>
              차트 분석부터
              <br />
              백테스트까지
              <br />
              <span className="bitview-brand">
                빗뷰
              </span>에서는 <span className="free-text">전부 무료!</span>
            </h1>

            <p className={`hero-description fade-in-up-delay-1 ${descVisible ? 'visible' : ''}`} ref={descRef}>
              실시간 차트 분석과 백테스트 기능으로
              <br />
              더 스마트한 투자 결정을 내리세요.
            </p>



            <div className={`hero-stats fade-in-up-delay-2 ${statsVisible ? 'visible' : ''}`} ref={statsRef}>
              <div className="stat-box">
                <TrendingUp className="stat-icon" />
                <div className="stat-content">
                  <div className="stat-number">실시간</div>
                  <div className="stat-label">차트 분석</div>
                </div>
              </div>
              <div className="stat-box">
                <Shield className="stat-icon" />
                <div className="stat-content">
                  <div className="stat-number">정확한</div>
                  <div className="stat-label">백테스트</div>
                </div>
              </div>
              <div className="stat-box">
                <Zap className="stat-icon" />
                <div className="stat-content">
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">모니터링</div>
                </div>
              </div>
            </div>
          </div>

          <div className={`hero-visual fade-in-up-delay-3 ${visualVisible ? 'visible' : ''}`} ref={visualRef}>
            {!isMobile && (
              <div className="hero-dashboard">
                <div className="dashboard-header">
                  <div className="dashboard-title">
                    <BarChart3 size={20} />
                    <span>대시보드</span>
                  </div>
                  <div className="dashboard-status">
                    <div className="status-dot"></div>
                    <span>실시간</span>
                  </div>
                </div>
              
              <div className="dashboard-content">
                <div className="portfolio-summary">
                  <div className="portfolio-item">
                    <div className="portfolio-header">
                      <img 
                        src="https://assets.coingecko.com/coins/images/1/small/bitcoin.png" 
                        alt="BTC" 
                        className="portfolio-icon"
                      />
                      <div className="portfolio-label">비트코인</div>
                    </div>
                    <div className="portfolio-value">${bitcoinPrice.toLocaleString()}</div>
                    <div className={`portfolio-change ${bitcoinChange >= 0 ? 'positive' : 'negative'}`}>
                      {bitcoinChange >= 0 ? '+' : ''}{bitcoinChange.toFixed(2)}%
                    </div>
                  </div>
                  <div className="portfolio-item">
                    <div className="portfolio-header">
                      <img 
                        src="https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png" 
                        alt="XRP" 
                        className="portfolio-icon"
                      />
                      <div className="portfolio-label">Ripple (XRP)</div>
                    </div>
                    <div className="portfolio-value">${ripplePrice.toFixed(4)}</div>
                    <div className={`portfolio-change ${rippleChange >= 0 ? 'positive' : 'negative'}`}>
                      {rippleChange >= 0 ? '+' : ''}{rippleChange.toFixed(2)}%
                    </div>
                  </div>
                </div>
                
                <div className="crypto-list">
                  <div className="crypto-item">
                    <div className="crypto-symbol">
                      <img 
                        src="https://assets.coingecko.com/coins/images/279/small/ethereum.png" 
                        alt="ETH" 
                        className="crypto-logo"
                      />
                    </div>
                    <div className="crypto-info">
                      <div className="crypto-name">Ethereum (ETH)</div>
                      <div className="crypto-price">
                        ${ethereumPrice.toFixed(2)} ({Math.floor(ethereumPrice * exchangeRate).toLocaleString()} KRW)
                      </div>
                    </div>
                    <div className={`crypto-change ${ethereumChange >= 0 ? 'positive' : 'negative'}`}>
                      <div className="change-label">24H %</div>
                      <div className="change-value">
                        {ethereumChange >= 0 ? '+' : ''}{ethereumChange.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="crypto-item">
                    <div className="crypto-symbol">
                      <img 
                        src="https://assets.coingecko.com/coins/images/4128/small/solana.png" 
                        alt="SOL" 
                        className="crypto-logo"
                      />
                    </div>
                    <div className="crypto-info">
                      <div className="crypto-name">Solana (SOL)</div>
                      <div className="crypto-price">
                        ${solanaPrice.toFixed(2)} ({Math.floor(solanaPrice * exchangeRate).toLocaleString()} KRW)
                      </div>
                    </div>
                    <div className={`crypto-change ${solanaChange >= 0 ? 'positive' : 'negative'}`}>
                      <div className="change-label">24H %</div>
                      <div className="change-value">
                        {solanaChange >= 0 ? '+' : ''}{solanaChange.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="crypto-item">
                    <div className="crypto-symbol exchange-icon">
                      💱
                    </div>
                    <div className="crypto-info">
                      <div className="crypto-name">환율 (USD/KRW)</div>
                      <div className="crypto-price">
                        1 USD = {exchangeRate.toFixed(2)} KRW
                      </div>
                    </div>
                    <div className="crypto-change neutral">
                      <div className="change-label">실시간</div>
                      <div className="change-value">
                        업데이트
                      </div>
                    </div>
                  </div>

                  <div className="crypto-item">
                    <div className="crypto-symbol nasdaq-symbol">
                      <BarChart3 size={24} />
                    </div>
                    <div className="crypto-info">
                      <div className="crypto-name">NASDAQ 100</div>
                      <div className="crypto-price">
                        ${nasdaqPrice.toFixed(2)}
                      </div>
                    </div>
                    <div className={`crypto-change ${nasdaqChange >= 0 ? 'positive' : 'negative'}`}>
                      <div className="change-label">24H %</div>
                      <div className="change-value">
                        {nasdaqChange >= 0 ? '+' : ''}{nasdaqChange.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .hero {
          padding: 12rem 0 4rem;
          background: transparent;
          position: relative;
          overflow: hidden;
          min-height: 90vh;
        }

        .bitcoin-rain {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .falling-bitcoin {
          position: absolute;
          top: -50px;
          color: rgba(255, 193, 7, 0.6);
          font-weight: bold;
          animation: fall linear infinite;
          text-shadow: 0 0 10px rgba(255, 193, 7, 0.3);
        }

        @keyframes fall {
          0% {
            transform: translateY(-50px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        .container {
          position: relative;
          z-index: 2;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .hero-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .hero-button-container {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 3rem;
        }

        .hero-badge-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(128, 128, 128, 0.01));
          border: 1px solid #374151;
          border-radius: 20px;
          color: var(--text-primary);
          font-size: 1.2rem;
          font-weight: 600;
          text-decoration: none;
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

        .hero-badge-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          transition: left 0.7s ease;
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          0% {
            left: -100%;
          }
          15% {
            left: 100%;
          }
          100% {
            left: 100%;
          }
        }

        .hero-badge-button::after {
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
          border-radius: 21px;
          z-index: -1;
          opacity: 0.6;
          filter: blur(0.5px);
          animation: buttonGlow 4s ease-in-out infinite;
        }

        .hero-badge-button:hover {
          transform: translateY(-2px);
        }

        .hero-badge-button:active {
          transform: translateY(-1px);
        }

        .hero-badge-button.no-shimmer::before {
          display: none;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
        }

        .bitview-brand {
          color: rgba(235, 242, 255, 0.9);
          font-weight: 700;
          text-shadow: 
            0 0 10px rgba(59, 130, 246, 0.5),
            0 0 20px rgba(59, 130, 246, 0.3),
            0 0 30px rgba(59, 130, 246, 0.2),
            0 0 40px rgba(59, 130, 246, 0.1);
          animation: brandGlow 3s ease-in-out infinite;
        }

                 @keyframes brandGlow {
           0%, 100% {
             text-shadow: 
               0 0 10px rgba(59, 130, 246, 0.5),
               0 0 20px rgba(59, 130, 246, 0.3),
               0 0 30px rgba(59, 130, 246, 0.2),
               0 0 40px rgba(59, 130, 246, 0.1);
           }
           50% {
             text-shadow: 
               0 0 15px rgba(59, 130, 246, 0.8),
               0 0 30px rgba(59, 130, 246, 0.5),
               0 0 45px rgba(59, 130, 246, 0.3),
               0 0 60px rgba(59, 130, 246, 0.2);
           }
         }

        .i-letter {
          color: rgba(255, 255, 255, 0.9);
          text-shadow: 
            0 0 10px rgba(255, 255, 255, 0.6),
            0 0 20px rgba(255, 255, 255, 0.4),
            0 0 30px rgba(255, 255, 255, 0.3);
        }

        .free-text {
          color: rgba(235, 242, 255, 0.9);
          font-weight: 700;
          text-shadow: 
            0 0 10px rgba(59, 130, 246, 0.5),
            0 0 20px rgba(59, 130, 246, 0.3),
            0 0 30px rgba(59, 130, 246, 0.2),
            0 0 40px rgba(59, 130, 246, 0.1);
          animation: brandGlow 3s ease-in-out infinite;
        }

        .hero-description {
          font-size: 1.25rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 2.5rem;
        }

        .mobile-login-button {
          margin-bottom: 2rem;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease;
          display: flex;
          justify-content: center;
          width: calc(130px * 3 + 0.6rem * 2);
          margin-left: auto;
          margin-right: auto;
        }

        .mobile-login-button.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .hero-mobile-login-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 14px 16px;
          width: 100%;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 
            0 4px 12px rgba(59, 130, 246, 0.3),
            0 0 20px rgba(59, 130, 246, 0.2);
          position: relative;
          overflow: hidden;
        }

        .hero-mobile-login-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          transition: left 0.6s ease;
        }

        .hero-mobile-login-btn:hover::before {
          left: 100%;
        }

        .hero-mobile-login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 6px 16px rgba(59, 130, 246, 0.4),
            0 0 30px rgba(59, 130, 246, 0.3);
        }

        .hero-mobile-login-btn:active {
          transform: translateY(-1px);
        }

        .hero-buttons {
          display: flex;
          gap: 1rem;
          margin-bottom: 3rem;
          justify-content: center;
        }

        .hero-buttons .btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }

        .btn-primary {
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          color: white;
          border: 1px solid #2563eb;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
          position: relative;
          overflow: hidden;
        }

        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.6s ease;
        }

        .btn-primary:hover::before {
          left: 100%;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
          border-color: #1d4ed8;
        }

        .btn-secondary {
          background: linear-gradient(135deg, #0ea5e9, #06b6d4);
          color: white;
          border: 1px solid #0284c7;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);
          position: relative;
          overflow: hidden;
        }

        .btn-secondary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.6s ease;
        }

        .btn-secondary:hover::before {
          left: 100%;
        }

        .btn-secondary:hover {
          background: linear-gradient(135deg, #0284c7, #0891b2);
          border-color: #0369a1;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(14, 165, 233, 0.4);
        }

        .hero-stats {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 3rem;
        }

        .stat-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.1rem 1.5rem;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(128, 128, 128, 0.01));
          border: 1px solid #374151;
          border-radius: 20px;
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

        .stat-box::before {
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
          border-radius: 21px;
          z-index: -1;
          opacity: 0.6;
          filter: blur(0.5px);
          animation: statGlow 4s ease-in-out infinite;
        }

        .stat-icon {
          width: 1.75rem;
          height: 1.75rem;
          color: #3b82f6;
          flex-shrink: 0;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stat-number {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1;
        }

        @keyframes statGlow {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }

        .hero-visual {
          position: relative;
        }

        .hero-dashboard {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(128, 128, 128, 0.01));
          border: 1px solid #374151;
          border-radius: 20px;
          padding: 2rem;
          backdrop-filter: blur(20px);
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.15),
            0 0 20px rgba(59, 130, 246, 0.12),
            0 0 40px rgba(59, 130, 246, 0.06),
            0 0 80px rgba(59, 130, 246, 0.03),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          position: relative;
          overflow: hidden;
        }

        .hero-dashboard::before {
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
          border-radius: 21px;
          z-index: -1;
          opacity: 0.6;
          filter: blur(0.5px);
          animation: dashboardGlow 4s ease-in-out infinite;
        }

        @keyframes dashboardGlow {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.005);
          }
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

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .dashboard-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-primary);
          font-weight: 600;
        }

        .dashboard-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #888888;
          font-size: 0.875rem;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #6680fd;
          border-radius: 50%;
          position: relative;
          animation: pulse 2s infinite;
        }

        .status-dot::before {
          content: '';
          position: absolute;
          top: -4px;
          left: -4px;
          width: 16px;
          height: 16px;
          background: #6680fd;
          border-radius: 50%;
          opacity: 0.3;
          animation: ripple 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1);
          }
          50% { 
            opacity: 0.8; 
            transform: scale(1.1);
          }
        }

        @keyframes ripple {
          0% {
            transform: scale(0.5);
            opacity: 0.8;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .portfolio-summary {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .portfolio-item {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(59, 130, 246, 0.01));
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid #374151;
          box-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          position: relative;
          overflow: hidden;
        }

        .portfolio-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
        }

        .portfolio-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .portfolio-icon {
          width: 24px;
          height: 24px;
          object-fit: contain;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .portfolio-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .portfolio-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .portfolio-change {
          font-size: 0.875rem;
          font-weight: 600;
          position: relative;
          transition: all 0.3s ease;
        }

        .portfolio-change.positive {
          color: #10b981;
          text-shadow: 0 0 8px rgba(16, 185, 129, 0.3);
        }

        .portfolio-change.positive::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, transparent, rgba(16, 185, 129, 0.1), transparent);
          border-radius: 4px;
          opacity: 0;
          animation: positiveGlow 2s infinite;
        }

        .portfolio-change.negative {
          color: #ef4444;
          text-shadow: 0 0 8px rgba(239, 68, 68, 0.3);
        }

        .portfolio-change.negative::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, transparent, rgba(239, 68, 68, 0.1), transparent);
          border-radius: 4px;
          opacity: 0;
          animation: negativeGlow 2s infinite;
        }

        @keyframes positiveGlow {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }

        @keyframes negativeGlow {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }

        .crypto-change.neutral {
          color: #6680fd;
          font-weight: 600;
        }

        .change-label {
          font-size: 0.75rem;
          color: #888888;
          margin-bottom: 0.25rem;
          text-align: center;
        }

        .change-value {
          font-size: 0.875rem;
          font-weight: 600;
          text-align: center;
        }

        .crypto-change-empty {
          width: 80px;
        }

        .premium-expensive {
          color: #ef4444;
          font-weight: 600;
        }

        .premium-cheap {
          color: #10b981;
          font-weight: 600;
        }

        .crypto-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .crypto-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.01), rgba(14, 165, 233, 0.005));
          border-radius: 12px;
          border: 1px solid #374151;
          box-shadow: 
            0 2px 6px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.03);
          position: relative;
          overflow: hidden;
        }

        .crypto-item::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 3px;
          height: 100%;
          background: linear-gradient(to bottom, transparent, #3b82f6, transparent);
          opacity: 0;
        }

        .crypto-symbol {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }

        .crypto-logo {
          width: 28px;
          height: 28px;
          object-fit: contain;
          border-radius: 50%;
        }

        .nasdaq-symbol {
          color: #3b82f6;
        }

        .exchange-icon {
          font-size: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .crypto-info {
          flex: 1;
        }

        .crypto-name {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .crypto-price {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .crypto-change {
          font-size: 0.875rem;
          font-weight: 600;
        }

        .crypto-change.positive {
          color: #10b981;
        }

        .crypto-change.negative {
          color: #ef4444;
        }

        /* 애니메이션 효과 클래스 */
        .fade-in-up {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease;
        }

        .fade-in-up.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .fade-in-up-delay-1 {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease;
          transition-delay: 0.4s;
        }

        .fade-in-up-delay-1.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .fade-in-up-delay-1-5 {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease;
          transition-delay: 0.6s;
        }

        .fade-in-up-delay-1-5.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .fade-in-up-delay-2 {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease;
          transition-delay: 0.8s;
        }

        .fade-in-up-delay-2.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .fade-in-up-delay-3 {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease;
          transition-delay: 1.2s;
        }

        .fade-in-up-delay-3.visible {
          opacity: 1;
          transform: translateY(0);
        }

        @media (max-width: 768px) {
          .hero {
            padding: 3rem 0 2rem;
            min-height: auto;
          }

          .container {
            padding: 0 1rem;
          }

          .hero-content {
            grid-template-columns: 1fr;
            gap: 2rem;
            text-align: center;
          }

          .hero-title {
            font-size: 2.2rem;
            line-height: 1.2;
            margin-bottom: 1rem;
          }

          .hero-description {
            font-size: 1.1rem;
            margin-bottom: 2rem;
          }

          .hero-button-container {
            flex-direction: column;
            gap: 0.8rem;
            margin-bottom: 2rem;
          }

          .hero-badge-button {
            padding: 0.8rem 1.5rem;
            font-size: 1rem;
            width: 100%;
            max-width: 280px;
          }

          .hero-buttons {
            flex-direction: column;
            gap: 0.8rem;
            align-items: center;
          }

          .hero-buttons .btn {
            padding: 0.8rem 1.5rem;
            font-size: 1rem;
            width: 100%;
            max-width: 200px;
          }

          .hero-stats {
            justify-content: center;
            flex-wrap: nowrap;
            gap: 0.6rem;
          }

          .stat-box {
            padding: 1.2rem 1rem;
            flex: 1;
            max-width: 130px;
          }

          .stat-icon {
            width: 1.4rem;
            height: 1.4rem;
          }

          .stat-number {
            font-size: 1rem;
          }

          .stat-label {
            font-size: 0.75rem;
          }

          .portfolio-summary {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .portfolio-item {
            padding: 1rem;
          }

          .portfolio-value {
            font-size: 1.2rem;
          }

          .crypto-list {
            gap: 0.8rem;
          }

          .crypto-item {
            padding: 0.8rem;
            gap: 0.8rem;
          }

          .crypto-symbol {
            width: 35px;
            height: 35px;
          }

          .crypto-logo {
            width: 24px;
            height: 24px;
          }

          .crypto-price {
            font-size: 0.9rem;
          }

          .crypto-change {
            font-size: 0.8rem;
          }

          .bitcoin-rain {
            display: block;
          }
          
          .falling-bitcoin {
            font-size: 1.2rem;
            animation-duration: 6s;
          }
        }

        @media (max-width: 480px) {
          .hero {
            padding: 2rem 0 1.5rem;
          }

          .container {
            padding: 0 0.75rem;
          }

          .hero-title {
            font-size: 1.8rem;
            line-height: 1.1;
          }

          .hero-description {
            font-size: 1rem;
            margin-bottom: 1.5rem;
          }

          .hero-button-container {
            margin-bottom: 1.5rem;
          }

          .hero-badge-button {
            padding: 0.7rem 1.2rem;
            font-size: 0.9rem;
          }

          .hero-buttons .btn {
            padding: 0.7rem 1.2rem;
            font-size: 0.9rem;
          }

          .hero-stats {
            justify-content: center;
            flex-wrap: nowrap;
            gap: 0.4rem;
          }

          .stat-box {
            padding: 1rem 0.8rem;
            flex: 1;
            max-width: 110px;
          }

          .stat-icon {
            width: 1rem;
            height: 1rem;
          }

          .stat-number {
            font-size: 0.75rem;
          }

          .stat-label {
            font-size: 0.6rem;
          }

          .portfolio-item {
            padding: 0.8rem;
          }

          .portfolio-value {
            font-size: 1.1rem;
          }

          .crypto-item {
            padding: 0.6rem;
          }

          .crypto-symbol {
            width: 30px;
            height: 30px;
          }

          .crypto-logo {
            width: 20px;
            height: 20px;
          }

          .mobile-login-button {
            width: calc(110px * 3 + 0.4rem * 2);
          }
        }
      `}</style>
    </section>
  )
}

export default Hero 