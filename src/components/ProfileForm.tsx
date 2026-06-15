import type { FormEvent } from 'react'
import type { ReactNode } from 'react'
import { RefreshCw, Search, Target } from 'lucide-react'

import { currentStatuses, interestedRoles, knowledgeLevels, targetFields } from '../data/options'
import type { ProfileInput } from '../types'

interface ProfileFormProps {
  profile: ProfileInput
  disabled: boolean
  loading: boolean
  onChange: (profile: ProfileInput) => void
  onSubmit: () => void
}

export function ProfileForm({ profile, disabled, loading, onChange, onSubmit }: ProfileFormProps) {
  function update<K extends keyof ProfileInput>(key: K, value: ProfileInput[K]) {
    onChange({ ...profile, [key]: value })
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <section className="panel p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-md border border-line bg-slate-50 px-3 py-1 text-xs font-bold text-muted">
            <Target size={14} />
            진단 조건
          </span>
          <h2 className="mt-3 text-xl font-bold text-ink">자격증 진단</h2>
          <p className="mt-1 text-sm leading-6 text-muted">목표와 학습 조건을 기준으로 추천 점수와 예상 로드맵을 계산합니다.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-xs font-bold text-muted">
          <Target size={14} />
          추천 기준 v1
        </span>
      </div>

      <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
        <Field label="목표 분야">
          <select className="field mt-1" value={profile.target_field} onChange={(event) => update('target_field', event.target.value)}>
            <option value="" disabled>
              선택하세요
            </option>
            {targetFields.map((field) => (
              <option key={field}>{field}</option>
            ))}
          </select>
        </Field>

        <Field label="현재 상태">
          <select className="field mt-1" value={profile.current_status} onChange={(event) => update('current_status', event.target.value)}>
            <option value="" disabled>
              선택하세요
            </option>
            {currentStatuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </Field>

        <Field label="준비 가능 기간">
          <div className="mt-1 flex items-center gap-2">
            <input
              className="field"
              type="number"
              min={1}
              max={52}
              value={profile.available_weeks === 0 ? '' : profile.available_weeks}
              onChange={(event) => update('available_weeks', event.target.value === '' ? 0 : Number(event.target.value))}
            />
            <span className="w-10 text-sm font-semibold text-muted">주</span>
          </div>
        </Field>

        <Field label="주당 학습 시간">
          <div className="mt-1 flex items-center gap-2">
            <input
              className="field"
              type="number"
              min={0}
              max={80}
              value={profile.weekly_hours === 0 ? '' : profile.weekly_hours}
              onChange={(event) => update('weekly_hours', event.target.value === '' ? 0 : Number(event.target.value))}
            />
            <span className="w-10 text-sm font-semibold text-muted">시간</span>
          </div>
        </Field>

        <Field label="관심 직무">
          <select className="field mt-1" value={profile.interested_role} onChange={(event) => update('interested_role', event.target.value)}>
            <option value="" disabled>
              선택하세요
            </option>
            {interestedRoles.map((role) => (
              <option key={role}>{role}</option>
            ))}
          </select>
        </Field>

        <Field label="기초 지식 수준">
          <select
            className="field mt-1"
            value={profile.knowledge_level}
            onChange={(event) => update('knowledge_level', event.target.value as ProfileInput['knowledge_level'])}
          >
            <option value="" disabled>
              선택하세요
            </option>
            {knowledgeLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </Field>

        <CheckTile
          checked={profile.has_related_major}
          label="관련 학과 또는 교육 이수"
          onChange={(checked) => update('has_related_major', checked)}
        />
        <CheckTile
          checked={profile.has_work_experience}
          label="관련 실무 경험 있음"
          onChange={(checked) => update('has_work_experience', checked)}
        />

        <button type="submit" className="primary-button md:col-span-2" disabled={disabled || loading}>
          {loading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
          {loading ? '추천 생성 중' : '추천 시작하기'}
        </button>
      </form>
    </section>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
    </label>
  )
}

function CheckTile({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex min-h-14 items-center gap-3 rounded-md border border-line bg-slate-50 p-3 transition hover:border-slate-400 hover:bg-white">
      <input type="checkbox" className="h-4 w-4 accent-brand-purple" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="text-sm font-semibold text-slate-700">{label}</span>
    </label>
  )
}
