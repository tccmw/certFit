import { useEffect, useMemo, useState } from 'react'
import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { api } from '../api/client'
import { useAuth } from '../auth/useAuth'
import { RoadmapPanel } from '../components/RoadmapPanel'
import { ScoreCharts } from '../components/ScoreCharts'
import type { RecommendationRun, Roadmap, RoadmapStep } from '../types'

export function MyPage() {
  const { logout, token } = useAuth()
  const navigate = useNavigate()
  const [history, setHistory] = useState<RecommendationRun[]>([])
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
  const [activeRoadmapId, setActiveRoadmapId] = useState<number | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const activeRoadmap = useMemo(
    () => roadmaps.find((roadmap) => roadmap.id === activeRoadmapId) ?? null,
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
        setActiveRoadmapId((previous) => (savedRoadmaps.some((roadmap) => roadmap.id === previous) ? previous : null))
      })
      .catch((error: unknown) => {
        if (active) {
          setMessage(error instanceof Error ? error.message : '마이페이지 데이터를 불러오지 못했습니다.')
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

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const nextSchedules = roadmaps
    .flatMap((roadmap) => roadmap.certificate.schedules.map((schedule) => ({ certificate: roadmap.certificate.name, schedule })))
    .filter((item) => item.schedule.exam_date)
    .sort((a, b) => String(a.schedule.exam_date).localeCompare(String(b.schedule.exam_date)))
    .slice(0, 4)

  return (
    <main className="mx-auto max-w-[1440px] space-y-6">
      {message && <p className="rounded-lg border border-line bg-white px-4 py-3 text-sm font-semibold text-ink shadow-card">{message}</p>}

      <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <section className="space-y-5">
          <section className="panel p-5">
            <h3 className="section-title">최근 추천 기록</h3>
            <div className="mt-3 space-y-2">
              {history.slice(0, 6).map((run) => (
                <div key={run.id} className="rounded-md border border-line bg-white px-3 py-2">
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
                <div key={`${item.certificate}-${item.schedule.id}`} className="rounded-md border border-line bg-white px-3 py-2">
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

          <button type="button" className="secondary-button w-full justify-center" onClick={handleLogout}>
            <LogOut size={16} />
            로그아웃
          </button>
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
