import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateSlug } from '@/lib/utils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  let query = supabase.from('materials').select('*');
  
  if (slug) {
    query = query.eq('slug', slug).single();
  } else {
    query = query.order('name', { ascending: true });
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request) {
  const material = await request.json();
  material.slug = generateSlug(material.name);

  const { data, error } = await supabase
    .from('materials')
    .insert([material])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data[0]);
}

export async function PUT(request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const updates = await request.json();

  if (updates.name) {
    updates.slug = generateSlug(updates.name);
  }

  const { data, error } = await supabase
    .from('materials')
    .update(updates)
    .eq('slug', slug)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data[0]);
}