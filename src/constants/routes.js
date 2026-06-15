/** 앱 라우트 경로 — Navbar·Router·레이아웃에서 단일 소스로 사용 */
export const ROUTES = {
  HOME: '/',
  LIVE_COINS: '/live-coins',
  CHART: '/chart',
  ADVANCED_BACKTEST: '/advanced-backtest',
  PROFIT_CALCULATOR: '/profit-calculator',
  FUNDING_CALCULATOR: '/funding-calculator',
  PREMIUM: '/premium',
  LOGIN: '/login',
  SIGNUP: '/signup',
  ADMIN: '/admin',
  PRIVACY: '/privacy',
  TERMS: '/terms',
}

/** 풀폭 레이아웃(`.container` 없음) — premium·인증 페이지 */
export const FULL_WIDTH_ROUTES = [
  ROUTES.PREMIUM,
  ROUTES.LOGIN,
  ROUTES.SIGNUP,
]

export function isFullWidthRoute(pathname) {
  return FULL_WIDTH_ROUTES.includes(pathname)
}

export function isRealtimeRoute(pathname) {
  return pathname === ROUTES.LIVE_COINS || pathname === ROUTES.CHART
}

export function isCalculatorRoute(pathname) {
  return (
    pathname === ROUTES.PROFIT_CALCULATOR ||
    pathname === ROUTES.FUNDING_CALCULATOR ||
    pathname === ROUTES.ADVANCED_BACKTEST
  )
}

/** 네비게이션 메뉴 정의 (데스크톱·모바일 공통) */
export const NAV_REALTIME_LINKS = [
  { path: ROUTES.LIVE_COINS, label: '실시간 가격' },
  { path: ROUTES.CHART, label: '차트 보기' },
]

export const NAV_CALCULATOR_LINKS = [
  { path: ROUTES.PROFIT_CALCULATOR, label: '수익 계산기' },
  { path: ROUTES.FUNDING_CALCULATOR, label: '펀딩비 계산기' },
  { path: ROUTES.ADVANCED_BACKTEST, label: '고급 백테스트' },
]
