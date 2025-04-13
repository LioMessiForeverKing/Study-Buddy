import { createClient } from '@/utils/supabase/client'
import type { Chapter } from '@/types/supabase'

export const chaptersService = {
  async getChapters(classId: string) {
    const supabase = createClient()
    const { data: chapters, error } = await supabase
      .from('chapters')
      .select(`
        *,
        drawings(*)
      `)
      .eq('class_id', classId)
      .order('order_index', { ascending: true })

    if (error) throw error
    return chapters
  },

  async addChapter(chapterData: {
    class_id: string
    title: string
    subtitle: string
    order_index: number
  }) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('chapters')
      .insert({
        ...chapterData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateChapter(id: string, updates: Partial<Omit<Chapter, 'id' | 'created_at'>>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('chapters')
      .update({ 
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteChapter(id: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('chapters')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async saveDrawing(drawingData: {
    chapter_id: string
    class_id: string
    page_data: any
  }) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('drawings')
      .upsert({
        chapter_id: drawingData.chapter_id,
        class_id: drawingData.class_id,
        page_data: drawingData.page_data,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getDrawing(chapterId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('drawings')
      .select('*')
      .eq('chapter_id', chapterId)
      .single()

    if (error && error.code !== 'PGRST116') throw error // Ignore not found error
    return data
  }
}
