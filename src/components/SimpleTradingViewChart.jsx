import { useEffect, useRef } from 'react'

const SimpleTradingViewChart = ({ symbol, width = "100%", height = "100%" }) => {
  const containerRef = useRef(null)

  const getIframeUrl = (symbol) => {
    const baseUrl = 'https://www.tradingview.com/widgetembed/'
    const params = new URLSearchParams({
      'frameElementId': `tradingview_${symbol.replace(':', '_')}`,
      'symbol': symbol,
      'interval': 'D',
      'hidesidetoolbar': '0',
      'hidetoptoolbar': '0',
      'symboledit': '1',
      'saveimage': '1',
      'toolbarbg': '000000',
      'studies': '[]',
      'hideideas': '1',
      'theme': 'dark',
      'style': '1',
      'timezone': 'Asia/Seoul',
      'withdateranges': '1',
      'hidevolume': '0',
      'locale': 'ko',
      'allow_symbol_change': '1',
      'details': '1',
      'hotlist': '1',
      'calendar': '1',
      'show_popup_button': '1',
      'popup_width': '1000',
      'popup_height': '650'
    })
    
    return `${baseUrl}?${params.toString()}`
  }

  useEffect(() => {
    if (!containerRef.current) return

    // 기존 내용 정리
    containerRef.current.innerHTML = ''

    // iframe 생성
    const iframe = document.createElement('iframe')
    iframe.src = getIframeUrl(symbol)
    iframe.style.width = '100%'
    iframe.style.height = '100%'
    iframe.style.border = 'none'
    iframe.style.backgroundColor = 'transparent'
    iframe.title = `${symbol} 차트`
    iframe.allowFullScreen = true

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
        overflow: 'hidden'
      }}
    />
  )
}

export default SimpleTradingViewChart 