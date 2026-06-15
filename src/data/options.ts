import type { KnowledgeLevel, ProfileInput } from '../types'

export const defaultProfile: ProfileInput = {
  target_field: '',
  current_status: '',
  available_weeks: 0,
  weekly_hours: 0,
  interested_role: '',
  knowledge_level: '',
  has_related_major: false,
  has_work_experience: false,
}

export const targetFields = ['IT/개발', '데이터', '사무/OA', '디자인', '네트워크/인프라']

export const currentStatuses = ['취업 준비생', '대학생', '자기계발 학생', '이직 준비 직장인']

export const interestedRoles = [
  '백엔드 개발자',
  '프론트엔드 개발자',
  '데이터 분석가',
  'BI 분석가',
  '시스템 엔지니어',
  '네트워크 엔지니어',
  '사무직',
  '그래픽 디자이너',
  '서비스 기획자',
]

export const knowledgeLevels: Array<{ value: KnowledgeLevel; label: string }> = [
  { value: 'beginner', label: '처음 시작' },
  { value: 'basic', label: '기초 있음' },
  { value: 'intermediate', label: '실습 경험 있음' },
  { value: 'advanced', label: '실무 수준' },
]
