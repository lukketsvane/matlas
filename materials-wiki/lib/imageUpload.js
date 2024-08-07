// lib/imageUpload.js
import { supabase } from './supabaseClient';

export const uploadImage = async (file, bucket, folder) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
};