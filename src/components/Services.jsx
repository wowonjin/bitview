import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { 
  TrendingUp, 
  BarChart3, 
  Calculator, 
  Coins, 
  Zap, 
  Crown,
  Activity,
  Target,
  DollarSign
} from 'lucide-react'

const Services = () => {
  const { isAuthenticated, isPremium } = useAuth()

  const services = [
    {
      id: 1,
      title: '실시간 코인 정보',
      description: '실시간 암호화폐 가격과 차트를 한눈에',
      icon: <Coins style={{ width: '24px', height: '24px' }} />,
      gradient: '#3b82f6',
      link: '/live-coins',
      bgColor: '#1a1a1a'
    },
    {
      id: 2,
      title: '차트 분석',
      description: '전문적인 차트 분석 도구로 시장 동향 파악',
      icon: <BarChart3 style={{ width: '24px', height: '24px' }} />,
      gradient: '#3b82f6',
      link: '/chart',
      bgColor: '#1a1a1a'
    },
    {
      id: 3,
      title: '고급 백테스트',
      description: '나만의 투자 전략을 시뮬레이션으로 검증',
      icon: <Activity style={{ width: '24px', height: '24px' }} />,
      gradient: '#3b82f6',
      link: '/advanced-backtest',
      bgColor: '#1a1a1a'
    },
    {
      id: 4,
      title: '수익 계산기',
      description: '투자 수익률과 손익을 간단하게 계산',
      icon: <Calculator style={{ width: '24px', height: '24px' }} />,
      gradient: '#3b82f6',
      link: '/profit-calculator',
      bgColor: '#1a1a1a'
    },
    {
      id: 5,
      title: '펀딩 계산기',
      description: '선물거래 펀딩비를 미리 계산해보세요',
      icon: <DollarSign style={{ width: '24px', height: '24px' }} />,
      gradient: '#3b82f6',
      link: '/funding-calculator',
      bgColor: '#1a1a1a'
    },
    {
      id: 6,
      title: '프리미엄 서비스',
      description: '더 많은 기능과 고급 분석 도구 이용',
      icon: <Crown style={{ width: '24px', height: '24px' }} />,
      gradient: '#3b82f6',
      link: '/premium',
      bgColor: '#1a1a1a'
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

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }



  // 로그인 상태이고 프리미엄 회원이면 배너를 숨김
  const shouldShowBanner = !isAuthenticated || !isPremium

  return (
    <>
      <section className="services-section">
        <div className="services-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="services-header"
          >
            <motion.h2 
              variants={itemVariants}
              className="services-title"
            >
              빗뷰에서 제공하는 서비스
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              className="services-subtitle"
            >
              암호화폐 투자에 필요한 모든 도구를 한 곳에서 만나보세요
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="services-grid"
          >
            {services.map((service) => (
              <motion.div
                key={service.id}
                variants={itemVariants}
              >
                <Link 
                  to={service.link} 
                  className="service-card"
                >
                  <div className="service-glow" />
                  
                  <div 
                    className="service-icon"
                    style={{ background: service.gradient }}
                  >
                    {service.icon}
                  </div>
                  
                  <h3 className="service-title">
                    {service.title}
                  </h3>
                  
                  <p className="service-description">
                    {service.description}
                  </p>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {shouldShowBanner && (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={containerVariants}
              className="services-banner"
            >
              <motion.div variants={itemVariants}>
                <Link 
                  to="/premium" 
                  className="banner-button"
                >
                  <Zap className="banner-icon" />
                  <span>무료 프리미엄으로 모든 기능을 이용하세요</span>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </div>
      </section>

      <style jsx>{`
        .services-section {
          padding: 80px 0;
          background: transparent;
          min-height: 100vh;
        }

        .services-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .services-header {
          text-align: center;
          margin-bottom: 64px;
        }

        .services-title {
          font-size: 2.5rem;
          font-weight: bold;
          color: #ffffff;
          margin-bottom: 16px;
        }

        .services-subtitle {
          font-size: 1.25rem;
          color: #a0a0a0;
          max-width: 600px;
          margin: 0 auto;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          margin-bottom: 64px;
        }

        .service-card {
          position: relative;
          padding: 24px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(128, 128, 128, 0.01));
          border: 1px solid #374151;
          backdrop-filter: blur(20px);
          text-decoration: none;
          color: inherit;
          transition: all 0.4s ease;
          cursor: pointer;
          display: block;
          overflow: hidden;
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.15),
            0 0 20px rgba(59, 130, 246, 0.15),
            0 0 40px rgba(59, 130, 246, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .service-card:hover {
          transform: translateY(-2px);
        }

        .service-glow {
          position: absolute;
          top: -1px;
          left: -1px;
          right: -1px;
          bottom: -1px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(14, 165, 233, 0.1) 50%, rgba(6, 182, 212, 0.08) 100%);
          border-radius: 21px;
          z-index: -1;
          opacity: 0.6;
          filter: blur(0.5px);
        }

        .service-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          color: white;
          margin-bottom: 16px;
          transition: transform 0.3s ease;
        }

        .service-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 12px;
        }

        .service-description {
          font-size: 0.875rem;
          color: #a0a0a0;
          margin-bottom: 16px;
          line-height: 1.6;
        }

        .services-banner {
          text-align: center;
        }

        .banner-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 16px 24px;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          border-radius: 16px;
          color: white;
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 16px;
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .banner-button:hover {
          transform: scale(1.05);
        }

        .banner-icon {
          width: 24px;
          height: 24px;
          margin-right: 8px;
        }

        @media (max-width: 768px) {
          .services-section {
            padding: 60px 0;
            min-height: auto;
          }

          .services-container {
            padding: 0 16px;
          }

          .services-header {
            margin-bottom: 48px;
          }

          .services-title {
            font-size: 2rem;
            margin-bottom: 12px;
          }

          .services-subtitle {
            font-size: 1.1rem;
          }

          .services-grid {
            grid-template-columns: 1fr;
            gap: 20px;
            margin-bottom: 48px;
          }

          .service-card {
            padding: 20px;
          }

          .service-icon {
            width: 40px;
            height: 40px;
          }

          .service-title {
            font-size: 1.1rem;
          }

          .service-description {
            font-size: 0.85rem;
          }

          .banner-button {
            padding: 14px 20px;
            font-size: 1rem;
          }
        }

        @media (max-width: 480px) {
          .services-section {
            padding: 40px 0;
          }

          .services-container {
            padding: 0 12px;
          }

          .services-header {
            margin-bottom: 32px;
          }

          .services-title {
            font-size: 1.8rem;
          }

          .services-subtitle {
            font-size: 1rem;
          }

          .services-grid {
            gap: 16px;
            margin-bottom: 32px;
          }

          .service-card {
            padding: 16px;
          }

          .service-icon {
            width: 36px;
            height: 36px;
          }

          .service-title {
            font-size: 1rem;
          }

          .service-description {
            font-size: 0.8rem;
          }

          .banner-button {
            padding: 12px 16px;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </>
  )
}

export default Services 