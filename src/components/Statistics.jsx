import { motion } from 'framer-motion'
import { Users, TrendingUp, Award, Globe } from 'lucide-react'

const Statistics = () => {
  const stats = [
    {
      icon: Users,
      number: '50,000+',
      label: '활성 사용자',
      description: '전 세계 투자자들이 신뢰하는 플랫폼',
      color: 'var(--secondary-cyan)'
    },
    {
      icon: TrendingUp,
      number: '₩1.2조',
      label: '누적 거래량',
      description: '안전하고 신뢰할 수 있는 거래 환경',
      color: 'var(--accent-orange)'
    },
    {
      icon: Award,
      number: '99.9%',
      label: '시스템 안정성',
      description: '24시간 중단 없는 서비스 제공',
      color: 'var(--primary-blue)'
    },
    {
      icon: Globe,
      number: '100+',
      label: '지원 거래소',
      description: '글로벌 거래소와 실시간 연동',
      color: 'var(--secondary-cyan)'
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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  }

  return (
    <section className="statistics section">
      <div className="container">
        <motion.div
          className="stats-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">믿을 수 있는 수치</h2>
          <p className="section-subtitle">
            수많은 투자자들이 선택한 BitView의 성과를 확인해보세요.
          </p>
        </motion.div>

        <motion.div
          className="stats-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="stat-card"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="stat-icon" style={{ color: stat.color }}>
                <stat.icon size={32} />
              </div>
              
              <motion.div
                className="stat-number"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                {stat.number}
              </motion.div>
              
              <h3 className="stat-label">{stat.label}</h3>
              <p className="stat-description">{stat.description}</p>
              
              <div className="stat-glow" style={{ background: `radial-gradient(circle, ${stat.color}20 0%, transparent 70%)` }}></div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <style jsx>{`
        .statistics {
          background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
          position: relative;
          overflow: hidden;
        }

        .statistics::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 80% 30%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 20% 70%, rgba(6, 182, 212, 0.15) 0%, transparent 50%);
          z-index: 1;
        }

        .container {
          position: relative;
          z-index: 2;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .stats-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 3rem 2rem;
          text-align: center;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(20px);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          margin: 0 auto 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stat-number {
          font-size: 3rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, var(--secondary-cyan), var(--accent-orange));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-label {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .stat-description {
          color: var(--text-secondary);
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .stat-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          transform: translate(-50%, -50%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .stat-card:hover .stat-glow {
          opacity: 1;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
          }

          .stat-card {
            padding: 2rem 1.5rem;
          }

          .stat-icon {
            width: 60px;
            height: 60px;
            margin-bottom: 1rem;
          }

          .stat-icon svg {
            width: 24px;
            height: 24px;
          }

          .stat-number {
            font-size: 2.5rem;
          }

          .stat-label {
            font-size: 1.1rem;
          }

          .stat-description {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </section>
  )
}

export default Statistics 