import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { BarChart3, Database, Route, UserRound } from 'lucide-react'

import { api } from '../api/client'
import { useAuth } from '../auth/useAuth'
import { RoadmapPanel } from '../components/RoadmapPanel'
import { ScoreCharts } from '../components/ScoreCharts'
import type { RecommendationRun, Roadmap, RoadmapStep } from '../types'

export function MyPage() {
  const { token, user } = useAuth()
  const [history, setHistory] = useState<RecommendationRun[]>([])
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
  const [activeRoadmapId, setActiveRoadmapId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  const activeRoadmap = useMemo(
    () => roadmaps.find((roadmap) => roadmap.id === activeRoadmapId) ?? roadmaps[0] ?? null,
    [activeRoadmapId, roadmaps],
  )

  useEffect(() => {
    if (!token) {
      return
    }

    let active = true
    Promise.all([api.recommendationHistory(token), api.roadmaps(token)])
      .then(([runs, savedRoadmaps]) => {
        if (!active) {
          return
        }
        setHistory(runs)
        setRoadmaps(savedRoadmaps)
        setActiveRoadmapId((previous) => previous ?? savedRoadmaps[0]?.id ?? null)
      })
      .catch((error: unknown) => {
        if (active) {
          setMessage(error instanceof Error ? error.message : '마이페이지 데이터를 불러오지 못했습니다.')
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [token])

  async function toggleStep(roadmap: Roadmap, step: RoadmapStep) {
    if (!token) {
      return
    }
    try {
      const updated = await api.updateStep(token, roadmap.id, step.id, !step.checked)
      setRoadmaps((previous) => previous.map((item) => (item.id === updated.id ? updated : item)))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '진행률 업데이트 중 오류가 발생했습니다.')
    }
  }

  async function importPublicData() {
    if (!token) {
      return
    }
    try {
      const result = await api.importPublicData(token)
      setMessage(result.message)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '공공데이터 확인 중 오류가 발생했습니다.')
    }
  }

  const nextSchedules = roadmaps
    .flatMap((roadmap) => roadmap.certificate.schedules.map((schedule) => ({ certificate: roadmap.certificate.name, schedule })))
    .filter((item) => item.schedule.exam_date)
    .sort((a, b) => String(a.schedule.exam_date).localeCompare(String(b.schedule.exam_date)))
    .slice(0, 4)

  const averageProgress = roadmaps.length
    ? Math.round(roadmaps.reduce((sum, roadmap) => sum + roadmap.progress, 0) / roadmaps.length)
    : 0

  return (
    <main className="mx-auto max-w-[1440px] space-y-6">
      <section className="relative overflow-hidden rounded-xl border border-line bg-white p-5 shadow-soft sm:p-7">
        <div className="absolute inset-x-0 top-0 h-1 bg-brand-gradient" />
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-gradient-soft text-brand-violet shadow-card">
              <UserRound size={22} />
            </span>
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-bold text-brand-blue">
                <Route size={14} />
                관리 현황
              </span>
              <h2 className="mt-3 text-xl font-bold text-ink">마이페이지</h2>
              <p className="mt-1 text-sm leading-6 text-muted">{user?.name}님의 추천 기록과 학습 진행률을 관리합니다.</p>
            </div>
          </div>
          <button type="button" className="secondary-button" onClick={importPublicData}>
            <Database size={16} />
            공공데이터 확인
          </button>
        </div>
      </section>

      {message && <p className="rounded-lg border border-brand-blue/20 bg-brand-blue/10 px-4 py-3 text-sm font-semibold text-brand-blue">{message}</p>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="추천 실행" value={`${history.length}회`} icon={<BarChart3 size={18} />} />
        <Stat label="저장 로드맵" value={`${roadmaps.length}개`} icon={<Route size={18} />} />
        <Stat label="평균 진행률" value={`${averageProgress}%`} icon={<Database size={18} />} />
        <Stat label="상태" value={loading ? '불러오는 중' : '동기화 완료'} icon={<UserRound size={18} />} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <section className="space-y-5">
          <section className="panel p-5">
            <h3 className="section-title">최근 추천 기록</h3>
            <div className="mt-3 space-y-2">
              {history.slice(0, 6).map((run) => (
                <div key={run.id} className="rounded-md border border-line bg-white px-3 py-2 shadow-card">
                  <p className="text-sm font-bold text-ink">{new Date(run.created_at).toLocaleString('ko-KR')}</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    {run.profile_snapshot.target_field} / {run.profile_snapshot.interested_role} / 상위{' '}
                    {run.items[0]?.certificate.name ?? '-'}
                  </p>
                </div>
              ))}
              {history.length === 0 && (
                <p className="rounded-md border border-dashed border-line bg-slate-50 p-4 text-sm text-muted">추천 기록이 없습니다.</p>
              )}
            </div>
          </section>

          <section className="panel p-5">
            <h3 className="section-title">시험 일정 알림</h3>
            <div className="mt-3 space-y-2">
              {nextSchedules.map((item) => (
                <div key={`${item.certificate}-${item.schedule.id}`} className="rounded-md border border-line bg-white px-3 py-2 shadow-card">
                  <p className="text-sm font-bold text-ink">{item.certificate}</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    {item.schedule.exam_name} / 시험일 {item.schedule.exam_date}
                  </p>
                </div>
              ))}
              {nextSchedules.length === 0 && (
                <p className="rounded-md border border-dashed border-line bg-slate-50 p-4 text-sm text-muted">
                  저장된 로드맵의 일정이 없습니다.
                </p>
              )}
            </div>
          </section>
        </section>

        <section className="space-y-5">
          <RoadmapPanel
            roadmaps={roadmaps}
            activeRoadmapId={activeRoadmapId}
            onSelect={setActiveRoadmapId}
            onToggleStep={toggleStep}
          />
          <ScoreCharts recommendations={history[0]?.items ?? []} roadmap={activeRoadmap} />
        </section>
      </div>
    </main>
  )
}

function Stat({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="metric-tile">
      <div className="flex items-center justify-between text-brand-violet">
        <span className="text-xs font-bold text-muted">{label}</span>
        {icon}
      </div>
      <p className="mt-2 truncate text-xl font-bold text-ink">{value}</p>
    </div>
  )
}
