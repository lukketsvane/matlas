'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from 'lucide-react';
import { MaterialCard } from '@/components/MaterialCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const SkeletonCard = () => (
  <Card className="h-[200px] sm:h-[300px]">
    <CardContent className="p-4">
      <Skeleton className="h-[100px] sm:h-[150px] w-full mb-4" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <Skeleton className="h-8 w-full" />
    </CardContent>
  </Card>
);

export default function DiscoverPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    setError(null);
  
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('id, name, description, header_image, slug, category')
        .order('name');
  
      if (error) throw new Error(error.message);
      
      setMaterials(data);

      const uniqueCategories = ['All', ...new Set(data.map(item => item.category))].sort();
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchMaterials();

    const subscription = supabase
      .channel('materials_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'materials' }, (payload) => {
        console.log('Change received!', payload);
        fetchMaterials();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchMaterials, supabase]);

  useEffect(() => {
    const filtered = materials.filter(material => 
      (selectedCategory === 'All' || material.category === selectedCategory) &&
      material.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMaterials(filtered);
  }, [materials, selectedCategory, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Discover Materials</h1>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-grow flex items-center">
          <Input 
            type="text" 
            placeholder="Search materials..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="flex-grow"
          />
          <Button type="submit" className="ml-2">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="sm:hidden">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Categories</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col space-y-2 mt-4">
              {categories.map((category) => (
                <Button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="justify-start"
                >
                  {category}
                </Button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden sm:flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <Button
            key={category}
            onClick={() => handleCategoryClick(category)}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
          >
            {category}
          </Button>
        ))}
      </div>

      {error && <div className="text-red-500">Error: {error}</div>}
      
      <AnimatePresence>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMaterials.map((material, index) => (
            <motion.div 
              key={material.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <MaterialCard material={material} />
            </motion.div>
          ))}
          {loading && Array(4).fill(0).map((_, index) => (
            <motion.div 
              key={`skeleton-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <SkeletonCard />
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}