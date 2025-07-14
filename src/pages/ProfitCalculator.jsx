import { useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

const ProfitCalculator = () => {
  const { user, isPremium } = useContext(AuthContext)
  const [amount, setAmount] = useState('')
  const [displayAmount, setDisplayAmount] = useState('')
  const [leverage, setLeverage] = useState('custom')
  const [customLeverage, setCustomLeverage] = useState(1)
  const [exchange, setExchange] = useState('binance')
  const [orderType, setOrderType] = useState('taker')
  const [profitRate, setProfitRate] = useState('')
  const [compoundTimes, setCompoundTimes] = useState(1)
  const [result, setResult] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showPremiumNotice, setShowPremiumNotice] = useState(false)

  // 거래소별 수수료율 (선물)
  const exchangeFees = {
    binance: {
      maker: 0.02, // 0.02%
      taker: 0.04  // 0.04%
    },
    bybit: {
      maker: 0.01, // 0.01%
      taker: 0.06  // 0.06%
    }
  }

  // 숫자 포매팅 함수 (천단위 구분자)
  const formatNumber = (value) => {
    if (!value) return ''
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  // 숫자에서 쉼표 제거
  const removeCommas = (value) => {
    return value.replace(/,/g, '')
  }

  // 계산하기 버튼 클릭 처리
  const handleCalculate = async () => {
    // 프리미엄 회원이 아닌 경우 프리미엄 안내 표시
    if (!isPremium) {
      setShowPremiumNotice(true)
      return
    }

    // 프리미엄 회원인 경우 계산 실행
    calculateProfit()
  }

  // 매수금액 입력 처리
  const handleAmountChange = (e) => {
    const value = e.target.value
    const numericValue = removeCommas(value)
    
    // 숫자만 허용
    if (!/^\d*$/.test(numericValue)) return
    
    setAmount(numericValue)
    setDisplayAmount(formatNumber(numericValue))
  }

  // 계산 함수
  const calculateProfit = () => {
    if (!amount || !profitRate || !compoundTimes) {
      setResult(null)
      return
    }

    const initialAmount = parseFloat(amount)
    const currentLeverage = parseFloat(customLeverage) || 1
    const profit = parseFloat(profitRate)
    const times = parseInt(compoundTimes)

    if (!initialAmount || !currentLeverage || !profit || !times) {
      setResult(null)
      return
    }

    // 수수료율
    const feeRate = exchangeFees[exchange][orderType] / 100

    let currentAmount = initialAmount
    let totalFees = 0
    let compoundResults = []

    // 복리 계산
    for (let i = 0; i < times; i++) {
      // 각 거래의 레버리지 적용 금액
      const leveragedAmount = currentAmount * currentLeverage
      
      // 수수료 계산
      const fee = leveragedAmount * feeRate
      totalFees += fee
      
      // 수익 계산 (레버리지 적용)
      const leveragedProfitRate = profit * currentLeverage
      const grossProfit = currentAmount * (leveragedProfitRate / 100)
      
      // 순수익 (수수료 차감)
      const netProfit = grossProfit - fee
      
      // 다음 거래를 위한 원금 업데이트
      currentAmount = currentAmount + netProfit
      
      compoundResults.push({
        round: i + 1,
        startAmount: i === 0 ? initialAmount : compoundResults[i-1].endAmount,
        leveragedAmount,
        fee,
        grossProfit,
        netProfit,
        endAmount: currentAmount
      })
    }

    // 최종 결과
    const totalGrossProfit = currentAmount - initialAmount + totalFees
    const finalNetProfit = currentAmount - initialAmount
    const finalNetProfitRate = ((currentAmount - initialAmount) / initialAmount) * 100

    setResult({
      initialAmount,
      finalAmount: currentAmount,
      currentLeverage,
      feeRate: feeRate * 100,
      totalFees,
      totalGrossProfit,
      finalNetProfit,
      finalNetProfitRate,
      compoundTimes: times,
      compoundResults,
      leveragedProfitRate: profit * currentLeverage
    })
  }

  return (
    <div className="profit-calculator-page">
      <div className="calculator-container">
        <div className="calculator-header">
          <h1 className="mobile-page-title">수익 복리 계산기</h1>
          <p className="mobile-page-description">바이낸스와 바이비트 선물 거래 수익을 <br />원화(KRW) 기준으로 계산해보세요</p>
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
                    value={leverage === 'custom' ? customLeverage : leverage}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 1;
                      setLeverage('custom');
                      setCustomLeverage(value);
                    }}
                    placeholder="레버리지를 입력하세요 (예: 10)"
                    className="leverage-input"
                    min="1"
                    max="125"
                    step="1"
                  />
                  <span className="unit-label">×</span>
                </div>
              </div>

              <div className="input-group">
                <label>주문 타입</label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                  className="dropdown-select"
                >
                  <option value="maker">
                    지정가 (Maker) - {exchange === 'binance' ? '0.02%' : '0.01%'}
                  </option>
                  <option value="taker">
                    시장가 (Taker) - {exchange === 'binance' ? '0.04%' : '0.06%'}
                  </option>
                </select>
              </div>

              <div className="input-group">
                <label>코인 상승률</label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    value={profitRate}
                    onChange={(e) => setProfitRate(e.target.value)}
                    placeholder="예: 5 (5% 상승)"
                    className="profit-input"
                    step="0.1"
                  />
                  <span className="unit-label">%</span>
                </div>
              </div>

              <div className="input-group">
                <label>복리 횟수</label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    value={compoundTimes}
                    onChange={(e) => setCompoundTimes(parseInt(e.target.value) || 1)}
                    placeholder="예: 3 (3번 복리)"
                    className="profit-input"
                    min="1"
                    max="20"
                  />
                  <span className="unit-label">회</span>
                </div>
              </div>

              <div className="calculate-button-wrapper">
                <div className="button-container">
                  <button 
                    className={`calculate-btn ${!isPremium ? 'disabled' : ''}`}
                    onClick={handleCalculate}
                    disabled={!isPremium}
                  >
                    {isPremium ? '수익 복리 계산하기' : '프리미엄 가입 후 이용 가능'}
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

            <div className="result-section">
              <div className="result-content">
                <div className="result-item">
                  <span className="label">초기 투자 금액:</span>
                  <span className="value">{result ? result.initialAmount.toLocaleString() : '0'} KRW</span>
                </div>
                <div className="result-item">
                  <span className="label">복리 횟수:</span>
                  <span className="value">{result ? result.compoundTimes : '0'}회</span>
                </div>
                <div className="result-item">
                  <span className="label">레버리지:</span>
                  <span className="value">{result ? result.currentLeverage : '0'}x</span>
                </div>
                <div className="result-item">
                  <span className="label">수수료율:</span>
                  <span className="value">{result ? result.feeRate : '0'}%</span>
                </div>
                <div className="result-item">
                  <span className="label">총 거래 수수료:</span>
                  <span className="value negative">-{result ? Math.round(result.totalFees).toLocaleString() : '0'} KRW</span>
                </div>
                <div className="result-item">
                  <span className="label">레버리지 적용 수익률:</span>
                  <span className="value">{result ? result.leveragedProfitRate : '0'}%</span>
                </div>
                <div className="result-item">
                  <span className="label">총 수익 (수수료 제외):</span>
                  <span className={`value ${result ? (result.totalGrossProfit >= 0 ? 'positive' : 'negative') : ''}`}>
                    {result ? (result.totalGrossProfit >= 0 ? '+' : '') + Math.round(result.totalGrossProfit).toLocaleString() : '0'} KRW
                  </span>
                </div>
                <div className="final-results-box">
                  <div className="result-item final final-amount-wrapper">
                    <span className="label">최종 보유 금액:</span>
                    <div className="amount-with-tooltip">
                      <span className="value">{result ? Math.round(result.finalAmount).toLocaleString() : '0'} KRW</span>
                      {result && result.compoundTimes > 1 && (
                        <div className="tooltip-wrapper">
                          <button 
                            className="tooltip-btn"
                            onClick={() => setShowDetails(!showDetails)}
                          >
                            복리 거래 상세내역 확인하기
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="result-item final">
                    <span className="label">최종 순수익:</span>
                    <span className={`value ${result ? (result.finalNetProfit >= 0 ? 'positive' : 'negative') : ''}`}>
                      {result ? (result.finalNetProfit >= 0 ? '+' : '') + Math.round(result.finalNetProfit).toLocaleString() : '0'} KRW
                    </span>
                  </div>
                  <div className="result-item final">
                    <span className="label">실제 총 수익률:</span>
                    <span className={`value ${result ? (result.finalNetProfitRate >= 0 ? 'positive' : 'negative') : ''}`}>
                      {result ? (result.finalNetProfitRate >= 0 ? '+' : '') + result.finalNetProfitRate.toFixed(2) : '0.00'}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showDetails && result && result.compoundTimes > 1 && (
          <aside className="details-aside">
            <div className="aside-header">
              <h4>복리 거래 상세내역</h4>
              <button 
                className="close-btn"
                onClick={() => setShowDetails(false)}
              >
                ×
              </button>
            </div>
            <div className="aside-content">
              <div className="compound-chart">
                <h5>거래별 보유 금액 추이</h5>
                <svg width="100%" height="200" viewBox="0 0 280 200">
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1"/>
                    </linearGradient>
                  </defs>
                  
                  {/* 격자선 */}
                  <g stroke="#374151" strokeWidth="1" opacity="0.3">
                    {[1,2,3,4].map(i => (
                      <line key={`grid-y-${i}`} x1="40" y1={40 + i * 30} x2="260" y2={40 + i * 30} />
                    ))}
                    {result.compoundResults.map((_, i) => (
                      <line key={`grid-x-${i}`} x1={60 + i * (200 / Math.max(result.compoundResults.length - 1, 1))} y1="40" x2={60 + i * (200 / Math.max(result.compoundResults.length - 1, 1))} y2="160" />
                    ))}
                  </g>

                  {/* 차트 영역 */}
                  <rect x="40" y="40" width="220" height="120" fill="none" stroke="#374151" strokeWidth="1"/>
                  
                  {/* 데이터 라인과 영역 */}
                  {(() => {
                    const maxAmount = Math.max(...result.compoundResults.map(r => r.endAmount), result.initialAmount);
                    const minAmount = Math.min(...result.compoundResults.map(r => r.endAmount), result.initialAmount);
                    const range = maxAmount - minAmount || 1;
                    
                    const points = [
                      `40,${160 - ((result.initialAmount - minAmount) / range) * 120}`,
                      ...result.compoundResults.map((round, index) => {
                        const x = 60 + index * (200 / Math.max(result.compoundResults.length - 1, 1));
                        const y = 160 - ((round.endAmount - minAmount) / range) * 120;
                        return `${x},${y}`;
                      })
                    ];
                    
                    const pathData = `M ${points.join(' L ')} L 260,160 L 40,160 Z`;
                    
                    return (
                      <>
                        {/* 영역 채우기 */}
                        <path d={pathData} fill="url(#chartGradient)" />
                        
                        {/* 라인 */}
                        <polyline 
                          points={points.join(' ')} 
                          fill="none" 
                          stroke="#3b82f6" 
                          strokeWidth="2"
                        />
                        
                        {/* 데이터 포인트 */}
                        <circle cx="40" cy={160 - ((result.initialAmount - minAmount) / range) * 120} r="3" fill="#ffffff" stroke="#3b82f6" strokeWidth="2"/>
                        {result.compoundResults.map((round, index) => {
                          const x = 60 + index * (200 / Math.max(result.compoundResults.length - 1, 1));
                          const y = 160 - ((round.endAmount - minAmount) / range) * 120;
                          return (
                            <circle key={index} cx={x} cy={y} r="3" fill="#ffffff" stroke="#3b82f6" strokeWidth="2"/>
                          );
                        })}
                      </>
                    );
                  })()}
                  
                  {/* X축 라벨 */}
                  <text x="40" y="180" textAnchor="middle" fill="#9ca3af" fontSize="12">시작</text>
                  {result.compoundResults.map((round, index) => {
                    const x = 60 + index * (200 / Math.max(result.compoundResults.length - 1, 1));
                    return (
                      <text key={index} x={x} y="180" textAnchor="middle" fill="#9ca3af" fontSize="12">
                        {round.round}차
                      </text>
                    );
                  })}
                  
                  {/* Y축 라벨 */}
                  {(() => {
                    const maxAmount = Math.max(...result.compoundResults.map(r => r.endAmount), result.initialAmount);
                    const minAmount = Math.min(...result.compoundResults.map(r => r.endAmount), result.initialAmount);
                    const step = (maxAmount - minAmount) / 4;
                    
                    return [0,1,2,3,4].map(i => {
                      const value = minAmount + step * i;
                      const y = 160 - (i * 30);
                      return (
                        <text key={i} x="35" y={y + 4} textAnchor="end" fill="#9ca3af" fontSize="10">
                          {(value / 1000).toFixed(0)}K
                        </text>
                      );
                    });
                  })()}
                  
                  {/* 축 제목 */}
                  <text x="150" y="195" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="500">거래 횟수</text>
                  <text x="15" y="100" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="500" transform="rotate(-90 15 100)">보유 금액</text>
                </svg>
              </div>
              
              {result.compoundResults.map((round) => (
                <div key={round.round} className="compound-round">
                  <div className="round-header">{round.round}차 거래</div>
                  <div className="round-details">
                    <div className="detail-item">
                      <span className="detail-label">시작 금액:</span>
                      <span className="detail-amount start-amount">{Math.round(round.startAmount).toLocaleString()} KRW</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">수수료:</span>
                      <span className="detail-amount fee-amount">-{Math.round(round.fee).toLocaleString()} KRW</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">순수익:</span>
                      <span className="detail-amount profit-amount">{round.netProfit >= 0 ? '+' : ''}{Math.round(round.netProfit).toLocaleString()} KRW</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">종료 금액:</span>
                      <span className="detail-amount end-amount">{Math.round(round.endAmount).toLocaleString()} KRW</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>

      <style jsx>{`
        .profit-calculator-page {
          padding-top: 100px;
          min-height: 100vh;
          padding-bottom: 50px;
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
          color: #9ca3af;
          font-size: 1.1rem;
        }

        .calculator-content {
          display: flex;
          gap: 40px;
          max-width: 1400px;
          margin: 0 auto;
          position: relative;
          overflow: visible;
        }

        .main-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          flex: 1;
          overflow: visible;
        }

        .input-section {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 16px;
          border: 1px solid #374151;
          padding: 30px;
          min-height: 600px;
        }

        .input-group {
          margin-bottom: 24px;
        }

        .input-group:last-child {
          margin-bottom: 0;
        }

        .input-group label {
          display: block;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 8px;
          font-size: 14px;
          text-align: left;
        }

        .amount-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .amount-input,
        .profit-input,
        .leverage-input,
        .dropdown-select {
          width: 100%;
          background: #111111;
          border: 1px solid #374151;
          border-radius: 8px;
          padding: 12px 16px;
          color: #ffffff;
          font-size: 16px;
          transition: border-color 0.3s ease;
          box-sizing: border-box;
        }

        .amount-input-wrapper .amount-input {
          padding-right: 60px;
        }

        .currency-label,
        .unit-label {
          position: absolute;
          right: 16px;
          color: #9ca3af;
          font-size: 14px;
          font-weight: 500;
          pointer-events: none;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-wrapper .leverage-input,
        .input-wrapper .profit-input {
          padding-right: 40px;
        }

        .amount-input:focus,
        .profit-input:focus,
        .leverage-input:focus,
        .dropdown-select:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .amount-input:focus + .currency-label,
        .leverage-input:focus + .unit-label,
        .profit-input:focus + .unit-label {
          color: #3b82f6;
        }

        .dropdown-select {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 12px center;
          background-repeat: no-repeat;
          background-size: 16px;
          padding-right: 48px;
        }

        .dropdown-select:focus {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%233b82f6' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
        }

        .dropdown-select option {
          background: #111111;
          color: #ffffff;
          padding: 8px;
        }

        .calculate-button-wrapper {
          margin-top: 24px;
        }

        .button-container {
          position: relative;
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

        .calculate-btn:active:not(.disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }

        .calculate-btn.disabled {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          cursor: not-allowed;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          transform: none;
          opacity: 0.5;
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
            transform: translateX(-50%) translateY(-10px) rotate(-1deg);
          }
        }

        .result-section {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 16px;
          border: 1px solid #374151;
          padding: 30px;
          overflow: visible;
        }

        .result-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow: visible;
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

        .final-results-box {
          border: 1px solid #3b82f6;
          border-radius: 12px;
          padding: 20px;
          margin-top: 16px;
          overflow: visible;
        }

        .result-item.final {
          border-bottom: 1px solid #374151;
          padding: 12px 0;
          font-weight: 600;
          overflow: visible;
        }

        .result-item.final:last-child {
          border-bottom: none;
        }

        .final-amount-wrapper {
          overflow: visible !important;
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

        .amount-with-tooltip {
          position: relative;
          display: inline-block;
        }

        .tooltip-wrapper {
          position: absolute;
          top: 50%;
          left: 100%;
          transform: translateY(-50%);
          margin-left: 12px;
          z-index: 9999;
        }

        .tooltip-btn {
          background: #3b82f6;
          color: #ffffff;
          border: none;
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 12px;
          cursor: pointer;
          white-space: nowrap;
          position: relative;
          animation: float 2s ease-in-out infinite;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          transition: all 0.3s ease;
        }

        .tooltip-btn:hover {
          background: #2563eb;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }

        .tooltip-btn::before {
          content: '';
          position: absolute;
          left: -8px;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 6px 8px 6px 0;
          border-color: transparent #3b82f6 transparent transparent;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        .details-aside {
          position: fixed;
          top: 0;
          right: 0;
          width: 320px;
          height: 100vh;
          background: rgba(17, 17, 17, 0.95);
          backdrop-filter: blur(10px);
          border-left: 1px solid #374151;
          z-index: 1000;
          overflow-y: auto;
          animation: slideInRight 0.3s ease-out;
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .aside-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          position: sticky;
          top: 0;
          background: rgba(17, 17, 17, 0.95);
          backdrop-filter: blur(10px);
        }

        .aside-header h4 {
          color: #ffffff;
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: #9ca3af;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .aside-content {
          padding: 20px;
        }

        .compound-chart {
          margin-bottom: 24px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
          border: 1px solid #374151;
        }

        .compound-chart h5 {
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 16px 0;
          text-align: center;
        }

        .compound-round {
          margin-bottom: 16px;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #374151;
        }

        .compound-round:last-child {
          margin-bottom: 0;
        }

        .round-header {
          font-weight: 600;
          color: #3b82f6;
          font-size: 16px;
          margin-bottom: 12px;
        }

        .round-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 14px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
          border-bottom: 1px solid rgba(55, 65, 81, 0.3);
        }

        .detail-item:last-child {
          border-bottom: none;
        }

        .detail-label {
          color: #9ca3af;
          text-align: left;
          flex: 1;
        }

        .detail-amount {
          text-align: right;
          font-weight: 500;
        }

        .detail-amount.start-amount {
          color: #ffffff;
        }

        .detail-amount.fee-amount {
          color: #ef4444;
        }

        .detail-amount.profit-amount {
          color: #10b981;
        }

        .detail-amount.end-amount {
          color: #3b82f6;
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
            flex-direction: column;
            gap: 24px;
          }

          .main-content {
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

          .input-section,
          .result-section {
            padding: 20px;
            min-height: auto;
          }

          .input-group {
            margin-bottom: 20px;
          }

          .input-group label {
            font-size: 14px;
          }

          .amount-input,
          .leverage-input,
          .profit-input,
          .dropdown-select {
            padding: 12px 16px;
            font-size: 14px;
          }

          .details-aside {
            width: 100%;
            left: 0;
          }

          .aside-content {
            padding: 16px;
          }

          .round-details {
            font-size: 13px;
          }

          .amount-with-tooltip {
            flex-direction: column;
            align-items: flex-end;
            gap: 8px;
          }

          .tooltip-wrapper {
            position: static;
            transform: none;
            margin-left: 0;
          }

          .tooltip-btn {
            font-size: 11px;
            padding: 6px 10px;
            position: relative;
          }

          .tooltip-btn::before {
            display: none;
          }

          .compound-chart {
            padding: 12px;
          }

          .compound-chart h5 {
            font-size: 13px;
          }

          .calculate-btn {
            padding: 12px 16px;
            font-size: 14px;
            width: 100%;
          }

          .premium-notice {
            top: -60px;
            font-size: 13px;
            padding: 10px 14px;
            min-width: 200px;
          }

          .premium-notice::before {
            border-width: 10px 10px 0 10px;
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

          .final-results-box {
            padding: 16px;
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

          .calculator-header h1,
          .mobile-page-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: #ffffff;
            margin: 0 0 8px 0;
            text-align: center;
          }

          .calculator-header p,
          .mobile-page-description {
            font-size: 0.9rem;
            color: #9ca3af;
            margin: 0 0 20px 0;
            text-align: center;
            line-height: 1.5;
          }

          .calculator-content {
            gap: 20px;
          }

          .main-content {
            gap: 20px;
          }

          .input-section,
          .result-section {
            padding: 16px;
          }

          .input-group {
            margin-bottom: 16px;
          }

          .input-group label {
            font-size: 13px;
            margin-bottom: 6px;
          }

          .amount-input,
          .leverage-input,
          .profit-input,
          .dropdown-select {
            padding: 10px 14px;
            font-size: 13px;
          }

          .currency-label,
          .unit-label {
            font-size: 13px;
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

          .final-results-box {
            padding: 12px;
          }

          .amount-with-tooltip {
            width: 100%;
            align-items: flex-end;
          }

          .tooltip-btn {
            font-size: 10px;
            padding: 5px 8px;
          }

          .details-aside {
            height: 100vh;
          }

          .aside-header {
            padding: 16px;
          }

          .aside-header h4 {
            font-size: 16px;
          }

          .aside-content {
            padding: 12px;
          }

          .compound-chart {
            padding: 10px;
          }

          .compound-chart h5 {
            font-size: 12px;
          }

          .compound-round {
            padding: 12px;
            margin-bottom: 12px;
          }

          .round-header {
            font-size: 14px;
            margin-bottom: 10px;
          }

          .round-details {
            font-size: 12px;
            gap: 6px;
          }

          .detail-item {
            padding: 4px 0;
          }

          .detail-label {
            font-size: 11px;
          }

          .detail-amount {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  )
}

export default ProfitCalculator 