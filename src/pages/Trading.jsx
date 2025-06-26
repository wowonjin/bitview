import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, BarChart, Bar } from 'recharts'
import { runAdvancedBacktest, ADVANCED_STRATEGIES } from '../utils/advancedBacktest'
import { TrendingUp, TrendingDown, Target, BarChart3, AlertTriangle, DollarSign, Play } from 'lucide-react'

const Trading = () => {
  const [symbol, setSymbol] = useState('BTCUSDT')
  const [interval, setInterval] = useState('5m')
  const [candleData, setCandleData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [backtestSignals, setBacktestSignals] = useState([])
  const [showBacktestSignals, setShowBacktestSignals] = useState(false)

  const [backtestConfig, setBacktestConfig] = useState({
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
  })
  const [backtestResults, setBacktestResults] = useState(null)
  const [isRunningBacktest, setIsRunningBacktest] = useState(false)
  const [activeAnalysisTab, setActiveAnalysisTab] = useState('portfolio')
  
  // 시간 간격별 기본 기간 설정 함수
  const getDefaultDates = (interval) => {
    const now = new Date()
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate()) // 오늘 00:00
    let start
    
    switch(interval) {
      case '5m':
      case '15m':
      case '30m':
        // 분봉: 최근 3일 (데이터 가용성 고려)
        start = new Date(end.getTime() - 3 * 24 * 60 * 60 * 1000)
        break
      case '1h':
        // 시간봉: 최근 30일
        start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '4h':
        // 4시간봉: 최근 90일
        start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1d':
        // 일봉: 최근 1년
        start = new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      case '1w':
      default:
        // 주봉: 최근 2년
        start = new Date(end.getTime() - 2 * 365 * 24 * 60 * 60 * 1000)
        break
    }
    
    return {
      start: start.toISOString().slice(0, 16),
      end: end.toISOString().slice(0, 16)
    }
  }

  // 기간 입력 상태
  const [startDate, setStartDate] = useState(() => getDefaultDates('5m').start)
  const [endDate, setEndDate] = useState(() => getDefaultDates('5m').end)
  const [loadingCustomData, setLoadingCustomData] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 })

  // 시간 간격 변경 시 기본 기간 자동 조정
  useEffect(() => {
    const defaultDates = getDefaultDates(interval)
    setStartDate(defaultDates.start)
    setEndDate(defaultDates.end)
    console.log(`${interval} 간격으로 변경 - 기본 기간: ${defaultDates.start} ~ ${defaultDates.end}`)
  }, [interval])

  // 날짜나 심볼, 간격 변경 시 자동으로 데이터 로딩 (디바운싱 적용)
  useEffect(() => {
    if (startDate && endDate) {
      console.log('날짜 또는 설정 변경으로 데이터 자동 로딩:', { startDate, endDate, symbol, interval })
      
      // 디바운싱: 500ms 후에 데이터 로딩
      const timeoutId = setTimeout(() => {
        loadCustomPeriodData()
      }, 500)
      
      // 클린업 함수로 이전 타이머 취소
      return () => clearTimeout(timeoutId)
    }
  }, [startDate, endDate, symbol, interval]) // 의존성 배열에 모든 관련 상태 추가

  // 백테스트 신호 업데이트 핸들러
  const handleBacktestSignalUpdate = (signals) => {
    setBacktestSignals(signals);
    setShowBacktestSignals(true);
  };

  // 백테스트 실행
  const runBacktest = async () => {
    if (!candleData || candleData.length < 100) {
      alert('충분한 데이터가 필요합니다 (최소 100개 캔들)');
      return;
    }

    setIsRunningBacktest(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const results = runAdvancedBacktest(candleData, backtestConfig);
      setBacktestResults(results);
      
      if (results.signals) {
        handleBacktestSignalUpdate(results.signals);
      }
    } catch (error) {
      console.error('백테스트 실행 오류:', error);
      alert('백테스트 실행 중 오류가 발생했습니다.');
    } finally {
      setIsRunningBacktest(false);
    }
  };

  // 전략 변경 핸들러
  const handleStrategyChange = (strategyType) => {
    const strategy = ADVANCED_STRATEGIES[strategyType];
    const defaultParams = {};
    
    Object.entries(strategy.parameters).forEach(([key, param]) => {
      defaultParams[key] = param.default;
    });
    
    setBacktestConfig(prev => ({
      ...prev,
      strategy: {
        type: strategyType,
        parameters: defaultParams
      }
    }));
  };

  // 파라미터 변경 핸들러
  const handleParameterChange = (paramName, value) => {
    setBacktestConfig(prev => ({
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

  // 테스트용 더미 데이터
  const generateDummyData = (count = 200) => {
    const data = []
    
    // 심볼에 따른 시작 가격 설정
    const basePrice = {
      'BTCUSDT': 45000,
      'ETHUSDT': 2500,
      'BNBUSDT': 300,
      'ADAUSDT': 0.5,
      'XRPUSDT': 0.6,
      'SOLUSDT': 100,
      'DOGEUSDT': 0.08,
      'DOTUSDT': 7
    }[symbol] || 45000
    
    let currentPrice = basePrice
    
    for (let i = 0; i < count; i++) {
      // 더 현실적인 가격 변동 (0.1% ~ 2% 범위)
      const volatility = basePrice * (0.001 + Math.random() * 0.019) // 0.1% ~ 2%
      const change = (Math.random() - 0.5) * volatility * 2
      
      const open = currentPrice
      const close = Math.max(0.01, currentPrice + change) // 최소 0.01 보장
      
      // 고가/저가는 시가/종가 기준으로 더 현실적으로 설정
      const bodyRange = Math.abs(close - open)
      const wickRange = bodyRange * (0.5 + Math.random() * 1.5) // 심지 길이
      
      const high = Math.max(open, close) + Math.random() * wickRange
      const low = Math.min(open, close) - Math.random() * wickRange
      
      // 소수점 자리수 설정 (가격에 따라)
      const decimals = basePrice < 1 ? 4 : 2
      const openPrice = parseFloat(open.toFixed(decimals))
      const closePrice = parseFloat(close.toFixed(decimals))
      const highPrice = parseFloat(high.toFixed(decimals))
      const lowPrice = parseFloat(Math.max(0.01, low).toFixed(decimals))
      
      // 시간을 더 현실적으로 설정 (간격에 따라)
      const intervalMinutes = {
        '5m': 5, '15m': 15, '30m': 30, '1h': 60, '4h': 240, '1d': 1440, '1w': 10080
      }[interval] || 5
      
      const timestamp = Date.now() - (count - i) * intervalMinutes * 60 * 1000
      const date = new Date(timestamp)
      
      data.push({
        time: date.toLocaleDateString('ko-KR', { 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        timestamp: timestamp,
        open: openPrice,
        high: highPrice,
        low: lowPrice,
        close: closePrice,
        volume: Math.random() * 1000000 + 100000, // 최소 거래량 보장
        price: closePrice,
        isPositive: closePrice >= openPrice,
        bodyHeight: Math.abs(closePrice - openPrice),
        bodyTop: Math.max(openPrice, closePrice),
        bodyBottom: Math.min(openPrice, closePrice)
      })
      
      currentPrice = close // 다음 캔들의 시작 가격
    }
    
    console.log('더미 데이터 생성 완료:', data.length, '개 캔들')
    return data
  }

  // 바이낸스 API에서 캔들스틱 데이터 가져오기
  const fetchCandleData = async (limit = 200, startTime = null, endTime = null) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('API 호출 시작:', symbol, interval, 'limit:', limit)
      
      // 타임아웃 설정
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
        console.log('API 요청 타임아웃')
      }, 8000) // 8초 타임아웃
      
      // API URL 구성
      let apiParams = `symbol=${symbol}&interval=${interval}&limit=${limit}`
      if (startTime) apiParams += `&startTime=${startTime}`
      if (endTime) apiParams += `&endTime=${endTime}`
      
      // 바이낸스 공개 API 사용 (개발 환경에서는 프록시, 프로덕션에서는 직접 호출)
      const isDevelopment = import.meta.env.DEV
      const apiUrl = isDevelopment 
        ? `/api/binance/api/v3/klines?${apiParams}`
        : `https://api.binance.com/api/v3/klines?${apiParams}`
      
      console.log('API URL:', apiUrl)
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
        mode: 'cors'
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('API 응답 성공:', data.length, '개 캔들')
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('유효하지 않은 데이터 형식입니다')
      }
      
      // 데이터 변환
      const formattedData = data.map((candle, index) => {
        const timestamp = parseInt(candle[0])
        const date = new Date(timestamp)
        const open = parseFloat(candle[1]) || 0
        const high = parseFloat(candle[2]) || 0
        const low = parseFloat(candle[3]) || 0
        const close = parseFloat(candle[4]) || 0
        
        return {
          time: date.toLocaleDateString('ko-KR', { 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          timestamp: timestamp,
          open: open,
          high: high,
          low: low,
          close: close,
          volume: parseFloat(candle[5]) || 0,
          price: close,
          isPositive: close >= open, // 상승/하락 여부
          bodyHeight: Math.abs(close - open), // 캔들 몸통 높이
          bodyTop: Math.max(open, close), // 캔들 몸통 상단
          bodyBottom: Math.min(open, close) // 캔들 몸통 하단
        }
      })
      
      console.log('변환된 데이터:', formattedData.slice(0, 3))
      setCandleData(formattedData)
      
    } catch (err) {
      console.error('API 호출 오류:', err)
      console.log('더미 데이터를 사용합니다.')
      
      // API 호출 실패 시 더미 데이터 사용
      const dummyData = generateDummyData(200)
      setCandleData(dummyData)
      
      // 더 친화적인 에러 메시지
      let errorMessage = '네트워크 연결을 확인해주세요'
      if (err.name === 'AbortError') {
        errorMessage = '요청 시간이 초과되었습니다'
      } else if (err.message.includes('CORS')) {
        errorMessage = 'CORS 정책으로 인한 접근 제한'
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = '네트워크 연결 오류 또는 API 서버 접근 불가'
      }
      
      setError(`API 연결 실패 (더미 데이터 표시): ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }



  // 사용자 지정 기간 데이터 로딩 함수
  const loadCustomPeriodData = async () => {
    if (!startDate || !endDate) {
      alert('시작일과 종료일을 모두 입력해주세요.')
      return
    }
    
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (start >= end) {
      alert('시작일은 종료일보다 이전이어야 합니다.')
      return
    }
    
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    console.log(`조회 기간: ${daysDiff}일`)
    
    // 너무 긴 기간인 경우 경고
    if (daysDiff > 90) {
      const confirm = window.confirm(`${daysDiff}일의 데이터를 조회합니다. 시간이 오래 걸릴 수 있습니다. 계속하시겠습니까?`)
      if (!confirm) return
    }
    
    setLoadingCustomData(true)
    setError(null)
    
    try {
      const startTime = start.getTime()
      const endTime = end.getTime()
      
      // 간격에 따른 최대 요청 가능한 캔들 수 계산
      const intervalMinutes = {
        '5m': 5, '15m': 15, '30m': 30, '1h': 60, '4h': 240, '1d': 1440, '1w': 10080
      }[interval] || 5
      
      const totalMinutes = (endTime - startTime) / (1000 * 60)
      const expectedCandles = Math.ceil(totalMinutes / intervalMinutes)
      
      console.log(`기간: ${startDate} ~ ${endDate}`)
      console.log(`예상 캔들 수: ${expectedCandles}개`)
      
      // 바이낸스 API는 한 번에 최대 1000개까지만 요청 가능
      const maxCandlesPerRequest = 1000
      const allData = []
      
      let currentStartTime = startTime
      let requestCount = 0
      const maxRequests = Math.ceil(expectedCandles / maxCandlesPerRequest)
      
      setLoadingProgress({ current: 0, total: maxRequests })
      
      console.log(`첫 번째 요청 시작 시간: ${new Date(currentStartTime).toLocaleString()}`)
      console.log(`요청 종료 시간: ${new Date(endTime).toLocaleString()}`)
      
      while (currentStartTime < endTime && requestCount < maxRequests) {
        setLoadingProgress({ current: requestCount + 1, total: maxRequests })
        console.log(`요청 ${requestCount + 1}/${maxRequests} 진행 중...`)
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000) // 8초 타임아웃
        
        const isDevelopment = import.meta.env.DEV
        const apiParams = `symbol=${symbol}&interval=${interval}&limit=${maxCandlesPerRequest}&startTime=${currentStartTime}&endTime=${endTime}`
        const apiUrl = isDevelopment 
          ? `/api/binance/api/v3/klines?${apiParams}`
          : `https://api.binance.com/api/v3/klines?${apiParams}`
        
        console.log(`API 요청 URL: ${apiUrl}`)
        console.log(`요청 시간 범위: ${new Date(currentStartTime).toLocaleString()} ~ ${new Date(endTime).toLocaleString()}`)
        
        try {
          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: controller.signal,
            mode: 'cors'
          })
          
          clearTimeout(timeoutId)
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
          
          const data = await response.json()
          
          if (!Array.isArray(data) || data.length === 0) {
            console.log(`요청 ${requestCount + 1}: 데이터가 없습니다.`)
            console.log(`요청한 시간 범위: ${new Date(currentStartTime).toLocaleString()} ~ ${new Date(endTime).toLocaleString()}`)
            
            // 첫 번째 요청에서 데이터가 없으면 에러로 처리
            if (requestCount === 0) {
              throw new Error(`해당 기간(${interval})에 대한 데이터가 존재하지 않습니다. 더 최근 날짜를 선택해주세요.`)
            }
            break
          }
          
          // 데이터 변환
          const formattedData = data.map((candle) => {
            const timestamp = parseInt(candle[0])
            const date = new Date(timestamp)
            const open = parseFloat(candle[1]) || 0
            const high = parseFloat(candle[2]) || 0
            const low = parseFloat(candle[3]) || 0
            const close = parseFloat(candle[4]) || 0
            
            return {
              time: date.toLocaleDateString('ko-KR', { 
                month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' 
              }),
              timestamp: timestamp,
              open: open, high: high, low: low, close: close,
              volume: parseFloat(candle[5]) || 0,
              price: close,
              isPositive: close >= open,
              bodyHeight: Math.abs(close - open),
              bodyTop: Math.max(open, close),
              bodyBottom: Math.min(open, close)
            }
          })
          
          allData.push(...formattedData)
          
          // 다음 요청을 위한 시작 시간 업데이트
          const lastTimestamp = parseInt(data[data.length - 1][0])
          currentStartTime = lastTimestamp + (intervalMinutes * 60 * 1000)
          
          // API 레이트 리미트 방지를 위한 딜레이 (단축)
          if (requestCount < maxRequests - 1) {
            await new Promise(resolve => setTimeout(resolve, 100))
          }
          
        } catch (fetchError) {
          console.error(`요청 ${requestCount + 1} 실패:`, fetchError)
          break
        }
        
        requestCount++
      }
      
      if (allData.length > 0) {
        // 시간순으로 정렬
        allData.sort((a, b) => a.timestamp - b.timestamp)
        
        // 사용자가 설정한 기간으로 데이터 필터링
        const filteredData = allData.filter(candle => {
          return candle.timestamp >= startTime && candle.timestamp <= endTime
        })
        
        console.log(`전체 로딩된 데이터: ${allData.length}개`)
        console.log(`필터링된 데이터: ${filteredData.length}개`)
        console.log(`필터링 범위: ${new Date(startTime).toLocaleString()} ~ ${new Date(endTime).toLocaleString()}`)
        
        if (filteredData.length > 0) {
          setCandleData(filteredData)
          console.log(`사용자 지정 기간 데이터 로딩 완료: ${filteredData.length}개 캔들`)
        } else {
          // 필터링된 데이터가 없으면 전체 데이터 사용
          setCandleData(allData)
          console.log(`필터링된 데이터가 없어 전체 데이터 사용: ${allData.length}개 캔들`)
        }
        
      } else {
        throw new Error('해당 기간에 대한 데이터를 찾을 수 없습니다.')
      }
      
    } catch (err) {
      console.error('사용자 지정 기간 데이터 로딩 실패:', err)
      
      // API 실패 시 해당 기간에 맞는 더미 데이터 생성
      const start = new Date(startDate)
      const end = new Date(endDate)
      const intervalMinutes = {
        '5m': 5, '15m': 15, '30m': 30, '1h': 60, '4h': 240, '1d': 1440, '1w': 10080
      }[interval] || 5
      
      const totalMinutes = (end - start) / (1000 * 60)
      const candleCount = Math.min(Math.ceil(totalMinutes / intervalMinutes), 2000) // 최대 2000개로 제한
      
      const dummyData = generateDummyData(candleCount)
      const adjustedDummyData = dummyData.map((item, index) => {
        const timestamp = start.getTime() + (index * intervalMinutes * 60 * 1000)
        const date = new Date(timestamp)
        return {
          ...item,
          timestamp: timestamp,
          time: date.toLocaleDateString('ko-KR', { 
            month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' 
          })
        }
      })
      
      setCandleData(adjustedDummyData)
      
      setError(`API 연결 실패 (더미 데이터 표시): ${err.message}`)
    } finally {
      setLoadingCustomData(false)
      setLoadingProgress({ current: 0, total: 0 })
    }
  }



  // 추가 과거 데이터 로딩 함수
  const loadMoreHistoricalData = async () => {
    if (!candleData || candleData.length === 0) return
    
    try {
      const oldestTimestamp = candleData[0].timestamp
      const intervalMinutes = {
        '5m': 5, '15m': 15, '30m': 30, '1h': 60, '4h': 240, '1d': 1440, '1w': 10080
      }[interval] || 5
      
      // 기존 데이터보다 더 과거 데이터 요청
      const endTime = oldestTimestamp - 1
      const startTime = endTime - (200 * intervalMinutes * 60 * 1000) // 200개 더 요청
      
      console.log('추가 과거 데이터 로딩 시작...')
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)
      
      const isDevelopment = import.meta.env.DEV
      const apiParams = `symbol=${symbol}&interval=${interval}&limit=200&startTime=${startTime}&endTime=${endTime}`
      const apiUrl = isDevelopment 
        ? `/api/binance/api/v3/klines?${apiParams}`
        : `https://api.binance.com/api/v3/klines?${apiParams}`
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
        mode: 'cors'
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data) && data.length > 0) {
          const formattedNewData = data.map((candle) => {
            const timestamp = parseInt(candle[0])
            const date = new Date(timestamp)
            const open = parseFloat(candle[1]) || 0
            const high = parseFloat(candle[2]) || 0
            const low = parseFloat(candle[3]) || 0
            const close = parseFloat(candle[4]) || 0
            
            return {
              time: date.toLocaleDateString('ko-KR', { 
                month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' 
              }),
              timestamp: timestamp,
              open: open, high: high, low: low, close: close,
              volume: parseFloat(candle[5]) || 0,
              price: close,
              isPositive: close >= open,
              bodyHeight: Math.abs(close - open),
              bodyTop: Math.max(open, close),
              bodyBottom: Math.min(open, close)
            }
          })
          
          // 기존 데이터 앞에 새 데이터 추가
          setCandleData(prevData => [...formattedNewData, ...prevData])
          console.log('추가 과거 데이터 로딩 완료:', formattedNewData.length, '개')
        }
      }
    } catch (err) {
      console.error('추가 데이터 로딩 실패:', err)
      // 실패 시 더미 데이터 추가
      const additionalDummyData = generateDummyData(200)
      const adjustedData = additionalDummyData.map((item, index) => ({
        ...item,
        timestamp: candleData[0].timestamp - (200 - index) * 60000 // 1분씩 과거로
      }))
      setCandleData(prevData => [...adjustedData, ...prevData])
    }
  }


  
  // 초기 로딩
  useEffect(() => {
    if (startDate && endDate) {
      loadCustomPeriodData()
    }
  }, [])

  // 자동 업데이트는 비활성화 (사용자가 수동으로 조회)
  // useEffect(() => {
  //   const interval_id = setInterval(() => {
  //     fetchCandleData(50)
  //     fetch24hStats()
  //   }, 30000)
  //   
  //   return () => clearInterval(interval_id)
  // }, [])

  // 캔들스틱 컴포넌트
  const CandlestickChart = ({ data }) => {
    const svgRef = useRef(null)
    const containerRef = useRef(null)
    
    // 줌 상태 관리
    const [zoomState, setZoomState] = useState({
      xScale: 1,
      yScale: 1,
      xOffset: 0,
      yOffset: 0,
      dataStartIndex: 0,
      dataEndIndex: data?.length || 0
    })
    
    // 데이터가 변경될 때 줌 상태 초기화
    useEffect(() => {
      if (data && data.length > 0) {
        setZoomState({
          xScale: 1,
          yScale: 1,
          xOffset: 0,
          yOffset: 0,
          dataStartIndex: Math.max(0, data.length - 100), // 최근 100개만 표시
          dataEndIndex: data.length
        })
      }
    }, [data])
    
    useEffect(() => {
      if (!data || data.length === 0) return
      
      const svg = svgRef.current
      const container = containerRef.current
      const containerWidth = container.offsetWidth
      const containerHeight = 500
      
      // SVG 크기 설정
      svg.setAttribute('width', containerWidth)
      svg.setAttribute('height', containerHeight)
      
      // 기존 내용 제거
      svg.innerHTML = ''
      
      // 마진 설정
      const margin = { top: 20, right: 80, bottom: 60, left: 30 }
      const width = containerWidth - margin.left - margin.right
      const height = containerHeight - margin.top - margin.bottom
      
      // 줌 상태에 따른 데이터 필터링
      const visibleData = data.slice(
        Math.max(0, zoomState.dataStartIndex),
        Math.min(data.length, zoomState.dataEndIndex)
      )
      
      if (visibleData.length === 0) return
      
      // 가격 범위 계산 (보이는 데이터만)
      const allPrices = visibleData.flatMap(d => [d.high, d.low])
      const minPrice = Math.min(...allPrices)
      const maxPrice = Math.max(...allPrices)
      const priceRange = maxPrice - minPrice
      const padding = priceRange * 0.1
      
      // Y축 줌 적용
      const adjustedMinPrice = minPrice - (padding * (1 - zoomState.yScale)) + zoomState.yOffset
      const adjustedMaxPrice = maxPrice + (padding * (1 - zoomState.yScale)) + zoomState.yOffset
      const adjustedPriceRange = adjustedMaxPrice - adjustedMinPrice
      
      // 스케일 함수
      const xScale = (index) => {
        const baseX = (index * width) / visibleData.length + margin.left
        return baseX * zoomState.xScale + zoomState.xOffset
      }
      const yScale = (price) => {
        return height - ((price - adjustedMinPrice) / adjustedPriceRange) * height + margin.top
      }
      
      // 캔들 너비 (줌에 따라 조정)
      const candleWidth = Math.max(1, (width / visibleData.length) * 0.7 * zoomState.xScale)
      
      // 배경 그리드 그리기
      const gridGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      
      // 수평 그리드 라인
      for (let i = 0; i <= 10; i++) {
        const y = margin.top + (i * height) / 10
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        line.setAttribute('x1', margin.left)
        line.setAttribute('x2', margin.left + width)
        line.setAttribute('y1', y)
        line.setAttribute('y2', y)
        line.setAttribute('stroke', '#374151')
        line.setAttribute('stroke-dasharray', '3,3')
        line.setAttribute('opacity', '0.5')
        gridGroup.appendChild(line)
      }
      
      // 수직 그리드 라인
      for (let i = 0; i < visibleData.length; i += Math.max(1, Math.floor(visibleData.length / 10))) {
        const x = xScale(i)
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        line.setAttribute('x1', x)
        line.setAttribute('x2', x)
        line.setAttribute('y1', margin.top)
        line.setAttribute('y2', margin.top + height)
        line.setAttribute('stroke', '#374151')
        line.setAttribute('stroke-dasharray', '3,3')
        line.setAttribute('opacity', '0.3')
        gridGroup.appendChild(line)
      }
      
      svg.appendChild(gridGroup)
      
      // 캔들스틱 그리기
      visibleData.forEach((candle, index) => {
        const x = xScale(index)
        const centerX = x + candleWidth / 2
        
        const highY = yScale(candle.high)
        const lowY = yScale(candle.low)
        const openY = yScale(candle.open)
        const closeY = yScale(candle.close)
        
        const isPositive = candle.close >= candle.open
        const color = isPositive ? '#10B981' : '#EF4444'
        
        // 심지 (High-Low 라인)
        const wick = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        wick.setAttribute('x1', centerX)
        wick.setAttribute('x2', centerX)
        wick.setAttribute('y1', highY)
        wick.setAttribute('y2', lowY)
        wick.setAttribute('stroke', color)
        wick.setAttribute('stroke-width', '1')
        svg.appendChild(wick)
        
        // 캔들 몸통
        const bodyHeight = Math.abs(closeY - openY)
        const bodyY = Math.min(openY, closeY)
        
        const body = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        body.setAttribute('x', x)
        body.setAttribute('y', bodyY)
        body.setAttribute('width', candleWidth)
        body.setAttribute('height', Math.max(1, bodyHeight))
        body.setAttribute('fill', isPositive ? color : color)
        body.setAttribute('stroke', color)
        body.setAttribute('stroke-width', '1')
        body.setAttribute('opacity', isPositive ? '0.8' : '1')
        
        // 툴팁 이벤트 제거
        
        svg.appendChild(body)
      })
      
      // 백테스트 신호 표시
      if (showBacktestSignals && backtestSignals.length > 0) {
        backtestSignals.forEach((signal) => {
          const signalDate = signal.date
          const signalIndex = visibleData.findIndex(candle => 
            candle.date === signalDate || 
            (candle.timestamp && new Date(candle.timestamp).toISOString().split('T')[0] === signalDate)
          )
          
          if (signalIndex >= 0) {
            const candle = visibleData[signalIndex]
            const x = xScale(signalIndex) + candleWidth / 2
            const y = signal.action === 'BUY' ? yScale(candle.low) + 15 : yScale(candle.high) - 15
            
            // 신호 배경 원
            const signalCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
            signalCircle.setAttribute('cx', x)
            signalCircle.setAttribute('cy', y)
            signalCircle.setAttribute('r', '12')
            signalCircle.setAttribute('fill', signal.action === 'BUY' ? '#00E676' : '#FF1744')
            signalCircle.setAttribute('opacity', '0.9')
            signalCircle.setAttribute('stroke', 'white')
            signalCircle.setAttribute('stroke-width', '2')
            
            // 신호 텍스트
            const signalText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
            signalText.setAttribute('x', x)
            signalText.setAttribute('y', y + 4)
            signalText.setAttribute('text-anchor', 'middle')
            signalText.setAttribute('fill', 'white')
            signalText.setAttribute('font-size', '12')
            signalText.setAttribute('font-weight', 'bold')
            signalText.textContent = signal.action === 'BUY' ? 'B' : 'S'
            
            // 툴팁 이벤트
            const addSignalTooltip = (element) => {
              element.addEventListener('mouseenter', (e) => {
                const tooltip = document.getElementById('candlestick-tooltip')
                if (tooltip) {
                  tooltip.style.display = 'block'
                  tooltip.style.left = e.pageX + 10 + 'px'
                  tooltip.style.top = e.pageY - 10 + 'px'
                  tooltip.innerHTML = `
                    <div class="tooltip-content">
                      <p><strong>${signal.action === 'BUY' ? '매수' : '매도'} 신호</strong></p>
                      <p><strong>가격:</strong> ₩${signal.price.toLocaleString()}</p>
                      <p><strong>신호 강도:</strong> ${(signal.strength * 100).toFixed(1)}%</p>
                      <p><strong>사유:</strong> ${signal.reason}</p>
                      <p><strong>날짜:</strong> ${signal.date}</p>
                    </div>
                  `
                }
              })
              element.addEventListener('mouseleave', hideTooltip)
            }
            
            addSignalTooltip(signalCircle)
            addSignalTooltip(signalText)
            
            svg.appendChild(signalCircle)
            svg.appendChild(signalText)
          }
        })
      }
      
      // Y축 라벨
      for (let i = 0; i <= 5; i++) {
        const price = adjustedMinPrice + (adjustedPriceRange * i) / 5
        const y = yScale(price)
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        text.setAttribute('x', margin.left + width + 10)
        text.setAttribute('y', y + 4)
        text.setAttribute('text-anchor', 'start')
        text.setAttribute('fill', '#9CA3AF')
        text.setAttribute('font-size', '12')
        text.textContent = `$${price.toLocaleString()}`
        svg.appendChild(text)
      }
      
      // X축 라벨
      for (let i = 0; i < visibleData.length; i += Math.max(1, Math.floor(visibleData.length / 5))) {
        const x = xScale(i)
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        text.setAttribute('x', x)
        text.setAttribute('y', margin.top + height + 20)
        text.setAttribute('text-anchor', 'middle')
        text.setAttribute('fill', '#9CA3AF')
        text.setAttribute('font-size', '10')
        text.textContent = visibleData[i].time
        svg.appendChild(text)
      }
      
    }, [data, zoomState])
    
    const showTooltip = (event, candle) => {
      const tooltip = document.getElementById('candlestick-tooltip')
      if (tooltip) {
        tooltip.style.display = 'block'
        tooltip.style.left = event.pageX + 10 + 'px'
        tooltip.style.top = event.pageY - 10 + 'px'
        tooltip.innerHTML = `
          <div class="tooltip-content">
            <p><strong>시간:</strong> ${candle.time}</p>
            <p><strong>시가:</strong> $${candle.open.toLocaleString()}</p>
            <p><strong>고가:</strong> $${candle.high.toLocaleString()}</p>
            <p><strong>저가:</strong> $${candle.low.toLocaleString()}</p>
            <p><strong>종가:</strong> $${candle.close.toLocaleString()}</p>
            <p><strong>거래량:</strong> ${candle.volume.toLocaleString()}</p>
            <p class="${candle.isPositive ? 'positive' : 'negative'}">
              ${candle.isPositive ? '상승' : '하락'}
            </p>
          </div>
        `
      }
    }
    
    const hideTooltip = () => {
      const tooltip = document.getElementById('candlestick-tooltip')
      if (tooltip) {
        tooltip.style.display = 'none'
      }
    }
    
    // 마우스 휠 이벤트 핸들러
    const handleWheel = useCallback((event) => {
      event.preventDefault()
      
      const container = containerRef.current
      if (!container) return
      
      const rect = container.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top
      
      const margin = { top: 20, right: 80, bottom: 60, left: 30 }
      const chartWidth = rect.width - margin.left - margin.right
      const chartHeight = 500 - margin.top - margin.bottom
      
      const isInXAxis = mouseY > 500 - margin.bottom && mouseY < 500
      const isInYAxis = mouseX < margin.left && mouseX > 0
      const isInChart = mouseX >= margin.left && mouseX <= rect.width - margin.right && 
                       mouseY >= margin.top && mouseY <= 500 - margin.bottom
      
      const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1
      const zoomSpeed = 0.1
      
      setZoomState(prevState => {
        if (isInXAxis) {
          // X축 줌 (시간 축)
          const currentRange = prevState.dataEndIndex - prevState.dataStartIndex
          const newDataRange = Math.max(10, Math.floor(currentRange / zoomFactor))
          const centerIndex = Math.floor((prevState.dataStartIndex + prevState.dataEndIndex) / 2)
          const newStartIndex = Math.max(0, centerIndex - Math.floor(newDataRange / 2))
          const newEndIndex = Math.min(data.length, newStartIndex + newDataRange)
          
          // 줌 아웃 시 데이터가 부족하면 추가 로딩
          if (zoomFactor < 1 && newStartIndex < 50 && data.length > 0) {
            console.log('줌 아웃으로 인한 추가 데이터 로딩 필요')
            setTimeout(() => loadMoreHistoricalData(), 100)
          }
          
          return {
            ...prevState,
            dataStartIndex: newStartIndex,
            dataEndIndex: newEndIndex
          }
        } else if (isInYAxis) {
          // Y축 줌 (가격 축)
          const newYScale = Math.max(0.1, Math.min(10, prevState.yScale * zoomFactor))
          const yCenter = (mouseY - margin.top) / chartHeight
          const newYOffset = prevState.yOffset + (yCenter - 0.5) * zoomSpeed * (zoomFactor - 1)
          
          return {
            ...prevState,
            yScale: newYScale,
            yOffset: newYOffset
          }
        } else if (isInChart) {
          // 전체 차트 줸 (양방향)
          const newXScale = Math.max(0.1, Math.min(10, prevState.xScale * zoomFactor))
          const newYScale = Math.max(0.1, Math.min(10, prevState.yScale * zoomFactor))
          
          const xCenter = (mouseX - margin.left) / chartWidth
          const yCenter = (mouseY - margin.top) / chartHeight
          
          const newXOffset = prevState.xOffset + (xCenter - 0.5) * zoomSpeed * (zoomFactor - 1)
          const newYOffset = prevState.yOffset + (yCenter - 0.5) * zoomSpeed * (zoomFactor - 1)
          
          return {
            ...prevState,
            xScale: newXScale,
            yScale: newYScale,
            xOffset: newXOffset,
            yOffset: newYOffset
          }
        }
        
        return prevState
      })
    }, [data])
    
    // 마우스 드래그 이벤트 (패닝)
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    
    const handleMouseDown = useCallback((event) => {
      const container = containerRef.current
      if (!container) return
      
      const rect = container.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top
      
      const margin = { top: 20, right: 80, bottom: 60, left: 30 }
      const isInChart = mouseX >= margin.left && mouseX <= rect.width - margin.right && 
                       mouseY >= margin.top && mouseY <= 500 - margin.bottom
      
      if (isInChart) {
        setIsDragging(true)
        setDragStart({ x: mouseX, y: mouseY })
      }
    }, [])
    
    const handleMouseMove = useCallback((event) => {
      if (!isDragging) return
      
      const container = containerRef.current
      if (!container) return
      
      const rect = container.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top
      
      const deltaX = mouseX - dragStart.x
      const deltaY = mouseY - dragStart.y
      
      setZoomState(prevState => ({
        ...prevState,
        xOffset: prevState.xOffset + deltaX * 0.5,
        yOffset: prevState.yOffset - deltaY * 0.5
      }))
      
      setDragStart({ x: mouseX, y: mouseY })
    }, [isDragging, dragStart])
    
    const handleMouseUp = useCallback(() => {
      setIsDragging(false)
    }, [])
    
    // 이벤트 리스너 등록
    useEffect(() => {
      const container = containerRef.current
      if (!container) return
      
      container.addEventListener('wheel', handleWheel, { passive: false })
      container.addEventListener('mousedown', handleMouseDown)
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        container.removeEventListener('wheel', handleWheel)
        container.removeEventListener('mousedown', handleMouseDown)
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }, [handleWheel, handleMouseDown, handleMouseMove, handleMouseUp])
    
    // 줌 리셋 함수
    const resetZoom = () => {
      setZoomState({
        xScale: 1,
        yScale: 1,
        xOffset: 0,
        yOffset: 0,
        dataStartIndex: Math.max(0, (data?.length || 0) - 100), // 최근 100개만 표시
        dataEndIndex: data?.length || 0
      })
    }
    
    return (
      <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '500px', cursor: isDragging ? 'grabbing' : 'grab' }}>
        <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
        
        {/* 줌 리셋 버튼 */}
        <button
          onClick={resetZoom}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            padding: '5px 10px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
            zIndex: 1001
          }}
        >
          줌 리셋
        </button>

        
        {/* 줌 가이드 */}

        
        <div 
          id="candlestick-tooltip" 
          style={{
            position: 'absolute',
            background: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px',
            display: 'none',
            pointerEvents: 'none',
            zIndex: 1000,
            border: '1px solid #374151'
          }}
        ></div>
      </div>
    )
  }

  // 커스텀 툴팁 컴포넌트
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`시간: ${label}`}</p>
          <p className="tooltip-price">{`종가: $${data.close?.toLocaleString()}`}</p>
          <p className="tooltip-open">{`시가: $${data.open?.toLocaleString()}`}</p>
          <p className="tooltip-volume">{`거래량: ${data.volume?.toLocaleString()}`}</p>
          <p className="tooltip-high">{`고가: $${data.high?.toLocaleString()}`}</p>
          <p className="tooltip-low">{`저가: $${data.low?.toLocaleString()}`}</p>
          <p className={`tooltip-change ${data.isPositive ? 'positive' : 'negative'}`}>
            {data.isPositive ? '상승' : '하락'}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="trading-page">
      <div className="trading-container">
        {/* 왼쪽 팝업 컨트롤 패널 */}
        <div className="trading-popup">
          <div className="popup-header">
            <h3>거래 설정</h3>
          </div>
          <div className="popup-body">
              <>
                {/* 백테스트 기간 설정 */}
                <div className="control-row">
                  <div className="control-group">
                    <label>시작일</label>
                    <input
                      type="date"
                      value={backtestConfig.startDate || '2023-01-01'}
                      onChange={(e) => setBacktestConfig(prev => ({ ...prev, startDate: e.target.value }))}
                      className="trading-select"
                    />
                  </div>
                  
                  <div className="control-group">
                    <label>종료일</label>
                    <input
                      type="date"
                      value={backtestConfig.endDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setBacktestConfig(prev => ({ ...prev, endDate: e.target.value }))}
                      className="trading-select"
                    />
                  </div>
                </div>

                {/* 백테스트 전략 설정 */}
                <div className="control-row">
                  <div className="control-group full-width">
                    <label>매매 전략</label>
                    <select
                      value={backtestConfig.strategy.type}
                      onChange={(e) => handleStrategyChange(e.target.value)}
                      className="trading-select"
                    >
                      {Object.entries(ADVANCED_STRATEGIES).map(([key, strategy]) => (
                        <option key={key} value={key}>{strategy.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 구분선 */}
                <div className="section-divider"></div>

                {/* 전략 파라미터 */}
                {Object.entries(ADVANCED_STRATEGIES[backtestConfig.strategy.type]?.parameters || {}).map(([key, param]) => {
                  // 파라미터 이름을 한국어로 변환
                  const getKoreanLabel = (paramKey) => {
                    const labelMap = {
                      'fastMA': '단기 이동평균',
                      'mediumMA': '중기 이동평균', 
                      'slowMA': '장기 이동평균',
                      'rsiPeriod': 'RSI 기간',
                      'rsiOverbought': 'RSI 과매수',
                      'rsiOversold': 'RSI 과매도',
                      'period': '기간',
                      'multiplier': '배수',
                      'kPeriod': 'K 기간',
                      'dPeriod': 'D 기간'
                    };
                    return labelMap[paramKey] || paramKey;
                  };

                  // 파라미터 설명을 한국어로 제공
                  const getParameterDescription = (paramKey) => {
                    const descriptionMap = {
                      'fastMA': '단기 추세를 파악하는 이동평균 기간입니다. 작을수록 민감하게 반응합니다.',
                      'mediumMA': '중기 추세를 파악하는 이동평균 기간입니다. 단기와 장기 사이의 균형점입니다.',
                      'slowMA': '장기 추세를 파악하는 이동평균 기간입니다. 클수록 안정적인 신호를 제공합니다.',
                      'rsiPeriod': 'RSI 계산에 사용되는 기간입니다. 일반적으로 14일을 사용합니다.',
                      'rsiOverbought': 'RSI가 이 값을 넘으면 과매수 상태로 판단합니다. 매도 신호로 활용됩니다.',
                      'rsiOversold': 'RSI가 이 값 아래로 떨어지면 과매도 상태로 판단합니다. 매수 신호로 활용됩니다.',
                      'period': '볼린저 밴드 계산에 사용되는 이동평균 기간입니다.',
                      'multiplier': '볼린저 밴드의 상하한선을 결정하는 표준편차 배수입니다.',
                      'kPeriod': '스토캐스틱 %K 계산에 사용되는 기간입니다.',
                      'dPeriod': '스토캐스틱 %D 계산에 사용되는 %K의 이동평균 기간입니다.'
                    };
                    return descriptionMap[paramKey] || '이 파라미터에 대한 설명이 없습니다.';
                  };

                  return (
                    <div key={key} className="control-row">
                      <div className="control-group full-width">
                        <label>
                          {getKoreanLabel(key)}
                        </label>
                        <input
                          type="number"
                          value={backtestConfig.strategy.parameters[key] || param.default}
                          onChange={(e) => handleParameterChange(key, parseFloat(e.target.value))}
                          min={param.min}
                          max={param.max}
                          step={key.includes('Period') ? 1 : 0.1}
                          className="trading-select"
                        />
                      </div>
                    </div>
                  );
                })}

                {/* 리스크 관리 */}
                <div className="control-row">
                  <div className="control-group">
                    <label>스톱로스 (%)</label>
                    <input
                      type="number"
                      value={backtestConfig.stopLoss * 100}
                      onChange={(e) => setBacktestConfig(prev => ({ ...prev, stopLoss: parseFloat(e.target.value) / 100 }))}
                      min={0}
                      max={20}
                      step={0.5}
                      className="trading-select"
                    />
                  </div>
                  
                  <div className="control-group">
                    <label>테이크프로핏 (%)</label>
                    <input
                      type="number"
                      value={backtestConfig.takeProfit * 100}
                      onChange={(e) => setBacktestConfig(prev => ({ ...prev, takeProfit: parseFloat(e.target.value) / 100 }))}
                      min={0}
                      max={50}
                      step={0.5}
                      className="trading-select"
                    />
                  </div>
                </div>

                <div className="control-row">
                  <div className="control-group">
                    <label>초기 자본 (원)</label>
                    <input
                      type="number"
                      value={backtestConfig.initialCapital}
                      onChange={(e) => setBacktestConfig(prev => ({ ...prev, initialCapital: parseInt(e.target.value) }))}
                      className="trading-select"
                    />
                  </div>
                  
                  <div className="control-group">
                    <label>거래당 위험비율 (%)</label>
                    <input
                      type="number"
                      value={backtestConfig.riskPerTrade * 100}
                      onChange={(e) => setBacktestConfig(prev => ({ ...prev, riskPerTrade: parseFloat(e.target.value) / 100 }))}
                      min={0.1}
                      max={10}
                      step={0.1}
                      className="trading-select"
                    />
                  </div>
                </div>

                {/* 백테스트 실행 버튼 */}
                <div className="control-row">
                  <div className="control-group full-width">
                    <button
                      onClick={runBacktest}
                      disabled={isRunningBacktest || !candleData || candleData.length < 100}
                      className="backtest-run-btn"
                    >
                      {isRunningBacktest ? (
                        <>
                          <div className="loading-spinner"></div>
                          분석 중...
                        </>
                      ) : (
                        <>
                          <Play size={16} />
                          백테스트 실행
                        </>
                      )}
                    </button>
                  </div>
                </div>


              </>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="error-message">
            오류: {error}
          </div>
        )}

        {/* 차트 섹션 */}
        <div className="chart-section" style={{ paddingRight: '20px' }}>
          <h3 className="chart-title">매매 차트 확인하기</h3>
          <div className="chart-container">
            
            {(loading || loadingCustomData) ? (
              <div className="no-data">
                <div>
                  {loadingCustomData ? '사용자 지정 기간 데이터를 불러오는 중...' : '데이터를 불러오는 중...'}
                </div>
                {loadingCustomData && loadingProgress.total > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ 
                      width: '300px', 
                      height: '20px', 
                      backgroundColor: '#374151', 
                      borderRadius: '10px', 
                      overflow: 'hidden',
                      margin: '0 auto'
                    }}>
                      <div style={{
                        width: `${(loadingProgress.current / loadingProgress.total) * 100}%`,
                        height: '100%',
                        backgroundColor: '#10B981',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#9CA3AF' }}>
                      {loadingProgress.current} / {loadingProgress.total} 요청 완료
                    </div>
                  </div>
                )}
              </div>
            ) : candleData && candleData.length > 0 ? (
              <CandlestickChart data={candleData} />
            ) : (
              <div className="no-data">
                {error ? `오류: ${error}` : '차트 데이터가 없습니다.'}
              </div>
            )}
          </div>
        </div>

        {/* 백테스트 결과 분석 */}
        {backtestResults && (
          <div className="data-table-section">
            <h3 className="table-title">백테스트 성과 분석</h3>
            
            {/* 성과 지표 카드 */}
            <div className="performance-cards">
              <div className="performance-card">
                <div className="card-header">총 수익률</div>
                <div className={`card-value ${backtestResults.totalReturn >= 0 ? 'positive' : 'negative'}`}>
                  {backtestResults.totalReturn?.toFixed(2)}%
                </div>
              </div>
              <div className="performance-card">
                <div className="card-header">승률</div>
                <div className={`card-value ${backtestResults.winRate >= 50 ? 'positive' : 'negative'}`}>
                  {backtestResults.winRate?.toFixed(1)}%
                </div>
              </div>
              <div className="performance-card">
                <div className="card-header">샤프 비율</div>
                <div className={`card-value ${backtestResults.sharpeRatio >= 1 ? 'positive' : 'negative'}`}>
                  {backtestResults.sharpeRatio?.toFixed(2)}
                </div>
              </div>
              <div className="performance-card">
                <div className="card-header">최대 손실폭</div>
                <div className="card-value negative">
                  -{backtestResults.maxDrawdown?.toFixed(2)}%
                </div>
              </div>
              <div className="performance-card">
                <div className="card-header">수익 팩터</div>
                <div className={`card-value ${backtestResults.profitFactor >= 1 ? 'positive' : 'negative'}`}>
                  {backtestResults.profitFactor?.toFixed(2)}
                </div>
              </div>
              <div className="performance-card">
                <div className="card-header">총 거래 횟수</div>
                <div className="card-value neutral">
                  {backtestResults.totalTrades}
                </div>
              </div>
            </div>

            {/* 차트 탭 네비게이션 */}
            <div className="chart-tabs">
              <button 
                className={`tab-btn ${activeAnalysisTab === 'portfolio' ? 'active' : ''}`}
                onClick={() => setActiveAnalysisTab('portfolio')}
              >
                포트폴리오 가치
              </button>
              <button 
                className={`tab-btn ${activeAnalysisTab === 'drawdown' ? 'active' : ''}`}
                onClick={() => setActiveAnalysisTab('drawdown')}
              >
                손실폭 분석
              </button>
              <button 
                className={`tab-btn ${activeAnalysisTab === 'trades' ? 'active' : ''}`}
                onClick={() => setActiveAnalysisTab('trades')}
              >
                거래 내역
              </button>
              <button 
                className={`tab-btn ${activeAnalysisTab === 'monthly' ? 'active' : ''}`}
                onClick={() => setActiveAnalysisTab('monthly')}
              >
                월별 수익률
              </button>
            </div>

            {/* 차트 컨테이너 */}
            <div className="analysis-chart-container" style={{ paddingRight: '20px' }}>
              {activeAnalysisTab === 'portfolio' && (
                <div style={{ width: '100%', height: 400 }}>
                  <ResponsiveContainer>
                    <AreaChart data={backtestResults.portfolio}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                      <XAxis dataKey="date" tick={{fill: '#94a3b8', fontSize: 12}} />
                      <YAxis 
                        orientation="right"
                        tickFormatter={(value) => `₩${(value / 1000000).toFixed(1)}M`} 
                        tick={{fill: '#94a3b8', fontSize: 12}} 
                        width={80}
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
              )}

              {activeAnalysisTab === 'drawdown' && (
                <div style={{ width: '100%', height: 400 }}>
                  <ResponsiveContainer>
                    <AreaChart data={backtestResults.portfolio}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                      <XAxis dataKey="date" tick={{fill: '#94a3b8', fontSize: 12}} />
                      <YAxis 
                        orientation="right"
                        tickFormatter={(value) => `${value.toFixed(1)}%`}
                        tick={{fill: '#94a3b8', fontSize: 12}} 
                        width={80}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value.toFixed(2)}%`, '손실폭']}
                        contentStyle={{
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '8px',
                          color: '#ffffff'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="drawdown" 
                        stroke="#ef4444" 
                        fill="rgba(239, 68, 68, 0.2)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {activeAnalysisTab === 'trades' && (
                <div className="trades-table-container">
                  <table className="trades-table">
                    <thead>
                      <tr>
                        <th>날짜</th>
                        <th>유형</th>
                        <th>가격</th>
                        <th>수량</th>
                        <th>수익률</th>
                        <th>사유</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backtestResults.trades?.slice(-20).map((trade, index) => (
                        <tr key={index}>
                          <td>{trade.date}</td>
                          <td className={trade.type === 'BUY' ? 'buy-type' : 'sell-type'}>
                            {trade.type === 'BUY' ? '매수' : '매도'}
                          </td>
                          <td>₩{trade.price?.toLocaleString()}</td>
                          <td>{trade.shares}</td>
                          <td className={trade.profitPercent >= 0 ? 'positive' : 'negative'}>
                            {trade.profitPercent ? `${trade.profitPercent.toFixed(2)}%` : '-'}
                          </td>
                          <td>{trade.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeAnalysisTab === 'monthly' && (
                <div style={{ width: '100%', height: 400 }}>
                  <ResponsiveContainer>
                    <BarChart data={backtestResults.monthlyReturns || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                      <XAxis dataKey="month" tick={{fill: '#94a3b8', fontSize: 12}} />
                      <YAxis 
                        orientation="right"
                        tickFormatter={(value) => `${value.toFixed(1)}%`}
                        tick={{fill: '#94a3b8', fontSize: 12}} 
                        width={80}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value.toFixed(2)}%`, '월별 수익률']}
                        contentStyle={{
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '8px',
                          color: '#ffffff'
                        }}
                      />
                      <Bar 
                        dataKey="return" 
                        fill={(entry) => entry >= 0 ? '#10b981' : '#ef4444'}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}


      </div>

      {/* 백테스트 신호 토글 버튼 */}
      {backtestSignals.length > 0 && (
        <div className="fixed top-20 right-4 z-30">
          <button
            onClick={() => setShowBacktestSignals(!showBacktestSignals)}
            className={`px-4 py-2 rounded-lg font-medium shadow-lg transition-all ${
              showBacktestSignals 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {showBacktestSignals ? '신호 숨기기' : '신호 보기'}
          </button>
        </div>
      )}



      <style jsx>{`
        .trading-page {
          padding-top: 80px;
          background: #111111;
          min-height: 100vh;
          color: white;
        }

        .trading-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .trading-popup {
          position: fixed;
          top: 120px;
          left: 20px;
          z-index: 1001;
          width: 350px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(128, 128, 128, 0.01));
          border: 1px solid #374151;
          border-radius: 20px;
          backdrop-filter: blur(20px);
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.15),
            0 0 20px rgba(59, 130, 246, 0.12),
            0 0 40px rgba(59, 130, 246, 0.06),
            0 0 80px rgba(59, 130, 246, 0.03),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }

        .trading-popup::before {
          content: '';
          position: absolute;
          top: -1px;
          left: -1px;
          right: -1px;
          bottom: -1px;
          background: linear-gradient(135deg, 
            rgba(59, 130, 246, 0.15) 0%, 
            rgba(14, 165, 233, 0.1) 50%, 
            rgba(6, 182, 212, 0.08) 100%);
          border-radius: 21px;
          z-index: -1;
          opacity: 0.6;
          filter: blur(0.5px);
          animation: tradingPopupGlow 4s ease-in-out infinite;
        }

        @keyframes tradingPopupGlow {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.005);
          }
        }

        .popup-header {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          text-align: left;
        }

        .popup-header h3 {
          margin: 0;
          color: white;
          font-size: 16px;
          font-weight: 600;
        }



        .backtest-run-btn {
          width: 100%;
          padding: 8px 12px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05));
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 8px;
          color: #3B82F6;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          backdrop-filter: blur(10px);
          box-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.1),
            0 0 12px rgba(59, 130, 246, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          position: relative;
          overflow: hidden;
        }

        .backtest-run-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.2), transparent);
          transition: left 0.6s ease;
        }

        .backtest-run-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(59, 130, 246, 0.1));
          transform: translateY(-1px);
          color: #60A5FA;
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 
            0 4px 8px rgba(0, 0, 0, 0.12),
            0 0 20px rgba(59, 130, 246, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .backtest-run-btn:hover:not(:disabled)::before {
          left: 100%;
        }

        .backtest-run-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: rgba(255, 255, 255, 0.02);
          color: #6b7280;
          transform: none !important;
          box-shadow: none !important;
        }

        .loading-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .backtest-summary {
          margin-top: 16px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid #374151;
          border-radius: 8px;
        }

        .backtest-summary h4 {
          margin: 0 0 12px 0;
          color: white;
          font-size: 14px;
          font-weight: 600;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 8px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 6px;
        }

        .summary-item .label {
          font-size: 11px;
          color: #9CA3AF;
        }

        .summary-item .value {
          font-size: 12px;
          font-weight: 600;
          color: white;
        }

        .summary-item .value.positive {
          color: #10B981;
        }

        .summary-item .value.negative {
          color: #EF4444;
        }

        .backtest-chart-container {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid #374151;
          border-radius: 12px;
          padding: 1.5rem;
          margin-top: 1rem;
        }

        .popup-body {
          padding: 20px;
        }

        .control-row {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .control-row:last-child {
          margin-bottom: 0;
        }

        .control-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .control-group.full-width {
          flex: none;
          width: 100%;
        }

        .control-group label {
          font-size: 14px;
          color: #9CA3AF;
          font-weight: 500;
          margin-bottom: 8px;
          text-align: left;
        }

        .auto-refresh-notice {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #9ca3af;
          font-size: 12px;
          margin-top: 16px;
          padding: 8px;
          background: rgba(156, 163, 175, 0.1);
          border-radius: 8px;
          justify-content: center;
        }

        .auto-refresh-notice .material-icons {
          font-size: 16px;
        }





        .trading-select {
          width: 100%;
          padding: 8px 12px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(59, 130, 246, 0.01));
          border: 1px solid #374151;
          border-radius: 8px;
          color: white;
          font-size: 14px;
          backdrop-filter: blur(10px);
          box-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .trading-select::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
          transition: left 0.6s ease;
        }

        .trading-select:hover {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(59, 130, 246, 0.03));
          transform: translateY(-1px);
          box-shadow: 
            0 4px 8px rgba(0, 0, 0, 0.12),
            0 0 12px rgba(59, 130, 246, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .trading-select:hover::before {
          left: 100%;
        }

        .trading-select:focus {
          outline: none;
          border-color: rgba(59, 130, 246, 0.3);
          box-shadow: 
            0 4px 8px rgba(0, 0, 0, 0.15),
            0 0 16px rgba(59, 130, 246, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .trading-select option {
          background: #1f2937;
          color: white;
          padding: 8px;
        }

        .trading-select option:hover {
          background: #374151;
        }

        .trading-select option:checked {
          background: #3B82F6;
          color: white;
        }

        .section-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: 12px 0;
        }









        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid #EF4444;
          color: #EF4444;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .chart-section {
          margin-bottom: 3rem;
          margin-left: 2rem;
        }

        .chart-container {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(59, 130, 246, 0.01));
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1rem;
          height: 500px;
          overflow: visible;
          position: relative;
        }





        .chart-title {
          color: white;
          margin-bottom: 1rem;
          font-size: 1.25rem;
          font-weight: 600;
          text-align: center;
        }

        .no-data {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 500px;
          color: #9CA3AF;
          font-size: 1.125rem;
        }

        .custom-tooltip {
          background: rgba(0, 0, 0, 0.9);
          border: 1px solid #374151;
          border-radius: 8px;
          padding: 1rem;
          color: white;
        }

        .tooltip-label {
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .tooltip-price, .tooltip-open, .tooltip-volume, .tooltip-high, .tooltip-low, .tooltip-change {
          margin: 0.25rem 0;
          font-size: 0.875rem;
        }

        .tooltip-change.positive {
          color: #10B981;
          font-weight: 600;
        }

        .tooltip-change.negative {
          color: #EF4444;
          font-weight: 600;
        }

        .positive {
          color: #10B981 !important;
        }

        .negative {
          color: #EF4444 !important;
        }

        .data-table-section {
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
        }





        .table-title {
          color: white;
          margin-bottom: 1rem;
          font-size: 1.25rem;
          font-weight: 600;
          text-align: center;
        }

        .table-container {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          background: rgba(255, 255, 255, 0.1);
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          color: #E5E7EB;
          border-bottom: 1px solid #374151;
        }

        .data-table td {
          padding: 0.75rem;
          border-bottom: 1px solid #374151;
          color: #D1D5DB;
        }

        .data-table tr:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .high-price {
          color: #10B981;
        }

        .low-price {
          color: #EF4444;
        }

        .backtest-signal {
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .backtest-signal:hover {
          transform: scale(1.1);
          filter: brightness(1.2);
        }

        .signal-buy {
          fill: #00E676;
          stroke: #00C853;
        }

        .signal-sell {
          fill: #FF1744;
          stroke: #D50000;
        }

        .performance-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .performance-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(59, 130, 246, 0.02));
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1rem;
          text-align: center;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .performance-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.2);
        }

        .card-header {
          color: #9CA3AF;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .card-value {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
        }

        .card-value.positive {
          color: #10B981;
        }

        .card-value.negative {
          color: #EF4444;
        }

        .card-value.neutral {
          color: #60A5FA;
        }

        .chart-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 1rem;
        }

        .tab-btn {
          padding: 0.5rem 1rem;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: #9CA3AF;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #D1D5DB;
        }

        .tab-btn.active {
          background: rgba(59, 130, 246, 0.2);
          border-color: rgba(59, 130, 246, 0.3);
          color: #60A5FA;
        }

        .analysis-chart-container {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1rem;
        }

        .trades-table-container {
          overflow-x: auto;
          max-height: 400px;
          overflow-y: auto;
          padding: 0.5rem;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.02);
        }

        .trades-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
          min-width: 600px;
        }

        .trades-table th {
          background: rgba(255, 255, 255, 0.1);
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          color: #E5E7EB;
          border-bottom: 1px solid #374151;
          position: sticky;
          top: 0;
          z-index: 10;
          white-space: nowrap;
        }

        .trades-table td {
          padding: 0.5rem 0.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          color: #D1D5DB;
          white-space: nowrap;
        }

        .trades-table tr:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .buy-type {
          color: #10B981;
          font-weight: 600;
        }

        .sell-type {
          color: #EF4444;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .trading-header {
            flex-direction: column;
            gap: 1rem;
          }

          .trading-controls {
            flex-direction: column;
            gap: 1rem;
            width: 100%;
          }

          .current-price {
            font-size: 1.5rem;
          }

          .trading-container {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  )
}

export default Trading 