import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Set up storage bucket
const setupStorage = async () => {
  const { data, error } = await supabase.storage.createBucket('materials', {
    public: true
  });
  if (error && error.message !== 'Bucket already exists') {
    console.error('Error creating storage bucket:', error);
  } else if (!error) {
    console.log('Storage bucket created successfully:', data);
  }
};

setupStorage();