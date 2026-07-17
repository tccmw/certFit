import type { FormEvent, ReactNode } from 'react'
import { useForm } from '@tanstack/react-form'
import { RefreshCw, Search, Target } from 'lucide-react'

import { currentStatuses, interestedRoles, knowledgeLevels, targetFields } from '../data/options'
import type { ProfileInput } from '../types'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { NativeSelect } from './ui/native-select'

interface ProfileFormProps {
  profile: ProfileInput
  disabled: boolean
  loading: boolean
  onSubmit: (profile: ProfileInput) => void
}

const required = (label: string) => ({ value }: { value: string }) => (value ? undefined : `${label}을 선택해주세요.`)

export function ProfileForm({ profile, disabled, loading, onSubmit }: ProfileFormProps) {
  const form = useForm({
    defaultValues: profile,
    onSubmit: ({ value }) => onSubmit(value),
  })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    event.stopPropagation()
    void form.handleSubmit()
  }

  return (
    <section className="panel p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-md border border-line bg-slate-50 px-3 py-1 text-xs font-bold text-muted">
            <Target size={14} /> 진단 조건
          </span>
          <h2 className="mt-3 text-xl font-bold text-ink">자격증 진단</h2>
          <p className="mt-1 text-sm leading-6 text-muted">목표와 학습 조건을 기준으로 추천 점수와 예상 로드맵을 계산합니다.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-xs font-bold text-muted">
          <Target size={14} /> 추천 기준 v1
        </span>
      </div>

      <form className="grid gap-4 md:grid-cols-2" noValidate onSubmit={submit}>
        <form.Field name="target_field" validators={{ onChange: required('목표 분야'), onSubmit: required('목표 분야') }}>
          {(field) => (
            <Field label="목표 분야" errors={field.state.meta.errors} touched={field.state.meta.isTouched}>
              <NativeSelect className="mt-1" value={field.state.value} onBlur={field.handleBlur} onChange={(event) => field.handleChange(event.target.value)}>
                <option value="" disabled>선택하세요</option>
                {targetFields.map((item) => <option key={item}>{item}</option>)}
              </NativeSelect>
            </Field>
          )}
        </form.Field>

        <form.Field name="current_status" validators={{ onChange: required('현재 상태'), onSubmit: required('현재 상태') }}>
          {(field) => (
            <Field label="현재 상태" errors={field.state.meta.errors} touched={field.state.meta.isTouched}>
              <NativeSelect className="mt-1" value={field.state.value} onBlur={field.handleBlur} onChange={(event) => field.handleChange(event.target.value)}>
                <option value="" disabled>선택하세요</option>
                {currentStatuses.map((item) => <option key={item}>{item}</option>)}
              </NativeSelect>
            </Field>
          )}
        </form.Field>

        <form.Field
          name="available_weeks"
          validators={{
            onChange: ({ value }) => validateRange(value, 1, 52, '준비 기간은 1주에서 52주 사이여야 합니다.'),
            onSubmit: ({ value }) => validateRange(value, 1, 52, '준비 기간은 1주에서 52주 사이여야 합니다.'),
          }}
        >
          {(field) => (
            <Field label="준비 가능 기간" errors={field.state.meta.errors} touched={field.state.meta.isTouched}>
              <div className="mt-1 flex items-center gap-2">
                <Input type="number" min={1} max={52} value={field.state.value === 0 ? '' : field.state.value} onBlur={field.handleBlur} onChange={(event) => field.handleChange(event.target.value === '' ? 0 : Number(event.target.value))} />
                <span className="w-10 text-sm font-semibold text-muted">주</span>
              </div>
            </Field>
          )}
        </form.Field>

        <form.Field
          name="weekly_hours"
          validators={{
            onChange: ({ value }) => validateRange(value, 1, 80, '주당 학습 시간은 1시간에서 80시간 사이여야 합니다.'),
            onSubmit: ({ value }) => validateRange(value, 1, 80, '주당 학습 시간은 1시간에서 80시간 사이여야 합니다.'),
          }}
        >
          {(field) => (
            <Field label="주당 학습 시간" errors={field.state.meta.errors} touched={field.state.meta.isTouched}>
              <div className="mt-1 flex items-center gap-2">
                <Input type="number" min={1} max={80} value={field.state.value === 0 ? '' : field.state.value} onBlur={field.handleBlur} onChange={(event) => field.handleChange(event.target.value === '' ? 0 : Number(event.target.value))} />
                <span className="w-10 text-sm font-semibold text-muted">시간</span>
              </div>
            </Field>
          )}
        </form.Field>

        <form.Field name="interested_role" validators={{ onChange: required('관심 직무'), onSubmit: required('관심 직무') }}>
          {(field) => (
            <Field label="관심 직무" errors={field.state.meta.errors} touched={field.state.meta.isTouched}>
              <NativeSelect className="mt-1" value={field.state.value} onBlur={field.handleBlur} onChange={(event) => field.handleChange(event.target.value)}>
                <option value="" disabled>선택하세요</option>
                {interestedRoles.map((item) => <option key={item}>{item}</option>)}
              </NativeSelect>
            </Field>
          )}
        </form.Field>

        <form.Field name="knowledge_level" validators={{ onChange: required('기초 지식 수준'), onSubmit: required('기초 지식 수준') }}>
          {(field) => (
            <Field label="기초 지식 수준" errors={field.state.meta.errors} touched={field.state.meta.isTouched}>
              <NativeSelect className="mt-1" value={field.state.value} onBlur={field.handleBlur} onChange={(event) => field.handleChange(event.target.value as ProfileInput['knowledge_level'])}>
                <option value="" disabled>선택하세요</option>
                {knowledgeLevels.map((level) => <option key={level.value} value={level.value}>{level.label}</option>)}
              </NativeSelect>
            </Field>
          )}
        </form.Field>

        <form.Field name="has_related_major">
          {(field) => <CheckTile checked={field.state.value} label="관련 학과 또는 교육 이수" onChange={field.handleChange} />}
        </form.Field>
        <form.Field name="has_work_experience">
          {(field) => <CheckTile checked={field.state.value} label="관련 실무 경험 있음" onChange={field.handleChange} />}
        </form.Field>

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" className="md:col-span-2" disabled={disabled || loading || isSubmitting || !canSubmit}>
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
              {loading ? '추천 생성 중' : '추천 시작하기'}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </section>
  )
}

function Field({ label, children, errors = [], touched = false }: { label: string; children: ReactNode; errors?: readonly unknown[]; touched?: boolean }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {touched && errors.length > 0 && <span className="mt-1 block text-xs font-semibold text-danger">{String(errors[0])}</span>}
    </label>
  )
}

function validateRange(value: number, min: number, max: number, message: string) {
  return value < min || value > max ? message : undefined
}

function CheckTile({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex min-h-14 items-center gap-3 rounded-md border border-line bg-slate-50 p-3 transition hover:border-slate-400 hover:bg-white">
      <input type="checkbox" className="h-4 w-4 accent-brand-purple" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="text-sm font-semibold text-slate-700">{label}</span>
    </label>
  )
}
