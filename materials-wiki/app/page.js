'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown } from 'lucide-react';

const categories = {
  "Metal": ["Ferrous Metal", "Nonferrous Metal"],
  "Polymer": ["Thermoplastic", "Thermoset"],
  "Ceramic": ["Oxide", "Non-oxide"],
  "Composite": ["Polymer Matrix Composite", "Metal Matrix Composite"],
  "Other Engineering Material": ["Advanced Material"]
};

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [randomMaterials, setRandomMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRandomMaterials = async () => {
      const supabase = createClientComponentClient();
      setLoading(true);
      setError(null);

      try {
        console.log('Fetching random materials...');
        const { data, error } = await supabase
          .from('materials')
          .select('id, name, description, header_image, slug')
          .limit(3);

        if (error) throw new Error(error.message);

        console.log('Fetched materials:', data);
        setRandomMaterials(data);
      } catch (err) {
        console.error('Error in fetchRandomMaterials:', err);
        setError('Failed to fetch random materials: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRandomMaterials();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchTerm);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-12">
        <Image src="/matlas-logo.png" alt="MatLas Wiki logo" width={200} height={200} className="mb-8" />
        <h1 className="text-4xl font-bold text-primary mb-6">MatLas Wiki</h1>
        <p className="text-xl mb-6">The Free Material Encyclopedia</p>
        <form onSubmit={handleSearch} className="w-full max-w-2xl mb-8">
          <div className="flex">
            <Input type="text" placeholder="Search materials..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-grow" />
            <Button type="submit" className="ml-2">Search</Button>
          </div>
        </form>
      </div>

      <h2 className="text-2xl font-bold mb-4">Random Materials</h2>
      {loading && <div>Loading random materials...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {randomMaterials.map((material) => (
            <Card key={material.id} className="hover:shadow-lg transition-shadow flex flex-col h-full">
              <div className="h-48 relative">
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
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle className="text-xl">{material.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground mb-4">
                  {material.description ? `${material.description.substring(0, 100)}...` : 'No description available.'}
                </p>
              </CardContent>
              <CardContent className="pt-0">
                <Link href={`/materials/${material.slug}`}>
                  <Button variant="outline" size="sm" className="w-full">View Details</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4">Material Categories</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
        {Object.entries(categories).map(([category, subcategories]) => (
          <Card key={category} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-2">{subcategories.length} subcategories</p>
              <Link href={`/materials?category=${encodeURIComponent(category)}`}>
                <Button variant="outline" size="sm">Explore</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button variant="outline" className="text-primary">
          Read MatLas Wiki in your language <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}