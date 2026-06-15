import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import logoWhite from '../assets/white.png'
import logoDark from '../assets/dark.png'

const Footer = () => {
  const year = new Date().getFullYear()
  const { theme, toggleTheme } = useTheme()
  const logoImage = theme === 'light' ? logoWhite : logoDark

  return (
    <footer className="footer">
      <div className="footer-inner">
        <Link to="/" className="footer-logo">
          <img src={logoImage} alt="BitView" />
        </Link>

        <nav className="footer-links" aria-label="법적 고지">
          <Link to="/privacy">개인정보처리방침</Link>
          <span className="footer-dot" aria-hidden="true">
            ·
          </span>
          <Link to="/terms">서비스 이용약관</Link>
          <span className="footer-dot" aria-hidden="true">
            ·
          </span>
          <button
            type="button"
            className="footer-theme-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            {theme === 'dark' ? '라이트 모드' : '다크 모드'}
          </button>
        </nav>

        <div className="footer-disclaimer">
          <p>
            빗뷰(bitview.kr)는 사이트 내 모든 암호화폐 가격 및 투자 관련 정보에 대하여
            어떠한 책임을 부담하지 않습니다.
          </p>
          <p>디지털 자산 투자는 전적으로 스스로의 책임이므로 이에 유의하시기 바랍니다.</p>
        </div>

        <p className="footer-copy">&copy; {year} BitView</p>
      </div>

      <style jsx>{`
        .footer {
          margin-top: auto;
          padding: 2rem 0 2.5rem;
          background: var(--bg-primary);
          border-top: 1px solid rgba(128, 128, 128, 0.2);
        }

        html[data-theme='light'] .footer {
          border-top-color: #d1d6db;
        }

        .footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          text-align: left;
        }

        .footer-logo {
          display: inline-block;
          margin-bottom: 1rem;
          text-decoration: none;
        }

        .footer-logo img {
          display: block;
          height: 1.25rem;
          width: auto;
          max-width: 7rem;
          object-fit: contain;
        }

        .footer-links {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.35rem 0.5rem;
          margin-bottom: 1.25rem;
        }

        .footer-links a {
          font-size: 0.8125rem;
          color: var(--text-secondary);
          text-decoration: none;
        }

        .footer-links a:hover {
          text-decoration: underline;
        }

        .footer-dot {
          font-size: 0.8125rem;
          color: var(--text-muted);
          user-select: none;
        }

        .footer-theme-btn {
          padding: 0;
          border: none;
          background: none;
          font-size: 0.8125rem;
          font-family: inherit;
          color: var(--text-secondary);
          cursor: pointer;
          text-decoration: none;
        }

        .footer-theme-btn:hover {
          text-decoration: underline;
        }

        .footer-disclaimer p {
          font-size: 0.75rem;
          line-height: 1.7;
          color: var(--text-muted);
          max-width: 42rem;
        }

        .footer-disclaimer p + p {
          margin-top: 0.35rem;
        }

        .footer-copy {
          margin-top: 1.25rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        @media (max-width: 768px) {
          .footer-inner {
            padding: 0 1rem;
          }

          .footer {
            padding: 1.5rem 0 2rem;
          }

          .footer-disclaimer p {
            font-size: 0.6875rem;
            line-height: 1.65;
          }

          .footer-links a,
          .footer-dot,
          .footer-theme-btn {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </footer>
  )
}

export default Footer
