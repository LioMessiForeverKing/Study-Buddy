import { createClient } from '@/lib/supabase'

export interface UserPersonalization {
  id: string;
  learning_style: string;
  interests: string[];
  communication_style: string;
  motivation_type: string;
  custom_prompts: Array<{
    question: string;
    response: string;
  }>;
}

export const savePersonalization = async (personalization: Omit<UserPersonalization, 'id'>) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('user_personalization')
    .upsert({
      id: user.id,
      ...personalization,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getPersonalization = async (): Promise<UserPersonalization | null> => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_personalization')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data;
};