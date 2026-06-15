import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

import type { RecommendationItem, Roadmap } from '../types'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

interface ScoreChartsProps {
  recommendations: RecommendationItem[]
  roadmap: Roadmap | null
  compact?: boolean
  className?: string
}

const chartColors = ['#863BFF', '#47BFFF', '#6D28D9', '#16803A', '#B7791F']

export function ScoreCharts({ recommendations, roadmap, compact = false, className = '' }: ScoreChartsProps) {
  const topItems = recommendations.slice(0, 5)
  const checked = roadmap?.steps.filter((step) => step.checked).length ?? 0
  const remaining = Math.max(0, (roadmap?.steps.length ?? 0) - checked)

  return (
    <section className={`panel ${compact ? 'p-4' : 'p-5 sm:p-6'} ${className}`}>
      <div className={compact ? 'mb-3' : 'mb-5'}>
        <h2 className={`${compact ? 'text-base' : 'text-xl'} font-bold text-ink`}>시각화</h2>
        <p className="mt-1 text-sm text-muted">추천 점수와 저장된 로드맵 진행률을 비교합니다.</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className={`${compact ? 'h-40' : 'h-72'} rounded-lg border border-line bg-white p-3`}>
          {topItems.length > 0 ? (
            <Bar
              data={{
                labels: topItems.map((item) => item.certificate.name),
                datasets: [
                  {
                    label: '추천 점수',
                    data: topItems.map((item) => item.score),
                    backgroundColor: chartColors,
                    borderRadius: 8,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: { min: 0, max: 100, grid: { color: '#E2E8F0' }, ticks: { color: '#64748B' } },
                  x: { grid: { display: false }, ticks: { color: '#64748B' } },
                },
                plugins: { legend: { display: false } },
              }}
            />
          ) : (
            <EmptyChart label="추천 계산 후 그래프가 표시됩니다." />
          )}
        </div>
        <div className={`${compact ? 'h-40' : 'h-72'} rounded-lg border border-line bg-white p-3`}>
          {roadmap ? (
            <Doughnut
              data={{
                labels: ['완료', '남은 단계'],
                datasets: [
                  {
                    data: [checked, remaining],
                    backgroundColor: ['#863BFF', '#E3DAF7'],
                    hoverBackgroundColor: ['#6D28D9', '#D8C9F8'],
                    borderWidth: 0,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '68%',
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: '#64748B', font: { family: 'Pretendard' } },
                  },
                  tooltip: { enabled: true },
                },
              }}
            />
          ) : (
            <EmptyChart label="저장한 로드맵이 없습니다." />
          )}
        </div>
      </div>
    </section>
  )
}

function EmptyChart({ label }: { label: string }) {
  return <div className="flex h-full items-center justify-center text-center text-sm font-medium text-muted">{label}</div>
}
