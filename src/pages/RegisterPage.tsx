import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'

import { useAuth } from '../auth/useAuth'
import { AuthPageFrame } from '../components/AuthPageFrame'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await register(email, password, name)
      navigate('/main', { replace: true })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '회원가입 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthPageFrame title="회원가입" subtitle="내 목표에 맞는 추천과 로드맵을 저장할 계정을 만듭니다.">
      <form className="space-y-4" onSubmit={submit}>
        <label className="block">
          <span className="label">이름</span>
          <input className="field mt-1" value={name} required onChange={(event) => setName(event.target.value)} />
        </label>
        <label className="block">
          <span className="label">이메일</span>
          <input className="field mt-1" type="email" value={email} required onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="block">
          <span className="label">비밀번호</span>
          <input
            className="field mt-1"
            type="password"
            minLength={6}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error && <p className="rounded-md bg-warning/10 px-3 py-2 text-sm font-medium text-amber-800">{error}</p>}
        <button type="submit" className="primary-button w-full" disabled={loading}>
          <UserPlus size={16} />
          {loading ? '가입 중' : '회원가입'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-muted">
        이미 계정이 있다면{' '}
        <Link className="font-semibold text-brand-violet hover:text-brand-blue hover:underline" to="/login">
          로그인
        </Link>
      </p>
    </AuthPageFrame>
  )
}
