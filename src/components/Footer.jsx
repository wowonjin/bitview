import { motion } from 'framer-motion'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-copyright">
          <p>&copy; 2024 BitView. All rights reserved.</p>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: rgba(17, 17, 17, 0.65);
          backdrop-filter: blur(18px);
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
          background: rgba(255, 255, 255, 0.08);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .footer-copyright {
          text-align: center;
        }

        .footer-copyright p {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .footer {
            padding: 1.5rem 0;
          }
        }
      `}</style>
    </footer>
  )
}

export default Footer 