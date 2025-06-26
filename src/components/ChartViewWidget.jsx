import { useEffect, useRef } from 'react'

const ChartViewWidget = ({ symbol, containerId, width = "100%", height = "100%" }) => {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    // 기존 내용 정리
    containerRef.current.innerHTML = ''

    // 고유한 컨테이너 ID 생성
    const uniqueId = `chartview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // iframe 방식으로 TradingView 차트 생성
    const iframe = document.createElement('iframe')
    iframe.id = uniqueId
    iframe.style.width = '100%'
    iframe.style.height = '100%'
    iframe.style.border = 'none'
    iframe.style.backgroundColor = 'transparent'
    iframe.frameBorder = '0'
    iframe.allowTransparency = true
    iframe.scrolling = 'no'
    iframe.allow = 'encrypted-media'
    
    // TradingView iframe URL 생성 - 15분 차트로 설정
    const baseUrl = 'https://www.tradingview.com/widgetembed/'
    const params = new URLSearchParams({
      frameElementId: uniqueId,
      symbol: symbol,
      interval: '15', // 15분 차트
      hidesidetoolbar: '0',
      hidetoptoolbar: '0',
      symboledit: '1',
      saveimage: '1',
      toolbarbg: '131722', // 어두운 테마
      studies: '[]',
      hideideas: '1',
      theme: 'dark',
      style: '1',
      timezone: 'Asia/Seoul',
      withdateranges: '1',
      hidevolume: '0',
      locale: 'ko',
      allow_symbol_change: '1',
      details: '1',
      hotlist: '1',
      calendar: '1',
      show_popup_button: '1',
      popup_width: '1000',
      popup_height: '650'
    })
    
    iframe.src = `${baseUrl}?${params.toString()}`
    
    containerRef.current.appendChild(iframe)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [symbol, containerId])

  return (
    <div 
      ref={containerRef}
      className="chartview-widget-container"
      style={{ 
        width, 
        height,
        backgroundColor: 'transparent',
        border: 'none'
      }}
    />
  )
}

export default ChartViewWidget 