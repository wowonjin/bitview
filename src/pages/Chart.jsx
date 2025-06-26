import React, { useState } from 'react'

const Chart = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USDT')

  const cryptoSymbols = [
    'BTC/USDT',
    'ETH/USDT',
    'BNB/USDT',
    'ADA/USDT',
    'XRP/USDT',
    'SOL/USDT',
    'DOGE/USDT',
    'DOT/USDT'
  ]

  return (
    <div className="chart-page">
      <div className="chart-container">
        <div className="chart-header">
          <h1>차트 보기</h1>
          <div className="symbol-selector">
            <label htmlFor="symbol">암호화폐 선택:</label>
            <select 
              id="symbol"
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="symbol-select"
            >
              {cryptoSymbols.map(symbol => (
                <option key={symbol} value={symbol}>{symbol}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="chart-content">
          <div className="chart-placeholder">
            <div className="placeholder-content">
              <h2>{selectedSymbol} 차트</h2>
              <p>선택한 암호화폐의 실시간 차트가 여기에 표시됩니다.</p>
              <div className="chart-info">
                <div className="info-item">
                  <span className="label">현재가:</span>
                  <span className="value">$45,123.45</span>
                </div>
                <div className="info-item">
                  <span className="label">24시간 변동:</span>
                  <span className="value positive">+2.45%</span>
                </div>
                <div className="info-item">
                  <span className="label">24시간 거래량:</span>
                  <span className="value">$1,234,567,890</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .chart-page {
          min-height: 100vh;
          background: #111111;
          padding: 80px 20px 20px;
        }

        .chart-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .chart-header h1 {
          color: white;
          font-size: 2rem;
          font-weight: 700;
        }

        .symbol-selector {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .symbol-selector label {
          color: #cbd5e1;
          font-weight: 500;
        }

        .symbol-select {
          padding: 0.5rem 1rem;
          background: rgba(51, 65, 85, 0.3);
          border: 1px solid #475569;
          border-radius: 8px;
          color: white;
          font-size: 1rem;
          min-width: 150px;
        }

        .symbol-select:focus {
          outline: none;
          border-color: #6680fd;
        }

        .chart-content {
          background: rgba(51, 65, 85, 0.3);
          border: 1px solid #475569;
          border-radius: 12px;
          padding: 2rem;
          backdrop-filter: blur(10px);
        }

        .chart-placeholder {
          min-height: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px dashed #475569;
          border-radius: 8px;
        }

        .placeholder-content {
          text-align: center;
          color: white;
        }

        .placeholder-content h2 {
          color: #6680fd;
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }

        .placeholder-content p {
          color: #cbd5e1;
          margin-bottom: 2rem;
        }

        .chart-info {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: center;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          min-width: 300px;
          padding: 0.5rem 1rem;
          background: rgba(17, 17, 17, 0.5);
          border-radius: 6px;
        }

        .label {
          color: #cbd5e1;
          font-weight: 500;
        }

        .value {
          color: white;
          font-weight: 600;
        }

        .value.positive {
          color: #10b981;
        }

        @media (max-width: 768px) {
          .chart-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .chart-header h1 {
            font-size: 1.5rem;
          }

          .info-item {
            min-width: 250px;
          }
        }
      `}</style>
    </div>
  )
}

export default Chart 