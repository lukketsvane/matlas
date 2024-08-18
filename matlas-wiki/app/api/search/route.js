import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const category = searchParams.get('category');
  const subcategory = searchParams.get('subcategory');
  
  if (!query && !category && !subcategory) {
    return NextResponse.json({ error: 'Query, category, or subcategory parameter is required' }, { status: 400 });
  }

  let supabaseQuery = supabase.from('materials').select('*');

  if (query) {
    supabaseQuery = supabaseQuery.ilike('name', `%${query}%`);
  }

  if (category) {
    supabaseQuery = supabaseQuery.eq('category', category);
  }

  if (subcategory) {
    supabaseQuery = supabaseQuery.eq('subcategory', subcategory);
  }

  const { data, error } = await supabaseQuery.limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}