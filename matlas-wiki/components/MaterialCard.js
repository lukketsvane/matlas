'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from '@supabase/auth-helpers-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function MaterialCard({ material }) {
  const [isAddToProjectOpen, setIsAddToProjectOpen] = useState(false);
  const [userProjects, setUserProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const session = useSession();
  const supabase = createClientComponentClient();

  const stripHtmlTags = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const fetchUserProjects = async () => {
    if (!session) return;
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('user_id', session.user.id);

      if (error) throw error;
      setUserProjects(data);
    } catch (error) {
      console.error('Error fetching user projects:', error);
    }
  };

  const handleAddToProject = async () => {
    setIsAddToProjectOpen(true);
    await fetchUserProjects();
  };

  const saveMaterialToProject = async () => {
    if (!selectedProject) return;
    try {
      const { error } = await supabase
        .from('project_materials')
        .insert({ 
          project_id: selectedProject, 
          material_id: material.id 
        });

      if (error) throw error;
      setIsAddToProjectOpen(false);
      alert('Material added to project successfully!');
    } catch (error) {
      console.error('Error saving material to project:', error);
      alert('Failed to add material to project');
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow flex flex-col h-full">
      <div className="h-32 relative">
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
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>
      <div className="flex flex-col flex-grow p-4">
        <CardHeader className="p-0 mb-2">
          <CardTitle className="text-lg">{material.name}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex flex-col flex-grow">
          <p className="text-sm text-muted-foreground mb-4 flex-grow">
            {stripHtmlTags(material.description).substring(0, 100)}...
          </p>
          <div className="flex justify-between items-center mt-auto">
            <Link href={`/materials/${material.slug}`}>
              <Button variant="outline" size="sm">View Details</Button>
            </Link>
            {session && (
              <Dialog open={isAddToProjectOpen} onOpenChange={setIsAddToProjectOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleAddToProject}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add to Project</DialogTitle>
                  </DialogHeader>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {userProjects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={saveMaterialToProject}>Save to Project</Button>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}