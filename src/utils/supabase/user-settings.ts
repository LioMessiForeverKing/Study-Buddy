import { createClient } from '@/lib/supabase'

export interface UserSettings {
  id: string;
  display_name: string;
  age_group: string;
  education_level: string;
  study_goals: string[];
}

export const getUserSettings = async (): Promise<UserSettings | null> => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data;
};

export const saveUserSettings = async (settings: Omit<UserSettings, 'id'>) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('user_settings')
    .upsert({
      id: user.id,
      ...settings,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};