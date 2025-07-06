import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-disclaimer">
          <p>
            빗뷰(bitview.kr)는 사이트 내 모든 암호화폐 가격 및 투자 관련 정보에 대하여 어떠한 책임을 부담하지 않습니다.
          </p>
          <p>
            디지털 자산 투자는 전적으로 스스로의 책임이므로 이에 유의하시기 바랍니다.
          </p>
        </div>
        
        <div className="footer-links">
          <Link to="/privacy">개인정보처리방침</Link>
          <span className="separator">|</span>
          <Link to="/terms">서비스 이용약관</Link>
        </div>
        
        <div className="footer-copyright">
          <p>&copy; 2024 BitView. All rights reserved.</p>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: transparent;
          padding: 2rem 0;
          margin-top: auto;
          position: relative;
        }

        .footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: #1a1a1a;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .footer-disclaimer {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .footer-disclaimer p {
          color: var(--text-secondary);
          font-size: 0.75rem;
          line-height: 1.6;
          margin-bottom: 0.5rem;
        }

        .footer-links {
          text-align: center;
          margin-bottom: 1rem;
        }

        .footer-links a {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.75rem;
          transition: color 0.3s ease;
        }

        .footer-links a:hover {
          color: #3b82f6;
        }

        .footer-links .separator {
          color: var(--text-secondary);
          margin: 0 0.5rem;
          font-size: 0.75rem;
        }

        .footer-copyright {
          text-align: center;
        }

        .footer-copyright p {
          color: var(--text-secondary);
          font-size: 0.75rem;
        }

        @media (max-width: 768px) {
          .footer {
            padding: 1.5rem 0;
          }

          .footer-disclaimer p {
            font-size: 0.7rem;
          }

          .footer-links a,
          .footer-links .separator {
            font-size: 0.7rem;
          }

          .footer-copyright p {
            font-size: 0.7rem;
          }
        }
      `}</style>
    </footer>
  )
}

export default Footer 