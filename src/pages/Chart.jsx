import { useState, useRef, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import SimpleTradingViewChart from '../components/SimpleTradingViewChart'

const Chart = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [chartMode, setChartMode] = useState(1) // 1, 2, 4개 차트 모드
  const [drawingMode, setDrawingMode] = useState(false)
  const [drawingTool, setDrawingTool] = useState('pen') // pen, highlighter, eraser
  const [drawingColor, setDrawingColor] = useState('#ffffff')
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  
  const popupRef = useRef(null)

  // 로그인 요구 팝업 상태
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false)

  // 도구선택창 표시/숨김 상태 (항상 표시)
  const [showToolPanel, setShowToolPanel] = useState(true)
  
  // 선택된 도구 카테고리 ('chart', 'pen', 'eraser', 'memo', null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  
  // 메모 관련 상태
  const [memos, setMemos] = useState([])
  const [showMemoEditor, setShowMemoEditor] = useState(false)
  const [showMemoList, setShowMemoList] = useState(false)
  const [memoSearchTerm, setMemoSearchTerm] = useState('')
  const [currentMemo, setCurrentMemo] = useState({ id: null, title: '', content: '' })
  const [memoEditorPosition, setMemoEditorPosition] = useState({ x: 350, y: 150 })

  // 메모 에디터 드래그 관련 상태
  const [isMemoEditorDragging, setIsMemoEditorDragging] = useState(false)
  const [memoEditorDragOffset, setMemoEditorDragOffset] = useState({ x: 0, y: 0 })
  const memoEditorRef = useRef(null)

  // 향상된 펜 설정 상태들
  const [penSize, setPenSize] = useState(2)
  const [eraserSize, setEraserSize] = useState(4)
  const [lineType, setLineType] = useState('solid') // solid, dashed
  const [availableColors] = useState([
    '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'
  ])
  const [availableSizes] = useState([1, 2, 4, 6, 8])
  const [availableEraserSizes] = useState([2, 4, 8, 12, 16])

  // 직선 그리기 관련 상태들
  const [mouseDownTime, setMouseDownTime] = useState(0)
  const [startPoint, setStartPoint] = useState(null)
  const [isDrawingStraightLine, setIsDrawingStraightLine] = useState(false)
  const [canvasState, setCanvasState] = useState(null)
  const [lastMousePosition, setLastMousePosition] = useState(null)
  const [mouseStopTimer, setMouseStopTimer] = useState(null)
  const isDrawingRef = useRef(false)
  
  // 툴팁 상태
  const [hoveredButton, setHoveredButton] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  
  // Shift 키 상태 (각도 제한용)
  const [isShiftPressed, setIsShiftPressed] = useState(false)

  // 모든 차트를 미리 정의 (처음부터 로딩하기 위해)
  const allCharts = [
    { symbol: 'BINANCE:BTCUSDT', name: '비트코인' },
    { symbol: 'BINANCE:ETHUSDT', name: '이더리움' },
    { symbol: 'BINANCE:XRPUSDT', name: '리플' },
    { symbol: 'BINANCE:SOLUSDT', name: '솔라나' }
  ]

  const chartVisibility = {
    1: [0], // 첫 번째 차트만 보이기
    2: [0, 1], // 첫 번째, 두 번째 차트 보이기
    4: [0, 1, 2, 3] // 모든 차트 보이기
  }



  const getGridClass = () => {
    switch(chartMode) {
      case 1: return 'grid-1'
      case 2: return 'grid-2'
      case 4: return 'grid-4'
      default: return 'grid-1'
    }
  }

  // 캔버스 초기화 및 저장된 내용 복원
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      
      // 사용자가 로그인된 경우 저장된 그림 복원
      if (user) {
        // 약간의 지연을 두어 캔버스가 완전히 준비된 후 복원
        setTimeout(() => {
          loadCanvas()
        }, 100)
      }
    }
  }, [user]) // user가 변경될 때마다 실행

  // 사용자 변경 시 메모 로딩 및 로그아웃 시 정리
  useEffect(() => {
    if (user) {
      loadMemos()
    } else {
      // 로그아웃 시 화면 정리
      setMemos([])
      setCurrentMemo({ id: null, title: '', content: '' })
      setShowMemoEditor(false)
      setShowMemoList(false)
      setDrawingMode(false)
      
      // 캔버스도 지우기
      if (canvasRef.current) {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
  }, [user]) // user가 변경될 때마다 메모 로딩

  // 페이지 로딩 완료 후 데이터 복원
  useEffect(() => {
    // 컴포넌트 마운트 후 약간의 지연을 두어 완전히 준비된 후 실행
    const timer = setTimeout(() => {
      if (user && canvasRef.current) {
        loadCanvas()
        loadMemos()
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [])

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (mouseStopTimer) {
        clearTimeout(mouseStopTimer)
      }
    }
  }, [mouseStopTimer])

  // Shift 키 이벤트 리스너
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(true)
      }
    }

    const handleKeyUp = (e) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // 필기 모드 변경 시 커서 즉시 변경
  useEffect(() => {
    if (!drawingMode) {
      document.body.style.cursor = 'default'
    }
  }, [drawingMode])

  // selectedCategory가 변경될 때 펜/지우개 기능 관리
  useEffect(() => {
    if (selectedCategory !== 'pen' && drawingMode && drawingTool === 'pen') {
      setDrawingMode(false)
    }
    if (selectedCategory !== 'eraser' && drawingMode && drawingTool === 'eraser') {
      setDrawingMode(false)
    }
  }, [selectedCategory, drawingMode, drawingTool])

  // 차트 모드 변경 시 iframe 새로고침 제거 (모든 차트를 미리 로딩하므로 불필요)

  // 그리기 시작
  const startDrawing = (e) => {
    if (!drawingMode) return
    
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    // 스크롤과 패딩을 고려한 정확한 좌표 계산
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setMouseDownTime(Date.now())
    setStartPoint({ x, y })
    setIsDrawing(true)
    isDrawingRef.current = true
    setIsDrawingStraightLine(false)
    setLastMousePosition({ x, y })
    
    // 기존 타이머가 있다면 정리
    if (mouseStopTimer) {
      clearTimeout(mouseStopTimer)
      setMouseStopTimer(null)
    }
    
    const ctx = canvas.getContext('2d')
    
    // 펜 모드에서만 캔버스 상태 저장 (직선 그리기를 위해)
    if (drawingTool !== 'eraser') {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      setCanvasState(imageData)
    }
    
    // 펜 모드에서만 0.5초 타이머 설정 (지우개 모드에서는 타이머 없음)
    if (drawingTool !== 'eraser') {
      const timer = setTimeout(() => {
        if (isDrawingRef.current && startPoint && canvasState && drawingTool !== 'eraser') {
          const canvas = canvasRef.current
          if (!canvas) return
          
          const ctx = canvas.getContext('2d')
          
          // 현재 마우스 위치 또는 마지막 위치 사용
          const currentPos = lastMousePosition || { x, y }
          
          // 원래 캔버스 상태로 복원 (그린 선 제거)
          ctx.putImageData(canvasState, 0, 0)
          
          // 직선 그리기
          drawStraightLine(startPoint.x, startPoint.y, currentPos.x, currentPos.y)
          
          setIsDrawingStraightLine(true)
        }
      }, 500)
      setMouseStopTimer(timer)
    }
    
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  // 그리기 중
  const draw = (e) => {
    if (!isDrawing || !drawingMode) return
    
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // 펜 모드에서만 타이머 설정 (지우개 모드에서는 직선 변환 안함)
    if (!isDrawingStraightLine && drawingTool !== 'eraser') {
      if (mouseStopTimer) {
        clearTimeout(mouseStopTimer)
      }
      
      // 새로운 타이머 설정 (0.5초 후 직선으로 변환)
      const timer = setTimeout(() => {
        // ref를 사용하여 실시간 드로잉 상태 확인
        if (isDrawingRef.current && startPoint && canvasState && drawingTool !== 'eraser') {
          const canvas = canvasRef.current
          if (!canvas) return
          
          const ctx = canvas.getContext('2d')
          
          // 원래 캔버스 상태로 복원 (그린 선 제거)
          ctx.putImageData(canvasState, 0, 0)
          
          // 직선 그리기
          drawStraightLine(startPoint.x, startPoint.y, x, y)
          
          setIsDrawingStraightLine(true)
        }
      }, 500)
      
      setMouseStopTimer(timer)
    }
    
    setLastMousePosition({ x, y })
    
    // 이미 직선으로 변환된 상태라면 직선을 실시간 업데이트
    if (isDrawingStraightLine && startPoint && canvasState) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      // 원래 캔버스 상태로 복원 (이전 직선 제거)
      ctx.putImageData(canvasState, 0, 0)
      
      // 새로운 위치로 직선 그리기
      drawStraightLine(startPoint.x, startPoint.y, x, y)
      return
    }
    
    const ctx = canvas.getContext('2d')
    
    if (drawingTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineWidth = eraserSize
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = drawingColor
      ctx.lineWidth = drawingTool === 'highlighter' ? penSize * 2 : penSize
      ctx.globalAlpha = drawingTool === 'highlighter' ? 0.5 : 1
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      
      // 점선/실선 설정
      if (lineType === 'dashed') {
        ctx.setLineDash([5, 5])
      } else {
        ctx.setLineDash([])
      }
    }
    
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  // 그리기 끝
  const stopDrawing = (e) => {
    if (!isDrawing || !drawingMode) return
    
    // 타이머 즉시 정리 (직선 변환 방지)
    if (mouseStopTimer) {
      clearTimeout(mouseStopTimer)
      setMouseStopTimer(null)
    }
    
    // 상태 즉시 초기화
    setIsDrawing(false)
    isDrawingRef.current = false
    setStartPoint(null)
    setMouseDownTime(0)
    setCanvasState(null)
    setLastMousePosition(null)
    setIsDrawingStraightLine(false)
    
    // 그리기 완료 후 자동 저장
    setTimeout(() => {
      saveCanvas()
    }, 50) // 약간의 지연을 두어 그리기가 완전히 완료된 후 저장
  }

  // 각도를 15도 단위로 제한하는 함수
  const constrainAngle = (startX, startY, endX, endY) => {
    if (!isShiftPressed) return { x: endX, y: endY }
    
    const dx = endX - startX
    const dy = endY - startY
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    // 현재 각도 계산 (라디안)
    let angle = Math.atan2(dy, dx)
    
    // 15도 단위로 각도 제한
    const angleStep = 15 * Math.PI / 180 // 15도를 라디안으로
    const constrainedAngle = Math.round(angle / angleStep) * angleStep
    
    // 제한된 각도로 새로운 끝점 계산
    const newEndX = startX + Math.cos(constrainedAngle) * distance
    const newEndY = startY + Math.sin(constrainedAngle) * distance
    
    return { x: newEndX, y: newEndY }
  }

  // 직선 그리기 함수
  const drawStraightLine = (startX, startY, endX, endY) => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Shift 키가 눌렸을 때 각도 제한 적용
    const constrainedEnd = constrainAngle(startX, startY, endX, endY)
    
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(constrainedEnd.x, constrainedEnd.y)
    
    if (drawingTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineWidth = eraserSize
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = drawingColor
      ctx.lineWidth = drawingTool === 'highlighter' ? penSize * 2 : penSize
      ctx.globalAlpha = drawingTool === 'highlighter' ? 0.5 : 1
      
      if (lineType === 'dashed') {
        ctx.setLineDash([5, 5])
      } else {
        ctx.setLineDash([])
      }
    }
    
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }

  // 캔버스 저장 함수
  const saveCanvas = () => {
    if (!user || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const imageData = canvas.toDataURL()
    const storageKey = `chartDrawing_${user.email || user.username || 'guest'}`
    
    localStorage.setItem(storageKey, imageData)
  }

  // 캔버스 복원 함수
  const loadCanvas = () => {
    if (!user || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const storageKey = `chartDrawing_${user.email || user.username || 'guest'}`
    const savedData = localStorage.getItem(storageKey)
    
    if (savedData) {
      const img = new Image()
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
      }
      img.src = savedData
    }
  }

  // 메모 로딩 함수
  const loadMemos = () => {
    if (!user) {
      setMemos([])
      return
    }
    
    const storageKey = `chartMemos_${user.email || user.username || 'guest'}`
    const savedMemos = localStorage.getItem(storageKey)
    const memoData = savedMemos ? JSON.parse(savedMemos) : []
    setMemos(memoData)
  }

  // 메모 저장 함수 (localStorage)
  const saveMemoToStorage = (memoData) => {
    if (!user) return
    
    const storageKey = `chartMemos_${user.email || user.username || 'guest'}`
    localStorage.setItem(storageKey, JSON.stringify(memoData))
  }

  // 캔버스 지우기
  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // 지운 후 저장
    saveCanvas()
  }





  // 메모 관련 함수들
  const saveMemo = () => {
    if (!currentMemo.title.trim() || !currentMemo.content.trim()) return
    
    const newMemo = {
      ...currentMemo,
      id: currentMemo.id || Date.now(),
      createdAt: currentMemo.id ? currentMemo.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const updatedMemos = currentMemo.id 
      ? memos.map(memo => memo.id === currentMemo.id ? newMemo : memo)
      : [...memos, newMemo]
    
    setMemos(updatedMemos)
    saveMemoToStorage(updatedMemos)
    setCurrentMemo({ id: null, title: '', content: '' })
    setShowMemoEditor(false)
  }

  const deleteMemo = (memoId) => {
    const updatedMemos = memos.filter(memo => memo.id !== memoId)
    setMemos(updatedMemos)
    saveMemoToStorage(updatedMemos)
  }

  const editMemo = (memo) => {
    setCurrentMemo(memo)
    setShowMemoEditor(true)
    // 메모 리스트는 닫지 않음
  }

  const createNewMemo = () => {
    setCurrentMemo({ id: null, title: '', content: '' })
    setShowMemoEditor(true)
  }



  // 메모 에디터 드래그 함수들
  const handleMemoEditorMouseDown = useCallback((e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON') {
      return
    }
    
    setIsMemoEditorDragging(true)
    setMemoEditorDragOffset({
      x: e.clientX - memoEditorPosition.x,
      y: e.clientY - memoEditorPosition.y
    })
  }, [memoEditorPosition.x, memoEditorPosition.y])

  const handleMemoEditorMouseMove = useCallback((e) => {
    if (isMemoEditorDragging) {
      const newX = e.clientX - memoEditorDragOffset.x
      const newY = e.clientY - memoEditorDragOffset.y
      
      const editorWidth = 350
      const editorHeight = 400
      const maxX = window.innerWidth - editorWidth
      const maxY = window.innerHeight - editorHeight
      
      setMemoEditorPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      })
    }
  }, [isMemoEditorDragging, memoEditorDragOffset.x, memoEditorDragOffset.y])

  const handleMemoEditorMouseUp = useCallback(() => {
    setIsMemoEditorDragging(false)
  }, [])

  // 메모 에디터 드래그 이벤트 리스너
  useEffect(() => {
    if (isMemoEditorDragging) {
      document.addEventListener('mousemove', handleMemoEditorMouseMove)
      document.addEventListener('mouseup', handleMemoEditorMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMemoEditorMouseMove)
        document.removeEventListener('mouseup', handleMemoEditorMouseUp)
      }
    }
  }, [isMemoEditorDragging, handleMemoEditorMouseMove, handleMemoEditorMouseUp])

  // 툴팁 함수들
  const handleButtonMouseEnter = (buttonType, event) => {
    const rect = event.target.getBoundingClientRect()
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    })
    setHoveredButton(buttonType)
  }

  const handleButtonMouseLeave = () => {
    setHoveredButton(null)
  }

  // 로그인 요구 팝업 관련 함수들
  const checkLoginRequired = () => {
    if (!user) {
      setShowLoginRequiredModal(true)
      return true
    }
    return false
  }

  const handleLoginRedirect = () => {
    setShowLoginRequiredModal(false)
    navigate('/login')
  }

  const handleChartModeChange = (mode) => {
    if (mode !== 1 && checkLoginRequired()) {
      return
    }
    setChartMode(mode)
  }

  const handleDrawingToggle = () => {
    if (checkLoginRequired()) {
      return
    }
    setDrawingMode(true)
    setDrawingTool('pen')
  }

  const handleEraserToggle = () => {
    if (checkLoginRequired()) {
      return
    }
    setDrawingMode(true)
    setDrawingTool('eraser')
  }

  // 검색어에 따른 메모 필터링
  const filteredMemos = memos.filter(memo => {
    if (!memoSearchTerm) return true
    const searchTerm = memoSearchTerm.toLowerCase()
    return memo.title.toLowerCase().includes(searchTerm) || 
           memo.content.toLowerCase().includes(searchTerm)
  })

  return (
    <div className="chart-page">
      {/* 모바일 전용 헤더 */}
      <div className="mobile-page-header">
        <h1 className="mobile-page-title">실시간 차트</h1>
        <p className="mobile-page-description">PC로 접속하시면 더 많은 기능을 사용할 수 있습니다.</p>
      </div>
      
      {/* 메인 컨테이너 */}
      <div className="main-container">
        {/* 좌측 도구 패널 */}
        <div className="tool-container">
          {/* 제목 */}
          <div className="tool-container-title">도구 선택</div>
          
          {/* 메인 카테고리 버튼들 */}
          <div className="main-buttons">
            <button 
              className={`main-btn ${selectedCategory === 'chart' ? 'active' : ''}`}
              onClick={() => setSelectedCategory(selectedCategory === 'chart' ? null : 'chart')}
              onMouseEnter={(e) => handleButtonMouseEnter('chart', e)}
              onMouseLeave={handleButtonMouseLeave}
            >
              <span className="material-icons">dashboard</span>
            </button>
            <button 
              className={`main-btn ${selectedCategory === 'pen' ? 'active' : ''}`}
              onClick={() => {
                if (selectedCategory === 'pen') {
                  setSelectedCategory(null)
                  if (drawingMode && drawingTool === 'pen') {
                    setDrawingMode(false)
                  }
                } else {
                  setSelectedCategory('pen')
                  handleDrawingToggle()
                }
              }}
              onMouseEnter={(e) => handleButtonMouseEnter('pen', e)}
              onMouseLeave={handleButtonMouseLeave}
            >
              <span className="material-icons">edit</span>
            </button>
            <button 
              className={`main-btn ${selectedCategory === 'eraser' ? 'active' : ''}`}
              onClick={() => {
                if (selectedCategory === 'eraser') {
                  setSelectedCategory(null)
                  if (drawingMode && drawingTool === 'eraser') {
                    setDrawingMode(false)
                  }
                } else {
                  setSelectedCategory('eraser')
                  handleEraserToggle()
                }
              }}
              onMouseEnter={(e) => handleButtonMouseEnter('eraser', e)}
              onMouseLeave={handleButtonMouseLeave}
            >
              <span className="material-icons">cleaning_services</span>
            </button>
            <button 
              className={`main-btn ${selectedCategory === 'memo' ? 'active' : ''}`}
              onClick={() => setSelectedCategory(selectedCategory === 'memo' ? null : 'memo')}
              onMouseEnter={(e) => handleButtonMouseEnter('memo', e)}
              onMouseLeave={handleButtonMouseLeave}
            >
              <span className="material-icons">note_add</span>
            </button>
          </div>

          {/* 세부 옵션 영역 */}
          <div 
            className={`detail-options ${selectedCategory ? 'has-border' : ''}`}
          >
                        {/* 차트 선택 옵션 */}
            {selectedCategory === 'chart' && (
              <div className="chart-options">
                <div className="chart-section-title">차트 선택하기</div>
                <div className="chart-controls">
              <button 
                    className={`chart-btn ${chartMode === 1 ? 'active' : ''}`}
                onClick={() => handleChartModeChange(1)}
                onMouseEnter={(e) => handleButtonMouseEnter('chart1', e)}
                onMouseLeave={handleButtonMouseLeave}
              >
                <svg width="20" height="16" viewBox="0 0 24 20" fill="none">
                  <rect x="2" y="2" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                </svg>
              </button>
              <button 
                    className={`chart-btn ${chartMode === 2 ? 'active' : ''}`}
                onClick={() => handleChartModeChange(2)}
                onMouseEnter={(e) => handleButtonMouseEnter('chart2', e)}
                onMouseLeave={handleButtonMouseLeave}
              >
                <svg width="20" height="16" viewBox="0 0 24 20" fill="none">
                  <rect x="2" y="2" width="9" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <rect x="13" y="2" width="9" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                </svg>
              </button>
              <button 
                    className={`chart-btn ${chartMode === 4 ? 'active' : ''}`}
                onClick={() => handleChartModeChange(4)}
                onMouseEnter={(e) => handleButtonMouseEnter('chart4', e)}
                onMouseLeave={handleButtonMouseLeave}
              >
                <svg width="20" height="16" viewBox="0 0 24 20" fill="none">
                  <rect x="2" y="2" width="9" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <rect x="13" y="2" width="9" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <rect x="2" y="11" width="9" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <rect x="13" y="11" width="9" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                </svg>
              </button>
            </div>
              </div>
            )}

                                    {/* 펜 도구 옵션 */}
            {selectedCategory === 'pen' && (
              <div className="pen-options">
                {/* 색상 선택 */}
                <div className="option-section">
                  <div className="section-label-left">색상 선택</div>
                  <div className="color-palette-inline">
                    {availableColors.map(color => (
                      <button
                        key={color}
                        className={`color-option ${drawingColor === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setDrawingColor(color)}
                      />
                    ))}
                  </div>
                </div>

                              {/* 펜 크기 선택 */}
                <div className="option-section" style={{ marginTop: '8px' }}>
                  <div className="section-label-left">펜 크기</div>
                  <div className="size-options-left">
                    {availableSizes.map(size => (
                      <button
                        key={size}
                        className={`size-option ${penSize === size ? 'selected' : ''}`}
                        onClick={() => setPenSize(size)}
                      >
                        <div 
                          className="size-preview"
                          style={{
                            width: `${Math.min(size * 2, 20)}px`,
                            height: `${Math.min(size * 2, 20)}px`
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                              {/* 직선 그리기 안내 */}
                <div className="info-section">
                  <span className="material-icons">info</span>
                  <div className="info-text">
                    드로잉 유지시 직선 (Shift: 특수각)
                  </div>
                </div>
              </div>
            )}

                        {/* 지우개 옵션 */}
            {selectedCategory === 'eraser' && (
              <div className="eraser-options">
                                {/* 지우개 크기 선택 */}
                <div className="option-section">
                  <div className="section-label-left">지우개 크기</div>
                  <div className="size-options-left">
                    {availableEraserSizes.map(size => (
                      <button
                        key={size}
                        className={`size-option ${eraserSize === size ? 'selected' : ''}`}
                        onClick={() => setEraserSize(size)}
                      >
                        <div 
                          className="size-preview"
                          style={{
                            width: `${Math.min(size, 20)}px`,
                            height: `${Math.min(size, 20)}px`
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

              {/* 모두 지우기 버튼 */}
              <button 
                  className="clear-all-btn"
                onClick={clearCanvas}
              >
                <span className="material-icons">delete</span>
                  <span>모두 지우기</span>
              </button>
            </div>
            )}

                        {/* 메모 옵션 */}
            {selectedCategory === 'memo' && (
              <div className="memo-options">
                <button 
                  className="memo-action-btn"
                onClick={createNewMemo}
              >
                <span className="material-icons">note_add</span>
                  <span>새 메모 작성</span>
              </button>
              <button 
                  className={`memo-action-btn ${showMemoList ? 'active' : ''}`}
                onClick={() => setShowMemoList(!showMemoList)}
              >
                <span className="material-icons">list_alt</span>
                  <span>메모 리스트</span>
              </button>
              
              {/* 드롭다운 메모 리스트 */}
              {showMemoList && (
                <div className="memo-dropdown">
                  {/* 검색 입력창 */}
                  <div className="memo-search-container">
                    <input
                      type="text"
                      placeholder="메모 검색..."
                      value={memoSearchTerm}
                      onChange={(e) => setMemoSearchTerm(e.target.value)}
                      className="memo-search-input"
                    />
                  </div>
                  
                  {/* 메모 목록 */}
                  {memos.length === 0 ? (
                    <div className="no-memos-dropdown">저장된 메모가 없습니다.</div>
                  ) : filteredMemos.length === 0 ? (
                    <div className="no-memos-dropdown">검색 결과가 없습니다.</div>
                  ) : (
                    filteredMemos.map(memo => (
                      <div key={memo.id} className="memo-dropdown-item" onClick={() => editMemo(memo)}>
                        <div className="memo-dropdown-title">{memo.title}</div>
                        <div className="memo-dropdown-preview">{memo.content.substring(0, 50)}...</div>
                        <div className="memo-dropdown-date">
                          {new Date(memo.updatedAt).toLocaleDateString('ko-KR')}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            )}
          </div>
        </div>

        {/* 차트 컨테이너 */}
        <div className="chart-wrapper">
          <div className={`chart-container ${getGridClass()}`}>
            {allCharts.map((chart, index) => (
              <div 
                key={`${chart.symbol}_${index}`} 
                className={`chart-item ${chartVisibility[chartMode].includes(index) ? 'visible' : 'hidden'}`}
              >
                <SimpleTradingViewChart
                  symbol={chart.symbol}
                  width="100%"
                  height="100%"
                />
              </div>
            ))}
          </div>
          
          {/* 그리기 캔버스 - 항상 렌더링, 그리기 모드에 따라 상호작용만 제어 */}
          <canvas
            ref={canvasRef}
            className="drawing-canvas"
            width={window.innerWidth}
            height={window.innerHeight}
            style={{
              cursor: drawingMode ? (
                drawingTool === 'eraser' 
                  ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M16.24 3.56l4.95 4.94c.78.79.78 2.05 0 2.84L12 20.53a4.008 4.008 0 0 1-5.66 0L2.81 17c-.78-.79-.78-2.05 0-2.84l8.49-8.49c.79-.78 2.05-.78 2.84 0l2.1 2.1zm-1.41 1.41L12 2.15 3.51 10.64l3.54 3.54 8.49-8.49-1.41-1.41z' fill='%23ffffff' stroke='%23000' stroke-width='1'/%3E%3Cpath d='M8.12 15.71l3.54-3.54 1.41 1.41-3.54 3.54c-.39.39-1.02.39-1.41 0s-.39-1.02 0-1.41z' fill='%23f0f0f0'/%3E%3C/svg%3E") 12 12, crosshair`
                  : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Ccircle cx='10' cy='10' r='${penSize}' fill='${encodeURIComponent(drawingColor)}' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E") 10 10, crosshair`
              ) : 'default',
              pointerEvents: drawingMode ? 'auto' : 'none'
            }}
            onMouseDown={drawingMode ? startDrawing : undefined}
            onMouseMove={drawingMode ? draw : undefined}
            onMouseUp={drawingMode ? stopDrawing : undefined}
            onMouseLeave={drawingMode ? stopDrawing : undefined}
            onContextMenu={drawingMode ? (e) => {
              e.preventDefault()
              setDrawingMode(false)
              setDrawingTool('pen')
              setExpandedSection(null)
            } : undefined}
          />
        </div>
      </div>

      {/* 툴팁 */}
      {hoveredButton && (
        <div 
          className="tooltip"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`
          }}
        >
          {hoveredButton === 'chart' && '차트 선택'}
          {hoveredButton === 'pen' && '펜 도구'}
          {hoveredButton === 'eraser' && '지우개 도구'}
          {hoveredButton === 'memo' && '메모 도구'}
          {hoveredButton === 'drawing' && '필기하기'}
          {hoveredButton === 'chart1' && '차트 1개'}
          {hoveredButton === 'chart2' && '차트 2개'}
          {hoveredButton === 'chart4' && '차트 4개'}
        </div>
      )}

      {/* 메모 에디터 */}
      {showMemoEditor && (
        <div 
          ref={memoEditorRef}
          className="memo-editor"
          style={{
            left: `${memoEditorPosition.x}px`,
            top: `${memoEditorPosition.y}px`,
            cursor: isMemoEditorDragging ? 'grabbing' : 'grab'
          }}
          onMouseDown={handleMemoEditorMouseDown}
        >
          <div className="memo-header">
            <input
              type="text"
              placeholder="메모 제목"
              value={currentMemo.title}
              onChange={(e) => setCurrentMemo({...currentMemo, title: e.target.value})}
              className="memo-title-input"
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: 'white', 
                fontSize: '16px', 
                fontWeight: '600',
                margin: 0,
                padding: 0,
                flex: 1
              }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="save-btn-header"
                onClick={saveMemo}
              >
                <span className="material-icons">save</span>
              </button>
              <button 
                className="close-btn"
                onClick={() => setShowMemoEditor(false)}
              >
                ✕
              </button>
            </div>
          </div>
          <div className="memo-content">
            <textarea
              placeholder="메모 내용을 입력하세요..."
              value={currentMemo.content}
              onChange={(e) => setCurrentMemo({...currentMemo, content: e.target.value})}
              className="memo-content-input"
              rows="6"
            />
          </div>
        </div>
      )}

      {/* 로그인 요구 팝업 모달 */}
      {showLoginRequiredModal && (
        <div className="login-required-modal-overlay" onClick={() => setShowLoginRequiredModal(false)}>
          <div className="login-required-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <h3>로그인이 필요합니다</h3>
              <p>차트 변경 및 드로잉 기능을 사용하려면 로그인이 필요합니다.</p>
              <div className="modal-buttons">
                <button 
                  className="modal-cancel-btn"
                  onClick={() => setShowLoginRequiredModal(false)}
                >
                  취소
                </button>
                <button 
                  className="modal-login-btn"
                  onClick={handleLoginRedirect}
                >
                  로그인하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        
        .chart-page {
          padding-top: 100px;
          min-height: 100vh;
          width: 100%;
          position: relative;
          padding-bottom: 50px;
          overflow: visible;
        }

        .main-container {
          position: relative;
          width: 100%;
          height: calc(100vh - 100px);
        }

        .tool-container {
          position: fixed;
          top: 120px;
          left: 30px;
          width: 280px;
          max-height: calc(100vh - 140px);
          z-index: 10000;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(128, 128, 128, 0.01));
          border: 1px solid #374151;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          user-select: none;
          backdrop-filter: blur(20px);
          overflow: hidden;
        }

        .tool-container-title {
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
          padding: 20px 20px 8px 20px;
          text-align: left;
          letter-spacing: 0.5px;
        }

        .chart-section-title {
          color: #d1d5db;
          font-size: 14px;
          font-weight: 500;
          padding: 0 0 8px 0;
          text-align: left;
          letter-spacing: 0.3px;
          margin-left: 0;
        }

        .main-buttons {
          display: flex;
          gap: 8px;
          padding: 8px 20px 12px 20px;
          justify-content: flex-start;
        }

        .main-btn {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(128, 128, 128, 0.01));
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #9ca3af;
          width: 48px;
          height: 48px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .main-btn .material-icons {
          font-size: 20px;
        }

        .main-btn:hover {
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.2);
        }

        .main-btn.active {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(14, 165, 233, 0.15));
          border-color: rgba(59, 130, 246, 0.3);
          color: white;
        }

        .detail-options {
          padding: 0 20px 20px 20px;
          max-height: calc(100vh - 280px);
          overflow-y: auto;
        }

        .detail-options.has-border {
          padding: 20px;
        }

        .detail-options.has-border {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .detail-options.has-border {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .option-title {
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 16px;
          letter-spacing: 0.5px;
        }

        .option-section {
          margin-bottom: 20px;
        }

        .section-label {
          color: #d1d5db;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .section-label-left {
          color: #d1d5db;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
          text-align: left;
        }

        .chart-controls {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }

        .chart-btn {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(128, 128, 128, 0.01));
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #9ca3af;
          width: 48px;
          height: 48px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .chart-btn:hover {
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.2);
        }

        .chart-btn.active {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(14, 165, 233, 0.15));
          border-color: rgba(59, 130, 246, 0.3);
          color: white;
        }

        .activate-btn {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(128, 128, 128, 0.01));
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #9ca3af;
          padding: 12px 16px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          width: 100%;
          margin-bottom: 16px;
        }

        .activate-btn:hover {
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.2);
        }

        .activate-btn.active {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.15));
          border-color: rgba(34, 197, 94, 0.3);
          color: white;
        }

        .info-section {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #9ca3af;
          font-size: 13px;
          padding: 12px;
          background: rgba(156, 163, 175, 0.1);
          border-radius: 8px;
        }

        .info-section .material-icons {
          font-size: 16px;
        }

        .info-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .clear-all-btn {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05));
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #9ca3af;
          padding: 12px 16px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          width: 100%;
          margin-top: 16px;
        }

        .clear-all-btn:hover {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.1));
          color: white;
        }

        .memo-action-btn {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(128, 128, 128, 0.01));
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #9ca3af;
          padding: 12px 16px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          width: 100%;
          margin-bottom: 8px;
        }

        .memo-action-btn:hover {
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.2);
        }

        .memo-action-btn.active {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(14, 165, 233, 0.15));
          border-color: rgba(59, 130, 246, 0.3);
          color: white;
        }







        .icon-btn {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(128, 128, 128, 0.01));
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #9ca3af;
          padding: 12px;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 44px;
          min-height: 44px;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(20px);
        }

        .icon-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        }

        .icon-btn:hover::before {
          left: 100%;
        }

        .icon-btn .material-icons {
          font-size: 22px;
          color: #9ca3af;
          z-index: 1;
        }

        .icon-btn:hover {
          color: #d1d5db;
        }

        .icon-btn:hover .material-icons {
          color: #ffffff;
        }

        .icon-btn.active {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(14, 165, 233, 0.15));
          border-color: rgba(59, 130, 246, 0.3);
          color: white;
        }

        .icon-btn.active .material-icons {
          color: white;
        }

        .icon-btn svg {
          color: #9ca3af;
          z-index: 1;
        }

        .icon-btn:hover svg {
          color: #ffffff;
        }

        .icon-btn.active svg {
          color: white;
        }



        .tool-btn {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(128, 128, 128, 0.01));
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #9ca3af;
          padding: 12px;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 44px;
          min-height: 44px;
          backdrop-filter: blur(20px);
        }

        .tool-btn:hover {
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.2);
        }

        .tool-btn.active {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(14, 165, 233, 0.15));
          border-color: rgba(59, 130, 246, 0.3);
          color: white;
        }

        .tool-btn .material-icons {
          font-size: 20px;
        }



        .drawing-controls {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .eraser-controls {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .memo-controls {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 200px;
          position: relative;
          align-items: flex-start;
        }

        .memo-btn {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(128, 128, 128, 0.01));
          color: #9ca3af;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 12px 16px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          min-height: 44px;
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(20px);
          white-space: nowrap;
        }



        .memo-btn .material-icons {
          font-size: 22px;
          color: #9ca3af;
          z-index: 1;
        }

        .memo-btn:hover {
          color: #ffffff;
        }

        .memo-btn:hover .material-icons {
          color: #ffffff;
        }

        .memo-btn.active {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(14, 165, 233, 0.15));
          border-color: rgba(59, 130, 246, 0.3);
          color: white;
        }

        .memo-btn.active .material-icons {
          color: white;
        }

        .memo-dropdown {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(128, 128, 128, 0.01));
          border: 1px solid #374151;
          border-radius: 12px;
          max-height: 300px;
          overflow-y: auto;
          min-width: 200px;
          box-sizing: border-box;
          z-index: 10001;
          backdrop-filter: blur(20px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          margin-top: 8px;
        }

        .memo-search-container {
          padding: 8px;
          border-bottom: 1px solid #374151;
        }

        .memo-search-input {
          width: 100%;
          background: #111111;
          border: none;
          color: #f1f5f9;
          padding: 6px 8px;
          border-radius: 4px;
          font-size: 13px;
          box-sizing: border-box;
          min-width: 150px;
        }

        .memo-search-input:focus {
          outline: none;
          border-color: #6680fd;
        }

        .memo-search-input::placeholder {
          color: #6b7280;
        }

        .memo-dropdown-item {
          padding: 8px 12px;
          border-bottom: 1px solid #374151;
          cursor: pointer;
        }

        .memo-dropdown-item:last-child {
          border-bottom: none;
        }

        .memo-dropdown-item:hover {
          background: #191919;
        }

        .memo-dropdown-title {
          color: white;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 4px;
          text-align: left;
        }

        .memo-dropdown-preview {
          color: #9ca3af;
          font-size: 12px;
          line-height: 1.4;
          margin-bottom: 4px;
          text-align: left;
        }

        .memo-dropdown-date {
          color: #6b7280;
          font-size: 11px;
          text-align: left;
        }

        .no-memos-dropdown {
          padding: 12px;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }

        .memo-editor {
          position: fixed;
          z-index: 10001;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(128, 128, 128, 0.01));
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          width: 260px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          user-select: none;
          backdrop-filter: blur(20px);
        }

        .memo-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: transparent;
          border-radius: 12px 12px 0 0;
          color: white;
          font-weight: 600;
          cursor: grab;
        }

        .memo-header:active {
          cursor: grabbing;
        }

        .close-btn {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05));
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #9ca3af;
          cursor: pointer;
          font-size: 16px;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
        }

        .close-btn:hover {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.1));
          color: white;
          transform: translateY(-1px);
        }

        .save-btn-header {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.05));
          border: 1px solid rgba(34, 197, 94, 0.2);
          color: #9ca3af;
          cursor: pointer;
          font-size: 16px;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
        }

        .save-btn-header:hover {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.1));
          color: white;
          transform: translateY(-1px);
        }

        .save-btn-header .material-icons {
          font-size: 18px;
          transition: all 0.3s ease;
        }

        .memo-content {
          padding: 4px 16px 16px 16px;
          background: transparent;
        }

        .memo-title-input {
          width: 100%;
          background: transparent;
          border: none;
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          margin-bottom: 12px;
          font-size: 14px;
        }

        .memo-title-input:focus {
          outline: none;
        }

        .memo-content-input {
          width: 100%;
          background: transparent;
          border: none;
          color: white;
          padding: 0;
          border-radius: 6px;
          margin: 0;
          font-size: 14px;
          resize: vertical;
          font-family: inherit;
        }

        .memo-content-input:focus {
          outline: none;
        }

        .memo-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .save-btn {
          background: #10b981;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .save-btn .material-icons {
          font-size: 18px;
        }

        .save-btn:hover {
          background: #059669;
        }

        .cancel-btn {
          background: #6b7280;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .cancel-btn:hover {
          background: #4b5563;
        }

        .memo-list-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10002;
        }

        .memo-list-content {
          background: #111111;
          border: 1px solid #475569;
          border-radius: 12px;
          width: 500px;
          max-height: 600px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
        }

        .memo-list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: #1a1a1a;
          border-bottom: 1px solid #475569;
        }

        .memo-list-header h3 {
          color: white;
          margin: 0;
          font-size: 18px;
        }

        .memo-list-body {
          max-height: 500px;
          overflow-y: auto;
          padding: 16px;
        }

        .no-memos {
          text-align: center;
          color: #6b7280;
          padding: 40px 20px;
          font-size: 16px;
        }

        .memo-item {
          background: #1a1a1a;
          border: 1px solid #475569;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
          transition: all 0.3s ease;
        }

        .memo-item:hover {
          border-color: #6680fd;
          background: rgba(102, 128, 253, 0.1);
        }

        .memo-item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .memo-item-header h4 {
          color: white;
          margin: 0;
          font-size: 16px;
          cursor: pointer;
          flex: 1;
        }

        .memo-item-header h4:hover {
          color: #6680fd;
        }

        .delete-btn {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          font-size: 16px;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .delete-btn .material-icons {
          font-size: 20px;
        }

        .delete-btn:hover {
          background: rgba(220, 38, 38, 0.2);
          color: #dc2626;
        }

        .memo-preview {
          color: #9ca3af;
          font-size: 14px;
          line-height: 1.4;
          margin: 8px 0;
        }

        .memo-date {
          color: #6b7280;
          font-size: 12px;
        }

        .chart-wrapper {
          position: absolute;
          top: 40px;
          left: 0;
          right: 0;
          height: calc(75vh - 20px);
          padding: 0;
          box-sizing: border-box;
          z-index: 1;
        }

        .drawing-canvas {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 9999;
          cursor: crosshair;
          pointer-events: auto;
        }

        .chart-container {
          width: 100% !important;
          height: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
          gap: 8px;
          background: transparent !important;
          border: none !important;
        }

        .grid-1 {
          display: grid;
          grid-template-columns: 1fr;
          background: transparent !important;
        }

        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: transparent !important;
        }

        .grid-4 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          background: transparent !important;
        }

        .chart-item {
          position: relative;
          background: transparent;
          border: none;
          overflow: hidden;
          min-height: 350px;
        }

        .chart-item.visible {
          display: block;
        }

        .chart-item.hidden {
          display: none;
        }

        .chart-title {
          position: absolute;
          top: 12px;
          left: 12px;
          color: #94a3b8;
          font-size: 14px;
          font-weight: 600;
          z-index: 10;
          background: rgba(0, 0, 0, 0.8);
          padding: 6px 12px;
          border-radius: 6px;
          backdrop-filter: blur(10px);
        }

        .tradingview-widget-container {
          width: 100% !important;
          height: 100% !important;
          background: transparent !important;
        }

        .tradingview-widget-container__widget {
          width: 100% !important;
          height: 100% !important;
        }

        .tool-btn {
          flex: 1;
          background: transparent;
          border: 1px solid #475569;
          color: #cbd5e1;
          padding: 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tool-btn .material-icons {
          font-size: 18px;
        }

        .tool-btn:hover {
          background: rgba(102, 128, 253, 0.2);
          border-color: #6680fd;
        }

        .tool-btn.active {
          background: #6680fd;
          border-color: #6680fd;
          color: white;
        }

        .color-section {
          width: 100%;
        }

        .color-palette {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-top: 8px;
        }

        .color-palette-inline {
          display: flex;
          gap: 8px;
          flex-wrap: nowrap;
          align-items: center;
        }

        .color-option {
          width: 28px;
          height: 28px;
          border: 2px solid #475569;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .color-option:hover {
          transform: scale(1.1);
        }

        .color-option.selected {
          border-color: #6680fd;
          box-shadow: 0 0 0 2px rgba(102, 128, 253, 0.3);
        }

        .size-section {
          width: 100%;
        }

        .size-options {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
          margin-top: 8px;
        }

        .size-options-left {
          display: flex;
          gap: 8px;
          flex-wrap: nowrap;
          align-items: center;
          justify-content: flex-start;
        }

        .size-option {
          background: transparent;
          border: none;
          color: #cbd5e1;
          padding: 6px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 28px;
          min-height: 28px;
        }

        .size-option:hover {
          background: transparent;
        }

        .size-option.selected {
          background: transparent;
          color: white;
        }

        .size-preview {
          border-radius: 50%;
          background-color: #6b7280;
          transition: background-color 0.3s ease;
        }

        .size-option:hover .size-preview {
          background-color: #ffffff;
        }

        .size-option.selected .size-preview {
          background-color: #ffffff;
        }

        .straight-line-info {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #9ca3af;
          font-size: 11px;
          padding: 8px 12px;
          background: rgba(156, 163, 175, 0.1);
          border-radius: 8px;
          width: 100%;
        }

        .straight-line-info .material-icons {
          font-size: 14px;
        }

        .clear-btn {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(128, 128, 128, 0.01));
          color: #9ca3af;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 12px 16px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: flex-start;
          min-height: 44px;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(20px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          white-space: nowrap;
        }

        .clear-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .clear-btn:hover::before {
          left: 100%;
        }

        .clear-btn .material-icons {
          font-size: 22px;
          color: #9ca3af;
          transition: all 0.3s ease;
          z-index: 1;
        }

        .clear-btn:hover {
          transform: translateY(-2px);
          color: #ffffff;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
        }

        .clear-btn:hover .material-icons {
          color: #ffffff;
        }

        .eraser-size-section {
          width: 100%;
        }

        .tooltip {
          position: fixed;
          background: #1f2937;
          color: white;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          z-index: 10003;
          transform: translateX(-50%) translateY(-100%);
          pointer-events: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          border: 1px solid #374151;
          opacity: 0;
          animation: tooltipFadeIn 0.2s ease-out forwards;
        }

        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-100%) translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(-100%) translateY(0);
          }
        }

        .tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 5px solid transparent;
          border-top-color: #1f2937;
        }

        .chart-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .section-title {
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 4px;
          padding-left: 4px;
          opacity: 0.9;
          letter-spacing: 0.5px;
        }

        .chart-controls {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          justify-content: flex-start;
        }

        @media (max-width: 768px) {
          .chart-page {
            padding-top: 80px;
            padding-bottom: 20px;
          }

          .main-container {
            flex-direction: column;
            height: auto;
          }

          .tool-container {
            position: relative;
            top: auto;
            left: auto;
            width: calc(100% - 20px);
            margin: 10px;
            max-height: none;
            border-radius: 12px;
          }

          .tool-container-title {
            padding: 16px 16px 10px 16px;
            font-size: 14px;
          }

          .chart-section-title {
            padding: 0 0 6px 0;
            font-size: 13px;
          }

          .main-buttons {
            padding: 8px 16px 16px 16px;
            gap: 6px;
          }

          .main-btn {
            width: 42px;
            height: 42px;
          }

          .main-btn .material-icons {
            font-size: 18px;
          }

          .detail-options {
            padding: 16px;
            max-height: 300px;
          }

          .chart-wrapper {
            width: 100%;
            height: calc(70vh - 120px);
            left: 0;
            right: 0;
            padding: 10px;
            margin-top: 10px;
          }

          .chart-container {
            height: 100%;
            border-radius: 8px;
            overflow: hidden;
          }

          .chart-controls {
            flex-wrap: wrap;
            justify-content: center;
            gap: 8px;
          }

          .chart-btn {
            width: 40px;
            height: 40px;
          }

          .color-palette-inline {
            flex-wrap: wrap;
            gap: 6px;
          }

          .color-option {
            width: 24px;
            height: 24px;
          }

          .size-options-left {
            flex-wrap: wrap;
            gap: 6px;
          }

          .size-option {
            width: 36px;
            height: 36px;
          }

          .option-section {
            margin-bottom: 16px;
          }

          .section-label-left {
            font-size: 13px;
          }

          .info-section {
            font-size: 12px;
            padding: 10px;
          }

          .memo-action-btn {
            padding: 10px 14px;
            font-size: 13px;
          }

          .clear-all-btn {
            padding: 10px 14px;
            font-size: 13px;
          }

          .memo-editor {
            width: 240px;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%);
          }

          .memo-dropdown {
            max-height: 200px;
          }

          .drawing-controls {
            gap: 8px;
          }

          .eraser-controls {
            gap: 8px;
          }

          .memo-controls {
            width: 100%;
          }

          .memo-btn {
            width: 100%;
          }

          .clear-btn {
            width: 100%;
          }

          .grid-2 {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 1fr;
          }

          .grid-4 {
            grid-template-columns: 1fr;
            grid-template-rows: repeat(4, 1fr);
          }

          .drawing-canvas {
            width: 100% !important;
            height: 100% !important;
          }
        }

        @media (max-width: 480px) {
          .chart-page {
            padding-top: 70px;
            padding-bottom: 15px;
          }

          .tool-container {
            width: calc(100% - 16px);
            margin: 8px;
          }

          .tool-container-title {
            padding: 12px 12px 8px 12px;
            font-size: 13px;
          }

          .main-buttons {
            padding: 6px 12px 12px 12px;
            gap: 4px;
          }

          .main-btn {
            width: 38px;
            height: 38px;
          }

          .main-btn .material-icons {
            font-size: 16px;
          }

          .detail-options {
            padding: 12px;
            max-height: 250px;
          }

          .chart-wrapper {
            width: 100%;
            height: calc(60vh - 100px);
            padding: 8px;
            margin-top: 8px;
          }

          .chart-controls {
            gap: 6px;
          }

          .chart-btn {
            width: 36px;
            height: 36px;
          }

          .color-option {
            width: 20px;
            height: 20px;
          }

          .size-option {
            width: 32px;
            height: 32px;
          }

          .option-section {
            margin-bottom: 12px;
          }

          .section-label-left {
            font-size: 12px;
            margin-bottom: 6px;
          }

          .info-section {
            font-size: 11px;
            padding: 8px;
          }

          .memo-action-btn {
            padding: 8px 12px;
            font-size: 12px;
          }

          .clear-all-btn {
            padding: 8px 12px;
            font-size: 12px;
          }

          .memo-editor {
            width: calc(100vw - 32px);
            max-width: 280px;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%);
          }

          .memo-header {
            padding: 10px 12px;
          }

          .memo-title-input {
            font-size: 14px !important;
          }

          .memo-content-input {
            font-size: 13px;
          }

          .memo-dropdown {
            max-height: 150px;
            font-size: 12px;
          }

          .memo-dropdown-title {
            font-size: 13px;
          }

          .memo-dropdown-preview {
            font-size: 11px;
          }

          .memo-dropdown-date {
            font-size: 10px;
          }

          .tooltip {
            font-size: 11px;
            padding: 4px 8px;
          }

          .grid-4 {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr 1fr;
          }
        }

        /* 로그인 요구 팝업 모달 스타일 - 도구 선택 팝업과 일관성 있는 디자인 */
        .login-required-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 20000;
          backdrop-filter: blur(5px);
          animation: overlayFadeIn 0.3s ease-out;
        }

        @keyframes overlayFadeIn {
          from {
            opacity: 0;
            backdrop-filter: blur(0px);
          }
          to {
            opacity: 1;
            backdrop-filter: blur(5px);
          }
        }

        .login-required-modal {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(128, 128, 128, 0.01));
          border: 1px solid #374151;
          border-radius: 20px;
          padding: 0;
          width: 420px;
          max-width: 90vw;
          position: relative;
          overflow: hidden;
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.15),
            0 0 20px rgba(59, 130, 246, 0.12),
            0 0 40px rgba(59, 130, 246, 0.06),
            0 0 80px rgba(59, 130, 246, 0.03),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          transform: scale(0.9) translateY(20px);
          opacity: 0;
          animation: modalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          user-select: none;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .login-required-modal::before {
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
          animation: modalGlow 4s ease-in-out infinite;
        }

        @keyframes modalGlow {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.005);
          }
        }

        @keyframes modalSlideIn {
          0% {
            transform: scale(0.9) translateY(20px);
            opacity: 0;
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        .modal-content {
          padding: 32px 28px;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .modal-content::before {
          content: '🔑';
          font-size: 36px;
          display: block;
          margin-bottom: 20px;
          opacity: 0.9;
          animation: keyRotate 3s ease-in-out infinite;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
        }

        @keyframes keyRotate {
          0%, 100% {
            transform: rotate(-15deg) scale(1);
          }
          25% {
            transform: rotate(15deg) scale(1.1);
          }
          50% {
            transform: rotate(-10deg) scale(1.05);
          }
          75% {
            transform: rotate(10deg) scale(1.1);
          }
        }

        .modal-content h3 {
          color: #ffffff;
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 12px 0;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
          letter-spacing: 0.5px;
        }

        .modal-content p {
          color: #9ca3af;
          font-size: 14px;
          line-height: 1.5;
          margin: 0 0 28px 0;
          font-weight: 400;
        }

        .modal-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .modal-cancel-btn {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(128, 128, 128, 0.01));
          color: #9ca3af;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 12px 24px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(20px);
          position: relative;
          overflow: hidden;
          min-width: 100px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .modal-cancel-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .modal-cancel-btn:hover::before {
          left: 100%;
        }

        .modal-cancel-btn:hover {
          transform: translateY(-2px);
          color: #d1d5db;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
        }

        .modal-login-btn {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(14, 165, 233, 0.15));
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: white;
          padding: 12px 28px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(20px);
          position: relative;
          overflow: hidden;
          min-width: 120px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
          transform: translateY(-1px);
        }

        .modal-login-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .modal-login-btn:hover::before {
          left: 100%;
        }

        .modal-login-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
          border-color: rgba(59, 130, 246, 0.4);
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(14, 165, 233, 0.2));
        }

        .modal-login-btn:active {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        /* 반응형 디자인 */
        @media (max-width: 480px) {
          .login-required-modal {
            width: 90vw;
            margin: 20px;
          }
          
          .modal-content {
            padding: 28px 20px;
          }
          
          .modal-content h3 {
            font-size: 16px;
          }
          
          .modal-content p {
            font-size: 13px;
          }
          
          .modal-buttons {
            flex-direction: column;
            gap: 10px;
          }
          
          .modal-cancel-btn,
          .modal-login-btn {
            width: 100%;
            padding: 14px;
          }
        }
      `}</style>
    </div>
  )
}

export default Chart 