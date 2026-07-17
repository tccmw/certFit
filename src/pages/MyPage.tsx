import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { api } from '../api/client'
import { useAuth } from '../auth/useAuth'
import { RoadmapPanel } from '../components/RoadmapPanel'
import { ScoreCharts } from '../components/ScoreCharts'
import { queryKeys } from '../lib/query-client'
import type { Roadmap, RoadmapStep } from '../types'

export function MyPage() {
  const { logout, token } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeRoadmapId, setActiveRoadmapId] = useState<number | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const historyQuery = useQuery({
    queryKey: queryKeys.recommendationHistory,
    queryFn: () => api.recommendationHistory(token!),
    enabled: Boolean(token),
  })
  const roadmapsQuery = useQuery({
    queryKey: queryKeys.roadmaps,
    queryFn: () => api.roadmaps(token!),
    enabled: Boolean(token),
  })

  const history = historyQuery.data ?? []
  const roadmaps = roadmapsQuery.data ?? []
  const queryError = historyQuery.error ?? roadmapsQuery.error

  const activeRoadmap = useMemo(
    () => roadmaps.find((roadmap) => roadmap.id === activeRoadmapId) ?? null,
    [activeRoadmapId, roadmaps],
  )

  const updateStepMutation = useMutation({
    mutationFn: ({ roadmap, step }: { roadmap: Roadmap; step: RoadmapStep }) =>
      api.updateStep(token!, roadmap.id, step.id, !step.checked),
    onSuccess: (updated) => {
      queryClient.setQueryData<Roadmap[]>(queryKeys.roadmaps, (previous = []) =>
        previous.map((roadmap) => (roadmap.id === updated.id ? updated : roadmap)),
      )
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : '진행률 업데이트 중 오류가 발생했습니다.'),
  })

  async function toggleStep(roadmap: Roadmap, step: RoadmapStep) {
    if (!token) {
      return
    }
    setMessage(null)
    updateStepMutation.mutate({ roadmap, step })
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
      {(message || queryError) && (
        <p className="rounded-lg border border-line bg-white px-4 py-3 text-sm font-semibold text-ink shadow-card">
          {message ?? (queryError instanceof Error ? queryError.message : '마이페이지 데이터를 불러오지 못했습니다.')}
        </p>
      )}

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
