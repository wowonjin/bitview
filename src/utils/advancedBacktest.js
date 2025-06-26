// 고급 백테스트 시스템 - TradingView 스타일
import { calculateSMA, calculateRSI } from './backtest';

// 볼린저 밴드 계산
export const calculateBollingerBands = (data, period = 20, multiplier = 2) => {
  const sma = calculateSMA(data, period);
  const bands = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      bands.push({ upper: null, middle: null, lower: null });
      continue;
    }
    
    const slice = data.slice(i - period + 1, i + 1);
    const mean = sma[i];
    const variance = slice.reduce((acc, val) => acc + Math.pow(val.close - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    
    bands.push({
      upper: mean + (stdDev * multiplier),
      middle: mean,
      lower: mean - (stdDev * multiplier)
    });
  }
  
  return bands;
};

// MACD 계산
export const calculateMACD = (data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);
  const macdLine = [];
  
  for (let i = 0; i < data.length; i++) {
    if (fastEMA[i] !== null && slowEMA[i] !== null) {
      macdLine.push(fastEMA[i] - slowEMA[i]);
    } else {
      macdLine.push(null);
    }
  }
  
  const signalLine = calculateEMAFromArray(macdLine, signalPeriod);
  const histogram = [];
  
  for (let i = 0; i < macdLine.length; i++) {
    if (macdLine[i] !== null && signalLine[i] !== null) {
      histogram.push(macdLine[i] - signalLine[i]);
    } else {
      histogram.push(null);
    }
  }
  
  return { macdLine, signalLine, histogram };
};

// EMA 계산
export const calculateEMA = (data, period) => {
  const multiplier = 2 / (period + 1);
  const ema = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      ema.push(data[i].close);
    } else {
      ema.push((data[i].close * multiplier) + (ema[i - 1] * (1 - multiplier)));
    }
  }
  
  return ema;
};

// 배열에서 EMA 계산
const calculateEMAFromArray = (array, period) => {
  const multiplier = 2 / (period + 1);
  const ema = [];
  
  for (let i = 0; i < array.length; i++) {
    if (array[i] === null) {
      ema.push(null);
      continue;
    }
    
    if (!ema.find(val => val !== null)) {
      ema.push(array[i]);
    } else {
      const lastEMA = ema[ema.length - 1] || array[i];
      ema.push((array[i] * multiplier) + (lastEMA * (1 - multiplier)));
    }
  }
  
  return ema;
};

// 스토캐스틱 오실레이터 계산
export const calculateStochastic = (data, kPeriod = 14, dPeriod = 3) => {
  const kValues = [];
  const dValues = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < kPeriod - 1) {
      kValues.push(null);
      continue;
    }
    
    const slice = data.slice(i - kPeriod + 1, i + 1);
    const highest = Math.max(...slice.map(d => d.high));
    const lowest = Math.min(...slice.map(d => d.low));
    const current = data[i].close;
    
    const k = ((current - lowest) / (highest - lowest)) * 100;
    kValues.push(k);
  }
  
  // %D 계산 (K값의 이동평균)
  for (let i = 0; i < kValues.length; i++) {
    if (i < dPeriod - 1 || kValues[i] === null) {
      dValues.push(null);
      continue;
    }
    
    const slice = kValues.slice(i - dPeriod + 1, i + 1);
    const validValues = slice.filter(v => v !== null);
    if (validValues.length === dPeriod) {
      dValues.push(validValues.reduce((a, b) => a + b, 0) / dPeriod);
    } else {
      dValues.push(null);
    }
  }
  
  return { k: kValues, d: dValues };
};

// 고급 전략 정의
export const ADVANCED_STRATEGIES = {
  TRIPLE_MA: {
    name: '트리플 이동평균',
    description: '5일, 20일, 50일 이동평균의 배열을 이용한 전략',
    parameters: {
      fastMA: { default: 5, min: 3, max: 15 },
      mediumMA: { default: 20, min: 15, max: 30 },
      slowMA: { default: 50, min: 30, max: 100 }
    }
  },
  MACD_RSI: {
    name: 'MACD + RSI 조합',
    description: 'MACD 신호와 RSI 과매수/과매도 조합',
    parameters: {
      rsiPeriod: { default: 14, min: 7, max: 21 },
      rsiOverbought: { default: 70, min: 65, max: 80 },
      rsiOversold: { default: 30, min: 20, max: 35 }
    }
  },
  BOLLINGER_REVERSION: {
    name: '볼린저 밴드 평균회귀',
    description: '볼린저 밴드 돌파 후 평균회귀 전략',
    parameters: {
      period: { default: 20, min: 15, max: 30 },
      multiplier: { default: 2.0, min: 1.5, max: 2.5 }
    }
  },
  STOCHASTIC_DIVERGENCE: {
    name: '스토캐스틱 다이버전스',
    description: '가격과 스토캐스틱의 다이버전스 기반 전략',
    parameters: {
      kPeriod: { default: 14, min: 10, max: 20 },
      dPeriod: { default: 3, min: 2, max: 5 }
    }
  }
};

// 고급 백테스트 실행
export const runAdvancedBacktest = (data, config) => {
  const {
    strategy,
    initialCapital = 10000000,
    commission = 0.001, // 0.1% 수수료
    slippage = 0.0005, // 0.05% 슬리피지
    stopLoss = null, // 퍼센트 (예: 0.05 = 5%)
    takeProfit = null, // 퍼센트
    maxPositionSize = 1.0, // 최대 포지션 크기 (1.0 = 100%)
    riskPerTrade = 0.02 // 거래당 위험 비율 (2%)
  } = config;

  const trades = [];
  const portfolio = [];
  const signals = [];
  let position = null;
  let capital = initialCapital;
  let shares = 0;
  let maxDrawdown = 0;
  let peak = initialCapital;
  let consecutiveLosses = 0;
  let maxConsecutiveLosses = 0;

  // 필요한 지표들 계산
  const indicators = calculateIndicators(data, strategy);

  for (let i = 50; i < data.length; i++) { // 충분한 데이터 확보 후 시작
    const currentPrice = data[i].close;
    const currentValue = capital + (shares * currentPrice);

    // 포트폴리오 값 기록
    portfolio.push({
      date: data[i].date || new Date(data[i].timestamp).toISOString().split('T')[0],
      value: currentValue,
      price: currentPrice,
      capital: capital,
      shares: shares,
      drawdown: peak > 0 ? ((peak - currentValue) / peak) * 100 : 0
    });

    // 최대 손실폭 계산
    if (currentValue > peak) {
      peak = currentValue;
    }
    const drawdown = ((peak - currentValue) / peak) * 100;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }

    // 스톱로스/테이크프로핏 체크
    if (position && shares > 0) {
      const currentReturn = (currentPrice - position.entryPrice) / position.entryPrice;
      
      if (stopLoss && currentReturn <= -stopLoss) {
        // 스톱로스 실행
        executeExit(i, currentPrice, 'STOP_LOSS');
        continue;
      }
      
      if (takeProfit && currentReturn >= takeProfit) {
        // 테이크프로핏 실행
        executeExit(i, currentPrice, 'TAKE_PROFIT');
        continue;
      }
    }

    // 매매 신호 확인
    const signal = getAdvancedSignal(data, i, indicators, strategy);
    
    if (signal.action !== 'HOLD') {
      signals.push({
        date: data[i].date || new Date(data[i].timestamp).toISOString().split('T')[0],
        price: currentPrice,
        action: signal.action,
        strength: signal.strength,
        reason: signal.reason
      });
    }

    // 매수 신호
    if (signal.action === 'BUY' && !position && capital > 0) {
      const positionSize = calculatePositionSize(capital, currentPrice, riskPerTrade, maxPositionSize);
      const adjustedPrice = currentPrice * (1 + slippage);
      const tradeCost = positionSize * adjustedPrice;
      const commissionCost = tradeCost * commission;
      
      if (capital >= tradeCost + commissionCost) {
        shares = Math.floor(positionSize);
        capital = capital - tradeCost - commissionCost;
        position = {
          type: 'LONG',
          entryPrice: adjustedPrice,
          entryDate: data[i].date || new Date(data[i].timestamp).toISOString().split('T')[0],
          shares: shares,
          reason: signal.reason
        };
        
        trades.push({
          type: 'BUY',
          date: data[i].date || new Date(data[i].timestamp).toISOString().split('T')[0],
          price: adjustedPrice,
          shares: shares,
          value: tradeCost,
          commission: commissionCost,
          reason: signal.reason
        });
      }
    }
    // 매도 신호
    else if (signal.action === 'SELL' && position && shares > 0) {
      executeExit(i, currentPrice, signal.reason);
    }
  }

  // 함수 정의
  function executeExit(index, price, reason) {
    const adjustedPrice = price * (1 - slippage);
    const tradeValue = shares * adjustedPrice;
    const commissionCost = tradeValue * commission;
    
    capital = capital + tradeValue - commissionCost;
    const profit = (adjustedPrice - position.entryPrice) * shares - commissionCost;
    const profitPercent = ((adjustedPrice - position.entryPrice) / position.entryPrice) * 100;
    
    trades.push({
      type: 'SELL',
      date: data[index].date || new Date(data[index].timestamp).toISOString().split('T')[0],
      price: adjustedPrice,
      shares: shares,
      value: tradeValue,
      commission: commissionCost,
      profit: profit,
      profitPercent: profitPercent,
      reason: reason
    });

    // 연속 손실 추적
    if (profit < 0) {
      consecutiveLosses++;
      maxConsecutiveLosses = Math.max(maxConsecutiveLosses, consecutiveLosses);
    } else {
      consecutiveLosses = 0;
    }

    shares = 0;
    position = null;
  }

  // 최종 통계 계산
  return calculateAdvancedStats({
    initialCapital,
    finalValue: capital + (shares * data[data.length - 1].close),
    trades,
    portfolio,
    signals,
    maxDrawdown,
    maxConsecutiveLosses,
    commission,
    slippage
  });
};

// 포지션 크기 계산
const calculatePositionSize = (capital, price, riskPerTrade, maxPositionSize) => {
  const maxShares = Math.floor((capital * maxPositionSize) / price);
  const riskShares = Math.floor((capital * riskPerTrade) / price);
  return Math.min(maxShares, riskShares);
};

// 지표 계산
const calculateIndicators = (data, strategy) => {
  const indicators = {
    sma5: calculateSMA(data, 5),
    sma20: calculateSMA(data, 20),
    sma50: calculateSMA(data, 50),
    rsi: calculateRSI(data, 14),
    macd: calculateMACD(data),
    bollinger: calculateBollingerBands(data),
    stochastic: calculateStochastic(data)
  };

  return indicators;
};

// 고급 신호 생성
const getAdvancedSignal = (data, index, indicators, strategy) => {
  const current = data[index];
  const previous = data[index - 1];
  
  switch (strategy.type) {
    case 'TRIPLE_MA':
      return getTripleMASignal(index, indicators, strategy.parameters);
    
    case 'MACD_RSI':
      return getMACDRSISignal(index, indicators, strategy.parameters);
    
    case 'BOLLINGER_REVERSION':
      return getBollingerReversionSignal(index, indicators, current, previous);
    
    case 'STOCHASTIC_DIVERGENCE':
      return getStochasticDivergenceSignal(index, indicators, data);
    
    default:
      return { action: 'HOLD', strength: 0, reason: 'Unknown strategy' };
  }
};

// 트리플 이동평균 신호
const getTripleMASignal = (index, indicators, params) => {
  const { sma5, sma20, sma50 } = indicators;
  
  if (sma5[index] > sma20[index] && sma20[index] > sma50[index] &&
      sma5[index - 1] <= sma20[index - 1]) {
    return { action: 'BUY', strength: 0.8, reason: '상승 정렬 돌파' };
  }
  
  if (sma5[index] < sma20[index] && sma20[index] < sma50[index] &&
      sma5[index - 1] >= sma20[index - 1]) {
    return { action: 'SELL', strength: 0.8, reason: '하락 정렬 돌파' };
  }
  
  return { action: 'HOLD', strength: 0, reason: 'No signal' };
};

// MACD + RSI 조합 신호
const getMACDRSISignal = (index, indicators, params) => {
  const { macd, rsi } = indicators;
  const { rsiOverbought = 70, rsiOversold = 30 } = params || {};
  
  if (macd.histogram[index] > 0 && macd.histogram[index - 1] <= 0 && 
      rsi[index] < rsiOverbought && rsi[index] > rsiOversold) {
    return { action: 'BUY', strength: 0.7, reason: 'MACD 상향돌파 + RSI 중립' };
  }
  
  if (macd.histogram[index] < 0 && macd.histogram[index - 1] >= 0 && 
      rsi[index] > rsiOversold) {
    return { action: 'SELL', strength: 0.7, reason: 'MACD 하향돌파' };
  }
  
  return { action: 'HOLD', strength: 0, reason: 'No signal' };
};

// 볼린저 밴드 평균회귀 신호
const getBollingerReversionSignal = (index, indicators, current, previous) => {
  const bb = indicators.bollinger[index];
  const bbPrev = indicators.bollinger[index - 1];
  
  if (previous.close <= bbPrev.lower && current.close > bb.lower) {
    return { action: 'BUY', strength: 0.6, reason: '하단 밴드 반등' };
  }
  
  if (previous.close >= bbPrev.upper && current.close < bb.upper) {
    return { action: 'SELL', strength: 0.6, reason: '상단 밴드 반락' };
  }
  
  return { action: 'HOLD', strength: 0, reason: 'No signal' };
};

// 스토캐스틱 다이버전스 신호
const getStochasticDivergenceSignal = (index, indicators, data) => {
  const stoch = indicators.stochastic;
  
  if (stoch.k[index] < 20 && stoch.k[index - 1] >= 20) {
    return { action: 'BUY', strength: 0.5, reason: '스토캐스틱 과매도 반등' };
  }
  
  if (stoch.k[index] > 80 && stoch.k[index - 1] <= 80) {
    return { action: 'SELL', strength: 0.5, reason: '스토캐스틱 과매수 반락' };
  }
  
  return { action: 'HOLD', strength: 0, reason: 'No signal' };
};

// 고급 통계 계산
const calculateAdvancedStats = (data) => {
  const { trades, portfolio, initialCapital, finalValue } = data;
  
  const sellTrades = trades.filter(t => t.type === 'SELL');
  const winningTrades = sellTrades.filter(t => t.profit > 0);
  const losingTrades = sellTrades.filter(t => t.profit < 0);
  
  const totalReturn = ((finalValue - initialCapital) / initialCapital) * 100;
  const winRate = sellTrades.length > 0 ? (winningTrades.length / sellTrades.length) * 100 : 0;
  
  const avgWin = winningTrades.length > 0 ? 
    winningTrades.reduce((acc, t) => acc + t.profitPercent, 0) / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? 
    losingTrades.reduce((acc, t) => acc + t.profitPercent, 0) / losingTrades.length : 0;
  
  const profitFactor = Math.abs(avgLoss) > 0 ? Math.abs(avgWin / avgLoss) : 0;
  
  // 샤프 비율 계산
  const returns = portfolio.map((p, i) => 
    i > 0 ? (p.value - portfolio[i-1].value) / portfolio[i-1].value : 0
  ).slice(1);
  
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const stdReturn = Math.sqrt(returns.reduce((acc, r) => acc + Math.pow(r - avgReturn, 2), 0) / returns.length);
  const sharpeRatio = stdReturn > 0 ? (avgReturn / stdReturn) * Math.sqrt(252) : 0;
  
  return {
    ...data,
    totalReturn,
    winRate,
    profitFactor,
    sharpeRatio,
    avgWin,
    avgLoss,
    totalTrades: sellTrades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    largestWin: winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.profitPercent)) : 0,
    largestLoss: losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.profitPercent)) : 0
  };
}; 