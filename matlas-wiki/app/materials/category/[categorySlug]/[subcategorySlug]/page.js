'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function CategoryPage({ params }) {
  const { categorySlug } = params;
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchSubcategories();
  }, [categorySlug]);

  async function fetchSubcategories() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('subcategory')
        .eq('category', categorySlug.replace(/-/g, ' '))
        .distinct();
      
      if (error) throw error;
      setSubcategories(data.map(item => item.subcategory));
    } catch (error) {
      setError('Failed to fetch subcategories');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredSubcategories = subcategories.filter(subcategory =>
    subcategory.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 capitalize">{categorySlug.replace(/-/g, ' ')}</h1>
      
      <Input
        type="text"
        placeholder="Search subcategories..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-md mb-6"
      />

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubcategories.map((subcategory) => (
          <Link key={subcategory} href={`/materials/category/${categorySlug}/${subcategory.replace(/ /g, '-').toLowerCase()}`}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{subcategory}</CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {!loading && filteredSubcategories.length === 0 && (
        <p>No subcategories found.</p>
      )}
    </div>
  );
}