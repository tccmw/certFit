import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'

import { useAuth } from '../auth/useAuth'
import { AuthPageFrame } from '../components/AuthPageFrame'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
      navigate('/main', { replace: true })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '로그인 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthPageFrame title="로그인" subtitle="저장된 추천 결과와 학습 로드맵을 이어서 확인하세요.">
      <form className="space-y-4" onSubmit={submit}>
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
          <LogIn size={16} />
          {loading ? '로그인 중' : '로그인'}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-muted">
        계정이 없다면{' '}
        <Link className="font-semibold text-brand-violet hover:text-brand-blue hover:underline" to="/register">
          회원가입
        </Link>
      </p>
    </AuthPageFrame>
  )
}
