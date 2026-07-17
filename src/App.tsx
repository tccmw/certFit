import { Navigate, Outlet, Route, Routes } from 'react-router-dom'

import { AuthProvider } from './auth/AuthContext'
import { useAuth } from './auth/useAuth'
import { BrandLogo } from './components/BrandLogo'
import { Card } from './components/ui/card'
import { AppShell } from './layout/AppShell'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { MainPage } from './pages/MainPage'
import { MyPage } from './pages/MyPage'
import { RegisterPage } from './pages/RegisterPage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/main" element={<DashboardPage />} />
            <Route path="/diagnosis" element={<MainPage />} />
            <Route path="/mypage" element={<MyPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

function RootRedirect() {
  const { isAuthenticated, booting } = useAuth()

  if (booting) {
    return <BootScreen />
  }

  return <Navigate to={isAuthenticated ? '/main' : '/login'} replace />
}

function GuestRoute() {
  const { isAuthenticated, booting } = useAuth()

  if (booting) {
    return <BootScreen />
  }

  return isAuthenticated ? <Navigate to="/main" replace /> : <Outlet />
}

function ProtectedRoute() {
  const { isAuthenticated, booting } = useAuth()

  if (booting) {
    return <BootScreen />
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

function BootScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <Card className="flex items-center gap-4 px-6 py-5">
        <BrandLogo size="sm" />
        <span className="text-sm font-semibold text-muted">세션을 확인하는 중입니다.</span>
      </Card>
    </div>
  )
}

export default App
