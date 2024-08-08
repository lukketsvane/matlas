'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Grid, List, Search, Filter } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/ui/pagination";

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

  const toggleFilter = () => setShowFilters(!showFilters);

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

  const stripHtmlTags = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const paginatedMaterials = materials.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col mb-6">
        <h1 className="text-3xl font-bold text-primary mb-4">Materials Library</h1>
        <div className="flex flex-wrap gap-4 items-center mb-4">
          <Tabs value={view} onValueChange={setView} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="grid"><Grid className="mr-2 h-4 w-4" /> Grid</TabsTrigger>
              <TabsTrigger value="table"><List className="mr-2 h-4 w-4" /> Table</TabsTrigger>
            </TabsList>
          </Tabs>
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
          <Button onClick={toggleFilter} variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
        {showFilters && (
          <div className="bg-card p-4 rounded-md shadow mb-4">
            <h3 className="text-lg font-semibold mb-2">Filters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {Object.keys(categories).map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedCategory !== 'all' && (
                <div>
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                    <SelectTrigger id="subcategory">
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All subcategories</SelectItem>
                      {categories[selectedCategory]?.map((subcategory) => (
                        <SelectItem key={subcategory} value={subcategory}>{subcategory}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold">Search in:</Label>
              <div className="flex flex-wrap gap-4">
                {Object.entries(advancedSearch).map(([key, value]) => (
                  <Label key={key} className="flex items-center space-x-2">
                    <Checkbox
                      checked={value}
                      onCheckedChange={(checked) => setAdvancedSearch({...advancedSearch, [key]: checked})}
                    />
                    <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}</span>
                  </Label>
                ))}
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={resetFilters} variant="outline" className="mr-2">Reset</Button>
              <Button onClick={fetchMaterials}>Apply Filters</Button>
            </div>
          </div>
        )}
      </div>
      {error && <div className="text-red-500 mb-4">Error: {error}</div>}
      {!loading && !error && (
        <>
          {view === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedMaterials.map((material) => (
                <Card key={material.id} className="hover:shadow-lg transition-shadow">
                  {material.header_image && (
                    <div className="h-40 relative">
                      <Image 
                        src={material.header_image}
                        alt={material.name}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-t-lg"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl">{material.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{stripHtmlTags(material.description).substring(0, 100)}...</p>
                    <Link href={`/materials/${material.slug}`}>
                      <Button variant="outline">View Details</Button>
                    </Link>
                  </CardContent>
                </Card>
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
                      <td className="p-2">{stripHtmlTags(material.description).substring(0, 100)}...</td>
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
  );
}