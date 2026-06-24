export type KnowledgeLevel = '' | 'beginner' | 'basic' | 'intermediate' | 'advanced'

export interface ProfileInput {
  target_field: string
  current_status: string
  available_weeks: number
  weekly_hours: number
  interested_role: string
  knowledge_level: KnowledgeLevel
  has_related_major: boolean
  has_work_experience: boolean
}

export interface User {
  id: number
  email: string
  name: string
  profile: ProfileInput | null
}

export interface AuthResponse {
  token: string
  user: User
}

export interface ExamSchedule {
  id: number
  exam_name: string
  registration_start: string | null
  registration_end: string | null
  exam_date: string | null
  result_date: string | null
  location: string
  note: string
}

export interface LearningResource {
  name: string
  provider_type: string
  delivery: string
  fit: string
  note: string
}

export interface Certificate {
  id: number
  slug: string
  name: string
  category: string
  difficulty: number
  required_weeks: number
  min_weekly_hours: number
  average_pass_rate: number
  provider: string
  exam_type: string
  eligibility: string
  schedule_summary: string
  description: string
  target_roles: string[]
  subjects: string[]
  tags: string[]
  schedules: ExamSchedule[]
  learning_resources?: LearningResource[]
}

export interface UserCertificate {
  id: number
  certificate: Certificate
  acquired_at: string | null
}

export interface RecommendationItem {
  id: number
  certificate: Certificate
  score: number
  pass_probability: number
  estimated_weeks: number
  eligibility_status: string
  reasons: string[]
  breakdown: Record<string, number>
}

export interface RecommendationRun {
  id: number
  created_at: string
  profile_snapshot: ProfileInput
  items: RecommendationItem[]
}

export interface RoadmapStep {
  id: number
  week: number
  title: string
  description: string
  planned_hours: number
  checked: boolean
}

export interface Roadmap {
  id: number
  certificate: Certificate
  title: string
  total_weeks: number
  created_at: string
  progress: number
  steps: RoadmapStep[]
}

export interface ImportResult {
  status: string
  imported_count: number
  message: string
}
