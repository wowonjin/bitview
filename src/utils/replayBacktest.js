// 리플레이 백테스트 전용 유틸리티 함수들
import { runAdvancedBacktest, ADVANCED_STRATEGIES } from './advancedBacktest';

// 리플레이 백테스트 실행
export const runReplayBacktest = (data, config, endIndex = null) => {
  const slicedData = endIndex ? data.slice(0, endIndex + 1) : data;
  return runAdvancedBacktest(slicedData, config);
};

// 실시간 포지션 계산
export const calculateCurrentPosition = (data, signals, currentIndex, initialCapital) => {
  let capital = initialCapital;
  let shares = 0;
  let position = null;
  let totalTrades = 0;
  let winningTrades = 0;
  let losingTrades = 0;
  let totalProfit = 0;
  
  const currentSignals = signals.filter((_, index) => index <= currentIndex);
  
  for (let i = 0; i < currentSignals.length; i++) {
    const signal = currentSignals[i];
    const signalIndex = data.findIndex(d => d.time === signal.date);
    
    if (signalIndex >= 0 && signalIndex <= currentIndex) {
      const price = data[signalIndex].close;
      
      if (signal.action === 'BUY' && !position && capital > 0) {
        const maxShares = Math.floor(capital / price);
        const commission = capital * 0.001; // 0.1% 수수료
        
        if (capital >= (maxShares * price) + commission) {
          shares = maxShares;
          capital = capital - (shares * price) - commission;
          position = {
            entryPrice: price,
            entryIndex: signalIndex,
            shares: shares
          };
        }
      } else if (signal.action === 'SELL' && position && shares > 0) {
        const tradeValue = shares * price;
        const commission = tradeValue * 0.001;
        const profit = tradeValue - (position.shares * position.entryPrice) - commission;
        
        capital = capital + tradeValue - commission;
        totalTrades++;
        totalProfit += profit;
        
        if (profit > 0) {
          winningTrades++;
        } else {
          losingTrades++;
        }
        
        shares = 0;
        position = null;
      }
    }
  }
  
  const currentPrice = data[currentIndex]?.close || 0;
  const currentValue = capital + (shares * currentPrice);
  const totalReturn = ((currentValue - initialCapital) / initialCapital) * 100;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  
  return {
    capital,
    shares,
    position,
    currentValue,
    totalReturn,
    totalTrades,
    winningTrades,
    losingTrades,
    totalProfit,
    winRate,
    currentPrice
  };
};

// 기술적 지표 계산 (리플레이용)
export const calculateIndicatorsForReplay = (data, indicators, endIndex) => {
  const slicedData = data.slice(0, endIndex + 1);
  const result = {};
  
  if (indicators.sma) {
    result.sma20 = calculateSMA(slicedData, 20);
    result.sma50 = calculateSMA(slicedData, 50);
  }
  
  if (indicators.ema) {
    result.ema12 = calculateEMA(slicedData, 12);
    result.ema26 = calculateEMA(slicedData, 26);
  }
  
  if (indicators.rsi) {
    result.rsi = calculateRSI(slicedData, 14);
  }
  
  if (indicators.macd) {
    result.macd = calculateMACD(slicedData);
  }
  
  if (indicators.bollinger) {
    result.bollinger = calculateBollingerBands(slicedData);
  }
  
  if (indicators.stochastic) {
    result.stochastic = calculateStochastic(slicedData);
  }
  
  return result;
};

// 단순 이동평균 계산
const calculateSMA = (data, period) => {
  const sma = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(null);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val.close, 0);
      sma.push(sum / period);
    }
  }
  return sma;
};

// 지수 이동평균 계산
const calculateEMA = (data, period) => {
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

// RSI 계산
const calculateRSI = (data, period = 14) => {
  const rsi = [];
  const gains = [];
  const losses = [];

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      gains.push(0);
      losses.push(0);
      rsi.push(50);
      continue;
    }

    const change = data[i].close - data[i - 1].close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);

    if (i < period) {
      rsi.push(50);
      continue;
    }

    const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;

    if (avgLoss === 0) {
      rsi.push(100);
    } else {
      const rs = avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }
  }

  return rsi;
};

// MACD 계산
const calculateMACD = (data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
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

// 볼린저 밴드 계산
const calculateBollingerBands = (data, period = 20, multiplier = 2) => {
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

// 스토캐스틱 계산
const calculateStochastic = (data, kPeriod = 14, dPeriod = 3) => {
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

// 거래 성과 분석
export const analyzeTradingPerformance = (trades) => {
  if (!trades || trades.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      avgWinPercent: 0,
      avgLossPercent: 0,
      profitFactor: 0,
      largestWin: 0,
      largestLoss: 0,
      avgTradeDuration: 0,
      consecutiveWins: 0,
      consecutiveLosses: 0
    };
  }
  
  const sellTrades = trades.filter(t => t.type === 'SELL');
  const winningTrades = sellTrades.filter(t => t.profit > 0);
  const losingTrades = sellTrades.filter(t => t.profit < 0);
  
  const totalWinAmount = winningTrades.reduce((sum, t) => sum + t.profit, 0);
  const totalLossAmount = Math.abs(losingTrades.reduce((sum, t) => sum + t.profit, 0));
  
  const avgWinPercent = winningTrades.length > 0 ? 
    winningTrades.reduce((sum, t) => sum + t.profitPercent, 0) / winningTrades.length : 0;
  const avgLossPercent = losingTrades.length > 0 ? 
    losingTrades.reduce((sum, t) => sum + Math.abs(t.profitPercent), 0) / losingTrades.length : 0;
  
  const profitFactor = totalLossAmount > 0 ? totalWinAmount / totalLossAmount : 0;
  
  const largestWin = winningTrades.length > 0 ? 
    Math.max(...winningTrades.map(t => t.profitPercent)) : 0;
  const largestLoss = losingTrades.length > 0 ? 
    Math.min(...losingTrades.map(t => t.profitPercent)) : 0;
  
  // 연속 승패 계산
  let consecutiveWins = 0;
  let consecutiveLosses = 0;
  let currentConsecutiveWins = 0;
  let currentConsecutiveLosses = 0;
  
  sellTrades.forEach(trade => {
    if (trade.profit > 0) {
      currentConsecutiveWins++;
      currentConsecutiveLosses = 0;
      consecutiveWins = Math.max(consecutiveWins, currentConsecutiveWins);
    } else {
      currentConsecutiveLosses++;
      currentConsecutiveWins = 0;
      consecutiveLosses = Math.max(consecutiveLosses, currentConsecutiveLosses);
    }
  });
  
  return {
    totalTrades: sellTrades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate: sellTrades.length > 0 ? (winningTrades.length / sellTrades.length) * 100 : 0,
    avgWinPercent: avgWinPercent,
    avgLossPercent: avgLossPercent,
    profitFactor: profitFactor,
    largestWin: largestWin,
    largestLoss: largestLoss,
    consecutiveWins: consecutiveWins,
    consecutiveLosses: consecutiveLosses,
    totalWinAmount: totalWinAmount,
    totalLossAmount: totalLossAmount
  };
};

// 위험 분석
export const analyzeRisk = (portfolio, initialCapital) => {
  if (!portfolio || portfolio.length === 0) {
    return {
      maxDrawdown: 0,
      maxDrawdownDuration: 0,
      volatility: 0,
      sharpeRatio: 0,
      sortinoRatio: 0,
      calmarRatio: 0,
      var95: 0,
      expectedShortfall: 0
    };
  }
  
  // 일일 수익률 계산
  const dailyReturns = [];
  for (let i = 1; i < portfolio.length; i++) {
    const returnRate = (portfolio[i].value - portfolio[i-1].value) / portfolio[i-1].value;
    dailyReturns.push(returnRate);
  }
  
  // 최대 손실폭 계산
  let maxDrawdown = 0;
  let peak = initialCapital;
  let drawdownStart = 0;
  let maxDrawdownDuration = 0;
  
  portfolio.forEach((point, index) => {
    if (point.value > peak) {
      peak = point.value;
      drawdownStart = index;
    }
    
    const drawdown = (peak - point.value) / peak;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
      maxDrawdownDuration = index - drawdownStart;
    }
  });
  
  // 변동성 (표준편차)
  const avgReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
  const variance = dailyReturns.reduce((acc, ret) => acc + Math.pow(ret - avgReturn, 2), 0) / dailyReturns.length;
  const volatility = Math.sqrt(variance) * Math.sqrt(252); // 연환산
  
  // 샤프 비율 (무위험 수익률 0% 가정)
  const sharpeRatio = volatility > 0 ? (avgReturn * 252) / volatility : 0;
  
  // 소르티노 비율 (하방 변동성)
  const negativeReturns = dailyReturns.filter(ret => ret < 0);
  const downwardDeviation = negativeReturns.length > 0 ?
    Math.sqrt(negativeReturns.reduce((acc, ret) => acc + ret * ret, 0) / negativeReturns.length) * Math.sqrt(252) : 0;
  const sortinoRatio = downwardDeviation > 0 ? (avgReturn * 252) / downwardDeviation : 0;
  
  // 칼마 비율
  const totalReturn = (portfolio[portfolio.length - 1].value - initialCapital) / initialCapital;
  const calmarRatio = maxDrawdown > 0 ? totalReturn / maxDrawdown : 0;
  
  // VaR (95% 신뢰수준)
  const sortedReturns = [...dailyReturns].sort((a, b) => a - b);
  const var95Index = Math.floor(sortedReturns.length * 0.05);
  const var95 = sortedReturns[var95Index] || 0;
  
  // Expected Shortfall (CVaR)
  const expectedShortfall = var95Index > 0 ?
    sortedReturns.slice(0, var95Index).reduce((a, b) => a + b, 0) / var95Index : 0;
  
  return {
    maxDrawdown: maxDrawdown * 100,
    maxDrawdownDuration,
    volatility: volatility * 100,
    sharpeRatio,
    sortinoRatio,
    calmarRatio,
    var95: var95 * 100,
    expectedShortfall: expectedShortfall * 100
  };
};

// 월별 수익률 계산
export const calculateMonthlyReturns = (portfolio) => {
  if (!portfolio || portfolio.length === 0) return [];
  
  const monthlyData = {};
  
  portfolio.forEach(point => {
    const date = new Date(point.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        start: point.value,
        end: point.value,
        month: monthKey
      };
    } else {
      monthlyData[monthKey].end = point.value;
    }
  });
  
  return Object.values(monthlyData).map(month => ({
    month: month.month,
    return: ((month.end - month.start) / month.start) * 100
  }));
}; 