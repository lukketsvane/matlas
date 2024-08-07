'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Grid, List, Search } from 'lucide-react';

export default function MaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [view, setView] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const session = useSession();
  const supabase = useSupabaseClient();

  useEffect(() => {
    fetchMaterials();
  }, []);

  async function fetchMaterials() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      setMaterials(data);
    } catch (error) {
      setError('Failed to fetch materials');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredMaterials = materials.filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>;
  if (error) return <div className="container mx-auto px-4 py-8">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col mb-6">
        <h1 className="text-3xl font-bold text-primary mb-4">Materials Library</h1>
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2">
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
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          {session && (
            <Link href="/materials/new/edit">
              <Button>Add New Material</Button>
            </Link>
          )}
        </div>
      </div>

      {view === 'grid' ? (
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMaterials.map((material) => (
              <TableRow key={material.id}>
                <TableCell className="font-medium">{material.name}</TableCell>
                <TableCell>{material.description.substring(0, 100)}...</TableCell>
                <TableCell>
                  <Link href={`/materials/${material.slug}`}>
                    <Button size="sm" variant="outline">View Details</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}