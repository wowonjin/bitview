import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useState, useEffect } from 'react'

const CryptoCards = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  const cryptoData = [
    {
      id: 1,
      name: 'Bitcoin',
      symbol: 'BTC',
      price: '$65,432.18',
      change: '+2.34%',
      isPositive: true,
      icon: '₿',
      color: '#f7931a',
      marketCap: '$1.2T',
      volume: '$28.5B'
    },
    {
      id: 2,
      name: 'Ethereum',
      symbol: 'ETH',
      price: '$3,421.67',
      change: '+1.87%',
      isPositive: true,
      icon: 'Ξ',
      color: '#627eea',
      marketCap: '$410.8B',
      volume: '$15.2B'
    },
    {
      id: 3,
      name: 'Cardano',
      symbol: 'ADA',
      price: '$0.8745',
      change: '-0.45%',
      isPositive: false,
      icon: '₳',
      color: '#0033ad',
      marketCap: '$29.8B',
      volume: '$1.2B'
    },
    {
      id: 4,
      name: 'Solana',
      symbol: 'SOL',
      price: '$187.23',
      change: '+5.67%',
      isPositive: true,
      icon: '◎',
      color: '#9945ff',
      marketCap: '$88.5B',
      volume: '$3.8B'
    },
    {
      id: 5,
      name: 'Polkadot',
      symbol: 'DOT',
      price: '$12.45',
      change: '-1.23%',
      isPositive: false,
      icon: '●',
      color: '#e6007a',
      marketCap: '$17.2B',
      volume: '$890M'
    },
    {
      id: 6,
      name: 'Chainlink',
      symbol: 'LINK',
      price: '$28.97',
      change: '+3.45%',
      isPositive: true,
      icon: '⬡',
      color: '#375bd2',
      marketCap: '$18.5B',
      volume: '$1.5B'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <section className="crypto-cards section">
      <div className="container">
        <div className="crypto-header">
          <motion.div
            initial={isMobile ? false : { opacity: 0, y: 20 }}
            whileInView={isMobile ? false : { opacity: 1, y: 0 }}
            transition={isMobile ? {} : { duration: 0.6 }}
          >
            <h2 className="section-title">실시간 시장 동향</h2>
            <p className="section-subtitle">
              주요 암호화폐의 실시간 가격과 시장 데이터를 확인하고
              <br />
              차트 분석과 백테스트로 투자 기회를 발견하세요.
            </p>
          </motion.div>
        </div>

        <motion.div
          className="crypto-grid"
          variants={isMobile ? {} : containerVariants}
          initial={isMobile ? false : "hidden"}
          whileInView={isMobile ? false : "visible"}
          viewport={isMobile ? {} : { once: true, amount: 0.3 }}
        >
          {cryptoData.map((crypto) => (
            <motion.div
              key={crypto.id}
              className="crypto-card card"
              variants={isMobile ? {} : cardVariants}
              whileHover={isMobile ? {} : { scale: 1.05 }}
              transition={isMobile ? {} : { type: "spring", stiffness: 300 }}
            >
              <div className="crypto-header-card">
                <div className="crypto-icon" style={{ color: crypto.color }}>
                  {crypto.icon}
                </div>
                <div className="crypto-info">
                  <h3 className="crypto-name">{crypto.name}</h3>
                  <span className="crypto-symbol">{crypto.symbol}</span>
                </div>
              </div>

              <div className="crypto-price">
                {crypto.price}
              </div>

              <div className={`crypto-change ${crypto.isPositive ? 'positive' : 'negative'}`}>
                {crypto.isPositive ? (
                  <TrendingUp size={16} />
                ) : (
                  <TrendingDown size={16} />
                )}
                {crypto.change}
              </div>

              <div className="crypto-details">
                <div className="detail-item">
                  <span className="detail-label">시가총액</span>
                  <span className="detail-value">{crypto.marketCap}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">거래량</span>
                  <span className="detail-value">{crypto.volume}</span>
                </div>
              </div>

              <div className="crypto-chart">
                <div className="chart-placeholder">
                  <div className="chart-line" style={{ 
                    background: crypto.isPositive ? 
                      'linear-gradient(90deg, transparent, #10b981, transparent)' : 
                      'linear-gradient(90deg, transparent, #ef4444, transparent)'
                  }}></div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <style jsx>{`
        .crypto-cards {
          background: var(--bg-primary);
        }

        .crypto-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .crypto-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .crypto-card {
          position: relative;
          overflow: hidden;
        }

        .crypto-header-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .crypto-icon {
          font-size: 2rem;
          font-weight: 700;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
          backdrop-filter: blur(10px);
        }

        .crypto-info {
          flex: 1;
        }

        .crypto-name {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .crypto-symbol {
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        .crypto-price {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .crypto-change {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
          width: fit-content;
        }

        .crypto-change.positive {
          color: #10b981;
          background: rgba(16, 185, 129, 0.1);
        }

        .crypto-change.negative {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .crypto-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .crypto-chart {
          height: 60px;
          position: relative;
        }

        .chart-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .chart-line {
          width: 80%;
          height: 2px;
          border-radius: 1px;
          opacity: 0.7;
        }

        @media (max-width: 768px) {
          .crypto-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .crypto-price {
            font-size: 1.5rem;
          }

          .crypto-details {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </section>
  )
}

export default CryptoCards 