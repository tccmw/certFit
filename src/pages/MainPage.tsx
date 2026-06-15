import { useEffect, useState } from 'react'
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Route } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

import { api } from '../api/client'
import { useAuth } from '../auth/useAuth'
import { CertificateDetail } from '../components/CertificateDetail'
import { ProfileForm } from '../components/ProfileForm'
import { RecommendationList } from '../components/RecommendationList'
import { ScoreCharts } from '../components/ScoreCharts'
import { defaultProfile } from '../data/options'
import type { Certificate, ProfileInput, RecommendationItem, RecommendationRun, Roadmap } from '../types'

type MainStep = 'diagnosis' | 'results' | 'detail'

const steps: Array<{ id: MainStep; label: string }> = [
  { id: 'diagnosis', label: '자격증 진단' },
  { id: 'results', label: '추천 결과' },
  { id: 'detail', label: '상세 정보' },
]

function parseStep(value: string | null): MainStep | null {
  return value === 'diagnosis' || value === 'results' || value === 'detail' ? value : null
}

export function MainPage() {
  const { token, refreshUser } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [profile, setProfile] = useState<ProfileInput>(defaultProfile)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [recommendationRun, setRecommendationRun] = useState<RecommendationRun | null>(null)
  const [selectedItem, setSelectedItem] = useState<RecommendationItem | null>(null)
  const [savedRoadmap, setSavedRoadmap] = useState<Roadmap | null>(null)
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    api
      .certificates()
      .then(setCertificates)
      .catch((error) => setMessage(error instanceof Error ? error.message : '자격증 데이터를 불러오지 못했습니다.'))
  }, [])

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

  async function runRecommendations() {
    if (!token) {
      return
    }
    if (
      !profile.target_field ||
      !profile.current_status ||
      !profile.interested_role ||
      !profile.knowledge_level ||
      profile.available_weeks <= 0 ||
      profile.weekly_hours <= 0
    ) {
      setMessage('추천에 필요한 진단 조건을 모두 입력해주세요.')
      return
    }

    setLoadingRecommendations(true)
    setMessage(null)
    try {
      const run = await api.recommendations(token, profile)
      setRecommendationRun(run)
      setSelectedItem(null)
      setSavedRoadmap(null)
      moveStep('results')
      await api.saveProfile(token, profile)
      await refreshUser()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '추천 계산 중 오류가 발생했습니다.')
    } finally {
      setLoadingRecommendations(false)
    }
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
    try {
      const roadmap = await api.createRoadmap(token, item.certificate.id, profile.available_weeks)
      setSavedRoadmap(roadmap)
      setMessage(`${item.certificate.name} 로드맵을 저장했습니다.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '로드맵 저장 중 오류가 발생했습니다.')
    }
  }

  function goToResults() {
    if (recommendationItems.length > 0) {
      moveStep('results', { replace: true })
      setMessage(null)
    }
  }

  return (
    <main className="mx-auto max-w-[1120px] space-y-5">
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

      {message && (
        <div className="flex flex-col gap-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm font-semibold text-amber-800 sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-2">
            <AlertCircle size={17} />
            {message}
          </span>
          {savedRoadmap && (
            <Link className="inline-flex items-center gap-1 text-brand-violet hover:text-brand-blue hover:underline" to="/mypage">
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
            onChange={setProfile}
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

function LineStepper({ currentStep }: { currentStep: MainStep }) {
  const currentIndex = steps.findIndex((item) => item.id === currentStep)

  return (
    <div className="mt-5">
      <div className="flex items-start">
        {steps.map((item, index) => {
          const active = index === currentIndex
          const complete = index < currentIndex

          return (
            <div key={item.id} className="flex flex-1 items-start">
              <div className="flex min-w-0 flex-1 flex-col items-center">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    complete ? 'bg-success text-white' : active ? 'bg-brand-gradient text-white' : 'bg-slate-100 text-muted'
                  }`}
                >
                  {complete ? <CheckCircle2 size={17} /> : index + 1}
                </span>
                <span className={`mt-2 text-center text-xs font-bold ${active ? 'text-ink' : 'text-muted'}`}>{item.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`mt-4 h-0.5 flex-1 ${index < currentIndex ? 'bg-success' : 'bg-line'}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
