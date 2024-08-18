'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { MaterialCard } from '@/components/MaterialCard';

export default function SubcategoryPage({ params }) {
  const { categorySlug, subcategorySlug } = params;
  const [materials, setMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchMaterials();
  }, [categorySlug, subcategorySlug]);

  const fetchMaterials = async () => {
    setLoading(true);
    setError(null);
    try {
      const decodedCategory = decodeURIComponent(categorySlug);
      const decodedSubcategory = decodeURIComponent(subcategorySlug.replace(/-/g, ' '));
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('category', decodedCategory)
        .eq('subcategory', decodedSubcategory)
        .order('name');

      if (error) throw error;
      setMaterials(data);
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError('Failed to fetch materials');
    } finally {
      setLoading(false);
    }
  };

  const filteredMaterials = materials.filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{decodeURIComponent(subcategorySlug.replace(/-/g, ' '))} Materials</h1>
      <p className="mb-4">Category: <Link href={`/materials/category/${categorySlug}`} className="text-blue-500 hover:underline">{decodeURIComponent(categorySlug)}</Link></p>
      
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search materials..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md"
        />
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <AnimatePresence>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMaterials.map((material) => (
            <motion.div
              key={material.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MaterialCard material={material} />
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {loading && <p>Loading...</p>}
    </div>
  );
}