import React, { useState, useEffect, useCallback, useRef } from 'react'
import { ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { Play, RefreshCw, BarChart3, TrendingUp, TrendingDown, Settings } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import PremiumModal from '../components/PremiumModal'

const BacktestCalculator = () => {
  const { isAuthenticated, isPremium } = useAuth()
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  
  // 차트 데이터 상태
  const [symbol, setSymbol] = useState('BTCUSDT')
  const [interval, setChartInterval] = useState('1m')
  const [candleData, setCandleData] = useState([])
  const [loading, setLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  
  // WebSocket 연결 관리
  const wsRef = useRef(null)
  const priceWsRef = useRef(null)
  
  // 백테스트 설정
  const [backtestConfig, setBacktestConfig] = useState({
    strategy: 'MACD_RSI',
    initialCapital: 10000000,
    commission: 0.001,
    stopLoss: 0.05,
    takeProfit: 0.10
  })
  
  // 백테스트 결과
  const [backtestResults, setBacktestResults] = useState(null)
  const [isRunningBacktest, setIsRunningBacktest] = useState(false)
  
  // 활성 탭
  const [activeResultTab, setActiveResultTab] = useState('overview')
  
  // 차트 줌 상태
  const [zoomLevel, setZoomLevel] = useState(1)
  const [displayRange, setDisplayRange] = useState(100)
  const chartContainerRef = useRef(null)
  
  // 차트 팬(이동) 상태
  const [chartOffset, setChartOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, offset: 0 })
  
  // 실시간 가격 정보
  const [marketData, setMarketData] = useState({
    currentPrice: 0,
    indexPrice: 0,
    changePercent24h: 0,
    changeAmount24h: 0,
    high24h: 0,
    low24h: 0,
    binanceFundingRate: 0,
    bybitFundingRate: 0
  })
  
  // 차트 줌 핸들러
  const handleChartZoom = useCallback((event) => {
    event.preventDefault()
    
    const delta = event.deltaY
    const zoomFactor = 0.1
    
    if (delta < 0) {
      // 줌 인 (확대)
      setZoomLevel(prev => Math.min(prev + zoomFactor, 3))
      setDisplayRange(prev => Math.max(prev - 10, 20))
    } else {
      // 줌 아웃 (축소)
      setZoomLevel(prev => Math.max(prev - zoomFactor, 0.5))
      setDisplayRange(prev => Math.min(prev + 10, 500))
    }
  }, [])
  
  // 차트 드래그 핸들러
  const handleMouseDown = useCallback((event) => {
    setIsDragging(true)
    setDragStart({
      x: event.clientX,
      offset: chartOffset
    })
  }, [chartOffset])
  
  const handleMouseMove = useCallback((event) => {
    if (!isDragging) return
    
    const deltaX = event.clientX - dragStart.x
    const sensitivity = 0.5 // 드래그 민감도
    const newOffset = dragStart.offset + Math.round(deltaX * sensitivity)
    
    // 오프셋 범위 제한 (0부터 전체 데이터 길이까지)
    const maxOffset = Math.max(0, candleData.length - displayRange)
    setChartOffset(Math.max(0, Math.min(newOffset, maxOffset)))
  }, [isDragging, dragStart, candleData.length, displayRange])
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])
  
  // 차트 컨테이너에 이벤트 리스너 추가
  useEffect(() => {
    const chartContainer = chartContainerRef.current
    if (chartContainer) {
      chartContainer.addEventListener('wheel', handleChartZoom, { passive: false })
      chartContainer.addEventListener('mousedown', handleMouseDown)
      
      return () => {
        chartContainer.removeEventListener('wheel', handleChartZoom)
        chartContainer.removeEventListener('mousedown', handleMouseDown)
      }
    }
  }, [handleChartZoom, handleMouseDown])
  
  // 전역 마우스 이벤트 리스너 (드래그 중일 때)
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])
  
  // 펀딩 카운트다운을 위한 별도 상태

  
  // 코인 정보
  const coinInfo = {
    'BTCUSDT': { name: 'Bitcoin', symbol: 'BTC', color: '#f7931a', icon: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png' },
    'ETHUSDT': { name: 'Ethereum', symbol: 'ETH', color: '#6b7280', icon: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
    'XRPUSDT': { name: 'Ripple', symbol: 'XRP', color: '#23292f', icon: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png' },
    'SOLUSDT': { name: 'Solana', symbol: 'SOL', color: '#6b7280', icon: 'https://assets.coingecko.com/coins/images/4128/small/solana.png' },
    'DOGEUSDT': { name: 'Dogecoin', symbol: 'DOGE', color: '#c2a633', icon: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png' }
  }

  // 실시간 시장 데이터 WebSocket 연결
  const connectPriceWebSocket = useCallback(() => {
    if (priceWsRef.current) {
      priceWsRef.current.close()
    }
    
    const tickerWs = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`)
    
    tickerWs.onopen = () => {
      console.log('Price WebSocket 연결됨')
      setIsConnected(true)
    }
    
    tickerWs.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      setMarketData(prev => ({
        ...prev,
        currentPrice: parseFloat(data.c),
        indexPrice: parseFloat(data.c),
        changePercent24h: parseFloat(data.P),
        changeAmount24h: parseFloat(data.p),
        high24h: parseFloat(data.h),
        low24h: parseFloat(data.l)
      }))
    }
    
    tickerWs.onclose = () => {
      console.log('Price WebSocket 연결 종료')
      setIsConnected(false)
      // 3초 후 재연결 시도
      setTimeout(() => {
        console.log('Price WebSocket 재연결 시도...')
        connectPriceWebSocket()
      }, 3000)
    }
    
    tickerWs.onerror = (error) => {
      console.error('Price WebSocket 오류:', error)
      setIsConnected(false)
    }
    
    priceWsRef.current = tickerWs
  }, [symbol])
  
  // 캔들스틱 데이터 WebSocket 연결
  const connectCandleWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
    }
    
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`)
    
    ws.onopen = () => {
      console.log('Candle WebSocket 연결됨')
    }
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      const kline = data.k
      
      if (kline.x) { // 캔들이 닫혔을 때만 업데이트
                 const d = new Date(kline.t)
                 const newCandle = {
                   dateLabel: d.toLocaleString('ko-KR', { month: '2-digit', day: '2-digit' }),
                   timeLabel: d.toLocaleString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true }),
                   timestamp: kline.t,
                   open: parseFloat(kline.o),
                   high: parseFloat(kline.h),
                   low: parseFloat(kline.l),
                   close: parseFloat(kline.c),
                   volume: parseFloat(kline.v),
                   price: parseFloat(kline.c)
                 }
        
        setCandleData(prev => {
          const newData = [...prev]
          const lastIndex = newData.length - 1
          
          if (newData[lastIndex] && newData[lastIndex].timestamp === kline.t) {
            newData[lastIndex] = newCandle
      } else {
            newData.push(newCandle)
            if (newData.length > 500) {
              newData.shift()
            }
          }
          
          return newData
        })
      }
    }
    
    ws.onclose = () => {
      console.log('Candle WebSocket 연결 종료')
      // 3초 후 재연결 시도
      setTimeout(() => {
        console.log('Candle WebSocket 재연결 시도...')
        connectCandleWebSocket()
      }, 3000)
    }
    
    ws.onerror = (error) => {
      console.error('Candle WebSocket 오류:', error)
    }
    
    wsRef.current = ws
  }, [symbol, interval])
  
  // 초기 캔들스틱 데이터 가져오기
  const fetchInitialCandleData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=500`
      )
      const data = await response.json()
      
             const formattedData = data.map(candle => {
               const d = new Date(candle[0])
               return {
                 dateLabel: d.toLocaleString('ko-KR', { month: '2-digit', day: '2-digit' }),
                 timeLabel: d.toLocaleString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true }),
                 timestamp: candle[0],
                 open: parseFloat(candle[1]),
                 high: parseFloat(candle[2]),
                 low: parseFloat(candle[3]),
                 close: parseFloat(candle[4]),
                 volume: parseFloat(candle[5]),
                 price: parseFloat(candle[4])
               }
             })
      
      setCandleData(formattedData)
    } catch (error) {
      console.error('초기 캔들 데이터 가져오기 실패:', error)
    } finally {
      setLoading(false)
    }
  }, [symbol, interval])
  
  // 바이낸스 펀딩 레이트 가져오기
  const fetchBinanceFundingRate = useCallback(async () => {
    try {
      // 바이낸스 선물 펀딩 레이트 API
      const response = await fetch(`https://fapi.binance.com/fapi/v1/fundingRate?symbol=${symbol}&limit=1`)
      const data = await response.json()
      
      if (data && data.length > 0 && data[0].fundingRate) {
        const fundingRate = parseFloat(data[0].fundingRate) * 100
        console.log('바이낸스 펀딩 레이트 (실제):', data[0].fundingRate, '-> ', fundingRate + '%')
        setMarketData(prev => ({
          ...prev,
          binanceFundingRate: fundingRate
        }))
      } else {
        // 대체 API 시도
        const altResponse = await fetch(`https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${symbol}`)
        const altData = await altResponse.json()
        
        if (altData.lastFundingRate) {
          const fundingRate = parseFloat(altData.lastFundingRate) * 100
          console.log('바이낸스 펀딩 레이트 (대체):', altData.lastFundingRate, '-> ', fundingRate + '%')
          setMarketData(prev => ({
            ...prev,
            binanceFundingRate: fundingRate
          }))
        }
      }
    } catch (error) {
      console.error('바이낸스 펀딩 레이트 가져오기 실패:', error)
    }
  }, [symbol])

  // 바이비트 펀딩 레이트 가져오기
  const fetchBybitFundingRate = useCallback(async () => {
    try {
      // 바이비트 현재 펀딩 레이트 API
      const response = await fetch(`https://api.bybit.com/v5/market/tickers?category=linear&symbol=${symbol}`)
      const data = await response.json()
      
      if (data.result && data.result.list && data.result.list.length > 0) {
        const ticker = data.result.list[0]
        const fundingRate = parseFloat(ticker.fundingRate || 0) * 100
        console.log('바이비트 펀딩 레이트 (원본):', ticker.fundingRate, '-> ', fundingRate + '%')
        setMarketData(prev => ({
          ...prev,
          bybitFundingRate: fundingRate
        }))
    } else {
        console.log('바이비트 API 응답:', data)
      }
    } catch (error) {
      console.error('바이비트 펀딩 레이트 가져오기 실패:', error)
    }
  }, [symbol])



  // 24시간 통계 데이터 가져오기
  const fetchMarketData = useCallback(async () => {
    try {
      const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
      const data = await response.json()
      
      setMarketData(prev => ({
        ...prev,
        currentPrice: parseFloat(data.lastPrice),
        indexPrice: parseFloat(data.lastPrice),
        changePercent24h: parseFloat(data.priceChangePercent),
        changeAmount24h: parseFloat(data.priceChange),
        high24h: parseFloat(data.highPrice),
        low24h: parseFloat(data.lowPrice)
      }))
      
    } catch (error) {
      console.error('시장 데이터 가져오기 실패:', error)
    }
  }, [symbol])

  const [backtestPeriod, setBacktestPeriod] = useState({
    startDate: '',
    endDate: '',
  });

  // 초기 데이터 로드 및 WebSocket 연결
  useEffect(() => {
    const initializeData = async () => {
      await fetchMarketData()
      await fetchInitialCandleData()
      await fetchBinanceFundingRate()
      await fetchBybitFundingRate()
      
      // WebSocket 연결
      connectPriceWebSocket()
      connectCandleWebSocket()
    }
    
    initializeData()
    
    // 펀딩 레이트 주기적 업데이트 (10초마다)
    const fundingInterval = setInterval(() => {
      fetchBinanceFundingRate()
      fetchBybitFundingRate()
    }, 10000) // 10초마다
    

    
    // 컴포넌트 언마운트 시 정리
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (priceWsRef.current) {
        priceWsRef.current.close()
      }
      clearInterval(fundingInterval)
    }
  }, [symbol, interval, fetchMarketData, fetchInitialCandleData, fetchBinanceFundingRate, fetchBybitFundingRate, connectPriceWebSocket, connectCandleWebSocket])

  // 심볼이나 인터벌 변경 시 WebSocket 재연결 (초기 로드 제외)
    useEffect(() => {
    if (candleData.length > 0) { // 초기 데이터가 로드된 후에만 재연결
      // 펀딩 레이트 초기화 (로딩중 표시를 위해)
      setMarketData(prev => ({
        ...prev,
        binanceFundingRate: 0,
        bybitFundingRate: 0
      }))
      
      connectPriceWebSocket()
      connectCandleWebSocket()
      // 펀딩 레이트도 다시 가져오기
      fetchBinanceFundingRate()
      fetchBybitFundingRate()
    }
  }, [symbol, interval, connectPriceWebSocket, connectCandleWebSocket, fetchBinanceFundingRate, fetchBybitFundingRate, candleData.length])

  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(new Date().setDate(today.getDate() - 30));
    setBacktestPeriod({
      startDate: thirtyDaysAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
    });
  }, []);

  // 캔들스틱 차트 컴포넌트
  const CandlestickChart = ({ data, offset }) => {
    if (!data || data.length === 0) {
      return (
        <div style={{ 
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#7d8590'
        }}>
          차트 데이터를 불러오는 중...
        </div>
      )
    }

    const margin = { top: 10, right: 60, bottom: 20, left: 10 }
    const width = 800 - margin.left - margin.right
    const height = 380 - margin.top - margin.bottom

    // 줌 레벨과 오프셋에 따른 표시 데이터 조정
    const maxOffset = Math.max(0, data.length - displayRange)
    const actualOffset = Math.min(offset || 0, maxOffset)
    const startIndex = Math.max(0, data.length - displayRange - actualOffset)
    const endIndex = Math.min(data.length, startIndex + displayRange)
    const visibleData = data.slice(startIndex, endIndex)
    
    if (visibleData.length === 0) return null
      
      const maxPrice = Math.max(...visibleData.map(d => d.high))
      const minPrice = Math.min(...visibleData.map(d => d.low))
      const priceRange = maxPrice - minPrice
      
      const xScale = (index) => margin.left + (index * width) / visibleData.length
      const yScale = (price) => margin.top + ((maxPrice - price) / priceRange) * height
      
    return (
      <svg width="100%" height="100%" viewBox={`0 0 800 430`}>
        {/* 캔들스틱 */}
        {visibleData.map((candle, index) => {
        const x = xScale(index)
          const isGreen = candle.close > candle.open
          const color = isGreen ? '#62af73' : '#d25351'
        
        const highY = yScale(candle.high)
        const lowY = yScale(candle.low)
        const openY = yScale(candle.open)
        const closeY = yScale(candle.close)
        
          const bodyTop = Math.min(openY, closeY)
        const bodyHeight = Math.abs(closeY - openY)
          const candleWidth = Math.max(2, width / visibleData.length - 2)
          
          return (
            <g key={candle.timestamp}>
              {/* 심지 */}
              <line
                x1={x + candleWidth / 2}
                y1={highY}
                x2={x + candleWidth / 2}
                y2={lowY}
                stroke={color}
                strokeWidth="1"
              />
              {/* 몸체 */}
              <rect
                x={x}
                y={bodyTop}
                width={candleWidth}
                height={Math.max(1, bodyHeight)}
                fill={isGreen ? color : color}
                stroke={color}
                strokeWidth="1"
              />
            </g>
          )
        })}
        
        {/* Y축 라벨 */}
        {Array.from({ length: 6 }, (_, i) => {
          const price = minPrice + (priceRange * i / 5)
          const y = yScale(price)
          return (
            <g key={i}>
              <line
                x1={margin.left}
                y1={y}
                x2={margin.left + width}
                y2={y}
                stroke="#30363d"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <text
                x={margin.left + width + 10}
                y={y + 4}
                textAnchor="start"
                fontSize="12"
                fill="#7d8590"
              >
                {price.toLocaleString()}
              </text>
            </g>
          )
        })}
        
                 {/* X축 라벨 */}
         {visibleData.map((candle, index) => {
           if (index % 20 === 0) {
             const x = xScale(index)
             return (
               <text
                 key={index}
                 x={x}
                 y={height + margin.top + 20}
                 textAnchor="middle"
                 fontSize="10"
                 fill="#7d8590"
               >
                 <tspan x={x} dy="0">{candle.dateLabel}</tspan>
                 <tspan x={x} dy="12">{candle.timeLabel}</tspan>
               </text>
             )
           }
           return null
         })}
         
         {/* 현재 가격 라인 */}
         {visibleData.length > 0 && (
           <>
             <line
               x1={margin.left}
               y1={yScale(visibleData[visibleData.length - 1].close)}
               x2={margin.left + width}
               y2={yScale(visibleData[visibleData.length - 1].close)}
               stroke="#f78166"
               strokeWidth="2"
               strokeDasharray="4,4"
               opacity="0.8"
             />
             <text
               x={margin.left + width + 5}
               y={yScale(visibleData[visibleData.length - 1].close) + 4}
               fontSize="12"
               fill="#f78166"
               fontWeight="bold"
             >
               {visibleData[visibleData.length - 1].close.toLocaleString()}
             </text>
           </>
         )}
       </svg>
    )
  }

  // 백테스트 실행
  const runBacktest = async () => {
    if (!isPremium) {
      setShowPremiumModal(true)
      return
    }

    try {
      setIsRunningBacktest(true)
      setBacktestResults(null)

      const { startDate, endDate } = backtestPeriod
      const startTime = new Date(startDate).getTime()
      const endTime = new Date(endDate).getTime()

      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&startTime=${startTime}&endTime=${endTime}&limit=1000`
      )
      
      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.statusText}`)
      }
      
      const rawData = await response.json()

      if (rawData.length === 0) {
        alert("선택한 기간에 대한 데이터가 없습니다. 기간을 다시 설정해주세요.")
        setIsRunningBacktest(false)
        return
      }

      const historicalData = rawData.map(candle => ({
         timestamp: candle[0],
         open: parseFloat(candle[1]),
         high: parseFloat(candle[2]),
         low: parseFloat(candle[3]),
         close: parseFloat(candle[4]),
      }))

      // 간단한 SMA 교차 전략 시뮬레이션 (임시)
      const simulateSmaCross = (data, config) => {
        const { initialCapital, commission } = config
        const shortPeriod = 10
        const longPeriod = 30

        if (data.length < longPeriod) return null

        const prices = data.map(d => d.close)
        const shortSma = Array.from({length: data.length})
        const longSma = Array.from({length: data.length})

        for(let i = shortPeriod - 1; i < data.length; i++) {
            const slice = prices.slice(i - shortPeriod + 1, i + 1)
            shortSma[i] = slice.reduce((a, b) => a + b, 0) / shortPeriod
        }
        for(let i = longPeriod - 1; i < data.length; i++) {
            const slice = prices.slice(i - longPeriod + 1, i + 1)
            longSma[i] = slice.reduce((a, b) => a + b, 0) / longPeriod
        }

        let capital = initialCapital
        let assets = 0
        let position = null
        let trades = []
        let portfolioHistory = [{ value: initialCapital, date: new Date(data[0].timestamp) }]
        
        let entryPrice = 0
        let entryDate = null

        for (let i = longPeriod; i < data.length; i++) {
            if (shortSma[i-1] < longSma[i-1] && shortSma[i] > longSma[i] && position === null) {
                // Buy
                const investment = capital
                entryPrice = data[i].close
                entryDate = new Date(data[i].timestamp)
                assets = investment / entryPrice
                capital = 0
                position = 'long'
            } else if (shortSma[i-1] > longSma[i-1] && shortSma[i] < longSma[i] && position === 'long') {
                // Sell
                const exitPrice = data[i].close
                const exitDate = new Date(data[i].timestamp)
                const investedCapital = assets * entryPrice
                capital = assets * exitPrice * (1 - commission)

                const pnl = capital - investedCapital
                const pnlPercent = (pnl / investedCapital) * 100

                trades.push({
                    type: 'Long',
                    entryDate,
                    entryPrice,
                    exitDate,
                    exitPrice,
                    pnl,
                    pnlPercent
                })
                
                assets = 0
                position = null
            }
            portfolioHistory.push({ value: capital + (assets * data[i].close), date: new Date(data[i].timestamp) })
        }

        const finalCapital = capital + (assets * data[data.length-1].close)
        const wins = trades.filter(t => t.pnl > 0).length
        const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0
        
        return {
          totalReturn: ((finalCapital - initialCapital) / initialCapital) * 100,
          maxDrawdown: -10.5, // Dummy
          sharpeRatio: 1.5, // Dummy
          totalTrades: trades.length,
          winRate: winRate,
          volatility: 15, // Dummy
          portfolio: portfolioHistory,
          trades: trades.reverse()
        }
      }

      const results = simulateSmaCross(historicalData, backtestConfig)
      setBacktestResults(results)

    } catch (error) {
      console.error('백테스트 실행 실패:', error)
      alert(`백테스트 실행 중 오류가 발생했습니다: ${error.message}`)
    } finally {
      setIsRunningBacktest(false)
    }
  }
  
  return (
    <div className="profit-calculator-page">
      {/* 모바일 전용 헤더 */}
      <div className="mobile-page-header">
        <h1 className="mobile-page-title">백테스트</h1>
        <p className="mobile-page-description">과거 데이터를 기반으로 다양한 투자 전략을 시뮬레이션해보세요.</p>
      </div>
      
      <div className="calculator-container">
        <div className="calculator-content">
          <div className="main-content">
            <div className="advanced-backtest-wrapper">
      <style>{`
        .advanced-backtest-wrapper {
          width: 100%;
          padding-top: 20px;
        }
        
        .backtest-main-content {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          align-items: flex-start;
          margin-top: 0;
        }
        
        .chart-section {
          flex: 1;
          min-width: 800px;
          background: none;
          border-radius: 16px;
          overflow: visible;
          border: 1px solid #374151;
          position: relative;
        }
        
        .chart-header {
          background: none;
        }
        
        .chart-config-select {
          background: #111111;
          color: #ffffff;
          border: 1px solid #374151;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 14px;
        }
        
        .chart-container {
          height: 430px;
          padding: 10px;
          background: none;
          position: relative;
          margin-top: 10px;
          border: none;
        }
        
        .right-panel {
          width: 300px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 16px;
          padding: 30px 20px;
          border: 1px solid #374151;
          height: fit-content;
        }
        
        .config-group {
          margin-bottom: 16px;
        }
        
        .config-label {
          display: block;
          margin-bottom: 6px;
          font-size: 14px;
          color: #ffffff;
          font-weight: 500;
          text-align: left;
        }
        
        .config-select,
        .config-input {
          width: 100%;
          background: #111111;
          color: #ffffff;
          border: 1px solid #374151;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        
        .config-select:focus,
        .config-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .unit-label {
          position: absolute;
          right: 10px;
          color: #9ca3af;
          font-size: 12px;
          pointer-events: none;
        }
        
        .run-backtest-btn {
          width: 100%;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          border: none;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        .run-backtest-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }
        
        .run-backtest-btn:disabled {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          cursor: not-allowed;
          transform: none;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          opacity: 0.5;
        }
        
        .results-section {
          margin-top: 20px;
          margin-bottom: 60px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 16px;
          padding: 30px;
          border: 1px solid #374151;
        }
        
        .results-tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          border-bottom: 1px solid #374151;
        }
        
        .results-tab {
          padding: 10px 16px;
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .results-tab.active {
          color: #ffffff;
          border-bottom-color: #3b82f6;
        }
        
        .results-tab:hover {
          color: #ffffff;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }
        
        .stat-card {
          background: rgba(255, 255, 255, 0.02);
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #374151;
          transition: all 0.2s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .stat-title {
          font-size: 12px;
          color: #9ca3af;
          margin-bottom: 8px;
          font-weight: 500;
        }
        
        .stat-value {
          font-size: 20px;
          font-weight: 600;
          color: #ffffff;
        }
        
        .stat-value.positive {
          color: #10b981;
        }
        
        .stat-value.negative {
          color: #ef4444;
        }
        
        .stat-value.neutral {
          color: #f59e0b;
        }
        
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          color: #7d8590;
          text-align: center;
        }
        
        .empty-state-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        .time-btn {
          color: #9ca3af;
          background: none;
          border: none;
          font-size: 13px;
          padding: 8px 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .time-btn.active {
          color: #3b82f6;
          font-weight: 700;
        }
        .time-btn:hover {
          color: #fff;
        }

        .date-range-picker {
          display: flex;
          align-items: center;
          background: #111111;
          border: 1px solid #374151;
          border-radius: 8px;
          transition: all 0.2s ease;
        }
        
        .date-range-picker:focus-within {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .date-range-input {
          background: transparent;
          border: none;
          color: #ffffff;
          padding: 10px 12px;
          font-size: 14px;
          width: 100%;
        }

        .date-range-input:focus {
          outline: none;
        }
        
        .date-range-input::-webkit-calendar-picker-indicator {
          display: none;
          -webkit-appearance: none;
        }
        
        .date-range-separator {
          color: #9ca3af;
        }

        @media (max-width: 768px) {
          .advanced-backtest-container {
            padding: 80px 16px 20px 16px;
          }

          .backtest-main-content {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .chart-section {
            min-height: 450px;
          }

          .chart-header {
            padding: 12px;
          }

          .chart-header > div {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .chart-header > div > div:first-child {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
          }

          .chart-header > div > div:nth-child(2) {
            display: flex;
            flex-direction: column;
            gap: 6px;
            width: 100%;
            align-items: flex-start;
          }

          .chart-header > div > div:nth-child(2) > div {
            width: 100%;
            text-align: left;
          }

          .chart-container {
            height: 400px;
          }

          .right-panel {
            order: -1;
            padding: 20px;
            min-height: 600px;
          }

          .config-group {
            margin-bottom: 18px;
          }

          .config-label {
            font-size: 14px;
            margin-bottom: 8px;
          }

          .config-input,
          .config-select {
            padding: 12px 14px;
            font-size: 14px;
          }

          .date-range-input {
            padding: 10px 12px;
            font-size: 14px;
          }

          .run-backtest-btn {
            padding: 14px 18px;
            font-size: 15px;
            margin-top: 25px;
          }

          .results-section {
            padding: 20px;
            min-height: 500px;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }

          .stat-card {
            padding: 16px;
          }

          .stat-title {
            font-size: 13px;
          }

          .stat-value {
            font-size: 18px;
          }

          .time-btn {
            padding: 8px 12px;
            font-size: 13px;
          }

          table {
            font-size: 13px;
          }

          table th,
          table td {
            padding: 10px 8px !important;
            font-size: 12px !important;
          }
        }

        @media (max-width: 480px) {
          .advanced-backtest-container {
            padding: 70px 12px 15px 12px;
          }

          .backtest-main-content {
            gap: 16px;
          }

          .chart-section {
            min-height: 400px;
          }

          .chart-header {
            padding: 10px;
          }

          .chart-header > div {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
          }

          .chart-header > div > div:first-child {
            display: flex;
            align-items: center;
            gap: 10px;
            width: 100%;
          }

          .chart-header > div > div:nth-child(2) {
            display: flex;
            flex-direction: column;
            gap: 4px;
            width: 100%;
            align-items: flex-start;
          }

          .chart-header > div > div:nth-child(2) > div {
            width: 100%;
            text-align: left;
          }

          .chart-container {
            height: 350px;
          }

          .right-panel {
            padding: 16px;
            min-height: 550px;
          }

          .config-group {
            margin-bottom: 16px;
          }

          .config-label {
            font-size: 13px;
            margin-bottom: 8px;
          }

          .config-input,
          .config-select {
            padding: 10px 12px;
            font-size: 13px;
          }

          .date-range-input {
            padding: 8px 10px;
            font-size: 13px;
          }

          .run-backtest-btn {
            padding: 12px 16px;
            font-size: 14px;
            margin-top: 20px;
          }

          .results-section {
            padding: 16px;
            min-height: 450px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .stat-card {
            padding: 14px;
          }

          .stat-title {
            font-size: 12px;
          }

          .stat-value {
            font-size: 16px;
          }

          .time-btn {
            padding: 6px 10px;
            font-size: 12px;
          }

          table {
            font-size: 11px;
          }

          table th,
          table td {
            padding: 6px 4px !important;
            font-size: 10px !important;
          }

          .empty-state {
            padding: 20px;
            font-size: 14px;
          }

          .empty-state-icon {
            font-size: 32px;
            margin-bottom: 12px;
          }
        }
      `}</style>
      
              <div className="backtest-main-content">
        {/* 차트 섹션 */}
        <div className="chart-section">
          <div className="chart-header">
                <div style={{
                display: 'flex', 
                alignItems: 'center', 
                gap: '20px',
                padding: '4px 0',
                flexWrap: 'wrap',
                width: '100%',
                overflow: 'visible'
              }}>
                {/* 왼쪽: 현재 가격 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {coinInfo[symbol]?.icon ? (
                    <img 
                      src={coinInfo[symbol].icon} 
                      alt={coinInfo[symbol].name}
                      style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '14px',
                      fontWeight: 'bold'
                }}>
                      {symbol.slice(0, 1)}
                </div>
                  )}
                  <div>
                    <div style={{ 
                      fontSize: '24px', 
                      fontWeight: 'bold', 
                      color: '#ffffff'
                    }}>
                      {marketData.currentPrice > 0 ? marketData.currentPrice.toLocaleString() : '108,965.90'}
                    </div>
            </div>
          </div>
          
                {/* 중간: 시장 정보 */}
                <div style={{ 
                  display: 'flex', 
                  gap: '20px', 
                  flexWrap: 'wrap',
                  flex: 1,
                  overflow: 'visible'
                }}>
                  <div style={{ minWidth: '90px' }}>
                    <div style={{ fontSize: '11px', color: '#7d8590', marginBottom: '2px' }}>Index Price</div>
                    <div style={{ fontSize: '15px', color: '#e6edf3' }}>
                      {marketData.indexPrice > 0 ? marketData.indexPrice.toLocaleString() : '108,998.86'}
                    </div>
                  </div>
                  
                  <div style={{ minWidth: '160px' }}>
                    <div style={{ fontSize: '13px', color: '#7d8590', marginBottom: '2px' }}>24H Change %</div>
          <div style={{ 
                      fontSize: '15px', 
                      color: marketData.changePercent24h >= 0 ? '#62af73' : '#d25351'
                    }}>
                      {marketData.changePercent24h > 0 ? '+' : ''}{marketData.changePercent24h.toFixed(2)}% 
                      ({marketData.changeAmount24h > 0 ? '+' : ''}{marketData.changeAmount24h.toLocaleString()})
                    </div>
                  </div>
                  

                  
                  <div style={{ minWidth: '130px' }}>
                    <div style={{ fontSize: '11px', color: '#7d8590', marginBottom: '2px' }}>Binance Funding Rate</div>
                    <div style={{ 
                      fontSize: '15px', 
                      color: marketData.binanceFundingRate !== 0 ? 
                        (marketData.binanceFundingRate >= 0 ? '#62af73' : '#d25351') : '#7d8590'
                    }}>
                      {marketData.binanceFundingRate !== 0 ? 
                        (marketData.binanceFundingRate >= 0 ? '+' : '') + marketData.binanceFundingRate.toFixed(4) + '%' 
                        : '로딩중...'
                      }
                    </div>
                  </div>
                  
                  <div style={{ minWidth: '130px' }}>
                    <div style={{ fontSize: '11px', color: '#7d8590', marginBottom: '2px' }}>Bybit Funding Rate</div>
                    <div style={{ 
                      fontSize: '15px', 
                      color: marketData.bybitFundingRate !== 0 ? 
                        (marketData.bybitFundingRate >= 0 ? '#62af73' : '#d25351') : '#7d8590'
                    }}>
                      {marketData.bybitFundingRate !== 0 ? 
                        (marketData.bybitFundingRate >= 0 ? '+' : '') + marketData.bybitFundingRate.toFixed(4) + '%' 
                        : '로딩중...'
                      }
                    </div>
                  </div>
                  

                </div>
              </div>
            </div>
            
            {/* 차트 설정 */}
            <div>
              <div style={{ display: 'flex', gap: '0', alignItems: 'center', paddingLeft: '10px', marginTop: '10px' }}>
                {[
                  { label: '1분', value: '1m' },
                  { label: '5분', value: '5m' },
                  { label: '15분', value: '15m' },
                  { label: '30분', value: '30m' },
                  { label: '1시간', value: '1h' },
                  { label: '4시간', value: '4h' },
                  { label: '1일', value: '1d' },
                  { label: '1주', value: '1w' },
                  { label: '1달', value: '1M' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setChartInterval(opt.value)}
                    className={`time-btn${interval === opt.value ? ' active' : ''}`}
                  >
                    {opt.label}
                  </button>
                ))}
            </div>
          </div>
          
            {/* 차트 */}
            <div 
              className="chart-container"
              ref={chartContainerRef}
              style={{ 
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: 'none' // 드래그 중 텍스트 선택 방지
              }}
            >
              {loading ? (
                <div className="empty-state">
                  <RefreshCw className="animate-spin" size={48} />
                  <div>차트 데이터를 불러오는 중...</div>
                </div>
              ) : (
                <CandlestickChart data={candleData} offset={chartOffset} />
              )}
              
              {/* 줌 레벨 및 위치 표시 */}
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(0, 0, 0, 0.7)',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div>줌: {zoomLevel.toFixed(1)}x ({displayRange}개)</div>
                {chartOffset > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '10px', color: '#ccc' }}>
                      오프셋: -{chartOffset}
                    </span>
                    <button 
                      onClick={() => setChartOffset(0)}
                      style={{
                        background: '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '9px',
                        cursor: 'pointer'
                      }}
                    >
                      최신
                    </button>
                  </div>
                )}
              </div>
          </div>
        </div>
        
        {/* 오른쪽 패널 - 백테스트 설정 */}
          <div className="right-panel">
            <div className="config-group">
              <label className="config-label">백테스트 기간</label>
              <div className="date-range-picker">
                <input 
                  type="date"
                  className="date-range-input"
                  value={backtestPeriod.startDate}
                  onChange={(e) => setBacktestPeriod(prev => ({...prev, startDate: e.target.value}))}
                />
                <span className="date-range-separator">~</span>
                <input 
                  type="date"
                  className="date-range-input"
                  value={backtestPeriod.endDate}
                  onChange={(e) => setBacktestPeriod(prev => ({...prev, endDate: e.target.value}))}
                />
              </div>
            </div>
            
            <div className="config-group">
              <label className="config-label">전략</label>
              <select 
                className="config-select"
                value={backtestConfig.strategy}
                onChange={(e) => setBacktestConfig(prev => ({
                  ...prev,
                  strategy: e.target.value
                }))}
              >
                <option value="MACD_RSI">MACD + RSI</option>
                <option value="SMA_CROSS">이동평균선 교차</option>
                <option value="BOLLINGER">볼린저밴드</option>
              </select>
            </div>
            
            <div className="config-group">
              <label className="config-label">초기 자본</label>
              <div className="input-wrapper">
                <input 
                  type="text"
                  className="config-input"
                  value={backtestConfig.initialCapital.toLocaleString()}
                  onChange={(e) => {
                    const value = e.target.value.replace(/,/g, '')
                    if (!/^\d*$/.test(value)) return
                    setBacktestConfig(prev => ({
                      ...prev,
                      initialCapital: parseInt(value) || 0
                    }))
                  }}
                />
                <span className="unit-label">KRW</span>
              </div>
            </div>
            
            <div className="config-group">
              <label className="config-label">수수료</label>
              <div className="input-wrapper">
                <input 
                  type="number"
                  className="config-input"
                  value={backtestConfig.commission * 100}
                  step="0.01"
                  onChange={(e) => setBacktestConfig(prev => ({
                    ...prev,
                    commission: parseFloat(e.target.value) / 100
                  }))}
                />
                <span className="unit-label">%</span>
              </div>
            </div>
            
            <div className="config-group">
              <label className="config-label">스톱로스</label>
              <div className="input-wrapper">
                <input 
                  type="number"
                  className="config-input"
                  value={backtestConfig.stopLoss * 100}
                  step="0.1"
                  onChange={(e) => setBacktestConfig(prev => ({
                    ...prev,
                    stopLoss: parseFloat(e.target.value) / 100
                  }))}
                />
                <span className="unit-label">%</span>
              </div>
            </div>
            
            <div className="config-group">
              <label className="config-label">익절</label>
              <div className="input-wrapper">
                <input 
                  type="number"
                  className="config-input"
                  value={backtestConfig.takeProfit * 100}
                  step="0.1"
                  onChange={(e) => setBacktestConfig(prev => ({
                    ...prev,
                    takeProfit: parseFloat(e.target.value) / 100
                  }))}
                />
                <span className="unit-label">%</span>
              </div>
            </div>
            
                          <button 
                className="run-backtest-btn"
                onClick={runBacktest}
                disabled={!isPremium || isRunningBacktest}
              >
                {isPremium ? (
                  isRunningBacktest ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      분석 중...
                    </>
                  ) : (
                    <>
                      <Play size={16} />
                      백테스트 실행
                    </>
                  )
                ) : (
                  '프리미엄 가입 후 이용 가능'
                )}
              </button>
        </div>
      </div>
      
        {/* 백테스트 결과 섹션 */}
        <div className="results-section">
          <div>
            {backtestResults ? (
              <>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-title">총 수익률</div>
                    <div className={`stat-value ${backtestResults.totalReturn >= 0 ? 'positive' : 'negative'}`}>
                      {backtestResults.totalReturn >= 0 ? '+' : ''}{backtestResults.totalReturn.toFixed(2)}%
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">최대 손실폭</div>
                    <div className="stat-value negative">{backtestResults.maxDrawdown.toFixed(2)}%</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">총 거래 횟수</div>
                    <div className="stat-value neutral">{backtestResults.totalTrades}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">승률</div>
                    <div className="stat-value positive">{backtestResults.winRate.toFixed(1)}%</div>
                  </div>
                </div>

                <div style={{ marginTop: '30px' }}>
                  <div style={{
                    maxHeight: '400px',
                    overflowY: 'auto',
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                      <thead style={{ position: 'sticky', top: 0 }}>
                        <tr>
                          <th style={{ padding: '12px 15px', textAlign: 'center', borderBottom: '1px solid #374151', fontSize: '14px' }}>번호</th>
                          <th style={{ padding: '12px 15px', textAlign: 'center', borderBottom: '1px solid #374151', fontSize: '14px' }}>타입</th>
                          <th style={{ padding: '12px 15px', textAlign: 'center', borderBottom: '1px solid #374151', fontSize: '14px' }}>진입 시간</th>
                          <th style={{ padding: '12px 15px', textAlign: 'center', borderBottom: '1px solid #374151', fontSize: '14px' }}>진입 가격</th>
                          <th style={{ padding: '12px 15px', textAlign: 'center', borderBottom: '1px solid #374151', fontSize: '14px' }}>청산 시간</th>
                          <th style={{ padding: '12px 15px', textAlign: 'center', borderBottom: '1px solid #374151', fontSize: '14px' }}>청산 가격</th>
                          <th style={{ padding: '12px 15px', textAlign: 'center', borderBottom: '1px solid #374151', fontSize: '14px' }}>수익 (KRW)</th>
                          <th style={{ padding: '12px 15px', textAlign: 'center', borderBottom: '1px solid #374151', fontSize: '14px' }}>수익률 (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {backtestResults.trades && backtestResults.trades.map((trade, index) => (
                          <tr key={index} style={{ borderBottom: '1px solid #374151' }}>
                            <td style={{ padding: '12px 15px', textAlign: 'center', fontSize: '13px' }}>{index + 1}</td>
                            <td style={{ padding: '12px 15px', color: trade.type === 'Long' ? '#62af73' : '#d25351', fontSize: '13px' }}>{trade.type}</td>
                            <td style={{ padding: '12px 15px', fontSize: '13px' }}>{trade.entryDate.toLocaleString()}</td>
                            <td style={{ padding: '12px 15px', textAlign: 'right', fontSize: '13px' }}>{trade.entryPrice.toLocaleString()}</td>
                            <td style={{ padding: '12px 15px', fontSize: '13px' }}>{trade.exitDate.toLocaleString()}</td>
                            <td style={{ padding: '12px 15px', textAlign: 'right', fontSize: '13px' }}>{trade.exitPrice.toLocaleString()}</td>
                            <td style={{ padding: '12px 15px', textAlign: 'right', color: trade.pnl >= 0 ? '#62af73' : '#d25351', fontSize: '13px' }}>
                              {trade.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td style={{ padding: '12px 15px', textAlign: 'right', color: trade.pnlPercent >= 0 ? '#62af73' : '#d25351', fontSize: '13px' }}>
                              {trade.pnlPercent.toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(!backtestResults.trades || backtestResults.trades.length === 0) && (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>거래 내역이 없습니다.</div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <div>백테스트를 실행하여 결과를 확인해보세요.</div>
              </div>
            )}
          </div>
        </div>
            </div>
          </div>
        </div>
      </div>
      
      {showPremiumModal && (
        <PremiumModal onClose={() => setShowPremiumModal(false)} />
      )}
    </div>
  )
}

export default BacktestCalculator 