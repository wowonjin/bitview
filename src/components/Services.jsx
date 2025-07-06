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

  const sectionStyle = {
    padding: '80px 0',
    background: 'transparent',
    minHeight: '100vh'
  }

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  }

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '64px'
  }

  const titleStyle = {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '16px'
  }

  const subtitleStyle = {
    fontSize: '1.25rem',
    color: '#a0a0a0',
    maxWidth: '600px',
    margin: '0 auto'
  }

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginBottom: '64px'
  }

  const serviceCardStyle = {
    position: 'relative',
    padding: '24px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(128, 128, 128, 0.01))',
    border: '1px solid #374151',
    backdropFilter: 'blur(20px)',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'all 0.4s ease',
    cursor: 'pointer',
    display: 'block',
    overflow: 'hidden',
    boxShadow: `
      0 4px 12px rgba(0, 0, 0, 0.15),
      0 0 20px rgba(59, 130, 246, 0.15),
      0 0 40px rgba(59, 130, 246, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.1)
    `
  }

  const iconContainerStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    color: 'white',
    marginBottom: '16px',
    transition: 'transform 0.3s ease'
  }

  const serviceTitle = {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '12px'
  }

  const serviceDescription = {
    fontSize: '0.875rem',
    color: '#a0a0a0',
    marginBottom: '16px',
    lineHeight: '1.6'
  }

  const bannerStyle = {
    textAlign: 'center'
  }

  const bannerBoxStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px 24px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    borderRadius: '16px',
    color: 'white',
    fontSize: '1.125rem',
    fontWeight: '600',
    marginBottom: '16px',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  }

  // 로그인 상태이고 프리미엄 회원이면 배너를 숨김
  const shouldShowBanner = !isAuthenticated || !isPremium

  return (
    <section style={sectionStyle}>
      <div style={containerStyle}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          style={headerStyle}
        >
          <motion.h2 
            variants={itemVariants}
            style={titleStyle}
          >
            빗뷰에서 제공하는 서비스
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            style={subtitleStyle}
          >
            암호화폐 투자에 필요한 모든 도구를 한 곳에서 만나보세요
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          style={gridStyle}
        >
          {services.map((service) => (
            <motion.div
              key={service.id}
              variants={itemVariants}
            >
              <Link 
                to={service.link} 
                style={serviceCardStyle}
              >
                {/* 글로우 효과 */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-1px',
                    left: '-1px',
                    right: '-1px',
                    bottom: '-1px',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(14, 165, 233, 0.1) 50%, rgba(6, 182, 212, 0.08) 100%)',
                    borderRadius: '21px',
                    zIndex: -1,
                    opacity: 0.6,
                    filter: 'blur(0.5px)'
                  }}
                />
                
                <div 
                  className="icon"
                  style={{
                    ...iconContainerStyle,
                    background: service.gradient
                  }}
                >
                  {service.icon}
                </div>
                
                <h3 style={serviceTitle}>
                  {service.title}
                </h3>
                
                <p style={serviceDescription}>
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
            style={bannerStyle}
          >
            <motion.div variants={itemVariants}>
              <Link 
                to="/premium" 
                style={bannerBoxStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                <Zap style={{ width: '24px', height: '24px', marginRight: '8px' }} />
                <span>무료 프리미엄으로 모든 기능을 이용하세요</span>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default Services 