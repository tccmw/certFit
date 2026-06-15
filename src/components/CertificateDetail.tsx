import { BadgeCheck, BookOpen, CalendarDays, Database, ListChecks, Target } from 'lucide-react'

import type { RecommendationItem } from '../types'

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

  return (
    <section className="panel animate-soft-scale p-5 sm:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-bold text-brand-blue">{certificate.provider}</p>
          <h2 className="mt-1 text-xl font-bold text-ink">{certificate.name}</h2>
          <p className="mt-3 text-sm leading-6 text-muted">{certificate.description}</p>
        </div>
        <div className="rounded-lg bg-brand-gradient p-4 text-white shadow-card xl:w-32">
          <p className="text-xs font-bold text-white/75">합격 가능성</p>
          <p className="mt-1 text-xl font-bold">{item.pass_probability}%</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <InfoTile label="시험 방식" value={certificate.exam_type} />
        <InfoTile label="평균 합격률" value={`${certificate.average_pass_rate}%`} />
        <InfoTile label="권장 기간" value={`${certificate.required_weeks}주`} />
        <InfoTile label="주당 권장" value={`${certificate.min_weekly_hours}시간`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <ListChecks size={18} className="text-brand-purple" />
            <h3 className="section-title">추천 이유</h3>
          </div>
          <ul className="space-y-2">
            {item.reasons.map((reason) => (
              <li key={reason} className="rounded-md border border-line bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700">
                {reason}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Database size={18} className="text-brand-blue" />
            <h3 className="section-title">점수 구성</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(item.breakdown).map(([key, value]) => (
              <div key={key}>
                <div className="mb-1 flex justify-between text-xs font-semibold text-muted">
                  <span>{breakdownLabels[key] ?? key}</span>
                  <span>{value}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${Math.min(100, (value / 45) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_1fr]">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <BookOpen size={18} className="text-brand-violet" />
            <h3 className="section-title">과목</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {certificate.subjects.map((subject) => (
              <span key={subject} className="rounded-md bg-brand-purple/10 px-2.5 py-1 text-xs font-bold text-brand-violet">
                {subject}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-3 flex items-center gap-2">
            <BadgeCheck size={18} className="text-success" />
            <h3 className="section-title">응시 자격</h3>
          </div>
          <p className="rounded-md bg-warning/10 px-3 py-2 text-sm leading-6 text-amber-800">{certificate.eligibility}</p>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <CalendarDays size={18} className="text-danger" />
          <h3 className="section-title">시험 일정</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {certificate.schedules.map((schedule) => (
            <div key={schedule.id} className="rounded-md border border-line bg-white p-3 shadow-card">
              <p className="text-sm font-bold text-ink">{schedule.exam_name}</p>
              <p className="mt-1 text-xs leading-5 text-muted">
                접수 {schedule.registration_start ?? '-'} ~ {schedule.registration_end ?? '-'}
              </p>
              <p className="text-xs leading-5 text-muted">
                시험 {schedule.exam_date ?? '-'} / 발표 {schedule.result_date ?? '-'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-slate-50 p-3">
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p className="mt-1 text-sm font-bold text-ink">{value}</p>
    </div>
  )
}
