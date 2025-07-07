# BitView 프로젝트 기술 문서

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [프로젝트 구조](#프로젝트-구조)
4. [주요 기능](#주요-기능)
5. [알고리즘 및 핵심 로직](#알고리즘-및-핵심-로직)
6. [API 설계](#api-설계)
7. [데이터베이스 설계](#데이터베이스-설계)
8. [성능 최적화](#성능-최적화)
9. [보안 구현](#보안-구현)
10. [배포 환경](#배포-환경)
11. [개발 환경 설정](#개발-환경-설정)
12. [코드 구조 및 아키텍처](#코드-구조-및-아키텍처)

---

## 📊 프로젝트 개요

**BitView**는 전문가급 암호화폐 분석 플랫폼으로, 실시간 시세 조회, 차트 분석, 고급 백테스트 기능을 제공하는 React 기반 웹 애플리케이션입니다.

### 주요 특징
- 실시간 암호화폐 시세 추적
- 전문가급 차트 분석 도구
- 고급 백테스트 시뮬레이션
- 리플레이 기능으로 실시간 전략 검증
- 다양한 기술적 지표 제공
- 반응형 디자인 및 PWA 지원

---

## 🛠️ 기술 스택

### Frontend
- **React**: 19.1.0 (최신 버전)
- **Vite**: 6.3.5 (빌드 도구)
- **React Router**: 7.6.2 (라우팅)
- **Framer Motion**: 12.18.1 (애니메이션)
- **Recharts**: 2.15.4 (차트 라이브러리)
- **TradingView Embed**: 3.0.6 (전문 차트)
- **Lucide React**: 0.517.0 (아이콘)

### Backend
- **Node.js**: Express 5.1.0
- **Socket.io**: 4.8.1 (실시간 통신)
- **WebSocket**: 8.18.3 (실시간 데이터)
- **CORS**: 2.8.5 (보안)
- **bcryptjs**: 3.0.2 (비밀번호 암호화)
- **jsonwebtoken**: 9.0.2 (JWT 인증)

### 데이터베이스
- **Prisma**: ORM (PostgreSQL/MySQL 지원)

### 개발 도구
- **ESLint**: 9.25.0 (코드 품질)
- **TypeScript**: 타입 안정성
- **Vite**: 개발 서버 및 빌드

### 외부 API
- **Binance API**: 실시간 암호화폐 데이터
- **WebSocket**: 실시간 시세 스트림

---

## 🏗️ 프로젝트 구조

```
bitview/
├── frontend/
│   ├── src/
│   │   ├── components/         # 재사용 가능한 컴포넌트
│   │   │   ├── layout/        # 레이아웃 컴포넌트
│   │   │   ├── ui/            # UI 컴포넌트
│   │   │   ├── ChartViewWidget.jsx
│   │   │   ├── CoinTable.jsx
│   │   │   ├── TradingViewChart.jsx
│   │   │   └── ...
│   │   ├── pages/             # 페이지 컴포넌트
│   │   │   ├── AdvancedBacktest.jsx
│   │   │   ├── Chart.jsx
│   │   │   ├── LiveCoins.jsx
│   │   │   ├── Premium.jsx
│   │   │   └── ...
│   │   ├── context/           # React Context
│   │   │   └── AuthContext.jsx
│   │   ├── utils/             # 유틸리티 함수
│   │   │   ├── advancedBacktest.js
│   │   │   ├── replayBacktest.js
│   │   │   └── backtest.js
│   │   ├── App.jsx           # 메인 앱 컴포넌트
│   │   └── main.jsx          # 엔트리 포인트
│   ├── public/               # 정적 파일
│   │   ├── robots.txt
│   │   ├── sitemap.xml
│   │   └── site.webmanifest
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── src/
│   │   └── auth/             # 인증 관련
│   ├── prisma/               # 데이터베이스 스키마
│   ├── server.js             # 메인 서버
│   ├── websocket-server.js   # 웹소켓 서버
│   └── package.json
├── README.md
└── TECHNICAL_DOCUMENTATION.md
```

---

## 🎯 주요 기능

### 1. 실시간 코인 모니터링 (`/live-coins`)
- 실시간 가격 업데이트
- 24시간 변동률 표시
- 즐겨찾기 기능
- 정렬 및 필터링
- 페이지네이션

### 2. 차트 분석 (`/chart`)
- TradingView 통합 차트
- 다양한 시간 간격 (1분~1개월)
- 기술적 지표 표시
- 마우스 줌/드래그 기능

### 3. 고급 백테스트 (`/advanced-backtest`)
- 4가지 고급 전략
- 리플레이 기능
- 실시간 성과 분석
- 위험 관리 도구

### 4. 계산기 도구
- 수익률 계산기 (`/profit-calculator`)
- 펀딩 수수료 계산기 (`/funding-calculator`)

### 5. 사용자 관리
- 회원가입/로그인 (`/login`, `/signup`)
- 프리미엄 기능 (`/premium`)
- 관리자 대시보드 (`/admin`)

---

## 🧮 알고리즘 및 핵심 로직

### 1. 백테스트 알고리즘

#### 기본 구조
```javascript
export const runAdvancedBacktest = (data, config) => {
  const {
    strategy,
    initialCapital = 10000000,
    commission = 0.001,
    slippage = 0.0005,
    stopLoss = null,
    takeProfit = null,
    maxPositionSize = 1.0,
    riskPerTrade = 0.02
  } = config;

  // 지표 계산
  const indicators = calculateIndicators(data, strategy);
  
  // 거래 시뮬레이션
  for (let i = 50; i < data.length; i++) {
    const signal = getAdvancedSignal(data, i, indicators, strategy);
    // 매수/매도 로직 실행
  }
};
```

#### 지원 전략
1. **트리플 이동평균 (TRIPLE_MA)**
   - 5일, 20일, 50일 이동평균 배열
   - 황금 교차/데드 교차 신호

2. **MACD + RSI 조합 (MACD_RSI)**
   - MACD 히스토그램 신호
   - RSI 과매수/과매도 필터

3. **볼린저 밴드 평균회귀 (BOLLINGER_REVERSION)**
   - 볼린저 밴드 돌파 후 회귀
   - 표준편차 기반 신호

4. **스토캐스틱 다이버전스 (STOCHASTIC_DIVERGENCE)**
   - 가격과 스토캐스틱 다이버전스
   - 추세 전환 신호

### 2. 기술적 지표 계산

#### 이동평균 (SMA)
```javascript
const calculateSMA = (data, period) => {
  const sma = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(null);
    } else {
      const sum = data.slice(i - period + 1, i + 1)
        .reduce((acc, val) => acc + val.close, 0);
      sma.push(sum / period);
    }
  }
  return sma;
};
```

#### 지수이동평균 (EMA)
```javascript
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
```

#### RSI (Relative Strength Index)
```javascript
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
```

#### 볼린저 밴드
```javascript
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
```

### 3. 리플레이 시스템

#### 실시간 포지션 계산
```javascript
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
        // 매수 로직
        const maxShares = Math.floor(capital / price);
        const commission = capital * 0.001;
        
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
        // 매도 로직
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
```

### 4. 위험 분석 알고리즘

#### 최대 손실폭 (Maximum Drawdown)
```javascript
export const analyzeRisk = (portfolio, initialCapital) => {
  let maxDrawdown = 0;
  let peak = initialCapital;
  let currentDrawdown = 0;
  let volatility = 0;
  
  const returns = [];
  
  for (let i = 0; i < portfolio.length; i++) {
    const currentValue = portfolio[i].totalValue;
    
    if (currentValue > peak) {
      peak = currentValue;
    }
    
    currentDrawdown = ((peak - currentValue) / peak) * 100;
    if (currentDrawdown > maxDrawdown) {
      maxDrawdown = currentDrawdown;
    }
    
    if (i > 0) {
      const dailyReturn = (currentValue - portfolio[i-1].totalValue) / portfolio[i-1].totalValue;
      returns.push(dailyReturn);
    }
  }
  
  // 변동성 계산
  if (returns.length > 0) {
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((acc, ret) => acc + Math.pow(ret - mean, 2), 0) / returns.length;
    volatility = Math.sqrt(variance) * Math.sqrt(252) * 100; // 연율화
  }
  
  return {
    maxDrawdown,
    volatility,
    sharpeRatio: calculateSharpeRatio(returns),
    sortinoRatio: calculateSortinoRatio(returns),
    var95: calculateVaR(returns, 0.95),
    var99: calculateVaR(returns, 0.99)
  };
};
```

---

## 🔌 API 설계

### 1. 인증 API

#### POST `/api/forgot-password`
비밀번호 재설정 요청
```javascript
// Request
{
  "email": "user@example.com"
}

// Response
{
  "success": true,
  "message": "비밀번호 재설정 링크가 이메일로 발송되었습니다.",
  "token": "123456" // 개발환경에서만
}
```

#### POST `/api/verify-reset-token`
재설정 토큰 검증
```javascript
// Request
{
  "email": "user@example.com",
  "token": "123456"
}

// Response
{
  "success": true,
  "message": "토큰이 유효합니다."
}
```

### 2. 실시간 데이터 API

#### WebSocket 연결
```javascript
// 실시간 시세 스트림
const tickerWs = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`);

// 캔들스틱 데이터 스트림
const candleWs = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`);
```

#### REST API
```javascript
// 초기 캔들 데이터 가져오기
const response = await fetch(
  `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=500`
);
```

---

## 🗄️ 데이터베이스 설계

### 1. 사용자 테이블 (Users)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nickname VARCHAR(100),
  profile_image VARCHAR(255),
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. 백테스트 결과 테이블 (Backtest_Results)
```sql
CREATE TABLE backtest_results (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  strategy_name VARCHAR(100),
  symbol VARCHAR(20),
  interval VARCHAR(10),
  start_date DATE,
  end_date DATE,
  initial_capital DECIMAL(15,2),
  final_capital DECIMAL(15,2),
  total_return DECIMAL(10,4),
  max_drawdown DECIMAL(10,4),
  total_trades INTEGER,
  win_rate DECIMAL(10,4),
  sharpe_ratio DECIMAL(10,4),
  config JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. 거래 내역 테이블 (Trades)
```sql
CREATE TABLE trades (
  id SERIAL PRIMARY KEY,
  backtest_id INTEGER REFERENCES backtest_results(id),
  trade_type VARCHAR(10), -- 'BUY' or 'SELL'
  symbol VARCHAR(20),
  price DECIMAL(15,8),
  quantity DECIMAL(15,8),
  commission DECIMAL(15,8),
  timestamp TIMESTAMP,
  pnl DECIMAL(15,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. 사용자 설정 테이블 (User_Settings)
```sql
CREATE TABLE user_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  favorite_symbols TEXT[], -- 즐겨찾기 심볼 배열
  default_interval VARCHAR(10),
  theme VARCHAR(20),
  notification_settings JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## ⚡ 성능 최적화

### 1. 프론트엔드 최적화

#### 번들 분할 (Code Splitting)
```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          charts: ['recharts', 'react-tradingview-embed'],
          utils: ['framer-motion', 'lucide-react']
        }
      }
    }
  }
});
```

#### 컴포넌트 최적화
```javascript
// React.memo를 사용한 불필요한 리렌더링 방지
const CandlestickChart = React.memo(({ data, offset }) => {
  // 차트 렌더링 로직
}, (prevProps, nextProps) => {
  return prevProps.data === nextProps.data && prevProps.offset === nextProps.offset;
});

// useMemo를 사용한 계산 최적화
const visibleData = useMemo(() => {
  const maxOffset = Math.max(0, data.length - displayRange);
  const actualOffset = Math.min(offset || 0, maxOffset);
  const startIndex = Math.max(0, data.length - displayRange - actualOffset);
  const endIndex = Math.min(data.length, startIndex + displayRange);
  return data.slice(startIndex, endIndex);
}, [data, displayRange, offset]);
```

### 2. 백테스트 성능 최적화

#### 지표 캐싱
```javascript
const indicatorCache = new Map();

const getIndicators = (data, strategy) => {
  const cacheKey = `${strategy}_${data.length}_${data[data.length-1].timestamp}`;
  
  if (indicatorCache.has(cacheKey)) {
    return indicatorCache.get(cacheKey);
  }
  
  const indicators = calculateIndicators(data, strategy);
  indicatorCache.set(cacheKey, indicators);
  
  return indicators;
};
```

#### 워커 스레드 활용
```javascript
// 백테스트 계산을 별도 워커에서 실행
const worker = new Worker('/js/backtest-worker.js');

worker.postMessage({
  data: historicalData,
  config: backtestConfig
});

worker.onmessage = (event) => {
  const { results, progress } = event.data;
  setBacktestResults(results);
  setProgress(progress);
};
```

### 3. 실시간 데이터 최적화

#### WebSocket 연결 관리
```javascript
class WebSocketManager {
  constructor() {
    this.connections = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(symbol, callback) {
    const key = `${symbol}_ticker`;
    
    if (this.connections.has(key)) {
      return this.connections.get(key);
    }

    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`);
    
    ws.onopen = () => {
      this.reconnectAttempts = 0;
      console.log(`WebSocket connected: ${symbol}`);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };

    ws.onclose = () => {
      this.connections.delete(key);
      this.reconnect(symbol, callback);
    };

    this.connections.set(key, ws);
    return ws;
  }

  reconnect(symbol, callback) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect(symbol, callback);
      }, Math.pow(2, this.reconnectAttempts) * 1000);
    }
  }
}
```

---

## 🔒 보안 구현

### 1. 인증 및 권한 관리

#### JWT 토큰 구조
```javascript
// JWT 생성
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      isPremium: user.isPremium 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: '24h',
      issuer: 'bitview',
      audience: 'bitview-users'
    }
  );
};

// JWT 검증 미들웨어
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};
```

#### 비밀번호 암호화
```javascript
const bcrypt = require('bcryptjs');

// 비밀번호 해싱
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// 비밀번호 검증
const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};
```

### 2. CORS 설정

#### 동적 CORS 설정
```javascript
const allowedOrigins = [
  'http://localhost:5178',
  'https://bitview.vercel.app',
  /^https:\/\/.*\.vercel\.app$/,
  process.env.CUSTOM_DOMAIN
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      }
      return allowedOrigin.test(origin);
    })) {
      callback(null, true);
    } else {
      callback(new Error('CORS 정책에 의해 차단됨'));
    }
  },
  credentials: true
}));
```

### 3. 입력 검증

#### 데이터 유효성 검사
```javascript
const validateBacktestConfig = (config) => {
  const errors = [];
  
  if (!config.strategy || !ADVANCED_STRATEGIES[config.strategy]) {
    errors.push('유효하지 않은 전략입니다.');
  }
  
  if (!config.initialCapital || config.initialCapital < 1000000) {
    errors.push('초기 자본은 최소 1,000,000원 이상이어야 합니다.');
  }
  
  if (config.commission < 0 || config.commission > 0.01) {
    errors.push('수수료는 0% ~ 1% 범위여야 합니다.');
  }
  
  return errors;
};
```

### 4. 보안 헤더

#### HTML 보안 헤더
```html
<!-- XSS 방지 -->
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="X-Frame-Options" content="DENY">
<meta http-equiv="X-XSS-Protection" content="1; mode=block">

<!-- HTTPS 강제 -->
<meta http-equiv="Strict-Transport-Security" content="max-age=31536000; includeSubDomains">
```

---

## 🚀 배포 환경

### 1. Vercel 배포 설정

#### vercel.json 설정
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-backend-url.onrender.com/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-backend-url.onrender.com/api/$1"
    }
  ]
}
```

### 2. 환경 변수 설정

#### 프론트엔드 (.env)
```bash
VITE_API_URL=https://your-backend-url.onrender.com
VITE_WEBSOCKET_URL=wss://your-websocket-url.onrender.com
VITE_BINANCE_API_URL=https://api.binance.com
```

#### 백엔드 (.env)
```bash
# 데이터베이스
DATABASE_URL=postgresql://user:password@localhost:5432/bitview

# JWT
JWT_SECRET=your-super-secret-jwt-key

# 이메일
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# 프론트엔드
FRONTEND_URL=https://bitview.vercel.app
CUSTOM_DOMAIN=https://your-domain.com

# 서버
PORT=3001
NODE_ENV=production
```

### 3. CI/CD 파이프라인

#### GitHub Actions
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Build project
        run: npm run build
      - name: Deploy to Vercel
        uses: vercel/action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 🛠️ 개발 환경 설정

### 1. 필요 조건
- Node.js 18.0.0 이상
- npm 9.0.0 이상
- PostgreSQL 13 이상 (운영 환경)

### 2. 설치 및 실행

#### 프로젝트 클론
```bash
git clone https://github.com/yourusername/bitview.git
cd bitview
```

#### 프론트엔드 설정
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 빌드 미리보기
npm run preview
```

#### 백엔드 설정
```bash
cd backend

# 의존성 설치
npm install

# 데이터베이스 마이그레이션
npx prisma migrate dev

# 서버 실행
npm start
```

### 3. 개발 도구

#### ESLint 설정
```javascript
// eslint.config.js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]
```

#### Vite 설정
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    },
    assetsDir: 'assets',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000
  },
  server: {
    proxy: {
      '/api/binance': {
        target: 'https://api.binance.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/binance/, ''),
        secure: true,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    }
  }
})
```

---

## 🏛️ 코드 구조 및 아키텍처

### 1. 컴포넌트 아키텍처

#### 계층적 구조
```
App
├── Router
│   ├── AuthProvider
│   ├── Layout Components
│   │   ├── Navbar
│   │   ├── Footer
│   │   └── Sidebar
│   └── Page Components
│       ├── Home
│       ├── LiveCoins
│       ├── AdvancedBacktest
│       └── Premium
└── Global Styles
```

#### 상태 관리 패턴
```javascript
// Context API 사용
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        setIsPremium(data.user.isPremium);
        localStorage.setItem('token', data.token);
        return { success: true };
      }
      
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: '로그인 중 오류가 발생했습니다.' };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsPremium(false);
    localStorage.removeItem('token');
  };

  const value = {
    user,
    isAuthenticated,
    isPremium,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 2. 데이터 플로우

#### 실시간 데이터 흐름
```
WebSocket API → State Management → Component Update → UI Render
     ↓
  Binance API
     ↓
  Data Processing
     ↓
  React State
     ↓
  Component Re-render
```

#### 백테스트 데이터 흐름
```
User Input → Config Validation → Algorithm Execution → Results Processing → UI Update
     ↓              ↓                    ↓                   ↓              ↓
  Form Data    Parameter Check    Calculate Indicators  Format Results  Chart/Table
     ↓              ↓                    ↓                   ↓              ↓
  Strategy      Risk Management    Signal Generation    Performance     Visualization
```

### 3. 모듈화 구조

#### 유틸리티 모듈
```javascript
// utils/index.js
export { default as backtest } from './backtest';
export { default as advancedBacktest } from './advancedBacktest';
export { default as replayBacktest } from './replayBacktest';
export { default as indicators } from './indicators';
export { default as risk } from './risk';
export { default as formatting } from './formatting';
```

#### 컴포넌트 모듈
```javascript
// components/index.js
export { default as Navbar } from './Navbar';
export { default as Footer } from './Footer';
export { default as CoinTable } from './CoinTable';
export { default as ChartViewWidget } from './ChartViewWidget';
export { default as TradingViewChart } from './TradingViewChart';
export { default as PremiumModal } from './PremiumModal';
```

### 4. 에러 처리

#### 전역 에러 바운더리
```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // 에러 로깅 서비스에 전송
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>문제가 발생했습니다</h2>
          <button onClick={() => window.location.reload()}>
            페이지 새로고침
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 📊 성능 지표

### 1. 핵심 웹 지표 (Core Web Vitals)
- **LCP (Largest Contentful Paint)**: < 2.5초
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### 2. 백테스트 성능
- **처리 속도**: 1,000개 데이터 포인트 < 1초
- **메모리 사용량**: < 100MB
- **동시 처리**: 최대 10개 백테스트

### 3. 실시간 데이터
- **지연 시간**: < 100ms
- **업데이트 빈도**: 1초당 1회
- **연결 안정성**: 99.9% 업타임

---

## 🎯 개발 로드맵

### Phase 1: 기본 기능 완성 (완료)
- [x] 실시간 코인 모니터링
- [x] 기본 차트 분석
- [x] 고급 백테스트 시스템
- [x] 리플레이 기능

### Phase 2: 사용자 경험 향상 (진행중)
- [x] 차트 줌/드래그 기능
- [x] SEO 최적화
- [ ] 모바일 최적화
- [ ] PWA 기능 완성

### Phase 3: 고급 기능 추가 (계획)
- [ ] 사용자 정의 전략 생성
- [ ] 소셜 트레이딩 기능
- [ ] AI 기반 전략 추천
- [ ] 알림 시스템

### Phase 4: 확장 (계획)
- [ ] 모바일 앱 개발
- [ ] 다국어 지원
- [ ] 추가 거래소 연동
- [ ] 기관 투자자 도구

---

## 🤝 팀 구성

### 필요 역할
1. **Frontend Developer** (React/TypeScript)
2. **Backend Developer** (Node.js/Python)
3. **DevOps Engineer** (AWS/Docker)
4. **QA Engineer** (Test Automation)
5. **UI/UX Designer** (Figma/Adobe)

### 협업 도구
- **코드 관리**: GitHub
- **프로젝트 관리**: Notion/Jira
- **커뮤니케이션**: Slack/Discord
- **디자인**: Figma
- **문서화**: Gitbook/Confluence

---

## 📝 참고 자료

### 외부 문서
- [Binance API Documentation](https://binance-docs.github.io/apidocs/)
- [TradingView Charting Library](https://www.tradingview.com/charting-library/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

### 내부 문서
- API 명세서
- 코딩 컨벤션
- 배포 가이드
- 트러블슈팅 가이드

---

**작성일**: 2024년 1월
**작성자**: BitView 개발팀
**문서 버전**: v1.0 