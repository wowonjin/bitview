import { useEffect, useRef } from 'react'

const MobileTradingViewChart = ({ symbol, width = "100%", height = "100%" }) => {
  const containerRef = useRef(null)

  const getMobileIframeUrl = (symbol) => {
    const baseUrl = 'https://www.tradingview.com/widgetembed/'
    const params = new URLSearchParams({
      'frameElementId': `tradingview_mobile_${symbol.replace(':', '_')}`,
      'symbol': symbol,
      'interval': '1H',
      'hidesidetoolbar': '1', // 모바일에서는 사이드 툴바 숨김
      'hidetoptoolbar': '0',
      'symboledit': '1',
      'saveimage': '0', // 모바일에서는 이미지 저장 비활성화
      'toolbarbg': '000000',
      'studies': '[]',
      'hideideas': '1',
      'theme': 'dark',
      'style': '1',
      'timezone': 'Asia/Seoul',
      'withdateranges': '0', // 모바일에서는 날짜 범위 숨김
      'hidevolume': '1', // 모바일에서는 볼륨 숨김
      'locale': 'ko',
      'allow_symbol_change': '1',
      'details': '0', // 모바일에서는 상세 정보 숨김
      'hotlist': '0', // 모바일에서는 핫리스트 숨김
      'calendar': '0', // 모바일에서는 캘린더 숨김
      'show_popup_button': '0', // 모바일에서는 팝업 버튼 숨김
      'mobile': '1', // 모바일 모드 활성화
      'toolbar_bg': '000000',
      'enable_publishing': '0',
      'hide_legend': '0',
      'hide_side_toolbar': '1',
      'hide_top_toolbar': '0',
      'hide_volume': '1',
      'hide_symbol_search': '0',
      'hide_comparison': '1',
      'hide_indicators': '0',
      'hide_drawings': '1', // 모바일에서는 그리기 도구 숨김
      'hide_studies': '0',
      'hide_right_toolbar': '1',
      'hide_left_toolbar': '1',
      'container_id': 'tradingview_mobile'
    })
    
    return `${baseUrl}?${params.toString()}`
  }

  useEffect(() => {
    if (!containerRef.current) return

    // 기존 내용 정리
    containerRef.current.innerHTML = ''

    // iframe 생성
    const iframe = document.createElement('iframe')
    iframe.src = getMobileIframeUrl(symbol)
    iframe.style.width = '100%'
    iframe.style.height = '100%'
    iframe.style.border = 'none'
    iframe.style.backgroundColor = 'transparent'
    iframe.title = `${symbol} 모바일 차트`
    iframe.allowFullScreen = true
    iframe.scrolling = 'no'

    // 모바일 최적화 스타일 추가
    iframe.style.minHeight = '400px'
    iframe.style.maxHeight = '70vh'
    iframe.style.touchAction = 'manipulation'

    containerRef.current.appendChild(iframe)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [symbol])

  return (
    <div 
      ref={containerRef}
      style={{ 
        width, 
        height,
        backgroundColor: 'transparent',
        border: 'none',
        overflow: 'hidden',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    />
  )
}

export default MobileTradingViewChart 