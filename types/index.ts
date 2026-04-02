export interface Note {
  id: string
  user_id: string
  title: string
  content: string
  is_public: boolean
  color: string
  tags: string[]
  word_count: number
  created_at: string
  updated_at: string
}

export interface Todo {
  id: string
  user_id: string
  title: string
  description?: string
  completed: boolean
  priority: 'high' | 'medium' | 'low'
  due_date?: string
  category?: string
  created_at: string
  updated_at: string
}

export interface TimetableEntry {
  id: string
  user_id: string
  course_name: string
  room?: string
  day_of_week: number   // 1=Mon … 5=Fri
  start_time: string    // "08:00"
  end_time: string      // "09:00"
  color: string
  created_at: string
}

export interface Profile {
  id: string
  user_id: string
  nickname: string
  avatar_url?: string
  theme: string
  created_at: string
  updated_at: string
}

export type NoteColor =
  | 'pink' | 'rose' | 'lavender' | 'mint' | 'peach' | 'sky' | 'cream'

export interface BlogPost {
  id: string
  author_id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  tags: string[]
  status: 'draft' | 'published'
  cover_image: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}
