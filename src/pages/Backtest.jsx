import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { runBacktest, generateMockData } from '../utils/backtest';
import { runAdvancedBacktest, ADVANCED_STRATEGIES } from '../utils/advancedBacktest';
import { TrendingUp, TrendingDown, DollarSign, Target, Calendar, Settings, BarChart3, AlertTriangle } from 'lucide-react';
import '../components/BacktestStyles.css';

const Backtest = () => {
  const [config, setConfig] = useState({
    symbol: 'BTC/KRW',
    startDate: '2023-01-01',
    endDate: '2024-01-01',
    initialCapital: 10000000,
    strategy: {
      type: 'MACD_RSI',
      parameters: {
        rsiPeriod: 14,
        rsiOverbought: 70,
        rsiOversold: 30
      }
    },
    commission: 0.001,
    slippage: 0.0005,
    stopLoss: 0.05,
    takeProfit: 0.10,
    maxPositionSize: 1.0,
    riskPerTrade: 0.02
  });

  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);

  // 백테스트 실행
  const handleRunBacktest = async () => {
    setIsRunning(true);
    try {
      // 실제로는 API에서 데이터를 가져와야 하지만, 지금은 모의 데이터 사용
      const mockData = generateMockData(365);
      const backtestResults = runAdvancedBacktest(mockData, config);
      setResults(backtestResults);
    } catch (error) {
      console.error('백테스트 실행 중 오류:', error);
    } finally {
      setIsRunning(false);
    }
  };

  // 차트 데이터 준비
  const chartData = useMemo(() => {
    if (!results) return [];
    return results.portfolio.map(item => ({
      date: item.date,
      포트폴리오가치: item.value,
      가격: item.price
    }));
  }, [results]);

  // 통계 카드 컴포넌트
  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }) => {
    const isPositive = color === 'green';
    const isNegative = color === 'red';

    return (
      <div className={`backtest-stat-card ${isPositive ? 'positive' : ''} ${isNegative ? 'negative' : ''}`}>
        <div className="backtest-stat-card-header">
          <div className="backtest-stat-title">{title}</div>
          <Icon className="backtest-stat-icon h-8 w-8" />
        </div>
        <div className="backtest-stat-value">{value}</div>
        {subtitle && <div className="backtest-stat-subtitle">{subtitle}</div>}
      </div>
    );
  };

  return (
    <div className="backtest-container">


      <div className="backtest-grid">
          {/* 설정 패널 */}
          <div>
            <div className="backtest-config-panel">
              <div className="backtest-config-header">
                <Settings className="h-6 w-6" />
                <h2 className="backtest-config-title">백테스트 설정</h2>
              </div>

              <div className="space-y-4">
                {/* 종목 선택 */}
                <div className="backtest-form-group">
                  <label className="backtest-form-label">
                    종목
                  </label>
                  <select
                    value={config.symbol}
                    onChange={(e) => setConfig(prev => ({ ...prev, symbol: e.target.value }))}
                    className="backtest-form-select"
                  >
                    <option value="BTC/KRW">비트코인 (BTC/KRW)</option>
                    <option value="ETH/KRW">이더리움 (ETH/KRW)</option>
                    <option value="XRP/KRW">리플 (XRP/KRW)</option>
                  </select>
                </div>

                {/* 기간 설정 */}
                <div className="backtest-form-group">
                  <label className="backtest-form-label">
                    시작일
                  </label>
                  <input
                    type="date"
                    value={config.startDate}
                    onChange={(e) => setConfig(prev => ({ ...prev, startDate: e.target.value }))}
                    className="backtest-form-input"
                  />
                </div>

                <div className="backtest-form-group">
                  <label className="backtest-form-label">
                    종료일
                  </label>
                  <input
                    type="date"
                    value={config.endDate}
                    onChange={(e) => setConfig(prev => ({ ...prev, endDate: e.target.value }))}
                    className="backtest-form-input"
                  />
                </div>

                {/* 초기 자본 */}
                <div className="backtest-form-group">
                  <label className="backtest-form-label">
                    초기 자본 (원)
                  </label>
                  <input
                    type="number"
                    value={config.initialCapital}
                    onChange={(e) => setConfig(prev => ({ ...prev, initialCapital: parseInt(e.target.value) }))}
                    className="backtest-form-input"
                    placeholder="10,000,000"
                  />
                </div>

                {/* 전략 선택 */}
                <div className="backtest-form-group">
                  <label className="backtest-form-label">
                    매매 전략
                  </label>
                  <select
                    value={config.strategy.type}
                    onChange={(e) => {
                      const strategy = ADVANCED_STRATEGIES[e.target.value];
                      const defaultParams = {};
                      Object.entries(strategy.parameters).forEach(([key, param]) => {
                        defaultParams[key] = param.default;
                      });
                      setConfig(prev => ({ 
                        ...prev, 
                        strategy: { 
                          type: e.target.value,
                          parameters: defaultParams
                        }
                      }));
                    }}
                    className="backtest-form-select"
                  >
                    {Object.entries(ADVANCED_STRATEGIES).map(([key, strategy]) => (
                      <option key={key} value={key}>{strategy.name}</option>
                    ))}
                  </select>
                </div>

                {/* 전략 파라미터 설정 */}
                {Object.entries(ADVANCED_STRATEGIES[config.strategy.type]?.parameters || {}).map(([key, param]) => (
                  <div key={key} className="backtest-form-group">
                    <label className="backtest-form-label" style={{ textTransform: 'capitalize' }}>
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </label>
                    <input
                      type="number"
                      value={config.strategy.parameters[key] || param.default}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        strategy: {
                          ...prev.strategy,
                          parameters: {
                            ...prev.strategy.parameters,
                            [key]: parseFloat(e.target.value)
                          }
                        }
                      }))}
                      min={param.min}
                      max={param.max}
                      step={key.includes('Period') ? 1 : 0.1}
                      className="backtest-form-input"
                    />
                  </div>
                ))}

                {/* 백테스트 실행 버튼 */}
                <button
                  onClick={handleRunBacktest}
                  disabled={isRunning}
                  className="backtest-run-button"
                >
                  {isRunning ? (
                    <div className="flex items-center justify-center">
                      <div className="backtest-loading-spinner"></div>
                      분석 중...
                    </div>
                  ) : (
                    '백테스트 실행'
                  )}
                </button>
              </div>
            </div>

            {/* 전략 설명 */}
            <div className="backtest-strategy-info">
              <h3>전략 설명</h3>
              <div>
                <p>{ADVANCED_STRATEGIES[config.strategy.type]?.description}</p>
              </div>
            </div>

            {/* 리스크 관리 설정 */}
            <div className="backtest-risk-management">
              <h3>리스크 관리</h3>
              <div className="space-y-3">
                <div className="backtest-form-group">
                  <label className="backtest-form-label">
                    스톱로스 (%)
                  </label>
                  <input
                    type="number"
                    value={config.stopLoss * 100}
                    onChange={(e) => setConfig(prev => ({ ...prev, stopLoss: parseFloat(e.target.value) / 100 }))}
                    min={0}
                    max={20}
                    step={0.5}
                    className="backtest-form-input"
                  />
                </div>
                
                <div className="backtest-form-group">
                  <label className="backtest-form-label">
                    테이크프로핏 (%)
                  </label>
                  <input
                    type="number"
                    value={config.takeProfit * 100}
                    onChange={(e) => setConfig(prev => ({ ...prev, takeProfit: parseFloat(e.target.value) / 100 }))}
                    min={0}
                    max={50}
                    step={0.5}
                    className="backtest-form-input"
                  />
                </div>
                
                <div className="backtest-form-group">
                  <label className="backtest-form-label">
                    거래당 위험비율 (%)
                  </label>
                  <input
                    type="number"
                    value={config.riskPerTrade * 100}
                    onChange={(e) => setConfig(prev => ({ ...prev, riskPerTrade: parseFloat(e.target.value) / 100 }))}
                    min={0.1}
                    max={10}
                    step={0.1}
                    className="backtest-form-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 결과 영역 */}
          <div className="results-area">
            {!results ? (
              <div className="empty-state">
                <BarChart3 className="h-16 w-16" />
                <h3>백테스트를 시작해보세요</h3>
                <p>
                  왼쪽 설정 패널에서 조건을 설정하고 백테스트를 실행하면 결과를 확인할 수 있습니다.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 성과 요약 */}
                <div className="backtest-stats-grid">
                  <StatCard
                    title="총 수익률"
                    value={`${results.totalReturn.toFixed(2)}%`}
                    subtitle={`${results.finalValue.toLocaleString()}원`}
                    icon={results.totalReturn >= 0 ? TrendingUp : TrendingDown}
                    color={results.totalReturn >= 0 ? 'green' : 'red'}
                  />
                  <StatCard
                    title="최대 손실폭"
                    value={`${results.maxDrawdown.toFixed(2)}%`}
                    subtitle="MDD"
                    icon={AlertTriangle}
                    color="red"
                  />
                  <StatCard
                    title="승률"
                    value={`${results.winRate.toFixed(1)}%`}
                    subtitle={`${results.winningTrades}승 ${results.losingTrades}패`}
                    icon={Target}
                    color={results.winRate >= 50 ? 'green' : 'red'}
                  />
                  <StatCard
                    title="샤프 비율"
                    value={results.sharpeRatio?.toFixed(2) || 'N/A'}
                    subtitle="위험 대비 수익"
                    icon={BarChart3}
                    color={results.sharpeRatio > 1 ? 'green' : 'blue'}
                  />
                  <StatCard
                    title="수익 팩터"
                    value={results.profitFactor?.toFixed(2) || 'N/A'}
                    subtitle="총수익/총손실"
                    icon={DollarSign}
                    color={results.profitFactor > 1.5 ? 'green' : 'blue'}
                  />
                  <StatCard
                    title="총 거래 횟수"
                    value={results.totalTrades}
                    subtitle="매매 건수"
                    icon={Calendar}
                    color="blue"
                  />
                </div>

                {/* 포트폴리오 가치 차트 */}
                <div className="backtest-chart-container">
                  <h3 className="backtest-chart-title">포트폴리오 가치 변화</h3>
                  <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => format(new Date(value), 'MM/dd', { locale: ko })}
                          tick={{fill: '#94a3b8', fontSize: 12}}
                          axisLine={{stroke: 'rgba(255, 255, 255, 0.2)'}}
                        />
                        <YAxis 
                          tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                          tick={{fill: '#94a3b8', fontSize: 12}}
                          axisLine={{stroke: 'rgba(255, 255, 255, 0.2)'}}
                        />
                        <Tooltip 
                          formatter={(value, name) => [
                            `${value.toLocaleString()}원`, 
                            name === '포트폴리오가치' ? '포트폴리오 가치' : '자산 가격'
                          ]}
                          labelFormatter={(value) => format(new Date(value), 'yyyy년 MM월 dd일', { locale: ko })}
                          contentStyle={{
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            color: '#ffffff'
                          }}
                        />
                        <Legend 
                          wrapperStyle={{color: '#e2e8f0'}}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="포트폴리오가치" 
                          stroke="#06b6d4" 
                          fill="url(#portfolioGradient)" 
                          fillOpacity={1}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="가격" 
                          stroke="#f59e0b" 
                          strokeWidth={2}
                          dot={false}
                        />
                        <defs>
                          <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 거래 내역 */}
                <div className="backtest-trades-table">
                  <div className="backtest-table-header">
                    <h3 className="backtest-table-title">거래 내역</h3>
                  </div>
                  <div className="backtest-table-wrapper">
                    <table className="backtest-table">
                      <thead>
                        <tr>
                          <th>날짜</th>
                          <th>유형</th>
                          <th>가격</th>
                          <th>수량</th>
                          <th>금액</th>
                          <th>수익률</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.trades.slice(-10).map((trade, index) => (
                          <tr key={index}>
                            <td>
                              {format(new Date(trade.date), 'yyyy-MM-dd', { locale: ko })}
                            </td>
                            <td>
                              <span className={`backtest-trade-badge ${trade.type === 'BUY' ? 'buy' : 'sell'}`}>
                                {trade.type === 'BUY' ? '매수' : '매도'}
                              </span>
                            </td>
                            <td>
                              {trade.price.toLocaleString()}원
                            </td>
                            <td>
                              {trade.shares.toLocaleString()}
                            </td>
                            <td>
                              {trade.value.toLocaleString()}원
                            </td>
                            <td>
                              {trade.profitPercent ? (
                                <span className={trade.profitPercent >= 0 ? 'backtest-profit-positive' : 'backtest-profit-negative'}>
                                  {trade.profitPercent.toFixed(2)}%
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default Backtest; 