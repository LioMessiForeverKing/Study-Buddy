import { createClient } from '@/utils/supabase/client'

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
  created_at?: string;
  updated_at?: string;
}

export const getPersonalization = async (): Promise<UserPersonalization | null> => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_personalization')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching personalization:', error);
    return null;
  }
  
  // Add debug logging
  console.log('Raw personalization data from Supabase:', data);
  
  return data;
};

export const savePersonalization = async (personalization: Omit<UserPersonalization, 'id' | 'created_at' | 'updated_at'>) => {
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
