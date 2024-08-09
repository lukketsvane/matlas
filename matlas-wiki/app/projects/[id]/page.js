'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useSession } from '@supabase/auth-helpers-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, Plus } from 'lucide-react';

export default function ProjectDetailPage({ params }) {
  const router = useRouter();
  const { id } = params;
  const session = useSession();
  const supabase = createClientComponentClient();
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
      setError(null);

      // Fetch project data
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .eq('id', id)
        .single();

      if (projectError) {
        console.error('Project fetch error:', projectError);
        throw new Error('Failed to fetch project data');
      }

      if (!projectData) {
        throw new Error('Project not found');
      }

      setProject(projectData);

      // Fetch materials data
      const { data: materialsData, error: materialsError } = await supabase
        .from('project_materials')
        .select(`
          id,
          materials:material_id (id, name, slug, header_image, description)
        `)
        .eq('project_id', id);

      if (materialsError) {
        console.error('Materials fetch error:', materialsError);
        throw new Error('Failed to fetch materials data');
      }

      setMaterials(materialsData.map(item => item.materials).filter(Boolean));
    } catch (err) {
      console.error('Error in fetchProjectAndMaterials:', err);
      setError(err.message);
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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Avatar className="h-12 w-12 mr-4">
            <AvatarImage src={project.profiles?.avatar_url} />
            <AvatarFallback>{project.profiles?.username?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-4xl font-bold">{project.name}</h1>
            <p className="text-sm text-muted-foreground">{project.profiles?.username}</p>
          </div>
        </div>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" /> Add Material
        </Button>
      </div>
      
      <p className="text-xl mb-8">
        {project.description && project.description.length > 200 
          ? `${project.description.substring(0, 200)}...` 
          : project.description}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {materials.map((material) => (
          <Card key={material.id} className="flex flex-col h-full">
            <div className="relative h-48">
              <Image
                src={material.header_image || '/placeholder.png'}
                alt={material.name}
                layout="fill"
                objectFit="cover"
                className="rounded-t-lg"
              />
            </div>
            <CardContent className="flex-grow flex flex-col justify-between p-4">
              <div>
                <h3 className="font-semibold mb-2">{material.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {material.description?.substring(0, 50)}...
                </p>
              </div>
              <div className="flex justify-between items-center mt-4">
                <Link href={`/materials/${material.slug}`}>
                  <Button variant="outline" size="sm">View</Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeMaterialFromProject(material.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}