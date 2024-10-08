'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Filters from '@/components/Filters';
import { Grid, List, Plus, Search, Filter } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import dynamic from 'next/dynamic';

const MaterialCard = ({ material }) => (
  <Card className="hover:shadow-lg transition-shadow flex flex-col h-full">
    <div className="h-32 relative">
      {material.header_image ? (
        <Image 
          src={material.header_image}
          alt={material.name}
          layout="fill"
          objectFit="cover"
          className="rounded-t-lg"
        />
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-t-lg">
          <span className="text-gray-400">No image</span>
        </div>
      )}
    </div>
    <CardContent className="flex flex-col flex-grow p-4">
      <CardTitle className="text-lg font-bold mb-2">{material.name}</CardTitle>
      <div className="text-sm text-muted-foreground mb-4 flex-grow overflow-hidden">
        <MarkdownRenderer content={material.description.substring(0, 150) + '...'} />
      </div>
      <div className="flex justify-between items-center mt-auto">
        <Link href={`/materials/category/${material.category}/${material.subcategory.replace(/ /g, '-')}/${material.slug}`}>
          <Button variant="outline" size="sm">View Details</Button>
        </Link>
        <Button variant="ghost" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

const MaterialsPageContent = () => {
  const searchParams = useSearchParams();
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [categories, setCategories] = useState({});
  const [view, setView] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [advancedSearch, setAdvancedSearch] = useState({ inTitle: true, inDescription: false, inProperties: false });
  const supabase = createClientComponentClient();

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('materials').select('*').order('name');
      if (error) throw error;
      const filteredData = data.filter(material => material.name !== "Ac");
      setMaterials(filteredData);
      const categoriesObj = filteredData.reduce((acc, { category, subcategory }) => {
        if (category) {
          if (!acc[category]) acc[category] = new Set();
          if (subcategory) acc[category].add(subcategory);
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
    const subscription = supabase.channel('materials_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'materials' }, fetchMaterials)
      .subscribe();
    return () => supabase.removeChannel(subscription);
  }, [fetchMaterials, supabase]);

  useEffect(() => {
    const filtered = materials.filter(material => {
      const categoryMatch = selectedCategory === 'all' || material.category === selectedCategory;
      const subcategoryMatch = selectedSubcategory === 'all' || material.subcategory === selectedSubcategory;
      const searchMatch = searchTerm === '' || (
        (advancedSearch.inTitle && material.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (advancedSearch.inDescription && material.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (advancedSearch.inProperties && JSON.stringify(material.properties).toLowerCase().includes(searchTerm.toLowerCase()))
      );
      return categoryMatch && subcategoryMatch && searchMatch;
    });
    setFilteredMaterials(filtered);
  }, [materials, selectedCategory, selectedSubcategory, searchTerm, advancedSearch]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setAdvancedSearch({ inTitle: true, inDescription: false, inProperties: false });
    setSearchTerm('');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // You can add additional logic here if needed
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-6">Materials Library</h1>
      
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
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <Filters
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedSubcategory={selectedSubcategory}
              setSelectedSubcategory={setSelectedSubcategory}
              advancedSearch={advancedSearch}
              setAdvancedSearch={setAdvancedSearch}
              resetFilters={resetFilters}
            />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-wrap gap-4 items-center mb-6">
        <Tabs value={view} onValueChange={setView} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="grid"><Grid className="mr-2 h-4 w-4" />Grid</TabsTrigger>
            <TabsTrigger value="table"><List className="mr-2 h-4 w-4" />Table</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {error && <div className="text-red-500 mb-4">Error: {error}</div>}
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-3/4">
          <AnimatePresence>
            {loading ? (
              <div></div>
            ) : view === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredMaterials.map((material) => (
                  <motion.div key={material.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
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
                      <th className="text-left p-2 hidden sm:table-cell">Description</th>
                      <th className="text-left p-2 hidden sm:table-cell">Category</th>
                      <th className="text-left p-2 hidden sm:table-cell">Subcategory</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMaterials.map((material) => (
                      <motion.tr key={material.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="border-t">
                        <td className="p-2">{material.name}</td>
                        <td className="p-2 hidden sm:table-cell">{truncateDescription(material.description, 100)}</td>
                        <td className="p-2 hidden sm:table-cell">{material.category}</td>
                        <td className="p-2 hidden sm:table-cell">{material.subcategory}</td>
                        <td className="p-2">
                          <Link href={`/materials/category/${material.category}/${material.subcategory.replace(/ /g, '-')}/${material.slug}`}>
                            <Button size="sm" variant="outline">View</Button>
                          </Link>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="hidden md:block w-1/4">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <Filters
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedSubcategory={selectedSubcategory}
                setSelectedSubcategory={setSelectedSubcategory}
                advancedSearch={advancedSearch}
                setAdvancedSearch={setAdvancedSearch}
                resetFilters={resetFilters}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

function truncateDescription(description, maxLength) {
  return description.length <= maxLength ? description : description.substr(0, maxLength) + '...';
}

const MaterialsPage = dynamic(() => Promise.resolve(MaterialsPageContent), {
  ssr: false,
  loading: () => <p></p>,
});

export default function MaterialsPageWrapper() {
  return (
    <Suspense fallback={<div></div>}>
      <MaterialsPage />
    </Suspense>
  );
}