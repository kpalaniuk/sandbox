export type Privacy = 'private' | 'link' | 'public'
export type SandboxState = 'active' | 'archived' | 'deleted'
export type ParticipantRole = 'owner' | 'admin' | 'editor' | 'contributor' | 'viewer'
export type MediaType = 'photo' | 'video' | 'audio' | 'document'
export type ExpenseStatus = 'pending' | 'settled' | 'cancelled'

export interface Sandbox {
  id: string
  title: string
  description?: string
  owner_id: string
  privacy: Privacy
  start_time?: string
  end_time?: string
  location?: string
  metadata: Record<string, any>
  state: SandboxState
  created_at: string
  updated_at: string
}

export interface Participant {
  id: string
  sandbox_id: string
  user_id: string
  role: ParticipantRole
  display_name?: string
  consent_flags: Record<string, any>
  created_at: string
}

export interface MediaItem {
  id: string
  sandbox_id: string
  owner_id: string
  type: MediaType
  url: string
  thumbnail_url?: string
  caption?: string
  timestamp: string
  location_lat?: number
  location_lng?: number
  metadata: Record<string, any>
  created_at: string
}

export interface Event {
  id: string
  sandbox_id: string
  title: string
  description?: string
  start_time: string
  end_time?: string
  location?: string
  location_lat?: number
  location_lng?: number
  created_by: string
  metadata: Record<string, any>
  created_at: string
}

export interface Expense {
  id: string
  sandbox_id: string
  payer_id: string
  amount: number
  currency: string
  description?: string
  splits: Array<{ user_id: string; amount: number }>
  status: ExpenseStatus
  created_at: string
}

export interface Message {
  id: string
  sandbox_id: string
  user_id: string
  content: string
  media_id?: string
  created_at: string
}

export interface Reaction {
  id: string
  media_id: string
  user_id: string
  emoji: string
  created_at: string
}
