import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import Statistics from './components/Statistics'
import CryptoCards from './components/CryptoCards'
import Footer from './components/Footer'
import Chart from './pages/Chart'

import AdvancedBacktest from './pages/AdvancedBacktest'
import ProfitCalculator from './pages/ProfitCalculator'
import FundingCalculator from './pages/FundingCalculator'
import LiveCoins from './pages/LiveCoins'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Admin from './pages/Admin'
import Premium from './pages/Premium'
import './App.css'

const AppContent = () => {
  const location = useLocation();
  const isPremiumPage = location.pathname === '/premium';
  const isAuthPage = ['/login', '/signup'].includes(location.pathname);

  return (
    <div className={isPremiumPage || isAuthPage ? "" : "container"}>
          <Routes>
            <Route path="/" element={
              <>
                <Hero />
              </>
            } />
            <Route path="/live-coins" element={<LiveCoins />} />
            <Route path="/chart" element={<Chart />} />

            <Route path="/advanced-backtest" element={<AdvancedBacktest />} />
            <Route path="/profit-calculator" element={<ProfitCalculator />} />
            <Route path="/funding-calculator" element={<FundingCalculator />} />
            <Route path="/premium" element={<Premium />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
    </div>
  )
}

function App() {
  // 방문자 IP 기록 함수
  const recordVisitorIP = () => {
    // 실제 환경에서는 서버에서 IP를 가져와야 하지만, 클라이언트에서는 임의의 IP 생성
    const generateRandomIP = () => {
      return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`
    }
    
    // 현재 방문자 데이터 가져오기
    const visitorData = localStorage.getItem('visitorStats')
    let visitorStats = visitorData ? JSON.parse(visitorData) : { ips: [], today: 0 }
    
    // 현재 IP 가져오기 (실제로는 서버에서 제공해야 함)
    const currentIP = generateRandomIP()
    
    // IP가 이미 기록되어 있지 않으면 추가
    if (!visitorStats.ips.includes(currentIP)) {
      visitorStats.ips.push(currentIP)
      visitorStats.today = visitorStats.ips.length
      localStorage.setItem('visitorStats', JSON.stringify(visitorStats))
    }
  }
  
  // 컴포넌트 마운트 시 방문자 기록
  useEffect(() => {
    recordVisitorIP()
    
    // 매일 자정에 방문자 통계 초기화 (실제 구현에서는 서버에서 처리)
    const now = new Date()
    const night = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1, // 다음날
      0, 0, 0 // 자정
    )
    const msToMidnight = night.getTime() - now.getTime()
    
    const resetTimer = setTimeout(() => {
      localStorage.setItem('visitorStats', JSON.stringify({ ips: [], today: 0 }))
    }, msToMidnight)
    
    return () => clearTimeout(resetTimer)
  }, [])
  
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <AppContent />
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
