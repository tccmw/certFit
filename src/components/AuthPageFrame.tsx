import { Route } from 'lucide-react'
import type { ReactNode } from 'react'

import { BrandLogo } from './BrandLogo'

interface AuthPageFrameProps {
  title: string
  subtitle: string
  children: ReactNode
}

export function AuthPageFrame({ title, subtitle, children }: AuthPageFrameProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10 text-ink">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-xl border border-line bg-white shadow-soft lg:grid-cols-[1fr_420px]">
        <div className="relative hidden min-h-[500px] bg-slate-50 p-10 text-ink lg:block">
          <div className="absolute inset-x-0 top-0 h-1 bg-brand-gradient" />
          <div className="relative flex h-full flex-col justify-between">
            <div>
              <BrandLogo subtitle="자격증 플래너" />
              <div className="mt-20 max-w-md">
                <span className="inline-flex items-center gap-2 rounded-full bg-brand-purple/10 px-3 py-1 text-xs font-semibold text-brand-violet">
                  <Route size={14} />
                  경로 설정
                </span>
                <h1 className="mt-5 text-xl font-bold leading-tight tracking-normal">
                  목표에 맞는 자격증 경로를 정리하세요
                </h1>
                <p className="mt-4 text-sm leading-6 text-muted">
                  목표 직무, 준비 기간, 학습 가능 시간을 바탕으로 추천과 로드맵을 한 번에 연결합니다.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {['직무 적합도', '준비 기간', '학습 계획'].map((label) => (
                <div key={label} className="rounded-md border border-line bg-white p-3 text-xs font-semibold text-muted shadow-card">
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-8 lg:hidden">
            <BrandLogo subtitle="자격증 플래너" />
          </div>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-ink">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{subtitle}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  )
}
