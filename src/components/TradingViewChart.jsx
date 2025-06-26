import { useEffect, useRef } from 'react'

const TradingViewChart = ({ symbol, containerId, width = "100%", height = "100%" }) => {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    // 기존 내용 정리
    containerRef.current.innerHTML = ''

    // TradingView 위젯 스크립트 동적 생성
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": symbol,
      "interval": "D",
      "timezone": "Asia/Seoul",
      "theme": "dark",
      "style": "1",
      "locale": "ko",
      "toolbar_bg": "f1f3f6",
      "enable_publishing": false,
      "allow_symbol_change": true,
      "calendar": false,
      "support_host": "https://www.tradingview.com",
      "withdateranges": true,
      "hide_side_toolbar": false,
      "hide_top_toolbar": false,
      "save_image": false,
      "container_id": "tradingview_widget",
      "width": "100%",
      "height": "100%",
      "overrides": {
        "mainSeriesProperties.priceAxisProperties.autoScale": true,
        "mainSeriesProperties.priceAxisProperties.lockScale": false,
        "paneProperties.background": "#111111",
        "paneProperties.vertGridProperties.color": "#363c4e",
        "paneProperties.horzGridProperties.color": "#363c4e",
        "symbolWatermarkProperties.transparency": 90,
        "scalesProperties.right.visible": true,
        "scalesProperties.left.visible": false,
        "scalesProperties.fontSize": 12
      },
      "studies_overrides": {},
      "enabled_features": ["study_templates"],
      "disabled_features": ["use_localstorage_for_settings", "volume_force_overlay"]
    })

    // 위젯 컨테이너 생성
    const widgetContainer = document.createElement('div')
    widgetContainer.className = 'tradingview-widget-container__widget'
    widgetContainer.style.height = '100%'
    widgetContainer.style.width = '100%'

    containerRef.current.appendChild(widgetContainer)
    containerRef.current.appendChild(script)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [symbol, containerId])

  return (
    <div 
      ref={containerRef}
      className="tradingview-widget-container"
      style={{ 
        width, 
        height,
        backgroundColor: 'transparent',
        border: 'none'
      }}
    />
  )
}

export default TradingViewChart 