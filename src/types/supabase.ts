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

export interface Database {
  public: {
    Tables: {
      classes: {
        Row: Class
        Insert: Omit<Class, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Class, 'id' | 'created_at'>>
      }
    }
  }
}
