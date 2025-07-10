import { useState, useEffect, useRef } from 'react'
import { TrendingUp, TrendingDown, Star, StarOff, Search, Filter, RefreshCw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const CoinTable = () => {
  const [coins, setCoins] = useState([])
  const [filteredCoins, setFilteredCoins] = useState([])
  const [sortBy, setSortBy] = useState('market_cap')
  const [sortOrder, setSortOrder] = useState('desc')
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)
  const [selectedEcosystem, setSelectedEcosystem] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [coinsPerPage] = useState(50)
  const [error, setError] = useState(null)
  
  // WebSocket 연결을 위한 ref
  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  
  // 이전 가격 데이터를 저장하기 위한 ref
  const previousPrices = useRef({})

  // Auth context 사용
  const { isAuthenticated, favoriteCoins, toggleFavoriteCoin } = useAuth()

  // 생태계 분류 함수
  const getEcosystem = (coin) => {
    const symbol = coin.symbol.toUpperCase()
    const name = coin.name.toLowerCase()
    
    // 비트코인 기반
    if (symbol === 'BTC' || name.includes('bitcoin') || symbol.includes('BTC')) {
      return 'bitcoin'
    }
    
    // 이더리움 기반 (ERC-20 토큰들)
    if (symbol === 'ETH' || name.includes('ethereum') || 
        ['USDC', 'USDT', 'DAI', 'LINK', 'UNI', 'AAVE', 'COMP', 'MKR', 'SNX', 'YFI', 'SUSHI', 'BAT', 'ZRX', 'OMG', 'ENJ', 'MANA', 'SAND', 'AXS', 'SHIB', 'PEPE'].includes(symbol)) {
      return 'ethereum'
    }
    
    // 바이낸스 스마트 체인 (BSC)
    if (symbol === 'BNB' || ['CAKE', 'BAKE', 'BURGER', 'AUTO', 'ALPACA', 'XVS', 'SXP', 'TWT', 'HARD', 'KAVA'].includes(symbol)) {
      return 'binance'
    }
    
    // 솔라나 기반
    if (symbol === 'SOL' || ['RAY', 'SRM', 'FIDA', 'ROPE', 'COPE', 'STEP', 'MEDIA', 'ATLAS', 'POLIS', 'SAMO'].includes(symbol)) {
      return 'solana'
    }
    
    // 아발란체 기반
    if (symbol === 'AVAX' || ['JOE', 'PNG', 'XAVA', 'SNOB', 'PEFI', 'SHERPA', 'YAK', 'BENQI'].includes(symbol)) {
      return 'avalanche'
    }
    
    // 카르다노 기반
    if (symbol === 'ADA' || name.includes('cardano')) {
      return 'cardano'
    }
    
    // 폴카닷 기반
    if (symbol === 'DOT' || ['KSM', 'MOVR', 'GLMR', 'ASTR', 'PHA', 'RMRK', 'KILT', 'TEER'].includes(symbol)) {
      return 'polkadot'
    }
    
    // 코스모스 기반
    if (symbol === 'ATOM' || ['OSMO', 'JUNO', 'SCRT', 'LUNA', 'UST', 'KUJI', 'ROWAN', 'REGEN'].includes(symbol)) {
      return 'cosmos'
    }
    
    // 기타 - 분류되지 않은 코인은 null 반환
    return null
  }

  // 생태계 목록
  const ecosystems = [
    { id: 'all', name: '전체' },
    { id: 'bitcoin', name: '비트코인' },
    { id: 'ethereum', name: '이더리움' },
    { id: 'binance', name: '바이낸스' },
    { id: 'solana', name: '솔라나' },
    { id: 'avalanche', name: '아발란체' },
    { id: 'cardano', name: '카르다노' },
    { id: 'polkadot', name: '폴카닷' },
    { id: 'cosmos', name: '코스모스' }
  ]

  // WebSocket 연결 함수
  const connectWebSocket = () => {
    try {
      // Binance WebSocket 연결
      const ws = new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr')
      
      ws.onopen = () => {
        console.log('WebSocket 연결됨')
        setIsWebSocketConnected(true)
      }
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        updatePricesFromWebSocket(data)
        setLastUpdate(new Date())
      }
      
      ws.onclose = () => {
        console.log('WebSocket 연결 끊어짐')
        setIsWebSocketConnected(false)
        // 재연결 시도
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000)
      }
      
      ws.onerror = (error) => {
        console.error('WebSocket 오류:', error)
        setIsWebSocketConnected(false)
      }
      
      wsRef.current = ws
    } catch (error) {
      console.error('WebSocket 연결 실패:', error)
      setIsWebSocketConnected(false)
    }
  }

  // WebSocket에서 받은 데이터로 가격 업데이트
  const updatePricesFromWebSocket = (tickerData) => {
    setCoins(prevCoins => prevCoins.map(coin => {
      // Binance 심볼을 찾기 위해 USDT 페어로 매칭
      const binanceSymbol = `${coin.symbol}USDT`
      const ticker = tickerData.find(t => t.s === binanceSymbol)
      
      if (ticker) {
        const newPriceUsd = parseFloat(ticker.c) // 현재 가격
        const newPriceKrw = newPriceUsd * 1320 // 환율 (실제로는 실시간 환율 API 사용 권장)
        const priceChange24h = parseFloat(ticker.P) // 24시간 변화율
        
        return {
          ...coin,
          current_price_usd: newPriceUsd,
          current_price_krw: newPriceKrw,
          price_change_percentage_24h: priceChange24h,
          priceDirection: getPriceDirection(coin.id, newPriceKrw),
          last_updated: new Date().toISOString()
        }
      }
      return coin
    }))
  }

  // 가격 변화 방향을 결정하는 함수
  const getPriceDirection = (coinId, currentPrice) => {
    const previousPrice = previousPrices.current[coinId]
    if (!previousPrice) {
      previousPrices.current[coinId] = currentPrice
      return 'neutral'
    }
    
    const direction = currentPrice > previousPrice ? 'up' : currentPrice < previousPrice ? 'down' : 'neutral'
    previousPrices.current[coinId] = currentPrice
    return direction
  }

  // 코인 데이터 가져오기 함수
  const fetchCoinData = async () => {
    try {
      // CoinGecko API에서 코인 데이터 가져오기 (100개씩 2번에 걸쳐)
      const [response1, response2] = await Promise.all([
        fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d'),
        fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=2&sparkline=false&price_change_percentage=1h%2C24h%2C7d')
      ])
      
      if (!response1.ok || !response2.ok) {
        throw new Error(`HTTP error! status: ${response1.status} / ${response2.status}`)
      }
      
      const [data1, data2] = await Promise.all([
        response1.json(),
        response2.json()
      ])
      
      const data = [...data1, ...data2]
      
      // 환율 정보 가져오기 (실패 시 기본값 사용)
      let krwRate = 1320
      try {
        const exchangeResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
        if (exchangeResponse.ok) {
          const exchangeData = await exchangeResponse.json()
          krwRate = exchangeData?.rates?.KRW || 1320
        }
      } catch (exchangeError) {
        console.warn('환율 데이터 로딩 실패, 기본값 사용:', exchangeError)
      }
      
      // 데이터 가공
      const processedCoins = data.map(coin => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        image: coin.image,
        current_price_usd: coin.current_price,
        current_price_krw: coin.current_price * krwRate,
        price_change_percentage_1h: coin.price_change_percentage_1h_in_currency || 0,
        price_change_percentage_24h: coin.price_change_percentage_24h || 0,
        price_change_percentage_7d: coin.price_change_percentage_7d_in_currency || 0,
        high_24h: coin.high_24h * krwRate,
        low_24h: coin.low_24h * krwRate,
        market_cap: coin.market_cap,
        total_volume: coin.total_volume * krwRate,
        ath: coin.ath * krwRate,
        atl: coin.atl * krwRate,
        last_updated: coin.last_updated,
        priceDirection: 'neutral'
      }))
      
      setCoins(processedCoins)
      setLastUpdate(new Date())
      
      return processedCoins
    } catch (error) {
      console.error('코인 데이터 로딩 실패:', error)
      throw error
    }
  }

  // 초기 데이터 로딩
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        setError(null)
        await fetchCoinData()
        // 초기 데이터 로딩 후 WebSocket 연결
        connectWebSocket()
      } catch (error) {
        console.error('초기 데이터 로딩 실패:', error)
        setError('코인 데이터를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.')
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

  // WebSocket 연결 상태에 따른 백업 업데이트 관리
  useEffect(() => {
    let backupInterval = null
    
    if (!isWebSocketConnected && coins.length > 0) {
      // WebSocket이 연결되지 않았을 때만 백업 업데이트 시작
      backupInterval = setInterval(async () => {
        try {
          await fetchCoinData()
        } catch (error) {
          console.error('백업 업데이트 실패:', error)
        }
      }, 30000)
    }
    
    return () => {
      if (backupInterval) {
        clearInterval(backupInterval)
      }
    }
  }, [isWebSocketConnected, coins.length])

  // 가격 변화 애니메이션 리셋
  useEffect(() => {
    const timers = coins
      .filter(coin => coin.priceDirection !== 'neutral')
      .map(coin => {
        return setTimeout(() => {
          setCoins(prevCoins =>
            prevCoins.map(p =>
              p.id === coin.id ? { ...p, priceDirection: 'neutral' } : p
            )
          );
        }, 1500);
      });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [coins]);

  // 검색 및 필터링
  useEffect(() => {
    let filtered = coins

    // 검색 필터링
    if (searchTerm) {
      filtered = filtered.filter(coin => 
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 관심 코인 필터링
    if (showOnlyFavorites && isAuthenticated) {
      filtered = filtered.filter(coin => favoriteCoins.includes(coin.id))
    }

    // 생태계 필터링
    if (selectedEcosystem !== 'all') {
      const validEcosystems = ecosystems.map(e => e.id)
      if (validEcosystems.includes(selectedEcosystem)) {
        filtered = filtered.filter(coin => {
          const ecosystem = getEcosystem(coin)
          return ecosystem === selectedEcosystem
        })
      }
    }

    // 정렬
    filtered = sortCoins(filtered)

    setFilteredCoins(filtered)
    setCurrentPage(1) // 필터링 시 첫 페이지로 이동
  }, [coins, searchTerm, showOnlyFavorites, favoriteCoins, selectedEcosystem, sortBy, sortOrder, isAuthenticated])

  // 정렬 함수
  const sortCoins = (coinsToSort) => {
    return [...coinsToSort].sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1
      } else {
        return aValue > bValue ? 1 : -1
      }
    })
  }

  // 페이지네이션
  const indexOfLastCoin = currentPage * coinsPerPage
  const indexOfFirstCoin = indexOfLastCoin - coinsPerPage
  const currentCoins = filteredCoins.slice(indexOfFirstCoin, indexOfLastCoin)
  const totalPages = Math.ceil(filteredCoins.length / coinsPerPage)

  // 숫자 포맷팅 함수들
  const formatNumber = (num) => {
    if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T'
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B'
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M'
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K'
    return num?.toFixed(0) || '0'
  }

  const formatPrice = (price) => {
    if (price >= 1000) return price.toLocaleString('ko-KR', { maximumFractionDigits: 0 })
    if (price >= 1) return price.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    return price.toLocaleString('ko-KR', { minimumFractionDigits: 4, maximumFractionDigits: 6 })
  }

  const formatPercentage = (percentage) => {
    if (percentage >= 0) return '+' + percentage.toFixed(2) + '%'
    return percentage.toFixed(2) + '%'
  }

  const formatCurrency = (currency) => {
    return formatNumber(currency)
  }

  // 정렬 핸들러
  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      setSortBy(key)
      setSortOrder('desc')
    }
  }

  // 정렬 표시 아이콘
  const renderSortIndicator = (columnKey) => {
    const isActive = sortBy === columnKey
    const isAsc = sortOrder === 'asc'
    const isDesc = sortOrder === 'desc'
    
    return (
      <div className="sort-indicators">
        <div className={`sort-arrow sort-up ${isActive && isAsc ? 'active' : ''}`}>▲</div>
        <div className={`sort-arrow sort-down ${isActive && isDesc ? 'active' : ''}`}>▼</div>
      </div>
    )
  }

  // 수동 새로고침
  const handleRefresh = async () => {
    try {
      setLoading(true)
      await fetchCoinData()
    } catch (error) {
      console.error('새로고침 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading && coins.length === 0) {
    return (
      <div className="coin-table-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>코인 데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error && coins.length === 0) {
    return (
      <div className="coin-table-container">
        <div className="error-message">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-btn"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
    <div className="coin-table-container">
      {/* 모바일에서만 보이는 페이지 헤더 */}
      <div className="mobile-page-header">
        <h1 className="mobile-page-title">실시간 코인 시세</h1>
        <p className="mobile-page-description">
          전 세계 암호화폐 시장의 실시간 가격 정보를 확인하세요.
        </p>
      </div>

      {/* 컨트롤 패널 */}
      <div className="coin-table-controls">
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="코인 이름 또는 심볼 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          {/* 관심 코인만 필터 버튼 제거 */}
        </div>
      </div>

      {/* 생태계 필터 버튼들 */}
      <div className="ecosystem-filters">
        {ecosystems.map(ecosystem => (
          <button
            key={ecosystem.id}
            className={`ecosystem-btn ${ecosystem.id === 'all' ? 'all-btn' : ''} ${selectedEcosystem === ecosystem.id ? 'active' : ''}`}
            onClick={() => setSelectedEcosystem(ecosystem.id)}
          >
            {ecosystem.name}
          </button>
        ))}
      </div>

      {/* 코인 테이블 */}
      <div className="coin-table-wrapper">
        <table className="coin-table">
          <thead>
            <tr>
              <th>번호</th>
              {isAuthenticated && (
                <th 
                  className="sortable favorite-header" 
                  onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="favorite-header-content">
                    관심
                  </div>
                </th>
              )}
              <th>이름</th>
              <th 
                className={`sortable ${sortBy === 'current_price_krw' ? 'active' : ''}`}
                onClick={() => handleSort('current_price_krw')}
              >
                <div className="header-content">
                  가격 (KRW)
                  {renderSortIndicator('current_price_krw')}
                </div>
              </th>
              <th 
                className={`sortable ${sortBy === 'price_change_percentage_1h' ? 'active' : ''}`}
                onClick={() => handleSort('price_change_percentage_1h')}
              >
                <div className="header-content">
                  1시간
                  {renderSortIndicator('price_change_percentage_1h')}
                </div>
              </th>
              <th 
                className={`sortable ${sortBy === 'price_change_percentage_24h' ? 'active' : ''}`}
                onClick={() => handleSort('price_change_percentage_24h')}
              >
                <div className="header-content">
                  24시간
                  {renderSortIndicator('price_change_percentage_24h')}
                </div>
              </th>
              <th 
                className={`sortable ${sortBy === 'price_change_percentage_7d' ? 'active' : ''}`}
                onClick={() => handleSort('price_change_percentage_7d')}
              >
                <div className="header-content">
                  7일
                  {renderSortIndicator('price_change_percentage_7d')}
                </div>
              </th>
              <th 
                className={`sortable ${sortBy === 'total_volume' ? 'active' : ''}`}
                onClick={() => handleSort('total_volume')}
              >
                <div className="header-content">
                  거래량 (24h)
                  {renderSortIndicator('total_volume')}
                </div>
              </th>
              <th 
                className={`sortable ${sortBy === 'market_cap' ? 'active' : ''}`}
                onClick={() => handleSort('market_cap')}
              >
                <div className="header-content">
                  시가총액
                  {renderSortIndicator('market_cap')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {currentCoins.map((coin, index) => (
              <tr key={coin.id} className="coin-row">
                <td className="rank">
                  {indexOfFirstCoin + index + 1}
                </td>
                {isAuthenticated && (
                  <td className="favorite">
                    <button
                      className={`favorite-btn ${favoriteCoins.includes(coin.id) ? 'active' : ''}`}
                      onClick={() => toggleFavoriteCoin(coin.id)}
                    >
                      {favoriteCoins.includes(coin.id) ? (
                        <Star size={16} fill="currentColor" />
                      ) : (
                        <StarOff size={16} />
                      )}
                    </button>
                  </td>
                )}
                <td className="coin-info">
                  <div className="coin-info-content">
                    <img src={coin.image} alt={coin.name} className="coin-logo" />
                    <div className="coin-details">
                      <span className="coin-name">{coin.name}</span>
                      <span className="coin-symbol">{coin.symbol}</span>
                    </div>
                  </div>
                </td>
                <td className={`price ${coin.priceDirection}`}>
                  ₩{formatPrice(coin.current_price_krw)}
                </td>
                <td className={`percentage ${coin.price_change_percentage_1h >= 0 ? 'positive' : 'negative'}`}>
                  <div className="percentage-content">
                    {coin.price_change_percentage_1h >= 0 ? (
                      <TrendingUp size={12} />
                    ) : (
                      <TrendingDown size={12} />
                    )}
                    {formatPercentage(coin.price_change_percentage_1h)}
                  </div>
                </td>
                <td className={`percentage ${coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}`}>
                  <div className="percentage-content">
                    {coin.price_change_percentage_24h >= 0 ? (
                      <TrendingUp size={12} />
                    ) : (
                      <TrendingDown size={12} />
                    )}
                    {formatPercentage(coin.price_change_percentage_24h)}
                  </div>
                </td>
                <td className={`percentage ${coin.price_change_percentage_7d >= 0 ? 'positive' : 'negative'}`}>
                  <div className="percentage-content">
                    {coin.price_change_percentage_7d >= 0 ? (
                      <TrendingUp size={12} />
                    ) : (
                      <TrendingDown size={12} />
                    )}
                    {formatPercentage(coin.price_change_percentage_7d)}
                  </div>
                </td>
                <td className="volume">
                  ₩{formatCurrency(coin.total_volume)}
                </td>
                <td className="market-cap">
                  ${formatCurrency(coin.market_cap)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            이전
          </button>
          
          <div className="pagination-info">
            <span>{currentPage} / {totalPages}</span>
          </div>
          
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            다음
          </button>
        </div>
      )}

      {filteredCoins.length === 0 && !loading && (
        <div className="no-results">
          <p>검색 결과가 없습니다.</p>
          {searchTerm && (
            <button 
              className="clear-search-btn"
              onClick={() => setSearchTerm('')}
            >
              검색 초기화
            </button>
          )}
        </div>
      )}
    </div>
    
    <style jsx global>{`
      .mobile-page-header {
        display: none;
      }
      
      .mobile-page-title {
        font-size: 24px;
        font-weight: 700;
        color: #ffffff;
        margin: 0 0 8px 0;
        text-align: center;
      }
      
      .mobile-page-description {
        font-size: 14px;
        color: #9ca3af;
        margin: 0 0 24px 0;
        text-align: center;
        line-height: 1.5;
      }
      
      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 12px;
        margin-top: 20px;
      }
      
      .pagination-btn {
        padding: 8px 16px;
        border: 1px solid #374151;
        background: #1f2937;
        color: #ffffff;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s ease;
      }
      
      .pagination-btn:hover:not(:disabled) {
        background: #374151;
        border-color: #6b7280;
      }
      
      .pagination-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .pagination-info {
        color: #9ca3af;
        font-size: 14px;
        min-width: 60px;
        text-align: center;
      }
      
      /* 모바일에서 이전 버튼이 다음 버튼의 왼쪽에 위치하도록 설정 */
      @media (max-width: 768px) {
                 .mobile-page-header {
           display: block !important;
           padding: 0 16px 20px 16px;
           margin-top: -80px;
           margin-bottom: 20px;
         }
        
        .mobile-page-title {
          font-size: 20px;
          margin-bottom: 8px;
        }
        
        .mobile-page-description {
          font-size: 13px;
          margin-bottom: 0;
        }
        
        .pagination {
          flex-direction: row;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-top: 16px;
        }
        
        .pagination-btn {
          padding: 6px 12px;
          font-size: 13px;
        }
        
        .pagination-info {
          font-size: 13px;
          min-width: 50px;
        }
      }
    `}</style>
    </>
  )
}

export default CoinTable