import { Award, BadgeCheck, Clock3, Gauge, Route, Save } from 'lucide-react'
import type { ReactNode } from 'react'

import type { RecommendationItem } from '../types'

interface RecommendationListProps {
  items: RecommendationItem[]
  selectedId: number | null
  loading: boolean
  className?: string
  bodyClassName?: string
  dense?: boolean
  onSelect: (item: RecommendationItem) => void
  onCreateRoadmap: (item: RecommendationItem) => void
}

export function RecommendationList({
  items,
  selectedId,
  loading,
  className = '',
  bodyClassName = '',
  dense = false,
  onSelect,
  onCreateRoadmap,
}: RecommendationListProps) {
  return (
    <section className={`panel flex min-h-0 flex-col p-5 ${className}`}>
      <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-2 rounded-md border border-line bg-slate-50 px-3 py-1 text-xs font-bold text-muted">
            <Route size={14} />
            적합도
          </span>
          <h2 className="mt-3 text-lg font-bold text-ink">추천 결과</h2>
          <p className="mt-1 text-sm text-muted">적합도가 높은 순서로 정렬됩니다.</p>
        </div>
        <Award size={22} className="shrink-0 text-warning" />
      </div>

      {loading && (
        <div className="grid shrink-0 gap-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="animate-pulse rounded-lg border border-dashed border-line bg-slate-50 p-4">
              <div className="h-4 w-36 rounded bg-slate-200" />
              <div className="mt-4 h-3 w-full rounded bg-slate-200" />
              <div className="mt-2 h-3 w-2/3 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="shrink-0 rounded-lg border border-dashed border-line bg-slate-50 p-6 text-center text-sm leading-6 text-muted">
          진단 값을 입력하면 추천 자격증과 적합도 분석이 표시됩니다.
        </div>
      )}

      <div className={`min-h-0 space-y-3 ${bodyClassName}`}>
        {items.map((item, index) => {
          const selected = selectedId === item.id
          const roles = item.certificate.target_roles.slice(0, dense ? 1 : 2).join(', ')

          return (
            <article
              key={item.id}
              className={`rounded-lg border transition duration-200 ${
                dense ? 'p-3' : 'p-4'
              } ${selected ? 'border-brand-purple bg-brand-purple/5 shadow-card' : 'border-line bg-white shadow-card hover:border-brand-purple/40'}`}
            >
              <button type="button" className="block w-full text-left" onClick={() => onSelect(item)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-ink px-2.5 py-1 text-xs font-bold text-white">TOP {index + 1}</span>
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-muted">
                        {item.score}% 적합
                      </span>
                    </div>
                    <h3 className={`${dense ? 'mt-2 text-base' : 'mt-3 text-lg'} font-bold text-ink`}>{item.certificate.name}</h3>
                    <p className="mt-1 text-sm font-medium text-muted">
                      {item.certificate.category} / {item.certificate.exam_type}
                    </p>
                    <p className={`${dense ? 'mt-1 line-clamp-1' : 'mt-2 line-clamp-2'} text-sm leading-6 text-slate-600`}>
                      {item.reasons[0]}
                    </p>
                  </div>

                  <div className={`shrink-0 rounded-lg border border-line bg-white text-center ${dense ? 'w-20 p-2.5' : 'w-28 p-4'}`}>
                    <p className="text-xs font-bold text-muted">적합도</p>
                    <p className="mt-1 text-xl font-bold text-ink">{item.score}</p>
                  </div>
                </div>

                <div className={`${dense ? 'mt-3 grid-cols-2' : 'mt-4 grid-cols-2 xl:grid-cols-4'} grid gap-2`}>
                  <StatChip icon={<BadgeCheck size={15} />} label="합격 가능성" value={`${item.pass_probability}%`} tone="success" />
                  <StatChip icon={<Clock3 size={15} />} label="예상 기간" value={`${item.estimated_weeks}주`} tone="blue" />
                  {!dense && <StatChip icon={<Gauge size={15} />} label="난이도" value={`${item.certificate.difficulty}/5`} tone="warning" />}
                  {!dense && <StatChip icon={<Route size={15} />} label="관련 직무" value={roles || '-'} tone="purple" />}
                </div>
              </button>

              <div className={`${dense ? 'mt-3 pt-3' : 'mt-4 pt-4'} flex items-center justify-between border-t border-line`}>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <Gauge size={14} />
                  {item.eligibility_status}
                </span>
                <button type="button" className="secondary-button h-9 px-3" onClick={() => onCreateRoadmap(item)}>
                  <Save size={15} />
                  저장
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function StatChip({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode
  label: string
  value: string
  tone: 'success' | 'blue' | 'warning' | 'purple'
}) {
  const toneClass = {
    success: 'border border-line bg-white text-emerald-700',
    blue: 'border border-line bg-white text-brand-blue',
    warning: 'border border-line bg-white text-amber-700',
    purple: 'border border-line bg-white text-muted',
  }[tone]

  return (
    <span className={`min-w-0 rounded-md px-3 py-2 ${toneClass}`}>
      <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-normal opacity-80">
        {icon}
        {label}
      </span>
      <span className="mt-1 block truncate text-sm font-bold">{value}</span>
    </span>
  )
}
