'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';

const colorScheme = ['#10454F', '#506266', '#818274', '#A3AB78', '#BDE038'];

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
          materials:material_id (id, name, slug, header_image)
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

  if (error) return <div className="container mx-auto px-4 py-8">Error: {error}</div>;
  if (!project) return <div className="container mx-auto px-4 py-8 ">Project not found</div>;

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-4xl font-bold mb-8">{project.name}</h1>
      <p className="text-xl mb-8 ">{project.description}</p>

      <Card className="border-none">
        <CardContent className="p-6">
          <div className="flex">
            {materials.slice(0, 5).map((material, index) => (
              <div 
                key={material.id} 
                className="relative flex-1 aspect-[1/3]  overflow-hidden"
                style={{ backgroundColor: colorScheme[index], marginRight: index < 4 ? '0' : '0' }}
              >
                {material.header_image && (
                  <Image
                    src={material.header_image}
                    alt={material.name}
                    layout="fill"
                    objectFit="cover"
                  />
                )}
              </div>
            ))}
            {[...Array(5 - materials.length)].map((_, index) => (
              <div 
                key={`empty-${index}`} 
                className="flex-1 aspect-[1/3]"
                style={{ backgroundColor: colorScheme[materials.length + index] }}
              ></div>
            ))}
          </div>
          <div className="space-y-4 mt-8">
            {materials.map((material) => (
              <div key={material.id} className="flex justify-between items-center ">
                <span className="font-medium">{material.name}</span>
                <div className="space-x-2">
                  <Link href={`/materials/${material.slug}`}>
                    <Button variant="outline" className="">View</Button>
                  </Link>
                  <Button 
                    variant="destructive" 
                    onClick={() => removeMaterialFromProject(material.id)} 
                    className=""
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
