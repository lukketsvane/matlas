'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MaterialPage({ params }) {
  const router = useRouter();
  const { slug } = params;
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const session = useSession();
  const supabase = useSupabaseClient();

  useEffect(() => {
    fetchMaterial();
  }, [slug]);

  async function fetchMaterial() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      setMaterial(data);
    } catch (error) {
      setError('Failed to fetch material');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (error) return <div className="container mx-auto px-4 py-8">Error: {error}</div>;
  if (!material) return <div className="container mx-auto px-4 py-8">Material not found</div>;
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-4xl font-bold mb-4">{material.name}</h1>
          {material.header_image && (
            <div className="mb-6">
              <Image 
                src={material.header_image}
                alt={material.name}
                width={800}
                height={400}
                layout="responsive"
                objectFit="cover"
                className="rounded-lg"
              />
            </div>
          )}
          <p className="text-lg mb-6">{material.description}</p>
          
          <Tabs defaultValue="properties">
            <TabsList>
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="usage">Usage Examples</TabsTrigger>
              <TabsTrigger value="history">Edit History</TabsTrigger>
            </TabsList>
            <TabsContent value="properties">
              <Card>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(material.properties || {}).map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell className="font-medium">{key}</TableCell>
                          <TableCell>{value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="usage">
              <Card>
                <CardContent>
                  {material.usage_examples && material.usage_examples.map((example, index) => (
                    <div key={index} className="mb-4">
                      <h3 className="text-lg font-semibold">{example.title}</h3>
                      <p>{example.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="history">
              <Card>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Editor</TableHead>
                        <TableHead>Changes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {material.edit_history && material.edit_history.map((edit, index) => (
                        <TableRow key={index}>
                          <TableCell>{new Date(edit.date).toLocaleDateString()}</TableCell>
                          <TableCell>{edit.editor}</TableCell>
                          <TableCell>{edit.changes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Related Materials</CardTitle>
            </CardHeader>
            <CardContent>
              {material.related_materials && material.related_materials.map((related, index) => (
                <div key={index} className="mb-4">
                  <h3 className="font-semibold">{related.name}</h3>
                  <p className="text-sm text-muted-foreground">{related.description}</p>
                  <Link href={`/materials/${related.slug}`}>
                    <Button variant="link" className="p-0">View</Button>
                  </Link>
                </div>
              ))}
            </CardContent>
          </Card>
          
          {session && (
            <Card>
              <CardContent className="pt-6">
                <Link href={`/materials/${material.slug}/edit`}>
                  <Button className="w-full">Edit Material</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}