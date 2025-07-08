import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Target, 
  TrendingUp, 
  Shield, 
  Zap,
  Brain,
  Globe,
  Award
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

const Features = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  const mainFeatures = [
    {
      icon: BarChart3,
      title: '실시간 차트 분석',
      description: '전문가급 차트 도구로 시장 트렌드를 정확히 파악하세요. 필기 기능과 다중 차트로 더욱 스마트한 분석이 가능합니다.',
      color: 'var(--secondary-cyan)',
      link: '/chart',
      badge: '실시간'
    },
    {
      icon: Target,
      title: '정밀 백테스트',
      description: '과거 데이터로 투자 전략을 시뮬레이션하고 성과를 검증하세요. AI 기반 전략으로 수익률을 최적화할 수 있습니다.',
      color: 'var(--accent-orange)',
      link: '/advanced-backtest',
      badge: 'AI 추천'
    }
  ]

  const subFeatures = [
    {
      icon: Brain,
      title: 'AI 투자 분석',
      description: '머신러닝 기반 시장 예측',
      color: 'var(--primary-blue)'
    },
    {
      icon: Shield,
      title: '안전한 보안',
      description: '은행급 보안 시스템 적용',
      color: 'var(--secondary-cyan)'
    },
    {
      icon: Globe,
      title: '글로벌 데이터',
      description: '전 세계 거래소 실시간 연동',
      color: 'var(--accent-orange)'
    },
    {
      icon: Award,
      title: '전문가 인증',
      description: '금융 전문가들이 검증한 도구',
      color: 'var(--primary-blue)'
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <section className="features section">
      <div className="container">
        <div className="features-header">
          <motion.div
            initial={isMobile ? false : { opacity: 0, y: 20 }}
            whileInView={isMobile ? false : { opacity: 1, y: 0 }}
            transition={isMobile ? {} : { duration: 0.6 }}
          >
            <h2 className="section-title">투자 성공을 위한 필수 도구</h2>
            <p className="section-subtitle">
              차트 분석부터 백테스트까지, 전문가 수준의 투자 도구를 제공합니다.
              <br />
              데이터 기반 투자로 더 나은 수익을 만들어보세요.
            </p>
          </motion.div>
        </div>

        {/* 메인 기능 */}
        <motion.div
          className="main-features"
          variants={isMobile ? {} : containerVariants}
          initial={isMobile ? false : "hidden"}
          whileInView={isMobile ? false : "visible"}
          viewport={isMobile ? {} : { once: true, amount: 0.3 }}
        >
          {mainFeatures.map((feature, index) => (
            <motion.div
              key={index}
              className="main-feature-card"
              variants={isMobile ? {} : itemVariants}
              whileHover={isMobile ? {} : { scale: 1.02 }}
              transition={isMobile ? {} : { type: "spring", stiffness: 300 }}
            >
              <div className="feature-badge" style={{ color: feature.color }}>
                {feature.badge}
              </div>
              
              <div className="feature-icon-large" style={{ color: feature.color }}>
                <feature.icon size={48} />
              </div>
              
              <h3 className="main-feature-title">{feature.title}</h3>
              <p className="main-feature-description">{feature.description}</p>
              
              <Link to={feature.link} className="feature-button">
                <span>시작하기</span>
                <TrendingUp size={16} />
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* 서브 기능 */}
        <motion.div
          className="sub-features"
          variants={isMobile ? {} : containerVariants}
          initial={isMobile ? false : "hidden"}
          whileInView={isMobile ? false : "visible"}
          viewport={isMobile ? {} : { once: true, amount: 0.3 }}
        >
          {subFeatures.map((feature, index) => (
            <motion.div
              key={index}
              className="sub-feature-card"
              variants={isMobile ? {} : itemVariants}
              whileHover={isMobile ? {} : { scale: 1.05 }}
              transition={isMobile ? {} : { type: "spring", stiffness: 300 }}
            >
              <div className="sub-feature-icon" style={{ color: feature.color }}>
                <feature.icon size={24} />
              </div>
              <h4 className="sub-feature-title">{feature.title}</h4>
              <p className="sub-feature-description">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <style jsx>{`
        .features {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0d1525 100%);
          position: relative;
          overflow: hidden;
        }

        .features::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 70% 20%, rgba(245, 158, 11, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 30% 80%, rgba(6, 182, 212, 0.1) 0%, transparent 50%);
          z-index: 1;
        }

        .container {
          position: relative;
          z-index: 2;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .features-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .main-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
          margin-bottom: 4rem;
        }

        .main-feature-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 3rem;
          text-align: center;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(20px);
          transition: all 0.3s ease;
        }

        .main-feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
          transition: left 0.5s;
        }

        .main-feature-card:hover::before {
          left: 100%;
        }

        .main-feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .feature-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .feature-icon-large {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100px;
          height: 100px;
          margin: 0 auto 2rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .main-feature-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .main-feature-description {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 2rem;
          font-size: 1.1rem;
        }

        .feature-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, var(--secondary-cyan), var(--primary-blue));
          color: white;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .feature-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(6, 182, 212, 0.3);
        }

        .sub-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .sub-feature-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .sub-feature-card:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .sub-feature-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          margin: 0 auto 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sub-feature-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .sub-feature-description {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .main-features {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .main-feature-card {
            padding: 2rem;
          }

          .feature-icon-large {
            width: 80px;
            height: 80px;
            margin-bottom: 1.5rem;
          }

          .feature-icon-large svg {
            width: 36px;
            height: 36px;
          }

          .main-feature-title {
            font-size: 1.5rem;
          }

          .main-feature-description {
            font-size: 1rem;
          }

          .sub-features {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
          }

          .sub-feature-card {
            padding: 1.5rem;
          }

          .sub-feature-icon {
            width: 50px;
            height: 50px;
          }

          .sub-feature-icon svg {
            width: 20px;
            height: 20px;
          }
        }
      `}</style>
    </section>
  )
}

export default Features 