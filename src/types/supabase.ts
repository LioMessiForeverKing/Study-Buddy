export interface TextElement {
  id: string
  x: number
  y: number
  text: string
  color: string
  fontSize: number
  isDragging: boolean
}

export interface PageDataWithImage {
  id: string
  imageData: string
  textElements: TextElement[]
}

export interface Class {
  id: string
  user_id: string
  title: string
  description: string
  yubi_variant: string
  created_at: string
  archived_at: string | null
  updated_at: string
}

export interface Chapter {
  id: string
  class_id: string
  title: string
  subtitle: string
  order_index: number
  created_at: string
  updated_at: string
}

export interface Drawing {
  id: string
  chapter_id: string
  class_id: string
  page_data: {
    pages: PageDataWithImage[]
    currentPageIndex: number
  }
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      classes: {
        Row: Class
        Insert: Omit<Class, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Class, 'id' | 'created_at'>>
      }
      chapters: {
        Row: Chapter
        Insert: Omit<Chapter, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Chapter, 'id' | 'created_at'>>
      }
      drawings: {
        Row: Drawing
        Insert: Omit<Drawing, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Drawing, 'id' | 'created_at'>>
      }
    }
  }
}
