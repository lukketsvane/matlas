'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Search } from 'lucide-react';
import { MaterialCard } from '@/components/MaterialCard';
import { motion } from 'framer-motion';

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [randomMaterials, setRandomMaterials] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClientComponentClient();
      setLoading(true);
      setError(null);

      try {
        const { data: materialsData, error: materialsError } = await supabase
          .from('materials')
          .select('id, name, description, header_image, slug, category, subcategory')
          .limit(3);

        if (materialsError) throw new Error(materialsError.message);
        setRandomMaterials(materialsData);

        const { data: allMaterials, error: allMaterialsError } = await supabase
          .from('materials')
          .select('category, subcategory');

        if (allMaterialsError) throw new Error(allMaterialsError.message);

        const categoriesObj = allMaterials.reduce((acc, material) => {
          if (material.category) {
            if (!acc[material.category]) {
              acc[material.category] = new Set();
            }
            if (material.subcategory) {
              acc[material.category].add(material.subcategory);
            }
          }
          return acc;
        }, {});

        Object.keys(categoriesObj).forEach(category => {
          categoriesObj[category] = Array.from(categoriesObj[category]);
        });

        setCategories(categoriesObj);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/materials?search=${encodeURIComponent(searchTerm)}`);
  };

  const handleCategoryClick = (category) => {
    router.push(`/materials?category=${encodeURIComponent(category)}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="flex flex-col items-center mb-12">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Image src="/matlas-logo.png" alt="MatLas Wiki logo" width={200} height={200} className="mb-8" />
        </motion.div>
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-4xl font-bold text-primary mb-6"
        >
          MatLas Wiki
        </motion.h1>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-xl mb-6"
        >
          The Free Material Encyclopedia
        </motion.p>
        <motion.form 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          onSubmit={handleSearch} 
          className="w-full max-w-2xl mb-8"
        >
          <div className="relative">
            <Search 
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" 
              onClick={handleSearch}
            />
            <Input 
              type="text" 
              placeholder="Search materials..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="pl-10 pr-4"
            />
          </div>
        </motion.form>
      </div>

      <motion.h2 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="text-2xl font-bold mb-4"
      >
        Random Materials
      </motion.h2>
      {error && <div className="text-red-500">Error: {error}</div>}
      {!loading && !error && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
        >
          {randomMaterials.map((material, index) => (
            <motion.div
              key={material.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 + (index * 0.1), duration: 0.5 }}
            >
              <MaterialCard material={material} />
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.h2 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="text-2xl font-bold mb-4"
      >
        Material Categories
      </motion.h2>
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12"
      >
        {Object.entries(categories).map(([category, subcategories], index) => (
          <motion.div
            key={category}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.4 + (index * 0.05), duration: 0.5 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-3">
                <CardTitle className="text-lg">{category}</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <p className="text-sm text-muted-foreground mb-2">{subcategories.length} subcategories</p>
                <Button variant="outline" size="sm" onClick={() => handleCategoryClick(category)} className="w-full">
                  Explore
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.5 }}
        className="text-center"
      >
        <Button variant="outline" className="text-primary">
          Read MatLas Wiki in your language <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
}