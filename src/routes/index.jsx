import { lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import AdminRoute from '../components/routes/AdminRoute'
import { ROUTES } from '../constants/routes'

import Home from '../pages/Home'
import LiveCoins from '../pages/LiveCoins'
import Privacy from '../pages/Privacy'
import Terms from '../pages/Terms'

const Chart = lazy(() => import('../pages/Chart'))
const AdvancedBacktest = lazy(() => import('../pages/AdvancedBacktest'))
const ProfitCalculator = lazy(() => import('../pages/ProfitCalculator'))
const FundingCalculator = lazy(() => import('../pages/FundingCalculator'))
const Premium = lazy(() => import('../pages/Premium'))
const Login = lazy(() => import('../pages/Login'))
const Signup = lazy(() => import('../pages/Signup'))
const Admin = lazy(() => import('../pages/Admin'))

export const AppRoutes = () => (
  <Routes>
    <Route element={<MainLayout />}>
      <Route path={ROUTES.HOME} element={<Home />} />
      <Route path={ROUTES.LIVE_COINS} element={<LiveCoins />} />
      <Route path={ROUTES.CHART} element={<Chart />} />
      <Route path={ROUTES.ADVANCED_BACKTEST} element={<AdvancedBacktest />} />
      <Route path={ROUTES.PROFIT_CALCULATOR} element={<ProfitCalculator />} />
      <Route path={ROUTES.FUNDING_CALCULATOR} element={<FundingCalculator />} />
      <Route path={ROUTES.PREMIUM} element={<Premium />} />
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.SIGNUP} element={<Signup />} />
      <Route
        path={ROUTES.ADMIN}
        element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        }
      />
      <Route path={ROUTES.PRIVACY} element={<Privacy />} />
      <Route path={ROUTES.TERMS} element={<Terms />} />
    </Route>
  </Routes>
)
