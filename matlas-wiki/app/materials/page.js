'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Grid, List, Search } from 'lucide-react';

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
    inTitle: false,
    inDescription: false,
    inProperties: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClientComponentClient();
      setLoading(true);
      setError(null);
      try {
        const { data: materialsData, error: materialsError } = await supabase
          .from('materials')
          .select('*')
          .order('name', { ascending: true });
        if (materialsError) throw new Error(materialsError.message);
        setMaterials(materialsData);
        const categoriesObj = materialsData.reduce((acc, material) => {
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

  const handleSearch = () => {
    // Implement search functionality
  };

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
    const matchesSubcategory = selectedSubcategory === 'all' || material.subcategory === selectedSubcategory;
    return matchesSearch && matchesCategory && matchesSubcategory;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col mb-6">
        <h1 className="text-3xl font-bold text-primary mb-4">Materials Library</h1>
        <div className="flex flex-wrap gap-2 items-center">          <div className="flex gap-2">
            <Button onClick={() => setView('grid')} variant={view === 'grid' ? 'default' : 'outline'}>
              <Grid className="mr-2 h-4 w-4" />
              Grid
            </Button>
            <Button onClick={() => setView('table')} variant={view === 'table' ? 'default' : 'outline'}>
              <List className="mr-2 h-4 w-4" />
              Table
            </Button>
          </div>
          <div className="flex-1 max-w-sm ml-4">
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
    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
    className="pl-10 pr-4"
  />
</div>  
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {Object.keys(categories).map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedCategory !== 'all' && (
            <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select subcategory" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All subcategories</SelectItem>
                {categories[selectedCategory]?.map((subcategory) => (
                  <SelectItem key={subcategory} value={subcategory}>{subcategory}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button onClick={handleSearch}>Search</Button>
        </div>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Advanced Search Options</h3>
        <div className="flex gap-4">
          <Label className="flex items-center">
            <Checkbox
              checked={advancedSearch.inTitle}
              onCheckedChange={(checked) => setAdvancedSearch({...advancedSearch, inTitle: checked})}
              className="mr-2"
            />
            Search in title
          </Label>
          <Label className="flex items-center">
            <Checkbox
              checked={advancedSearch.inDescription}
              onCheckedChange={(checked) => setAdvancedSearch({...advancedSearch, inDescription: checked})}
              className="mr-2"
            />
            Search in description
          </Label>
          <Label className="flex items-center">
            <Checkbox
              checked={advancedSearch.inProperties}
              onCheckedChange={(checked) => setAdvancedSearch({...advancedSearch, inProperties: checked})}
              className="mr-2"
            />
            Search in properties
          </Label>
        </div>
      </div>
      {error && <div className="text-red-500">Error: {error}</div>}
      {!loading && !error && (
        view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material) => (
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
                  <p className="text-muted-foreground mb-4">{material.description.substring(0, 100)}...</p>
                  <Link href={`/materials/${material.slug}`}>
                    <Button variant="outline">View Details</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Category</th>
                <th>Subcategory</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.map((material) => (
                <tr key={material.id}>
                  <td>{material.name}</td>
                  <td>{material.description.substring(0, 100)}...</td>
                  <td>{material.category}</td>
                  <td>{material.subcategory}</td>
                  <td>
                    <Link href={`/materials/${material.slug}`}>
                      <Button size="sm" variant="outline">View Details</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
    </div>
  );
}