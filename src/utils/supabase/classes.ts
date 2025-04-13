import { createClient } from '@/utils/supabase/client'
import type { Class } from '@/types/supabase'

export const classesService = {
  async getClasses() {
    const supabase = createClient()
    const { data: classes, error } = await supabase
      .from('classes')
      .select('*')
      .is('archived_at', null)
      .order('created_at', { ascending: false })

    if (error) throw error
    return classes
  },

  async getArchivedClasses() {
    const supabase = createClient()
    const { data: classes, error } = await supabase
      .from('classes')
      .select('*')
      .not('archived_at', 'is', null)
      .order('archived_at', { ascending: false })

    if (error) throw error
    return classes
  },

  async addClass(classData: {
    title: string;
    description: string;
    yubi_variant: string;
  }) {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Authentication required')
    }

    const newClass = {
      ...classData,
      user_id: user.id,
      archived_at: null
    }

    const { data, error } = await supabase
      .from('classes')
      .insert(newClass)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw new Error(error.message)
    }

    return data
  },

  async updateClass(id: string, updates: Partial<Class>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('classes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async archiveClass(id: string) {
    return this.updateClass(id, { archived_at: new Date().toISOString() })
  },

  async restoreClass(id: string) {
    return this.updateClass(id, { archived_at: null })
  },

  async deleteClass(id: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
