import { BadgeCheck, ChevronDown, CheckCircle2, ListChecks, Route } from 'lucide-react'

import type { Roadmap, RoadmapStep } from '../types'

interface RoadmapPanelProps {
  roadmaps: Roadmap[]
  activeRoadmapId: number | null
  onSelect: (roadmapId: number | null) => void
  onToggleStep: (roadmap: Roadmap, step: RoadmapStep) => void
}

export function RoadmapPanel({ roadmaps, activeRoadmapId, onSelect, onToggleStep }: RoadmapPanelProps) {
  return (
    <section className="panel p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-md border border-line bg-slate-50 px-3 py-1 text-xs font-bold text-muted">
            <Route size={14} />
            학습 계획
          </span>
          <h2 className="mt-3 text-xl font-bold text-ink">저장한 로드맵</h2>
          <p className="mt-1 text-sm text-muted">로드맵을 선택하면 주차별 계획과 진행률이 펼쳐집니다.</p>
        </div>
        <ListChecks size={24} className="text-brand-violet" />
      </div>

      {roadmaps.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-slate-50 p-8 text-center text-sm leading-6 text-muted">
          추천 카드에서 로드맵을 저장하면 주차별 계획이 표시됩니다.
        </div>
      ) : (
        <div className="space-y-3">
          {roadmaps.map((roadmap) => {
            const expanded = activeRoadmapId === roadmap.id

            return (
              <article key={roadmap.id} className="overflow-hidden rounded-lg border border-line bg-white">
                <button
                  type="button"
                  className={`flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition ${
                    expanded ? 'bg-brand-purple/5' : 'hover:bg-slate-50'
                  }`}
                  aria-expanded={expanded}
                  onClick={() => onSelect(expanded ? null : roadmap.id)}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-ink">{roadmap.title}</span>
                    <span className="mt-1 block text-xs font-semibold text-muted">
                      {roadmap.certificate.name} / {roadmap.total_weeks}주 로드맵 / {roadmap.progress}% 완료
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="hidden w-24 overflow-hidden rounded-full bg-slate-100 sm:block">
                      <span className="block h-2 rounded-full bg-brand-purple" style={{ width: `${roadmap.progress}%` }} />
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-muted transition-transform ${expanded ? 'rotate-180 text-brand-violet' : ''}`}
                    />
                  </span>
                </button>

                {expanded && (
                  <div className="border-t border-line bg-slate-50/60 p-4">
                    <div className="mb-4 rounded-md border border-line bg-white p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-bold text-ink">진행률</p>
                        <p className="text-sm font-bold text-brand-violet">{roadmap.progress}%</p>
                      </div>
                      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-brand-purple transition-all" style={{ width: `${roadmap.progress}%` }} />
                      </div>
                    </div>

                    <div className="space-y-3">
                      {roadmap.steps.map((step, index) => (
                        <button
                          key={step.id}
                          type="button"
                          className={`flex w-full gap-4 rounded-lg border p-3 text-left transition hover:border-brand-purple/40 ${
                            step.checked ? 'border-success/30 bg-success/10' : 'border-line bg-white'
                          }`}
                          onClick={() => onToggleStep(roadmap, step)}
                        >
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line shadow-card ${
                              step.checked ? 'bg-success text-white' : 'bg-white text-ink'
                            }`}
                          >
                            {step.checked ? <CheckCircle2 size={19} /> : <span className="text-sm font-bold">{index + 1}</span>}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold text-muted">Week {step.week}</span>
                              {step.checked && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                                  <BadgeCheck size={12} />
                                  완료
                                </span>
                              )}
                            </span>
                            <span className="mt-1 block text-sm font-bold text-ink">{step.title}</span>
                            <span className="mt-1 block text-sm leading-6 text-muted">{step.description}</span>
                            <span className="mt-2 block text-xs font-bold text-slate-500">예상 {step.planned_hours}시간</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
