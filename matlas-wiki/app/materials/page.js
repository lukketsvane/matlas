'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from "@/components/ui/button";
import { MaterialCard } from '@/components/MaterialCard';
import SearchBar from '@/components/SearchBar';
import Filters from '@/components/Filters';
import { Grid, List } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from 'framer-motion';

export default function MaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [categories, setCategories] = useState({});
  const [view, setView] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [advancedSearch, setAdvancedSearch] = useState({
    inTitle: true,
    inDescription: false,
    inProperties: false,
  });
  const [showFilters, setShowFilters] = useState(false);

  const supabase = createClientComponentClient();

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setMaterials(data);

      const categoriesObj = data.reduce((acc, material) => {
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
        categoriesObj[category] = Array.from(categoriesObj[category]).sort();
      });

      setCategories(categoriesObj);
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
    const filtered = materials.filter(material => {
      const categoryMatch = selectedCategory === 'all' || material.category === selectedCategory;
      const subcategoryMatch = selectedSubcategory === 'all' || material.subcategory === selectedSubcategory;
      const searchMatch = (
        (advancedSearch.inTitle && material.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (advancedSearch.inDescription && material.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (advancedSearch.inProperties && JSON.stringify(material.properties).toLowerCase().includes(searchTerm.toLowerCase()))
      );
      return categoryMatch && subcategoryMatch && (searchTerm === '' || searchMatch);
    });
    setFilteredMaterials(filtered);
  }, [materials, selectedCategory, selectedSubcategory, searchTerm, advancedSearch]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Filtering is now handled in the useEffect above
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setAdvancedSearch({
      inTitle: true,
      inDescription: false,
      inProperties: false,
    });
    setSearchTerm('');
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row">
      <div className="flex-grow">
        <div className="flex flex-col mb-6">
          <h1 className="text-3xl font-bold text-primary mb-4">Materials Library</h1>
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <Tabs value={view} onValueChange={setView} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="grid"><Grid className="mr-2 h-4 w-4" />Grid</TabsTrigger>
                <TabsTrigger value="table"><List className="mr-2 h-4 w-4" />Table</TabsTrigger>
              </TabsList>
            </Tabs>
            <SearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              handleSearch={handleSearch}
            />
            <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="md:hidden">
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
        </div>
        {error && <div className="text-red-500 mb-4">Error: {error}</div>}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <AnimatePresence>
            {view === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Description</th>
                      <th className="text-left p-2">Category</th>
                      <th className="text-left p-2">Subcategory</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMaterials.map((material) => (
                      <motion.tr
                        key={material.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t"
                      >
                        <td className="p-2">{material.name}</td>
                        <td className="p-2">{material.description}</td>
                        <td className="p-2">{material.category}</td>
                        <td className="p-2">{material.subcategory}</td>
                        <td className="p-2">
                          <Link href={`/materials/${material.slug}`}>
                            <Button size="sm" variant="outline">View Details</Button>
                          </Link>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AnimatePresence>
        )}
      </div>
      <Filters
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedSubcategory={selectedSubcategory}
        setSelectedSubcategory={setSelectedSubcategory}
        advancedSearch={advancedSearch}
        setAdvancedSearch={setAdvancedSearch}
        resetFilters={resetFilters}
        showFilters={showFilters}
      />
    </div>
  );
}