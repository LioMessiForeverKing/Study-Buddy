import { createClient } from '@/lib/supabase'

export interface Class {
  id: string;
  user_id: string;
  title: string;
  description: string;
  yubi_variant?: string;
  created_at?: string;
  updated_at?: string;
  is_archived: boolean;
}

export const getClasses = async (archived: boolean = false): Promise<Class[]> => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];

  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_archived', archived)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const addClass = async (classData: Pick<Class, 'title' | 'description' | 'yubi_variant'>): Promise<Class> => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('classes')
    .insert({
      user_id: user.id,
      title: classData.title,
      description: classData.description,
      yubi_variant: classData.yubi_variant,
      is_archived: false
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateClass = async (id: string, updates: Partial<Class>): Promise<Class> => {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('classes')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteClass = async (id: string): Promise<void> => {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('classes')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const archiveClass = async (id: string): Promise<Class> => {
  return updateClass(id, { is_archived: true });
};

export const restoreClass = async (id: string): Promise<Class> => {
  return updateClass(id, { is_archived: false });
};