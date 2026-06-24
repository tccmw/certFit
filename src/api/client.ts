import type {
  AuthResponse,
  Certificate,
  ImportResult,
  ProfileInput,
  RecommendationRun,
  Roadmap,
  User,
  UserCertificate,
} from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

interface RequestOptions extends Omit<RequestInit, 'body'> {
  token?: string | null
  body?: BodyInit | object | null
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`)
  }

  let body = options.body
  if (body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob)) {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(body)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body,
  })

  if (!response.ok) {
    let message = `요청 실패 (${response.status})`
    try {
      const data = await response.json()
      message = data.detail ?? message
    } catch {
      // Keep the status-based message when the body is not JSON.
    }
    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }
  return response.json() as Promise<T>
}

export const api = {
  register: (email: string, password: string, name: string) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: { email, password, name },
    }),
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),
  me: (token: string) => request<User>('/auth/me', { token }),
  saveProfile: (token: string, profile: ProfileInput) =>
    request<User>('/auth/profile', {
      method: 'PUT',
      token,
      body: profile,
    }),
  certificates: () => request<Certificate[]>('/certificates'),
  myCertificates: (token: string) => request<UserCertificate[]>('/my-certificates', { token }),
  addMyCertificate: (token: string, certificateId: number) =>
    request<UserCertificate>('/my-certificates', {
      method: 'POST',
      token,
      body: { certificate_id: certificateId },
    }),
  removeMyCertificate: (token: string, userCertificateId: number) =>
    request<void>(`/my-certificates/${userCertificateId}`, {
      method: 'DELETE',
      token,
    }),
  recommendations: (token: string, profile: ProfileInput) =>
    request<RecommendationRun>('/recommendations', {
      method: 'POST',
      token,
      body: profile,
    }),
  recommendationHistory: (token: string) => request<RecommendationRun[]>('/recommendations/history', { token }),
  roadmaps: (token: string) => request<Roadmap[]>('/roadmaps', { token }),
  createRoadmap: (token: string, certificateId: number, totalWeeks?: number) =>
    request<Roadmap>('/roadmaps', {
      method: 'POST',
      token,
      body: { certificate_id: certificateId, total_weeks: totalWeeks },
    }),
  updateStep: (token: string, roadmapId: number, stepId: number, checked: boolean) =>
    request<Roadmap>(`/roadmaps/${roadmapId}/steps/${stepId}`, {
      method: 'PATCH',
      token,
      body: { checked },
    }),
  event: (token: string | null, eventType: string, certificateId?: number, metadata: Record<string, unknown> = {}) =>
    request<{ status: string }>('/events', {
      method: 'POST',
      token,
      body: { event_type: eventType, certificate_id: certificateId, metadata },
    }),
  importPublicData: (token: string) =>
    request<ImportResult>('/imports/public-data', {
      method: 'POST',
      token,
    }),
}
