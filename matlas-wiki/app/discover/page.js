// app/discover.js
'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from 'lucide-react';

export default function DiscoverPage() {
  const [materials, setMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    rating: [],
    type: [],
    imageSize: [],
    version: [],
    other: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchMaterials();
  }, []);

  async function fetchMaterials() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setMaterials(data);
    } catch (error) {
      console.error('Error fetching materials:', error);
      setError('Failed to fetch materials');
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
  };

  const handleFilterChange = (category, value) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
  };

  return (
    <div className="flex">
      <div className="flex-grow">
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="What will you imagine?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && materials.map((material) => (
            <Card key={material.id} className="overflow-hidden">
              <CardContent className="p-0">
                <Image
                  src={material.header_image || '/placeholder.svg'}
                  alt={material.name}
                  width={300}
                  height={300}
                  layout="responsive"
                  objectFit="cover"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <aside className="w-64 ml-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Rating</h3>
            {['Liked', 'Unrated', 'Hidden'].map((option) => (
              <div key={option} className="flex items-center">
                <Checkbox
                  id={`rating-${option}`}
                  checked={filters.rating.includes(option)}
                  onCheckedChange={() => handleFilterChange('rating', option)}
                />
                <Label htmlFor={`rating-${option}`} className="ml-2">{option}</Label>
              </div>
            ))}
          </div>
          <div>
            <h3 className="font-medium mb-2">Type</h3>
            {['Grids', 'Upscales'].map((option) => (
              <div key={option} className="flex items-center">
                <Checkbox
                  id={`type-${option}`}
                  checked={filters.type.includes(option)}
                  onCheckedChange={() => handleFilterChange('type', option)}
                />
                <Label htmlFor={`type-${option}`} className="ml-2">{option}</Label>
              </div>
            ))}
          </div>
          <div>
            <h3 className="font-medium mb-2">Image Size</h3>
            {['Square', 'Landscape', 'Portrait'].map((option) => (
              <div key={option} className="flex items-center">
                <Checkbox
                  id={`size-${option}`}
                  checked={filters.imageSize.includes(option)}
                  onCheckedChange={() => handleFilterChange('imageSize', option)}
                />
                <Label htmlFor={`size-${option}`} className="ml-2">{option}</Label>
              </div>
            ))}
          </div>
          <div>
            <h3 className="font-medium mb-2">Version</h3>
            {['6', '5'].map((option) => (
              <div key={option} className="flex items-center">
                <Checkbox
                  id={`version-${option}`}
                  checked={filters.version.includes(option)}
                  onCheckedChange={() => handleFilterChange('version', option)}
                />
                <Label htmlFor={`version-${option}`} className="ml-2">{option}</Label>
              </div>
            ))}
          </div>
          <div>
            <h3 className="font-medium mb-2">Other</h3>
            {['Tiled', 'Raw'].map((option) => (
              <div key={option} className="flex items-center">
                <Checkbox
                  id={`other-${option}`}
                  checked={filters.other.includes(option)}
                  onCheckedChange={() => handleFilterChange('other', option)}
                />
                <Label htmlFor={`other-${option}`} className="ml-2">{option}</Label>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}