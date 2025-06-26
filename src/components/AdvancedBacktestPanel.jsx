import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
         AreaChart, Area, BarChart, Bar, ScatterChart, Scatter } from 'recharts';
import { 
  Play, Pause, Settings, TrendingUp, TrendingDown, Target, 
  BarChart3, AlertTriangle, DollarSign, Percent, Clock, 
  Filter, Download, Eye, EyeOff
} from 'lucide-react';
import { runAdvancedBacktest, ADVANCED_STRATEGIES } from '../utils/advancedBacktest';

const AdvancedBacktestPanel = ({ candleData, symbol, onSignalUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    strategy: {
      type: 'MACD_RSI',
      parameters: {
        rsiPeriod: 14,
        rsiOverbought: 70,
        rsiOversold: 30
      }
    },
    initialCapital: 10000000,
    commission: 0.001,
    slippage: 0.0005,
    stopLoss: 0.05,
    takeProfit: 0.10,
    maxPositionSize: 1.0,
    riskPerTrade: 0.02
  });
  
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showSignals, setShowSignals] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // 백테스트 실행
  const runBacktest = async () => {
    if (!candleData || candleData.length < 100) {
      alert('충분한 데이터가 필요합니다 (최소 100개 캔들)');
      return;
    }

    setIsRunning(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const backtestResults = runAdvancedBacktest(candleData, config);
      setResults(backtestResults);
      
      if (onSignalUpdate && backtestResults.signals) {
        onSignalUpdate(backtestResults.signals);
      }
    } catch (error) {
      console.error('백테스트 실행 오류:', error);
      alert('백테스트 실행 중 오류가 발생했습니다.');
    } finally {
      setIsRunning(false);
    }
  };

  // 전략 변경 핸들러
  const handleStrategyChange = (strategyType) => {
    const strategy = ADVANCED_STRATEGIES[strategyType];
    const defaultParams = {};
    
    Object.entries(strategy.parameters).forEach(([key, param]) => {
      defaultParams[key] = param.default;
    });
    
    setConfig(prev => ({
      ...prev,
      strategy: {
        type: strategyType,
        parameters: defaultParams
      }
    }));
  };

  // 파라미터 변경 핸들러
  const handleParameterChange = (paramName, value) => {
    setConfig(prev => ({
      ...prev,
      strategy: {
        ...prev.strategy,
        parameters: {
          ...prev.strategy.parameters,
          [paramName]: value
        }
      }
    }));
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gray-800/50 border border-gray-600 hover:bg-gray-700/50 hover:border-blue-500/30 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-300 backdrop-blur-sm hover:shadow-blue-500/10"
        >
          <BarChart3 className="h-5 w-5" />
          백테스트
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">고급 백테스트 시스템</h2>
            <span className="text-sm text-gray-400">({symbol})</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white p-2"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* 설정 패널 */}
          <div className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto">
            <div className="p-4 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">전략 설정</h3>
                
                {/* 전략 선택 */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">매매 전략</label>
                  <select
                    value={config.strategy.type}
                    onChange={(e) => handleStrategyChange(e.target.value)}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm"
                  >
                    {Object.entries(ADVANCED_STRATEGIES).map(([key, strategy]) => (
                      <option key={key} value={key}>{strategy.name}</option>
                    ))}
                  </select>
                </div>

                {/* 전략 파라미터 */}
                <div className="space-y-3 mt-4">
                  {Object.entries(ADVANCED_STRATEGIES[config.strategy.type]?.parameters || {}).map(([key, param]) => (
                    <div key={key}>
                      <label className="text-sm text-gray-300 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </label>
                      <input
                        type="number"
                        value={config.strategy.parameters[key] || param.default}
                        onChange={(e) => handleParameterChange(key, parseFloat(e.target.value))}
                        min={param.min}
                        max={param.max}
                        step={key.includes('Period') ? 1 : 0.1}
                        className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm mt-1"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 리스크 관리 */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">리스크 관리</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-300">초기 자본 (원)</label>
                    <input
                      type="number"
                      value={config.initialCapital}
                      onChange={(e) => setConfig(prev => ({ ...prev, initialCapital: parseInt(e.target.value) }))}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-300">스톱로스 (%)</label>
                    <input
                      type="number"
                      value={config.stopLoss * 100}
                      onChange={(e) => setConfig(prev => ({ ...prev, stopLoss: parseFloat(e.target.value) / 100 }))}
                      min={0}
                      max={20}
                      step={0.5}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-300">테이크프로핏 (%)</label>
                    <input
                      type="number"
                      value={config.takeProfit * 100}
                      onChange={(e) => setConfig(prev => ({ ...prev, takeProfit: parseFloat(e.target.value) / 100 }))}
                      min={0}
                      max={50}
                      step={0.5}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* 실행 버튼 */}
              <button
                onClick={runBacktest}
                disabled={isRunning}
                className="w-full bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-400/50 hover:text-blue-300 hover:shadow-blue-500/20 disabled:bg-gray-800/30 disabled:text-gray-500 disabled:border-gray-700 text-blue-400 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 backdrop-blur-sm shadow-lg"
              >
                {isRunning ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    분석 중...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    백테스트 실행
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 결과 영역 */}
          <div className="flex-1 p-6">
            {!results ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <BarChart3 className="h-16 w-16 mb-4" />
                <h3 className="text-xl font-semibold mb-2">백테스트를 시작하세요</h3>
                <p className="text-center">
                  왼쪽 설정을 조정하고 백테스트를 실행하여<br />
                  전략의 성과를 확인해보세요.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 성과 지표 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">총 수익률</p>
                        <p className={`text-2xl font-bold ${results.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {results.totalReturn.toFixed(2)}%
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 opacity-50 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">승률</p>
                        <p className={`text-2xl font-bold ${results.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                          {results.winRate.toFixed(1)}%
                        </p>
                      </div>
                      <Target className="h-8 w-8 opacity-50 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">최대 손실폭</p>
                        <p className="text-2xl font-bold text-red-400">
                          {results.maxDrawdown.toFixed(2)}%
                        </p>
                      </div>
                      <AlertTriangle className="h-8 w-8 opacity-50 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">총 거래 횟수</p>
                        <p className="text-2xl font-bold text-white">
                          {results.totalTrades}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 opacity-50 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* 포트폴리오 차트 */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">포트폴리오 성과</h3>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <AreaChart data={results.portfolio}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                        <XAxis dataKey="date" tick={{fill: '#94a3b8', fontSize: 12}} />
                        <YAxis 
                          tickFormatter={(value) => `₩${(value / 1000000).toFixed(1)}M`} 
                          tick={{fill: '#94a3b8', fontSize: 12}} 
                        />
                        <Tooltip 
                          formatter={(value) => [`₩${value.toLocaleString()}`, '포트폴리오 가치']}
                          contentStyle={{
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            color: '#ffffff'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#06b6d4" 
                          fill="rgba(6, 182, 212, 0.2)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 매매 내역 */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">최근 매매 내역</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left p-2 text-gray-300">날짜</th>
                          <th className="text-left p-2 text-gray-300">유형</th>
                          <th className="text-right p-2 text-gray-300">가격</th>
                          <th className="text-right p-2 text-gray-300">수량</th>
                          <th className="text-right p-2 text-gray-300">수익률</th>
                          <th className="text-left p-2 text-gray-300">사유</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.trades.slice(-10).map((trade, index) => (
                          <tr key={index} className="border-b border-gray-700/50">
                            <td className="p-2 text-gray-300">{trade.date}</td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                trade.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                                {trade.type === 'BUY' ? '매수' : '매도'}
                              </span>
                            </td>
                            <td className="p-2 text-right text-gray-300">₩{trade.price.toLocaleString()}</td>
                            <td className="p-2 text-right text-gray-300">{trade.shares?.toLocaleString()}</td>
                            <td className="p-2 text-right">
                              {trade.profitPercent !== undefined && (
                                <span className={trade.profitPercent >= 0 ? 'text-green-400' : 'text-red-400'}>
                                  {trade.profitPercent.toFixed(2)}%
                                </span>
                              )}
                            </td>
                            <td className="p-2 text-gray-400 text-xs">{trade.reason}</td>
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
    </div>
  );
};

export default AdvancedBacktestPanel; 