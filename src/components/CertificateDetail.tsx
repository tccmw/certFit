import {
  BadgeCheck,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Database,
  Gauge,
  GraduationCap,
  ListChecks,
  MonitorPlay,
  Target,
} from 'lucide-react'

import type { ExamSchedule, LearningResource, RecommendationItem } from '../types'

interface CertificateDetailProps {
  item: RecommendationItem | null
}

const breakdownLabels: Record<string, string> = {
  field: '분야/직무',
  preparation: '준비 여건',
  level: '레벨 적합',
  eligibility: '응시 자격',
  behavior: '행동 보정',
}

export function CertificateDetail({ item }: CertificateDetailProps) {
  if (!item) {
    return (
      <section className="panel p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Target size={18} className="text-brand-purple" />
          <h2 className="text-lg font-bold text-ink">상세 분석</h2>
        </div>
        <p className="mt-5 rounded-lg border border-dashed border-line bg-slate-50 p-8 text-center text-sm leading-6 text-muted">
          추천 카드를 선택하면 시험 정보와 추천 근거가 표시됩니다.
        </p>
      </section>
    )
  }

  const certificate = item.certificate
  const learningResources = certificate.learning_resources ?? []
  const coreMetrics = [
    { label: '시험 방식', value: certificate.exam_type },
    { label: '평균 합격률', value: `${certificate.average_pass_rate}%` },
    { label: '권장 기간', value: `${certificate.required_weeks}주` },
    { label: '주당 권장', value: `${certificate.min_weekly_hours}시간` },
    { label: '난이도', value: `${certificate.difficulty}/5` },
    { label: '응시 판단', value: item.eligibility_status },
  ]

  return (
    <section className="panel space-y-8 p-5 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0">
          <p className="text-sm font-bold text-brand-blue">{certificate.provider}</p>
          <h2 className="mt-1 text-xl font-bold text-ink">{certificate.name}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">{certificate.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-line bg-slate-50 p-4">
          <GaugeRing label="적합도" value={item.score} tone="purple" />
          <GaugeRing label="합격 가능성" value={item.pass_probability} tone="success" />
        </div>
      </div>

      <div className="grid overflow-hidden rounded-lg border border-line bg-white sm:grid-cols-2 xl:grid-cols-3">
        {coreMetrics.map((metric) => (
          <InfoCell key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-lg border border-line bg-white p-4">
          <div className="mb-4 flex items-center gap-2">
            <ListChecks size={18} className="text-brand-purple" />
            <h3 className="section-title">추천 이유</h3>
          </div>
          <ol className="space-y-3">
            {item.reasons.slice(0, 4).map((reason, index) => (
              <li key={reason} className="grid grid-cols-[28px_1fr] gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-purple/10 text-xs font-bold text-brand-purple">
                  {index + 1}
                </span>
                <p className="rounded-md border border-line bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700">
                  {reason}
                </p>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-lg border border-line bg-white p-4">
          <div className="mb-5 flex items-center gap-2">
            <Database size={18} className="text-brand-blue" />
            <h3 className="section-title">점수 구성</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(item.breakdown).map(([key, value]) => (
              <div key={key}>
                <div className="mb-2 flex justify-between text-xs font-semibold text-muted">
                  <span>{breakdownLabels[key] ?? key}</span>
                  <span>{value}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand-purple" style={{ width: `${Math.min(100, (value / 45) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-line bg-white p-4">
          <div className="mb-4 flex items-center gap-2">
            <BookOpen size={18} className="text-brand-violet" />
            <h3 className="section-title">과목</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {certificate.subjects.map((subject) => (
              <span key={subject} className="rounded-md border border-line bg-white px-2.5 py-1 text-xs font-bold text-muted">
                {subject}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-line bg-white p-4">
          <div className="mb-4 flex items-center gap-2">
            <BadgeCheck size={18} className="text-success" />
            <h3 className="section-title">응시 자격</h3>
          </div>
          <p className="rounded-md bg-warning/10 px-3 py-2 text-sm leading-6 text-amber-800">{certificate.eligibility}</p>
        </div>
      </div>

      {learningResources.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <GraduationCap size={18} className="text-brand-blue" />
            <h3 className="section-title">추천 학습처</h3>
          </div>
          <div className="grid gap-3 xl:grid-cols-3">
            {learningResources.map((resource) => (
              <LearningResourceCard key={`${resource.provider_type}-${resource.name}`} resource={resource} />
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-muted">
            실제 수강 전에는 지역, 개강일, 수강료, 환급 조건을 각 학습처에서 다시 확인하세요.
          </p>
        </div>
      )}

      <div>
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays size={18} className="text-danger" />
          <h3 className="section-title">시험 일정</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {certificate.schedules.map((schedule) => (
            <ScheduleCard key={schedule.id} schedule={schedule} />
          ))}
        </div>
      </div>
    </section>
  )
}

function GaugeRing({ label, value, tone }: { label: string; value: number; tone: 'purple' | 'success' }) {
  const rounded = Math.max(0, Math.min(100, Math.round(value)))
  const color = tone === 'success' ? '#16803A' : '#863BFF'

  return (
    <div className="flex flex-col items-center justify-center gap-2 text-center">
      <div
        className="flex h-24 w-24 items-center justify-center rounded-full"
        style={{ background: `conic-gradient(${color} ${rounded}%, #E8E3F4 0)` }}
      >
        <div className="flex h-[72px] w-[72px] flex-col items-center justify-center rounded-full bg-white shadow-card">
          <span className="text-xl font-bold text-ink">{rounded}</span>
          <span className="text-[11px] font-bold text-muted">%</span>
        </div>
      </div>
      <span className="text-xs font-bold text-muted">{label}</span>
    </div>
  )
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-line p-4 sm:[&:nth-child(odd)]:border-r xl:border-r xl:[&:nth-child(3n)]:border-r-0 xl:[&:nth-last-child(-n+3)]:border-b-0">
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p className="mt-2 text-sm font-bold text-ink">{value}</p>
    </div>
  )
}

function LearningResourceCard({ resource }: { resource: LearningResource }) {
  return (
    <article className="rounded-lg border border-line bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-gradient-soft text-brand-purple">
          <LearningResourceIcon providerType={resource.provider_type} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink">{resource.name}</p>
          <p className="mt-1 text-xs font-bold text-brand-blue">
            {resource.provider_type} / {resource.delivery}
          </p>
        </div>
      </div>
      <dl className="mt-4 grid gap-2 text-xs leading-5">
        <div className="grid grid-cols-[64px_1fr] gap-2">
          <dt className="font-bold text-ink">대상</dt>
          <dd className="text-slate-700">{resource.fit}</dd>
        </div>
        <div className="grid grid-cols-[64px_1fr] gap-2 rounded-md bg-slate-50 px-3 py-2">
          <dt className="font-bold text-ink">체크</dt>
          <dd className="text-muted">{resource.note}</dd>
        </div>
      </dl>
    </article>
  )
}

function LearningResourceIcon({ providerType }: { providerType: string }) {
  if (providerType.includes('온라인')) {
    return <MonitorPlay size={17} />
  }

  if (providerType.includes('학원')) {
    return <Building2 size={17} />
  }

  return <GraduationCap size={17} />
}

function ScheduleCard({ schedule }: { schedule: ExamSchedule }) {
  const timeline = [
    { label: '접수', value: `${schedule.registration_start ?? '-'} ~ ${schedule.registration_end ?? '-'}`, icon: <Clock3 size={14} /> },
    { label: '시험', value: schedule.exam_date ?? '-', icon: <Gauge size={14} /> },
    { label: '발표', value: schedule.result_date ?? '-', icon: <CheckCircle2 size={14} /> },
  ]

  return (
    <div className="rounded-lg border border-line bg-white p-4">
      <p className="text-sm font-bold text-ink">{schedule.exam_name}</p>
      <div className="mt-4 grid gap-3">
        {timeline.map((item) => (
          <div key={item.label} className="grid grid-cols-[28px_44px_1fr] items-center gap-2 text-xs">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-danger/10 text-danger">{item.icon}</span>
            <span className="font-bold text-ink">{item.label}</span>
            <span className="text-muted">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
