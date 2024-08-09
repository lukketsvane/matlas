'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
import { MaterialCard } from '@/components/MaterialCard';
import { motion } from 'framer-motion';
import { Skeleton } from "@/components/ui/skeleton";

const SkeletonCard = () => (
  <Card className="h-[300px]">
    <CardContent className="p-4">
      <Skeleton className="h-[150px] w-full mb-4" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <Skeleton className="h-8 w-full" />
    </CardContent>
  </Card>
);

export default function DiscoverPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const observer = useRef();
  const lastMaterialElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    setError(null);
  
    try {
      let query = supabase
        .from('materials')
        .select('id, name, description, header_image, slug, category', { count: 'exact' })
        .range(page * 12, (page + 1) * 12 - 1)
        .order('name');
  
      if (selectedCategory !== 'All') {
        query = query.eq('category', selectedCategory);
      }
  
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }
  
      const { data, error, count } = await query;
  
      if (error) throw new Error(error.message);
      
      setMaterials(prevMaterials => [...prevMaterials, ...data]);
      setHasMore(count > (page + 1) * 12);
  
      if (page === 0) {
        // Fetch all categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('materials')
          .select('category');
  
        if (categoriesError) throw new Error(categoriesError.message);
  
        // Extract unique categories
        const uniqueCategories = ['All', ...new Set(categoriesData.map(item => item.category))].sort();
        setCategories(uniqueCategories);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [supabase, page, selectedCategory, searchTerm]);
  
  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleSearch = (e) => {
    e.preventDefault();
    setMaterials([]);
    setPage(0);
    fetchMaterials();
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setMaterials([]);
    setPage(0);
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="mb-4">
        <form onSubmit={handleSearch} className="flex items-center">
          <Input 
            type="text" 
            placeholder="Search materials..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="flex-grow mr-2"
          />
          <Button type="submit">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <div className="flex space-x-4 mb-8 overflow-x-auto">
        {categories.map((category) => (
          <Button
            key={category}
            onClick={() => handleCategoryClick(category)}
            variant={selectedCategory === category ? "default" : "outline"}
          >
            {category}
          </Button>
        ))}
      </div>

      {error && <div className="text-red-500 mb-4">Error: {error}</div>}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {materials.map((material, index) => (
          <motion.div 
            key={material.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            ref={index === materials.length - 1 ? lastMaterialElementRef : null}
          >
            <MaterialCard material={material} />
          </motion.div>
        ))}
        {loading && Array(4).fill(0).map((_, index) => (
          <motion.div 
            key={`skeleton-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <SkeletonCard />
          </motion.div>
        ))}
      </div>
    </div>
  );
}