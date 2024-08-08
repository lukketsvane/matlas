'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Trash2 } from 'lucide-react';

export default function ProjectDetailPage({ params }) {
  const router = useRouter();
  const { id } = params;
  const session = useSession();
  const supabase = useSupabaseClient();
  const [project, setProject] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!session) {
      router.push('/auth');
    } else {
      fetchProjectAndMaterials();
    }
  }, [session, id, router]);

  async function fetchProjectAndMaterials() {
    try {
      setLoading(true);
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (projectError) throw projectError;

      const { data: materialsData, error: materialsError } = await supabase
        .from('project_materials')
        .select(`
          id,
          materials:material_id (id, name, slug)
        `)
        .eq('project_id', id);

      if (materialsError) throw materialsError;

      setProject(projectData);
      setMaterials(materialsData.map(item => item.materials));
    } catch (error) {
      setError('Failed to fetch project data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function removeMaterialFromProject(materialId) {
    try {
      const { error } = await supabase
        .from('project_materials')
        .delete()
        .eq('project_id', id)
        .eq('material_id', materialId);

      if (error) throw error;
      setMaterials(materials.filter(material => material.id !== materialId));
    } catch (error) {
      console.error('Error removing material from project:', error);
      alert('Failed to remove material from project');
    }
  }

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>;
  if (error) return <div className="container mx-auto px-4 py-8">Error: {error}</div>;
  if (!project) return <div className="container mx-auto px-4 py-8">Project not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">{project.name}</h1>
      <p className="text-xl mb-8">{project.description}</p>

      <Card>
        <CardHeader>
          <CardTitle>Saved Materials</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell>{material.name}</TableCell>
                  <TableCell>
                    <Link href={`/materials/${material.slug}`}>
                      <Button variant="outline">View</Button>
                    </Link>
                    <Button 
                      variant="destructive" 
                      onClick={() => removeMaterialFromProject(material.id)} 
                      className="ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}