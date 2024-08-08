'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { MaterialCard } from '@/components/MaterialCard';
import SearchBar from '@/components/SearchBar';
import Filters from '@/components/Filters';
import { Grid, List } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MaterialsPage() {
  const [materials, setMaterials] = useState([]);
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const supabase = createClientComponentClient();

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('materials').select('*');

      if (searchTerm) {
        const searchConditions = [];
        if (advancedSearch.inTitle) searchConditions.push(`name.ilike.%${searchTerm}%`);
        if (advancedSearch.inDescription) searchConditions.push(`description.ilike.%${searchTerm}%`);
        if (advancedSearch.inProperties) searchConditions.push(`properties::text.ilike.%${searchTerm}%`);
        query = query.or(searchConditions.join(','));
      }

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (selectedSubcategory !== 'all') {
        query = query.eq('subcategory', selectedSubcategory);
      }

      const { data, error } = await query.order('name', { ascending: true });

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
        categoriesObj[category] = Array.from(categoriesObj[category]);
      });

      setCategories(categoriesObj);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [supabase, searchTerm, selectedCategory, selectedSubcategory, advancedSearch]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMaterials();
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setAdvancedSearch({
      inTitle: true,
      inDescription: false,
      inProperties: false,
    });
    setCurrentPage(1);
    fetchMaterials();
  };

  const paginatedMaterials = materials.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row">
      <div className="flex-grow">
        <div className="flex flex-col mb-6">
          <h1 className="text-3xl font-bold text-primary mb-4">Materials Library</h1>
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <Tabs value={view} onValueChange={setView} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="grid"><Grid className="mr-2 h-4 w-4" /></TabsTrigger>
                <TabsTrigger value="table"><List className="mr-2 h-4 w-4" /></TabsTrigger>
              </TabsList>
            </Tabs>
            <SearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              handleSearch={handleSearch}
            />
            <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="md:hidden">
              Filters
            </Button>
          </div>
        </div>
        {error && <div className="text-red-500 mb-4">Error: {error}</div>}
        {!loading && !error && (
          <>
            {view === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedMaterials.map((material) => (
                  <MaterialCard key={material.id} material={material} />
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
                    {paginatedMaterials.map((material) => (
                      <tr key={material.id} className="border-t">
                        <td className="p-2">{material.name}</td>
                        <td className="p-2">{material.description}</td>
                        <td className="p-2">{material.category}</td>
                        <td className="p-2">{material.subcategory}</td>
                        <td className="p-2">
                          <Link href={`/materials/${material.slug}`}>
                            <Button size="sm" variant="outline">View Details</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Pagination
              className="mt-8"
              currentPage={currentPage}
              totalPages={Math.ceil(materials.length / itemsPerPage)}
              onPageChange={setCurrentPage}
            />
          </>
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
