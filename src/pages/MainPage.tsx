import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, LoaderCircle, Route } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

import { api } from '../api/client'
import { useAuth } from '../auth/useAuth'
import { CertificateDetail } from '../components/CertificateDetail'
import { ProfileForm } from '../components/ProfileForm'
import { RecommendationList } from '../components/RecommendationList'
import { ScoreCharts } from '../components/ScoreCharts'
import { defaultProfile } from '../data/options'
import { queryKeys } from '../lib/query-client'
import type { ProfileInput, RecommendationItem, RecommendationRun, Roadmap } from '../types'

type MainStep = 'diagnosis' | 'results' | 'detail'

const steps: Array<{ id: MainStep; label: string }> = [
  { id: 'diagnosis', label: '자격증 진단' },
  { id: 'results', label: '추천 결과' },
  { id: 'detail', label: '상세 정보' },
]
const recommendationLoadingMinimumMs = 2000

function parseStep(value: string | null): MainStep | null {
  return value === 'diagnosis' || value === 'results' || value === 'detail' ? value : null
}

export function MainPage() {
  const { token, refreshUser } = useAuth()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [profile, setProfile] = useState<ProfileInput>(defaultProfile)
  const [recommendationRun, setRecommendationRun] = useState<RecommendationRun | null>(null)
  const [selectedItem, setSelectedItem] = useState<RecommendationItem | null>(null)
  const [savedRoadmap, setSavedRoadmap] = useState<Roadmap | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const certificatesQuery = useQuery({
    queryKey: queryKeys.certificates,
    queryFn: api.certificates,
    staleTime: 30 * 60_000,
  })

  const recommendationMutation = useMutation({
    mutationFn: async (input: ProfileInput) => {
      const loadingStartedAt = Date.now()
      const run = await api.recommendations(token!, input)
      const remainingLoadingTime = recommendationLoadingMinimumMs - (Date.now() - loadingStartedAt)
      if (remainingLoadingTime > 0) {
        await new Promise<void>((resolve) => window.setTimeout(resolve, remainingLoadingTime))
      }
      await api.saveProfile(token!, input)
      await refreshUser()
      return run
    },
    onSuccess: async (run) => {
      setRecommendationRun(run)
      setSelectedItem(null)
      setSavedRoadmap(null)
      moveStep('results')
      await queryClient.invalidateQueries({ queryKey: queryKeys.recommendationHistory })
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : '추천 계산 중 오류가 발생했습니다.'),
  })

  const createRoadmapMutation = useMutation({
    mutationFn: async (item: RecommendationItem) => ({
      item,
      roadmap: await api.createRoadmap(token!, item.certificate.id, profile.available_weeks),
    }),
    onSuccess: async ({ item, roadmap }) => {
      setSavedRoadmap(roadmap)
      setMessage(`${item.certificate.name} 로드맵을 저장했습니다.`)
      await queryClient.invalidateQueries({ queryKey: queryKeys.roadmaps })
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : '로드맵 저장 중 오류가 발생했습니다.'),
  })

  const certificates = certificatesQuery.data ?? []
  const loadingRecommendations = recommendationMutation.isPending

  const recommendationItems = recommendationRun?.items ?? []
  const requestedStep = parseStep(searchParams.get('step'))
  const step: MainStep =
    requestedStep === 'detail'
      ? selectedItem
        ? 'detail'
        : recommendationItems.length > 0
          ? 'results'
          : 'diagnosis'
      : requestedStep === 'results' && recommendationItems.length > 0
        ? 'results'
        : 'diagnosis'

  function moveStep(nextStep: MainStep, options: { replace?: boolean } = {}) {
    setSearchParams(nextStep === 'diagnosis' ? {} : { step: nextStep }, options)
  }

  function runRecommendations(input: ProfileInput) {
    if (!token) {
      return
    }

    setMessage(null)
    setProfile(input)
    recommendationMutation.mutate(input)
  }

  async function selectRecommendation(item: RecommendationItem) {
    setSelectedItem(item)
    moveStep('detail')
    api.event(token, 'recommendation_select', item.certificate.id, { tags: item.certificate.tags }).catch(() => undefined)
  }

  async function createRoadmap(item: RecommendationItem) {
    if (!token) {
      return
    }
    setMessage(null)
    createRoadmapMutation.mutate(item)
  }

  function goToResults() {
    if (recommendationItems.length > 0) {
      moveStep('results', { replace: true })
      setMessage(null)
    }
  }

  return (
    <main className="mx-auto max-w-[1120px] space-y-5" aria-busy={loadingRecommendations}>
      {loadingRecommendations && <RecommendationLoadingOverlay />}
      <section className="panel p-4 sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold text-ink">{steps.find((item) => item.id === step)?.label}</h1>
            <p className="mt-1 text-sm text-muted">진단 후 추천 결과에서 자격증을 선택하면 상세 정보와 시각화를 확인할 수 있습니다.</p>
          </div>
          <Link className="secondary-button" to="/mypage">
            <Route size={16} />
            저장한 로드맵 보기
          </Link>
        </div>

        <LineStepper currentStep={step} />
      </section>

      {(message || certificatesQuery.error) && (
        <div className="flex flex-col gap-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm font-semibold text-amber-800 sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-2">
            <AlertCircle size={17} />
            {message ?? (certificatesQuery.error instanceof Error ? certificatesQuery.error.message : '자격증 데이터를 불러오지 못했습니다.')}
          </span>
          {savedRoadmap && (
            <Link className="inline-flex items-center gap-1 text-ink hover:text-brand-blue hover:underline" to="/mypage">
              마이페이지에서 보기
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      )}

      {step === 'diagnosis' && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <ProfileForm
            profile={profile}
            disabled={false}
            loading={loadingRecommendations}
            onSubmit={runRecommendations}
          />

          <section className="panel p-5">
            <h2 className="text-lg font-bold text-ink">진행 안내</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-muted">
              <p>1. 진단 조건을 모두 입력합니다.</p>
              <p>2. 추천 시작하기를 누르면 추천 결과로 이동합니다.</p>
              <p>3. 자격증 카드를 선택하면 상세 정보와 시각화로 이동합니다.</p>
            </div>
            <div className="mt-5 rounded-md bg-slate-50 p-3">
              <p className="text-xs font-bold text-muted">자격증 데이터</p>
              <p className="mt-1 text-lg font-bold text-ink">{certificates.length}개</p>
            </div>
          </section>
        </div>
      )}

      {step === 'results' && (
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" className="secondary-button" onClick={() => moveStep('diagnosis', { replace: true })}>
              <ArrowLeft size={16} />
              진단 수정
            </button>
            <p className="text-sm font-medium text-muted">{recommendationItems.length}개 추천 결과가 생성되었습니다. 자격증을 선택하세요.</p>
          </div>
          <RecommendationList
            items={recommendationItems}
            selectedId={selectedItem?.id ?? null}
            loading={loadingRecommendations}
            onSelect={selectRecommendation}
            onCreateRoadmap={createRoadmap}
          />
        </section>
      )}

      {step === 'detail' && selectedItem && (
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" className="secondary-button" onClick={goToResults}>
              <ArrowLeft size={16} />
              추천 결과로 돌아가기
            </button>
            <button type="button" className="primary-button" onClick={() => createRoadmap(selectedItem)}>
              <CheckCircle2 size={16} />
              로드맵 저장
            </button>
          </div>

          <div className="grid gap-5">
            <CertificateDetail item={selectedItem} />
            <ScoreCharts recommendations={recommendationItems} roadmap={savedRoadmap} />
          </div>
        </section>
      )}

      {step === 'detail' && !selectedItem && (
        <section className="panel p-6 text-center text-sm text-muted">
          선택한 자격증이 없습니다. 추천 결과에서 자격증을 선택해주세요.
        </section>
      )}
    </main>
  )
}

function RecommendationLoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 px-4 backdrop-blur-sm" role="status" aria-live="polite">
      <div className="w-full max-w-sm rounded-xl border border-line bg-white p-6 text-center shadow-soft sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-purple/10 text-brand-purple">
          <LoaderCircle size={30} className="animate-spin" aria-hidden="true" />
        </div>
        <h2 className="mt-5 break-keep text-lg font-bold text-ink">
          맞춤 자격증을
          <br />
          분석하고 있어요
        </h2>
        <p className="mt-2 break-keep text-sm leading-6 text-muted">
          <span className="block">입력한 진단 조건을 바탕으로</span>
          <span className="block">추천 결과와 학습 경로를 계산하고 있습니다.</span>
        </p>
        <p className="mt-4 text-xs font-semibold text-brand-violet">잠시만 기다려 주세요</p>
      </div>
    </div>
  )
}

function LineStepper({ currentStep }: { currentStep: MainStep }) {
  const currentIndex = steps.findIndex((item) => item.id === currentStep)

  return (
    <div className="mt-5">
      <div className="grid grid-cols-3">
        {steps.map((item, index) => {
          const active = index === currentIndex
          const complete = index < currentIndex

          return (
            <div key={item.id} className="relative flex min-w-0 flex-col items-center">
              {index > 0 && (
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute right-1/2 top-4 z-0 h-0.5 w-full ${index <= currentIndex ? 'bg-success' : 'bg-line'}`}
                />
              )}
              <span
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  complete ? 'bg-success text-white' : active ? 'bg-brand-purple text-white' : 'bg-slate-100 text-muted'
                }`}
              >
                {complete ? <CheckCircle2 size={17} /> : index + 1}
              </span>
              <span className={`mt-2 text-center text-xs font-bold ${active ? 'text-ink' : 'text-muted'}`}>{item.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
