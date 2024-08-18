'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from '@supabase/auth-helpers-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from "@/components/ui/button";
import { Pencil } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import AddToProjectDialog from '@/components/AddToProjectDialog';
import MaterialTabs from '@/components/MaterialTabs';
import MarkdownRenderer from '@/components/MarkdownRenderer';

export default function MaterialPage({ params }) {
  const { categorySlug, subcategorySlug, materialSlug } = params;
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const session = useSession();
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    fetchMaterial();
  }, [categorySlug, subcategorySlug, materialSlug]);

  async function fetchMaterial() {
    try {
      setLoading(true);
      const decodedCategory = decodeURIComponent(categorySlug);
      const decodedSubcategory = decodeURIComponent(subcategorySlug.replace(/-/g, ' '));
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('slug', materialSlug)
        .eq('category', decodedCategory)
        .eq('subcategory', decodedSubcategory)
        .single();
      if (error) throw error;
      setMaterial(data);
    } catch (error) {
      console.error('Error fetching material:', error);
      setError('Failed to fetch material');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="px-4 py-8">Error: {error}</div>;
  if (!material) return <div className="px-4 py-8">Material not found</div>;

  return (
    <div className="max-w-screen-xl mx-auto">
      <SearchBar />
      {material.header_image && (
        <div className="w-full h-64 sm:h-96 relative">
          <Image 
            src={material.header_image}
            alt={material.name}
            layout="fill"
            objectFit="cover"
            priority
            className="w-screen"
          />
        </div>
      )}
      <div className="px-4 mt-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">{material.name}</h1>
          <div className="flex items-center">
            {session && (
              <>
                <Link href={`/materials/category/${categorySlug}/${subcategorySlug}/${materialSlug}/edit`}>
                  <Button variant="outline" size="icon" className="mr-2">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
                <AddToProjectDialog material={material} />
              </>
            )}
          </div>
        </div>
        <p className="mb-4">
          Category: <Link href={`/materials/category/${categorySlug}`} className="text-blue-500 hover:underline">{material.category}</Link> &gt; 
          <Link href={`/materials/category/${categorySlug}/${subcategorySlug}`} className="text-blue-500 hover:underline">{material.subcategory}</Link>
        </p>
        <MarkdownRenderer content={material.description} />
        <MaterialTabs material={material} />
      </div>
    </div>
  );
}