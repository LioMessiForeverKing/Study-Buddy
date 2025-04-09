import { createClient } from '@/lib/supabase'

export const uploadFile = async (
  bucketName: string,
  filePath: string,
  file: File
) => {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .storage
    .from(bucketName)
    .upload(filePath, file);

  if (error) throw error;
  return data;
};

export const getFileUrl = (bucketName: string, filePath: string) => {
  const supabase = createClient();
  const { data } = supabase
    .storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return data.publicUrl;
};