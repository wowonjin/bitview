import { useEffect } from 'react'

/** 라우트 변경 시 스크롤을 상단으로 이동 */
export function useScrollToTop(pathname) {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
}
