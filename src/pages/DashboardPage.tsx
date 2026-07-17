import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Award, BookOpenCheck, CalendarDays, Clock3, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import { api } from '../api/client'
import { useAuth } from '../auth/useAuth'
import { queryKeys } from '../lib/query-client'
import type { Certificate, ExamSchedule } from '../types'

interface UpcomingExam {
  certificate: Certificate
  schedule: ExamSchedule
}

export function DashboardPage() {
  const { token, user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedCertificateId, setSelectedCertificateId] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const certificatesQuery = useQuery({
    queryKey: queryKeys.certificates,
    queryFn: api.certificates,
    staleTime: 30 * 60_000,
  })
  const ownedCertificatesQuery = useQuery({
    queryKey: queryKeys.myCertificates,
    queryFn: () => api.myCertificates(token!),
    enabled: Boolean(token),
  })
  const roadmapsQuery = useQuery({
    queryKey: queryKeys.roadmaps,
    queryFn: () => api.roadmaps(token!),
    enabled: Boolean(token),
  })

  const certificates = certificatesQuery.data ?? []
  const ownedCertificates = ownedCertificatesQuery.data ?? []
  const roadmaps = roadmapsQuery.data ?? []
  const loading = certificatesQuery.isPending || ownedCertificatesQuery.isPending || roadmapsQuery.isPending
  const queryError = certificatesQuery.error ?? ownedCertificatesQuery.error ?? roadmapsQuery.error

  const addCertificateMutation = useMutation({
    mutationFn: (certificateId: number) => api.addMyCertificate(token!, certificateId),
    onSuccess: async () => {
      setSelectedCertificateId('')
      await queryClient.invalidateQueries({ queryKey: queryKeys.myCertificates })
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : '자격증을 추가하지 못했습니다.'),
  })

  const removeCertificateMutation = useMutation({
    mutationFn: (userCertificateId: number) => api.removeMyCertificate(token!, userCertificateId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.myCertificates })
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : '자격증을 삭제하지 못했습니다.'),
  })

  const availableCertificates = useMemo(() => {
    const ownedIds = new Set(ownedCertificates.map((item) => item.certificate.id))
    return certificates.filter((certificate) => !ownedIds.has(certificate.id))
  }, [certificates, ownedCertificates])

  const upcomingExams = useMemo(() => getUpcomingExams(certificates), [certificates])
  const activeRoadmaps = roadmaps.slice(0, 3)

  async function addCertificate() {
    const certificateId = Number(selectedCertificateId)
    if (!token || !certificateId) {
      return
    }

    setMessage(null)
    addCertificateMutation.mutate(certificateId)
  }

  async function removeCertificate(userCertificateId: number) {
    if (!token) {
      return
    }

    setMessage(null)
    removeCertificateMutation.mutate(userCertificateId)
  }

  return (
    <main className="mx-auto max-w-[1440px] space-y-6">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold text-brand-blue">자격 관리 홈</p>
          <h1 className="mt-1 text-2xl font-bold text-ink">{user?.name ?? '나'}님의 자격 현황</h1>
          <p className="mt-2 text-sm leading-6 text-muted">보유 자격증과 가까운 시험 일정을 한곳에서 관리하세요.</p>
        </div>
        <Link className="primary-button" to="/diagnosis">
          <BookOpenCheck size={17} />
          자격증 진단 시작
        </Link>
      </header>

      {(message || queryError) && (
        <p className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm font-semibold text-amber-800">
          {message ?? (queryError instanceof Error ? queryError.message : '홈 데이터를 불러오지 못했습니다.')}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <section className="panel p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-ink">보유 자격증</h2>
              <p className="mt-1 text-sm text-muted">취득한 자격증을 등록해 관리할 수 있습니다.</p>
            </div>
            <Award size={22} className="text-warning" />
          </div>

          {loading ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[0, 1].map((item) => (
                <div key={item} className="h-28 animate-pulse rounded-lg border border-line bg-slate-50" />
              ))}
            </div>
          ) : ownedCertificates.length > 0 ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {ownedCertificates.map((item) => (
                <article key={item.id} className="flex min-h-28 items-start justify-between gap-4 rounded-lg border border-line bg-white p-4 shadow-card">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-purple/10 text-brand-purple">
                      <Award size={19} />
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-ink">{item.certificate.name}</p>
                      <p className="mt-1 text-xs font-semibold text-brand-blue">{item.certificate.category}</p>
                      <p className="mt-2 text-xs text-muted">{item.certificate.provider}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="icon-button h-8 w-8 shrink-0"
                    title="보유 자격증 삭제"
                    aria-label={`${item.certificate.name} 삭제`}
                    onClick={() => removeCertificate(item.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-dashed border-line bg-slate-50 px-5 py-9 text-center text-sm text-muted">
              등록한 자격증이 없습니다.
            </div>
          )}

          <div className="mt-5 grid gap-3 border-t border-line pt-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <label className="block">
              <span className="label">보유 자격증 추가</span>
              <select
                className="field mt-1"
                value={selectedCertificateId}
                disabled={addCertificateMutation.isPending || availableCertificates.length === 0}
                onChange={(event) => setSelectedCertificateId(event.target.value)}
              >
                <option value="">자격증 선택</option>
                {availableCertificates.map((certificate) => (
                  <option key={certificate.id} value={certificate.id}>
                    {certificate.name}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className="secondary-button" disabled={!selectedCertificateId || addCertificateMutation.isPending} onClick={addCertificate}>
              <Plus size={16} />
              추가
            </button>
          </div>
        </section>

        <section className="panel p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-ink">다가오는 시험</h2>
              <p className="mt-1 text-sm text-muted">가까운 시험일 순으로 표시됩니다.</p>
            </div>
            <CalendarDays size={22} className="text-danger" />
          </div>

          <div className="mt-5 space-y-3">
            {upcomingExams.map((item) => (
              <article key={`${item.certificate.id}-${item.schedule.id}`} className="grid grid-cols-[60px_1fr] gap-3 rounded-lg border border-line bg-white p-3">
                <div className="flex flex-col items-center justify-center rounded-md bg-danger/10 px-2 text-center text-danger">
                  <span className="text-xs font-bold">{getDaysLabel(item.schedule.exam_date)}</span>
                  <span className="mt-1 text-[11px] font-semibold">시험</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink">{item.certificate.name}</p>
                  <p className="mt-1 truncate text-xs font-semibold text-muted">{item.schedule.exam_name}</p>
                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-700">
                    <Clock3 size={13} />
                    {formatLongDate(item.schedule.exam_date)}
                  </p>
                </div>
              </article>
            ))}
            {!loading && upcomingExams.length === 0 && (
              <div className="rounded-lg border border-dashed border-line bg-slate-50 px-4 py-8 text-center text-sm text-muted">가까운 시험 일정이 없습니다.</div>
            )}
          </div>
        </section>
      </div>

      <section className="panel p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink">진행 중 로드맵</h2>
            <p className="mt-1 text-sm text-muted">저장한 학습 계획의 현재 진행률입니다.</p>
          </div>
          <Link className="secondary-button" to="/mypage">
            전체 로드맵 보기
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-28 animate-pulse rounded-lg border border-line bg-slate-50" />
            ))}
          </div>
        ) : activeRoadmaps.length > 0 ? (
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {activeRoadmaps.map((roadmap) => (
              <article key={roadmap.id} className="rounded-lg border border-line bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink">{roadmap.certificate.name}</p>
                    <p className="mt-1 text-xs text-muted">{roadmap.total_weeks}주 학습 계획</p>
                  </div>
                  <span className="text-sm font-bold text-brand-purple">{roadmap.progress}%</span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand-purple" style={{ width: `${roadmap.progress}%` }} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-3 rounded-lg border border-dashed border-line bg-slate-50 px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">아직 저장한 로드맵이 없습니다.</p>
            <Link className="secondary-button" to="/diagnosis">
              진단으로 이동
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}

function getUpcomingExams(certificates: Certificate[]): UpcomingExam[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return certificates
    .flatMap((certificate) => certificate.schedules.map((schedule) => ({ certificate, schedule })))
    .filter((item) => item.schedule.exam_date && new Date(`${item.schedule.exam_date}T00:00:00`) >= today)
    .sort((a, b) => String(a.schedule.exam_date).localeCompare(String(b.schedule.exam_date)))
    .slice(0, 4)
}

function getDaysLabel(date: string | null) {
  if (!date) {
    return '-'
  }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const examDate = new Date(`${date}T00:00:00`)
  const days = Math.round((examDate.getTime() - today.getTime()) / 86_400_000)
  return days === 0 ? 'D-Day' : `D-${days}`
}

function formatLongDate(date: string | null) {
  if (!date) {
    return '시험일 미정'
  }
  return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date(`${date}T00:00:00`))
}
