import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import Statistics from './components/Statistics'
import CryptoCards from './components/CryptoCards'
import Footer from './components/Footer'
import Chart from './pages/Chart'
import Backtest from './pages/Backtest'
import Trading from './pages/Trading'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Admin from './pages/Admin'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={
              <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Hero />
              </motion.main>
            } />
            <Route path="/chart" element={<Chart />} />
            <Route path="/backtest" element={<Backtest />} />
            <Route path="/trading" element={<Trading />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
