import { NavLink, Outlet } from 'react-router-dom'

import { useAuth } from '../auth/useAuth'
import { BrandLogo } from '../components/BrandLogo'

export function AppShell() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-canvas px-4 py-4 text-ink sm:px-6 lg:px-8">
      <header className="mx-auto mb-6 flex max-w-[1440px] flex-col gap-4 rounded-lg border border-line bg-white px-4 py-3 shadow-card md:flex-row md:items-center md:justify-between">
        <BrandLogo subtitle="자격증 플래너" />

        <nav className="flex flex-wrap items-center gap-2">
          <NavLink to="/main" className={({ isActive }) => navClass(isActive)}>
            홈
          </NavLink>
          <NavLink to="/diagnosis" className={({ isActive }) => navClass(isActive)}>
            자격증 진단
          </NavLink>
          <NavLink to="/mypage" className={({ isActive }) => navClass(isActive)}>
            마이페이지
          </NavLink>
          {user?.name && (
            <span className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-muted">{user.name}</span>
          )}
        </nav>
      </header>

      <Outlet />
    </div>
  )
}

function navClass(isActive: boolean) {
  return `inline-flex h-10 items-center rounded-md px-4 text-sm font-semibold transition ${
    isActive
      ? 'bg-brand-purple text-white shadow-card'
      : 'border border-transparent text-muted hover:border-line hover:bg-slate-50 hover:text-ink'
  }`
}
