import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PageLoader from '../components/PageLoader'
import { useScrollToTop } from '../hooks/useScrollToTop'
import { isFullWidthRoute } from '../constants/routes'

/** 공통 쉘: Navbar + 콘텐츠 + Footer */
const MainLayout = () => {
  const { pathname } = useLocation()
  useScrollToTop(pathname)

  const contentClass = isFullWidthRoute(pathname) ? '' : 'container'

  return (
    <div className="App">
      <Navbar />
      <div className={contentClass}>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </div>
      <Footer />
    </div>
  )
}

export default MainLayout
