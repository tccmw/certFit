import { BadgeCheck, CheckCircle2, ListChecks, Route } from 'lucide-react'

import type { Roadmap, RoadmapStep } from '../types'

interface RoadmapPanelProps {
  roadmaps: Roadmap[]
  activeRoadmapId: number | null
  onSelect: (roadmapId: number) => void
  onToggleStep: (roadmap: Roadmap, step: RoadmapStep) => void
}

export function RoadmapPanel({ roadmaps, activeRoadmapId, onSelect, onToggleStep }: RoadmapPanelProps) {
  const active = roadmaps.find((roadmap) => roadmap.id === activeRoadmapId) ?? roadmaps[0] ?? null

  return (
    <section className="panel p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-emerald-700">
            <Route size={14} />
            Study Roadmap
          </span>
          <h2 className="mt-3 text-xl font-bold text-ink">학습 로드맵</h2>
          <p className="mt-1 text-sm text-muted">저장한 계획과 주차별 진행률을 관리합니다.</p>
        </div>
        <ListChecks size={24} className="text-success" />
      </div>

      {roadmaps.length > 0 && (
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {roadmaps.map((roadmap) => (
            <button
              key={roadmap.id}
              type="button"
              className={`shrink-0 rounded-md border px-3 py-2 text-xs font-bold transition ${
                active?.id === roadmap.id
                  ? 'border-brand-purple bg-brand-purple/10 text-brand-violet shadow-card'
                  : 'border-line bg-white text-muted hover:border-brand-purple/40 hover:text-brand-violet'
              }`}
              onClick={() => onSelect(roadmap.id)}
            >
              {roadmap.certificate.name}
            </button>
          ))}
        </div>
      )}

      {!active ? (
        <div className="rounded-lg border border-dashed border-line bg-slate-50 p-8 text-center text-sm leading-6 text-muted">
          추천 카드에서 로드맵을 저장하면 주차별 계획이 표시됩니다.
        </div>
      ) : (
        <>
          <div className="mb-6 rounded-xl bg-brand-gradient-soft p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-base font-bold text-ink">{active.title}</p>
                <p className="mt-1 text-sm font-medium text-muted">{active.total_weeks}주 로드맵</p>
              </div>
              <p className="text-xl font-bold text-brand-violet">{active.progress}%</p>
            </div>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-brand-gradient transition-all" style={{ width: `${active.progress}%` }} />
            </div>
          </div>

          <div className="max-h-[560px] overflow-y-auto pr-1">
            <div className="relative space-y-3">
              <div className="absolute bottom-8 left-5 top-8 w-0.5 bg-brand-gradient" />
              {active.steps.map((step, index) => (
                <button
                  key={step.id}
                  type="button"
                  className={`relative z-10 flex w-full gap-4 rounded-lg border p-3 text-left transition hover:border-brand-purple/40 ${
                    step.checked ? 'border-success/30 bg-success/10' : 'border-line bg-white hover:border-brand-purple/40'
                  }`}
                  onClick={() => onToggleStep(active, step)}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-white shadow-card ${
                      step.checked ? 'bg-success text-white' : 'bg-brand-gradient text-white'
                    }`}
                  >
                    {step.checked ? <CheckCircle2 size={19} /> : <span className="text-sm font-bold">{index + 1}</span>}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-brand-violet">Week {step.week}</span>
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
        </>
      )}
    </section>
  )
}
