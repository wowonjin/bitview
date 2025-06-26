// 백테스트 관련 계산 함수들

// 단순 이동평균 계산
export const calculateSMA = (data, period) => {
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

// RSI 계산
export const calculateRSI = (data, period = 14) => {
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

// 백테스트 실행
export const runBacktest = (data, strategy, initialCapital = 10000) => {
  const trades = [];
  const portfolio = [];
  let position = null;
  let capital = initialCapital;
  let shares = 0;
  let maxDrawdown = 0;
  let peak = initialCapital;

  // 지표 계산
  const sma20 = calculateSMA(data, 20);
  const sma5 = calculateSMA(data, 5);
  const rsi = calculateRSI(data);

  for (let i = 1; i < data.length; i++) {
    const currentPrice = data[i].close;
    const currentValue = capital + (shares * currentPrice);

    // 포트폴리오 값 기록
    portfolio.push({
      date: data[i].date,
      value: currentValue,
      price: currentPrice,
      capital: capital,
      shares: shares
    });

    // 최대 손실폭 계산
    if (currentValue > peak) {
      peak = currentValue;
    }
    const drawdown = ((peak - currentValue) / peak) * 100;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }

    // 매매 신호 확인
    const signal = getSignal(data, i, sma20, sma5, rsi, strategy);

    // 매수 신호
    if (signal === 'BUY' && !position && capital > 0) {
      shares = Math.floor(capital / currentPrice);
      capital = capital - (shares * currentPrice);
      position = {
        type: 'LONG',
        entryPrice: currentPrice,
        entryDate: data[i].date,
        shares: shares
      };
      
      trades.push({
        type: 'BUY',
        date: data[i].date,
        price: currentPrice,
        shares: shares,
        value: shares * currentPrice
      });
    }
    // 매도 신호
    else if (signal === 'SELL' && position && shares > 0) {
      capital = capital + (shares * currentPrice);
      const profit = (currentPrice - position.entryPrice) * shares;
      const profitPercent = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;
      
      trades.push({
        type: 'SELL',
        date: data[i].date,
        price: currentPrice,
        shares: shares,
        value: shares * currentPrice,
        profit: profit,
        profitPercent: profitPercent
      });

      shares = 0;
      position = null;
    }
  }

  // 최종 결과 계산
  const finalValue = capital + (shares * data[data.length - 1].close);
  const totalReturn = ((finalValue - initialCapital) / initialCapital) * 100;
  const winningTrades = trades.filter(t => t.type === 'SELL' && t.profit > 0).length;
  const losingTrades = trades.filter(t => t.type === 'SELL' && t.profit < 0).length;
  const totalTrades = winningTrades + losingTrades;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  return {
    initialCapital,
    finalValue,
    totalReturn,
    maxDrawdown,
    trades,
    portfolio,
    winRate,
    totalTrades,
    winningTrades,
    losingTrades
  };
};

// 매매 신호 생성
const getSignal = (data, index, sma20, sma5, rsi, strategy) => {
  if (index < 20) return 'HOLD';

  const current = data[index];
  const previous = data[index - 1];

  switch (strategy.type) {
    case 'SMA_CROSSOVER':
      if (sma5[index] > sma20[index] && sma5[index - 1] <= sma20[index - 1]) {
        return 'BUY';
      }
      if (sma5[index] < sma20[index] && sma5[index - 1] >= sma20[index - 1]) {
        return 'SELL';
      }
      break;

    case 'RSI_REVERSAL':
      if (rsi[index] < 30 && rsi[index - 1] >= 30) {
        return 'BUY';
      }
      if (rsi[index] > 70 && rsi[index - 1] <= 70) {
        return 'SELL';
      }
      break;

    case 'PRICE_MOMENTUM':
      const priceChange = ((current.close - previous.close) / previous.close) * 100;
      if (priceChange > strategy.buyThreshold) {
        return 'BUY';
      }
      if (priceChange < strategy.sellThreshold) {
        return 'SELL';
      }
      break;

    default:
      return 'HOLD';
  }

  return 'HOLD';
};

// 가짜 API 데이터 생성 (실제로는 외부 API에서 가져올 예정)
export const generateMockData = (days = 365) => {
  const data = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  let price = 50000; // 시작 가격

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // 랜덤 가격 변동 생성
    const change = (Math.random() - 0.5) * 0.1;
    price = price * (1 + change);
    
    const high = price * (1 + Math.random() * 0.05);
    const low = price * (1 - Math.random() * 0.05);
    const volume = Math.floor(Math.random() * 1000000) + 100000;

    data.push({
      date: date.toISOString().split('T')[0],
      open: price,
      high: high,
      low: low,
      close: price,
      volume: volume
    });
  }

  return data;
}; 