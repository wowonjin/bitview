import { useEffect } from 'react'

const STORAGE_KEY = 'visitorStats'

function generatePlaceholderIP() {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.')
}

/** 방문자 통계(localStorage) — 추후 서버 API로 교체 가능 */
export function useVisitorStats() {
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    let visitorStats = raw ? JSON.parse(raw) : { ips: [], today: 0 }

    const currentIP = generatePlaceholderIP()
    if (!visitorStats.ips.includes(currentIP)) {
      visitorStats.ips.push(currentIP)
      visitorStats.today = visitorStats.ips.length
      localStorage.setItem(STORAGE_KEY, JSON.stringify(visitorStats))
    }

    const now = new Date()
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0)
    const msToMidnight = midnight.getTime() - now.getTime()

    const resetTimer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ips: [], today: 0 }))
    }, msToMidnight)

    return () => clearTimeout(resetTimer)
  }, [])
}
