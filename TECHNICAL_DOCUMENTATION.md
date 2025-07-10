# BitView 프로젝트 기술 문서

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [프로젝트 구조](#프로젝트-구조)
4. [Firebase 클라우드 아키텍처](#firebase-클라우드-아키텍처)
5. [주요 기능](#주요-기능)
6. [알고리즘 및 핵심 로직](#알고리즘-및-핵심-로직)
7. [Firebase 데이터베이스 설계](#firebase-데이터베이스-설계)
8. [성능 최적화](#성능-최적화)
9. [보안 구현](#보안-구현)
10. [배포 환경](#배포-환경)
11. [개발 환경 설정](#개발-환경-설정)
12. [코드 구조 및 아키텍처](#코드-구조-및-아키텍처)

---

## 📊 프로젝트 개요

**BitView**는 전문가급 암호화폐 분석 플랫폼으로, 실시간 시세 조회, 차트 분석, 고급 백테스트 기능을 제공하는 React + Firebase 기반 웹 애플리케이션입니다.

### 주요 특징
- 🔥 **Firebase 클라우드 네이티브** 아키텍처
- 📊 실시간 암호화폐 시세 추적
- 📈 전문가급 차트 분석 도구
- 🧮 고급 백테스트 시뮬레이션
- 🔄 리플레이 기능으로 실시간 전략 검증
- 📱 반응형 디자인 및 PWA 지원
- 🌐 글로벌 접근성 및 실시간 동기화

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

### 🔥 Firebase 클라우드
- **Firebase Authentication**: 사용자 인증
- **Cloud Firestore**: NoSQL 데이터베이스
- **Firebase Analytics**: 사용자 분석
- **Firebase Hosting**: 정적 호스팅

### 개발 도구
- **ESLint**: 9.25.0 (코드 품질)
- **Vite**: 개발 서버 및 빌드

### 외부 API
- **Binance API**: 실시간 암호화폐 데이터
- **WebSocket**: 실시간 시세 스트림

---

## 🏗️ 프로젝트 구조

```
bitview/
├── src/
│   ├── components/            # 재사용 가능한 컴포넌트
│   │   ├── ChartViewWidget.jsx
│   │   ├── CoinTable.jsx
│   │   ├── TradingViewChart.jsx
│   │   ├── AdvancedBacktestPanel.jsx
│   │   ├── CryptoCards.jsx
│   │   ├── Features.jsx
│   │   ├── Footer.jsx
│   │   ├── Hero.jsx
│   │   ├── Navbar.jsx
│   │   ├── PremiumModal.jsx
│   │   ├── Services.jsx
│   │   ├── SimpleTradingViewChart.jsx
│   │   ├── Statistics.jsx
│   │   └── TradingViewWidget.jsx
│   ├── pages/                 # 페이지 컴포넌트
│   │   ├── AdvancedBacktest.jsx
│   │   ├── Chart.jsx
│   │   ├── LiveCoins.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Premium.jsx
│   │   ├── ProfitCalculator.jsx
│   │   ├── FundingCalculator.jsx
│   │   ├── Admin.jsx
│   │   ├── Terms.jsx
│   │   └── Privacy.jsx
│   ├── context/               # React Context
│   │   └── AuthContext.jsx
│   ├── firebase/              # Firebase 설정
│   │   └── config.js
│   ├── utils/                 # 유틸리티 함수
│   │   ├── firebase-auth.js   # Firebase 인증 유틸리티
│   │   ├── advancedBacktest.js
│   │   ├── replayBacktest.js
│   │   └── backtest.js
│   ├── App.jsx               # 메인 앱 컴포넌트
│   └── main.jsx              # 엔트리 포인트
├── public/                   # 정적 파일
│   ├── robots.txt
│   ├── sitemap.xml
│   └── site.webmanifest
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 🔥 Firebase 클라우드 아키텍처

### 인증 시스템
```javascript
// Firebase Authentication 설정
import { getAuth } from "firebase/auth";
import { auth } from "../firebase/config";

// 사용자 인증 상태 관리
const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};
```

### 데이터베이스 구조
```javascript
// Firestore 데이터베이스 설계
firestore: {
  users: {
    [userId]: {
      displayName: string,
      email: string,
      createdAt: timestamp,
      exchange_registered: boolean,
      is_premium: boolean,
      last_login: timestamp
    }
  },
  favorites: {
    [docId]: {
      userId: string,
      coinId: string,
      createdAt: timestamp
    }
  }
}
```

### 실시간 동기화
- **사용자 상태**: 자동 동기화
- **즐겨찾기**: 실시간 업데이트
- **프리미엄 상태**: 즉시 반영

---

## 🎯 주요 기능

### 1. 🔐 Firebase 인증 시스템
- 이메일/비밀번호 인증
- 비밀번호 재설정 이메일
- 실시간 인증 상태 동기화
- 자동 로그인 유지

### 2. 📊 실시간 코인 모니터링 (`/live-coins`)
- 실시간 가격 업데이트
- 24시간 변동률 표시
- 개인화된 즐겨찾기 (Firebase 동기화)
- 정렬 및 필터링
- 페이지네이션

### 3. 📈 차트 분석 (`/chart`)
- TradingView 통합 차트
- 다양한 시간 간격 (1분~1개월)
- 기술적 지표 표시
- 마우스 줌/드래그 기능

### 4. 🧮 고급 백테스트 (`/advanced-backtest`)
- 4가지 고급 전략
- 리플레이 기능
- 실시간 성과 분석
- 위험 관리 도구

### 5. 🔧 계산기 도구
- 수익률 계산기 (`/profit-calculator`)
- 펀딩 수수료 계산기 (`/funding-calculator`)

### 6. 👑 프리미엄 기능 (`/premium`)
- 거래소 연동 프리미엄
- 고급 분석 도구
- 무제한 백테스트

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

    const avgGain = gains.slice(i - period + 1, i + 1)
      .reduce((a, b) => a + b) / period;
    const avgLoss = losses.slice(i - period + 1, i + 1)
      .reduce((a, b) => a + b) / period;
    
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

### 3. 리플레이 시스템

#### 실시간 백테스트 재생
```javascript
export const startReplayBacktest = (
  data, 
  config, 
  onProgress,
  onComplete,
  speed = 100
) => {
  let currentIndex = 50;
  const results = [];
  
  const playNextCandle = () => {
    if (currentIndex >= data.length) {
      onComplete(results);
      return;
    }
    
    // 현재 캔들까지의 백테스트 실행
    const partialData = data.slice(0, currentIndex + 1);
    const result = runAdvancedBacktest(partialData, config);
    
    results.push(result);
    onProgress(result, currentIndex, data.length);
    
    currentIndex++;
    setTimeout(playNextCandle, speed);
  };
  
  playNextCandle();
};
```

---

## 🔥 Firebase 데이터베이스 설계

### 1. 사용자 컬렉션 (users)
```javascript
{
  [userId]: {
    displayName: "사용자명",
    email: "user@example.com",
    photoURL: "profile_image_url",
    createdAt: serverTimestamp(),
    exchange_registered: false,
    is_premium: false,
    premium_expires: null,
    last_login: serverTimestamp(),
    updated_at: serverTimestamp()
  }
}
```

### 2. 즐겨찾기 컬렉션 (favorites)
```javascript
{
  [docId]: {
    userId: "user_uid",
    coinId: "BTCUSDT",
    createdAt: serverTimestamp()
  }
}
```

### 3. 데이터 접근 패턴
```javascript
// 사용자 즐겨찾기 조회
const getUserFavorites = async (userId) => {
  const favoritesRef = collection(db, 'favorites');
  const q = query(favoritesRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  
  const favorites = [];
  querySnapshot.forEach((doc) => {
    favorites.push(doc.data().coinId);
  });
  
  return favorites;
};
```

---

## 🚀 성능 최적화

### 1. 프론트엔드 최적화
- **Code Splitting**: React.lazy로 페이지별 분할
- **Memoization**: React.memo로 불필요한 리렌더링 방지
- **Virtual Scrolling**: 대용량 코인 목록 가상화
- **Image Optimization**: WebP 형식 및 lazy loading

### 2. Firebase 최적화
- **쿼리 최적화**: 복합 인덱스 활용
- **실시간 리스너**: 필요한 경우만 구독
- **캐싱**: 중복 요청 방지
- **배치 작업**: 여러 작업을 하나의 트랜잭션으로

### 3. 차트 성능
- **Canvas 렌더링**: 고성능 차트 그리기
- **데이터 샘플링**: 큰 데이터셋 간소화
- **메모리 관리**: 차트 인스턴스 적절한 정리

---

## 🛡️ 보안 구현

### 1. Firebase 보안 규칙
```javascript
// Firestore 보안 규칙
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자는 자신의 데이터만 읽고 쓸 수 있음
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 즐겨찾기는 소유자만 관리 가능
    match /favorites/{docId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

### 2. 클라이언트 보안
- **입력 검증**: 모든 사용자 입력 검증
- **XSS 방지**: 적절한 이스케이핑
- **CSRF 방지**: Firebase 기본 보안 기능 활용
- **API 키 보호**: 환경 변수 사용

---

## 🌐 배포 환경

### 1. Netlify 배포
```bash
# 빌드 명령어
npm run build

# 배포 설정 (netlify.toml)
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 2. Firebase 호스팅 (선택적)
```bash
# Firebase 호스팅 설정
firebase init hosting
firebase deploy
```

### 3. 환경 변수
```javascript
// .env.local
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 🛠️ 개발 환경 설정

### 1. 프로젝트 초기화
```bash
# 저장소 클론
git clone https://github.com/your-username/bitview.git
cd bitview

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 2. Firebase 설정
```bash
# Firebase CLI 설치
npm install -g firebase-tools

# Firebase 로그인
firebase login

# 프로젝트 설정
firebase init
```

### 3. 환경 변수 설정
```bash
# .env.local 파일 생성
touch .env.local

# Firebase 설정 정보 추가
echo "VITE_FIREBASE_API_KEY=your_api_key" >> .env.local
# ... 기타 설정
```

---

## 📚 코드 구조 및 아키텍처

### 1. 컴포넌트 구조
```javascript
// 기본 컴포넌트 구조
const Component = () => {
  const [state, setState] = useState(initialState);
  const { user } = useAuth();
  
  useEffect(() => {
    // 초기화 로직
  }, []);
  
  return (
    <motion.div>
      {/* JSX */}
    </motion.div>
  );
};
```

### 2. Firebase 인증 플로우
```javascript
// AuthContext.jsx
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // 사용자 프로필 로드
        const profile = await getUserProfile(firebaseUser.uid);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);
  
  // ... 기타 로직
};
```

### 3. 상태 관리
- **Context API**: 전역 상태 관리
- **useState**: 컴포넌트 로컬 상태
- **useEffect**: 사이드 이펙트 처리
- **Firebase 실시간 리스너**: 서버 상태 동기화

---

## 📈 성능 모니터링

### 1. Firebase Analytics
```javascript
// 사용자 이벤트 추적
import { analytics } from '../firebase/config';
import { logEvent } from "firebase/analytics";

// 백테스트 실행 추적
logEvent(analytics, 'backtest_run', {
  strategy: 'TRIPLE_MA',
  duration: 'session'
});
```

### 2. 성능 메트릭
- **페이지 로드 시간**: Lighthouse 점수
- **상호작용 지연**: Firebase Performance
- **에러 추적**: Firebase Crashlytics
- **사용자 플로우**: Firebase Analytics

---

## 🔮 향후 계획

### 1. 기능 확장
- 더 많은 백테스트 전략 추가
- 실시간 알림 시스템
- 모바일 앱 개발
- 소셜 기능 (커뮤니티)

### 2. 성능 향상
- GraphQL 도입
- PWA 기능 강화
- 오프라인 지원
- 다국어 지원

### 3. 사업 확장
- 프리미엄 기능 확대
- API 제공 서비스
- 교육 콘텐츠
- 파트너십 확대

---

## 📞 문의 및 지원

개발 관련 문의: [GitHub Issues](https://github.com/your-username/bitview/issues)  
사업 문의: contact@bitview.com

---

**BitView** - 전문가급 암호화폐 분석 플랫폼 🚀 