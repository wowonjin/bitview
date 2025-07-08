import { useState, useContext, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext'

const FundingCalculator = () => {
  const { user, isPremium } = useContext(AuthContext)
  const [amount, setAmount] = useState('')
  const [displayAmount, setDisplayAmount] = useState('')
  const [leverage, setLeverage] = useState(1)
  const [exchange, setExchange] = useState('binance')
  const [coinSymbol, setCoinSymbol] = useState('BTCUSDT')
  const [customCoin, setCustomCoin] = useState('')
  const [isCustomCoin, setIsCustomCoin] = useState(false)
  const [customFundingRate, setCustomFundingRate] = useState('')
  const [currentFundingRate, setCurrentFundingRate] = useState(null)
  const [fundingTime, setFundingTime] = useState(null)
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPremiumNotice, setShowPremiumNotice] = useState(false)

  // 인기 코인 목록
  const popularCoins = [
    { symbol: 'BTCUSDT', name: '비트코인', icon: '₿' },
    { symbol: 'ETHUSDT', name: '이더리움', icon: '⟠' },
    { symbol: 'XRPUSDT', name: 'XRP', icon: '◉' },
    { symbol: 'SOLUSDT', name: '솔라나', icon: '◎' },
    { symbol: 'DOGEUSDT', name: '도지코인', icon: '🐕' },
    { symbol: 'ADAUSDT', name: '카다노', icon: '♠' },
    { symbol: 'DOTUSDT', name: '폴카닷', icon: '●' },
    { symbol: 'LINKUSDT', name: '체인링크', icon: '⬢' },
    { symbol: 'AVAXUSDT', name: '아발란체', icon: '🔺' },
    { symbol: 'ATOMUSDT', name: '코스모스', icon: '⚛' }
  ]

  // 숫자 포매팅 함수
  const formatNumber = (value) => {
    if (!value) return ''
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  // 숫자에서 쉼표 제거
  const removeCommas = (value) => {
    return value.replace(/,/g, '')
  }

  // 바이낸스 펀딩비 조회
  const fetchBinanceFundingRate = async (symbol) => {
    try {
      const response = await fetch(`https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${symbol}`)
      const data = await response.json()
      return {
        fundingRate: parseFloat(data.lastFundingRate),
        nextFundingTime: new Date(data.nextFundingTime)
      }
    } catch (error) {
      console.error('바이낸스 펀딩비 조회 실패:', error)
      return {
        fundingRate: 0.001,
        nextFundingTime: new Date(Date.now() + 8 * 60 * 60 * 1000)
      }
    }
  }

  // 바이비트 펀딩비 조회 (모의 데이터)
  const fetchBybitFundingRate = async (symbol) => {
    try {
      return {
        fundingRate: 0.0005,
        nextFundingTime: new Date(Date.now() + 8 * 60 * 60 * 1000)
      }
    } catch (error) {
      console.error('바이비트 펀딩비 조회 실패:', error)
      return {
        fundingRate: 0.0005,
        nextFundingTime: new Date(Date.now() + 8 * 60 * 60 * 1000)
      }
    }
  }

  // 펀딩비 조회
  const fetchFundingRate = async () => {
    // 직접 입력 시 API 호출하지 않고 사용자 입력값 사용
    if (isCustomCoin) {
      if (customFundingRate) {
        setCurrentFundingRate(parseFloat(customFundingRate) / 100)
        setFundingTime(new Date(Date.now() + 8 * 60 * 60 * 1000))
      } else {
        setCurrentFundingRate(null)
        setFundingTime(null)
      }
      return
    }
    
    setIsLoading(true)
    const symbol = coinSymbol
    
    try {
      let fundingData = null
      
      if (exchange === 'binance') {
        fundingData = await fetchBinanceFundingRate(symbol)
      } else if (exchange === 'bybit') {
        fundingData = await fetchBybitFundingRate(symbol)
      }
      
      if (fundingData) {
        setCurrentFundingRate(fundingData.fundingRate)
        setFundingTime(fundingData.nextFundingTime)
      }
    } catch (error) {
      console.error('펀딩비 조회 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }



  // 심볼 또는 거래소 변경 시 펀딩비 조회
  useEffect(() => {
    if (coinSymbol || customFundingRate) {
      fetchFundingRate()
    }
  }, [coinSymbol, customFundingRate, exchange, isCustomCoin])

  // 매수금액 입력 처리
  const handleAmountChange = (e) => {
    const value = e.target.value
    const numericValue = removeCommas(value)
    
    if (!/^\d*$/.test(numericValue)) return
    
    setAmount(numericValue)
    setDisplayAmount(formatNumber(numericValue))
  }

  // 계산하기 버튼 클릭 처리
  const handleCalculate = async () => {
    // 프리미엄 회원이 아닌 경우 프리미엄 안내 표시
    if (!isPremium) {
      setShowPremiumNotice(true)
      return
    }

    // 프리미엄 회원인 경우 계산 실행
    calculateFunding()
  }

  // 펀딩비 계산 함수
  const calculateFunding = () => {
    if (!amount || currentFundingRate === null || !leverage) {
      setResult(null)
      return
    }

    const investAmount = parseFloat(amount)
    const leverageAmount = parseFloat(leverage)
    const fundingRate = currentFundingRate

    if (!investAmount || !leverageAmount || fundingRate === null) {
      setResult(null)
      return
    }

    // 포지션 크기 (레버리지 적용)
    const positionSize = investAmount * leverageAmount
    
    // 8시간마다 받는 펀딩비
    const fundingPer8Hours = positionSize * fundingRate
    
    // 하루 펀딩비 (8시간 * 3회)
    const fundingPerDay = fundingPer8Hours * 3
    
    // 한달 펀딩비 (30일 기준)
    const fundingPerMonth = fundingPerDay * 30
    
    // 6개월 펀딩비
    const fundingPer6Months = fundingPerMonth * 6
    
    // 1년 펀딩비
    const fundingPerYear = fundingPerMonth * 12

    setResult({
      investAmount,
      leverageAmount,
      positionSize,
      fundingRate: fundingRate * 100,
      fundingPer8Hours,
      fundingPerDay,
      fundingPerMonth,
      fundingPer6Months,
      fundingPerYear,
      symbol: isCustomCoin ? '직접 입력' : coinSymbol
    })
  }

  return (
    <div className="profit-calculator-page">
      <div className="calculator-container">
        <div className="calculator-header">
          <h1 className="mobile-page-title">펀딩비 계산기</h1>
                      <p className="mobile-page-description">바이낸스와 바이비트 선물 거래 펀딩비를 실시간으로 계산해보세요</p>
        </div>

        <div className="calculator-content">
          <div className="main-content">
            <div className="input-section">
              <div className="input-group">
                <label>거래소</label>
                <select
                  value={exchange}
                  onChange={(e) => setExchange(e.target.value)}
                  className="dropdown-select"
                >
                  <option value="binance">바이낸스 (Binance)</option>
                  <option value="bybit">바이비트 (Bybit)</option>
                </select>
              </div>

              <div className="input-group">
                <label>코인 선택</label>
                <div className="coin-selection">
                  <div className="coin-type-toggle">
                    <button 
                      className={`toggle-btn ${!isCustomCoin ? 'active' : ''}`}
                      onClick={() => setIsCustomCoin(false)}
                    >
                      코인 선택하기
                    </button>
                    <button 
                      className={`toggle-btn ${isCustomCoin ? 'active' : ''}`}
                      onClick={() => setIsCustomCoin(true)}
                    >
                      직접 입력하기
                    </button>
                  </div>
                  
                  {!isCustomCoin ? (
                    <select
                      value={coinSymbol}
                      onChange={(e) => setCoinSymbol(e.target.value)}
                      className="dropdown-select"
                    >
                      {popularCoins.map(coin => (
                        <option key={coin.symbol} value={coin.symbol}>
                          {coin.name} ({coin.symbol})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      value={customFundingRate}
                      onChange={(e) => setCustomFundingRate(e.target.value)}
                      placeholder="펀딩비 % 입력 (예: 0.01)"
                      className="coin-input"
                      step="0.0001"
                      min="-1"
                      max="1"
                    />
                  )}
                </div>
              </div>

              {currentFundingRate !== null && (
                <div className="funding-rate-display">
                  <div className="funding-info">
                    <div className="funding-rate">
                      <span className="label">현재 펀딩비율:</span>
                      <span className={`value ${currentFundingRate >= 0 ? 'positive' : 'negative'}`}>
                        {(currentFundingRate * 100).toFixed(4)}%
                      </span>
                    </div>
                    {fundingTime && (
                      <div className="funding-time">
                        <span className="label">다음 펀딩 시간:</span>
                        <span className="value">{fundingTime.toLocaleString('ko-KR')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="input-group amount-input-group">
                <label>매수 금액</label>
                <div className="amount-input-wrapper">
                  <input
                    type="text"
                    value={displayAmount}
                    onChange={handleAmountChange}
                    placeholder="매수할 금액을 입력하세요"
                    className="amount-input"
                  />
                  <span className="currency-label">KRW</span>
                </div>
              </div>

              <div className="input-group">
                <label>레버리지</label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    value={leverage}
                    onChange={(e) => setLeverage(parseFloat(e.target.value) || 1)}
                    placeholder="레버리지를 입력하세요 (예: 10)"
                    className="leverage-input"
                    min="1"
                    max="125"
                    step="1"
                  />
                  <span className="unit-label">×</span>
                </div>
              </div>

              <div className="calculate-button-wrapper">
                <div className="button-container">
                  <button 
                    className={`calculate-btn ${!isPremium || isLoading ? 'disabled' : ''}`}
                    onClick={handleCalculate}
                    disabled={!isPremium || isLoading}
                  >
                    {isPremium 
                      ? (isLoading ? '펀딩비 조회 중...' : '펀딩비 계산하기')
                      : '프리미엄 가입 후 이용 가능'}
                  </button>
                  
                  {showPremiumNotice && !isPremium && (
                    <div className="premium-notice">
                      <div className="notice-content">
                        <span className="notice-text">
                          🎁 프리미엄 신청하면 무제한 이용 가능
                        </span>
                        <button 
                          className="close-notice"
                          onClick={() => setShowPremiumNotice(false)}
                        >
                          ×
                        </button>
                      </div>
                      <div className="notice-arrow"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="result-section">
            <div className="result-content">
              <div className="result-item">
                <span className="label">투자 금액:</span>
                <span className="value">{result ? result.investAmount.toLocaleString() : '0'} KRW</span>
              </div>
              <div className="result-item">
                <span className="label">레버리지:</span>
                <span className="value">{result ? result.leverageAmount : '0'}x</span>
              </div>
              <div className="result-item">
                <span className="label">포지션 크기:</span>
                <span className="value">{result ? result.positionSize.toLocaleString() : '0'} KRW</span>
              </div>
              <div className="result-item">
                <span className="label">현재 펀딩비율:</span>
                <span className={`value ${result ? (result.fundingRate >= 0 ? 'positive' : 'negative') : ''}`}>
                  {result ? result.fundingRate.toFixed(4) : '0.0000'}%
                </span>
              </div>
              
              <div className="funding-results-box">
                <div className="result-item funding">
                  <span className="label">8시간마다 받는 금액:</span>
                  <span className={`value ${result ? (result.fundingPer8Hours >= 0 ? 'positive' : 'negative') : ''}`}>
                    {result ? (result.fundingPer8Hours >= 0 ? '+' : '') + Math.round(result.fundingPer8Hours).toLocaleString() : '0'} KRW
                  </span>
                </div>
                <div className="result-item funding">
                  <span className="label">하루 받는 금액:</span>
                  <span className={`value ${result ? (result.fundingPerDay >= 0 ? 'positive' : 'negative') : ''}`}>
                    {result ? (result.fundingPerDay >= 0 ? '+' : '') + Math.round(result.fundingPerDay).toLocaleString() : '0'} KRW
                  </span>
                </div>
                <div className="result-item funding">
                  <span className="label">한 달 받는 금액:</span>
                  <span className={`value ${result ? (result.fundingPerMonth >= 0 ? 'positive' : 'negative') : ''}`}>
                    {result ? (result.fundingPerMonth >= 0 ? '+' : '') + Math.round(result.fundingPerMonth).toLocaleString() : '0'} KRW
                  </span>
                </div>
                <div className="result-item funding">
                  <span className="label">6개월 받는 금액:</span>
                  <span className={`value ${result ? (result.fundingPer6Months >= 0 ? 'positive' : 'negative') : ''}`}>
                    {result ? (result.fundingPer6Months >= 0 ? '+' : '') + Math.round(result.fundingPer6Months).toLocaleString() : '0'} KRW
                  </span>
                </div>
                <div className="result-item funding final">
                  <span className="label">1년 받는 금액:</span>
                  <span className={`value ${result ? (result.fundingPerYear >= 0 ? 'positive' : 'negative') : ''}`}>
                    {result ? (result.fundingPerYear >= 0 ? '+' : '') + Math.round(result.fundingPerYear).toLocaleString() : '0'} KRW
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .profit-calculator-page {
          padding-top: 100px;
          min-height: 100vh;
          padding-bottom: 50px;
          color: white;
          overflow: visible;
        }

        .calculator-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          overflow: visible;
        }

        .calculator-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .calculator-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 16px;
        }

        .calculator-header p {
          font-size: 1.1rem;
          color: #9ca3af;
          line-height: 1.6;
        }

        .calculator-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: start;
        }

        .main-content {
          width: 100%;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 16px;
          border: 1px solid #374151;
          padding: 30px;
          box-sizing: border-box;
        }

        .input-section {
          width: 100%;
          display: flex;
          flex-direction: column;
        }

        .input-group {
          width: 100%;
          display: flex;
          flex-direction: column;
          margin-bottom: 24px;
        }

        .input-group:last-child {
          margin-bottom: 0;
        }

        .amount-input-group {
          margin-top: 8px;
        }

        .input-group label {
          display: block;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 8px;
          font-size: 14px;
          text-align: left;
        }

        .coin-selection {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .coin-type-toggle {
          width: 100%;
          display: flex;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #374151;
        }

        .toggle-btn {
          flex: 1;
          padding: 12px 16px;
          background: #111111;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
        }

        .toggle-btn.active {
          background: #3b82f6;
          color: #ffffff;
        }

        .dropdown-select, .coin-input {
          width: 100%;
          padding: 12px 16px;
          background: #111111;
          border: 1px solid #374151;
          border-radius: 8px;
          color: #ffffff;
          font-size: 16px;
          transition: border-color 0.3s ease;
          box-sizing: border-box;
        }

        .dropdown-select {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 20px center;
          background-repeat: no-repeat;
          background-size: 16px;
          padding-right: 48px;
        }

        .dropdown-select:focus {
          outline: none;
          border-color: #3b82f6;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%233b82f6' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
        }

        .dropdown-select option {
          background: #111111;
          color: #ffffff;
          padding: 8px;
        }

        .coin-input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .amount-input:focus,
        .leverage-input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .amount-input:focus + .currency-label,
        .leverage-input:focus + .unit-label {
          color: #3b82f6;
        }

        .funding-rate-display {
          width: 100%;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid #3b82f6;
          border-radius: 8px;
          padding: 16px;
          margin: 8px 0 16px 0;
          box-sizing: border-box;
        }

        .funding-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .funding-rate, .funding-time {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .funding-rate .label, .funding-time .label {
          color: #9ca3af;
          font-size: 14px;
        }

        .funding-rate .value {
          font-weight: 700;
          font-size: 1.1rem;
        }

        .amount-input-wrapper {
          width: 100%;
          position: relative;
        }

        .amount-input {
          width: 100%;
          padding: 12px 60px 12px 16px;
          background: #111111;
          border: 1px solid #374151;
          border-radius: 8px;
          color: #ffffff;
          font-size: 16px;
          transition: border-color 0.3s ease;
          box-sizing: border-box;
        }

        .amount-input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .currency-label {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          font-size: 14px;
          font-weight: 500;
          pointer-events: none;
        }

        .input-wrapper {
          width: 100%;
          position: relative;
        }

        .leverage-input {
          width: 100%;
          padding: 12px 40px 12px 16px;
          background: #111111;
          border: 1px solid #374151;
          border-radius: 8px;
          color: #ffffff;
          font-size: 16px;
          transition: border-color 0.3s ease;
          box-sizing: border-box;
        }

        .leverage-input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .unit-label {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          font-size: 14px;
          font-weight: 500;
          pointer-events: none;
        }

        .calculate-button-wrapper {
          width: 100%;
          margin-top: 16px;
        }

        .button-container {
          width: 100%;
          position: relative;
          text-align: center;
        }

        .calculate-btn {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: #ffffff;
          border: none;
          padding: 14px 16px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          width: 100%;
          box-sizing: border-box;
        }

        .calculate-btn:hover:not(.disabled) {
          background: linear-gradient(135deg, #2563eb, #1e40af);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        .calculate-btn.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .premium-notice {
          position: absolute;
          top: -70px;
          left: 50%;
          transform: translateX(-50%);
          background: #f59e0b;
          color: #ffffff;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          z-index: 1000;
          animation: slideInUp 0.3s ease-out, floatBubble 3s ease-in-out infinite 0.5s;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
          border: none;
          min-width: 250px;
          text-align: center;
        }

        .premium-notice::before {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 12px 12px 0 12px;
          border-color: #f59e0b transparent transparent transparent;
        }

        .premium-notice::after {
          display: none;
        }

        .notice-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .notice-text {
          color: #ffffff;
          flex: 1;
          font-weight: 600;
        }

        .close-notice {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: #ffffff;
          font-size: 16px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 50%;
          transition: background 0.2s ease;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-notice:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .notice-arrow {
          display: none;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        @keyframes floatBubble {
          0%, 100% {
            transform: translateX(-50%) translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateX(-50%) translateY(-8px) rotate(1deg);
          }
          50% {
            transform: translateX(-50%) translateY(-4px) rotate(0deg);
          }
          75% {
            transform: translateX(-50%) translateY(-6px) rotate(-1deg);
          }
        }

        .result-section {
          width: 100%;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 16px;
          border: 1px solid #374151;
          padding: 30px;
          height: fit-content;
          box-sizing: border-box;
        }

        .result-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .result-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #374151;
        }

        .result-item:last-child {
          border-bottom: none;
        }

        .result-item .label {
          color: #9ca3af;
          font-size: 14px;
        }

        .result-item .value {
          color: #ffffff;
          font-weight: 500;
          font-size: 16px;
        }

        .result-item .value.positive {
          color: #10b981;
        }

        .result-item .value.negative {
          color: #ef4444;
        }

        .funding-results-box {
          border: 1px solid #3b82f6;
          border-radius: 12px;
          padding: 20px;
          margin-top: 16px;
        }

        .result-item.funding {
          border-bottom: 1px solid #374151;
        }

        .result-item.funding.final {
          border-bottom: none;
          font-size: 1.1rem;
        }

        .result-item.funding.final .value {
          font-size: 18px;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .profit-calculator-page {
            padding-top: 80px;
            padding-bottom: 30px;
          }

          .calculator-container {
            padding: 0 16px;
          }

          .calculator-content {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          
          .calculator-header {
            margin-bottom: 32px;
          }

          .calculator-header h1 {
            font-size: 2rem;
          }

          .calculator-header p {
            font-size: 1rem;
          }
          
          .main-content, .result-section {
            padding: 20px;
          }

          .input-group {
            margin-bottom: 20px;
          }

          .input-group label {
            font-size: 14px;
          }

          .dropdown-select,
          .coin-input,
          .amount-input,
          .leverage-input {
            padding: 12px 16px;
            font-size: 14px;
          }

          .amount-input {
            padding: 12px 60px 12px 16px;
          }

          .leverage-input {
            padding: 12px 40px 12px 16px;
          }

          .toggle-btn {
            padding: 10px 14px;
            font-size: 13px;
          }

          .funding-rate-display {
            padding: 14px;
          }

          .calculate-btn {
            padding: 12px 16px;
            font-size: 14px;
          }

          .premium-notice {
            top: -60px;
            font-size: 13px;
            padding: 10px 14px;
            min-width: 200px;
          }

          .result-item {
            padding: 10px 0;
          }

          .result-item .label {
            font-size: 13px;
          }

          .result-item .value {
            font-size: 14px;
          }

          .funding-results-box {
            padding: 16px;
          }

          .result-item.funding.final .value {
            font-size: 16px;
          }
        }

        @media (max-width: 480px) {
          .profit-calculator-page {
            padding-top: 70px;
            padding-bottom: 20px;
          }

          .calculator-container {
            padding: 0 12px;
          }

          .calculator-header {
            margin-bottom: 24px;
          }

          .calculator-header h1 {
            font-size: 1.75rem;
          }

          .calculator-header p {
            font-size: 0.9rem;
          }

          .calculator-content {
            gap: 20px;
          }

          .main-content, .result-section {
            padding: 16px;
          }

          .input-group {
            margin-bottom: 16px;
          }

          .input-group label {
            font-size: 13px;
            margin-bottom: 6px;
          }

          .dropdown-select,
          .coin-input,
          .amount-input,
          .leverage-input {
            padding: 10px 14px;
            font-size: 13px;
          }

          .amount-input {
            padding: 10px 50px 10px 14px;
          }

          .leverage-input {
            padding: 10px 35px 10px 14px;
          }

          .currency-label,
          .unit-label {
            font-size: 13px;
            right: 14px;
          }

          .toggle-btn {
            padding: 8px 12px;
            font-size: 12px;
          }

          .funding-rate-display {
            padding: 12px;
          }

          .funding-info {
            gap: 0.4rem;
          }

          .funding-rate .label,
          .funding-time .label {
            font-size: 12px;
          }

          .funding-rate .value {
            font-size: 1rem;
          }

          .funding-time .value {
            font-size: 11px;
          }

          .calculate-btn {
            padding: 10px 14px;
            font-size: 13px;
          }

          .premium-notice {
            top: -55px;
            font-size: 12px;
            padding: 8px 12px;
            min-width: 180px;
          }

          .result-item {
            padding: 8px 0;
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .result-item .label {
            font-size: 12px;
          }

          .result-item .value {
            font-size: 13px;
            align-self: flex-end;
          }

          .funding-results-box {
            padding: 12px;
          }

          .result-item.funding.final {
            font-size: 1rem;
          }

          .result-item.funding.final .value {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  )
}

export default FundingCalculator 