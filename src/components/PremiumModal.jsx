import React from 'react'
import { X, Crown, Gift, ExternalLink, CheckCircle, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const PremiumModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  
  const binanceRef = "https://www.binance.com/activity/referral-entry/CPA?ref=CPA_00WJ27SBVM"
  const bybitRef = "https://www.bybit.com/invite?ref=71367"

  const benefits = [
    "AI 기반 고급 백테스팅 도구",
    "실시간 매매 신호 알림",
    "포트폴리오 자동 관리",
    "위험 관리 시스템",
    "전문가 분석 리포트",
    "24/7 프리미엄 지원"
  ]

  const exchangeBenefits = {
    binance: [
      "거래 수수료 20% 할인 (평생)",
      "100 USDT 신규 가입 보너스",
      "바이낸스 론치패드 우선 참여"
    ],
    bybit: [
      "거래 수수료 20% 할인 (60일)",
      "최대 30,050 USDT 보너스",
      "무료 합약 체험금 제공"
    ]
  }

  const handleExchangeClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleViewAllBenefits = () => {
    onClose()
    navigate('/premium')
  }

  if (!isOpen) return null

  return (
    <div className="premium-modal-overlay">
      <div className="premium-modal">
        <button className="close-button" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-header">
          <div className="premium-icon">
            <Crown size={32} />
          </div>
          <h2>💎 프리미엄 기능이 필요해요!</h2>
          <p>고급 백테스팅 기능은 프리미엄 멤버만 사용할 수 있습니다.</p>
        </div>

        <div className="unlock-section">
          <div className="unlock-header">
            <Star className="star-icon" />
            <h3>🔓 간단한 방법으로 즉시 해제하세요!</h3>
          </div>
          <p className="unlock-description">
            파트너 거래소에 가입만 하면 <strong>모든 프리미엄 기능이 자동으로 해제</strong>됩니다.
          </p>
        </div>

        <div className="benefits-preview">
                      <h4>💎 프리미엄 기능 미리보기</h4>
          <div className="benefits-grid">
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit-item">
                <CheckCircle className="check-icon" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="exchange-options">
          <h4>파트너 거래소 선택</h4>
          <div className="exchange-cards">
            <div className="exchange-card binance-card">
              <div className="exchange-info">
                <img src="/api/placeholder/40/40" alt="Binance" className="exchange-logo" />
                <div>
                  <h5>바이낸스</h5>
                  <p>세계 최대 거래소</p>
                </div>
              </div>
              <div className="quick-benefits">
                {exchangeBenefits.binance.map((benefit, index) => (
                  <div key={index} className="quick-benefit">
                    <CheckCircle size={14} />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
              <button 
                className="exchange-btn binance-btn"
                onClick={() => handleExchangeClick(binanceRef)}
              >
                <Gift size={16} />
                바이낸스 가입하기
                <ExternalLink size={14} />
              </button>
            </div>

            <div className="exchange-card bybit-card">
              <div className="exchange-info">
                <img src="/api/placeholder/40/40" alt="Bybit" className="exchange-logo" />
                <div>
                  <h5>바이비트</h5>
                  <p>선물거래 전문</p>
                </div>
              </div>
              <div className="quick-benefits">
                {exchangeBenefits.bybit.map((benefit, index) => (
                  <div key={index} className="quick-benefit">
                    <CheckCircle size={14} />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
              <button 
                className="exchange-btn bybit-btn"
                onClick={() => handleExchangeClick(bybitRef)}
              >
                <Gift size={16} />
                바이비트 가입하기
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="view-all-btn" onClick={handleViewAllBenefits}>
            모든 혜택 자세히 보기
          </button>
          <p className="auto-unlock-note">
            ⚡ 거래소 가입 후 자동으로 프리미엄 기능이 해제됩니다
          </p>
        </div>
      </div>

      <style jsx>{`
        .premium-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1rem;
        }

        .premium-modal {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          max-width: 700px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.3),
            0 0 60px rgba(59, 130, 246, 0.1);
        }

        .close-button {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .close-button:hover {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .modal-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .premium-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          color: white;
          box-shadow: 0 10px 20px rgba(251, 191, 36, 0.3);
        }

        .modal-header h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.5rem;
        }

        .modal-header p {
          color: #94a3b8;
          font-size: 1rem;
          line-height: 1.5;
        }

        .unlock-section {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          text-align: center;
        }

        .unlock-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .star-icon {
          color: #fbbf24;
          width: 20px;
          height: 20px;
        }

        .unlock-header h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #10b981;
          margin: 0;
        }

        .unlock-description {
          color: #d1d5db;
          font-size: 0.95rem;
          line-height: 1.5;
          margin: 0;
        }

        .unlock-description strong {
          color: #10b981;
          font-weight: 600;
        }

        .benefits-preview {
          margin-bottom: 2rem;
        }

        .benefits-preview h4 {
          font-size: 1.125rem;
          font-weight: 600;
          color: white;
          margin-bottom: 1rem;
          text-align: center;
        }

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 0.75rem;
        }

        .benefit-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .check-icon {
          color: #10b981;
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }

        .benefit-item span {
          color: #d1d5db;
          font-size: 0.875rem;
        }

        .exchange-options h4 {
          font-size: 1.125rem;
          font-weight: 600;
          color: white;
          margin-bottom: 1rem;
          text-align: center;
        }

        .exchange-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .exchange-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .exchange-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
        }

        .exchange-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .exchange-logo {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          background: #fbbf24;
        }

        .exchange-info h5 {
          font-size: 1rem;
          font-weight: 600;
          color: white;
          margin: 0;
        }

        .exchange-info p {
          font-size: 0.75rem;
          color: #94a3b8;
          margin: 0;
        }

        .quick-benefits {
          margin-bottom: 1rem;
        }

        .quick-benefit {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .quick-benefit svg {
          color: #10b981;
          flex-shrink: 0;
        }

        .quick-benefit span {
          font-size: 0.8rem;
          color: #d1d5db;
        }

        .exchange-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .binance-btn {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          color: white;
        }

        .binance-btn:hover {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          transform: translateY(-1px);
          box-shadow: 0 5px 15px rgba(251, 191, 36, 0.3);
        }

        .bybit-btn {
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white;
        }

        .bybit-btn:hover {
          background: linear-gradient(135deg, #ea580c, #dc2626);
          transform: translateY(-1px);
          box-shadow: 0 5px 15px rgba(249, 115, 22, 0.3);
        }

        .modal-footer {
          text-align: center;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 1.5rem;
        }

        .view-all-btn {
          background: transparent;
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #60a5fa;
          padding: 0.75rem 2rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 1rem;
        }

        .view-all-btn:hover {
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.5);
          color: #93c5fd;
        }

        .auto-unlock-note {
          font-size: 0.8rem;
          color: #94a3b8;
          margin: 0;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .premium-modal {
            margin: 1rem;
            padding: 1.5rem;
          }

          .benefits-grid {
            grid-template-columns: 1fr;
          }

          .exchange-cards {
            grid-template-columns: 1fr;
          }

          .modal-header h2 {
            font-size: 1.5rem;
          }

          .premium-icon {
            width: 60px;
            height: 60px;
          }

          .premium-icon svg {
            width: 24px;
            height: 24px;
          }
        }
      `}</style>
    </div>
  )
}

export default PremiumModal 