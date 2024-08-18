'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { MaterialCard } from '@/components/MaterialCard';

export default function CategoryPage({ params }) {
  const { categorySlug } = params;
  const [materials, setMaterials] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchMaterials();
    fetchSubcategories();
  }, [categorySlug]);

  const fetchMaterials = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('category', categorySlug)
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

  const fetchSubcategories = async () => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('subcategory')
        .eq('category', categorySlug)
        .distinct();

      if (error) throw error;
      setSubcategories(data.map(item => item.subcategory).filter(Boolean));
    } catch (err) {
      console.error('Error fetching subcategories:', err);
    }
  };

  const filteredMaterials = materials.filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{categorySlug} Materials</h1>
      
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search materials..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md"
        />
      </div>

      {subcategories.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Subcategories</h2>
          <div className="flex flex-wrap gap-2">
            {subcategories.map(subcategory => (
              <Link key={subcategory} href={`/materials/category/${categorySlug}/${subcategory}`}>
                <Button variant="outline">{subcategory}</Button>
              </Link>
            ))}
          </div>
        </div>
      )}

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