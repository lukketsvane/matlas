'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ThumbsUp, MessageSquare, FolderPlus } from 'lucide-react';
import { useSession } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';

export default function DiscoverPage() {
  const [materials, setMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('random');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProjects, setUserProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isAddToProjectOpen, setIsAddToProjectOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const supabase = createClientComponentClient();
  const session = useSession();
  const router = useRouter();

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('materials').select('*');
      
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      switch (activeTab) {
        case 'hot': query = query.order('views', { ascending: false }); break;
        case 'likes': query = query.order('likes', { ascending: false }); break;
        case 'name': query = query.order('name', { ascending: true }); break;
      }
      
      const { data, error } = await query.limit(50);
      if (error) throw error;
      
      if (activeTab === 'random') {
        for (let i = data.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [data[i], data[j]] = [data[j], data[i]];
        }
      }
      
      setMaterials(data);
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError('Failed to fetch materials: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [supabase, activeTab, searchTerm]);

  const fetchUserProjects = useCallback(async () => {
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
  }, [supabase, session]);

  useEffect(() => {
    fetchMaterials();
    if (session) fetchUserProjects();
  }, [fetchMaterials, fetchUserProjects, session]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMaterials();
  };

  const handleAddToProject = (e, material) => {
    e.stopPropagation();
    setSelectedMaterial(material);
    setIsAddToProjectOpen(true);
  };

  const saveMaterialToProject = async () => {
    if (!selectedProject || !selectedMaterial) return;
    try {
      const { error } = await supabase
        .from('project_materials')
        .insert({ 
          project_id: selectedProject, 
          material_id: selectedMaterial.id 
        });
      if (error) throw error;
      alert('Material saved to project successfully!');
      setIsAddToProjectOpen(false);
    } catch (error) {
      console.error('Error saving material to project:', error);
      alert('Failed to save material to project');
    }
  };

  const handleCardClick = (slug) => router.push(`/materials/${slug}`);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input 
              type="text" 
              placeholder="Search materials..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="pl-10 pr-4" 
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="random">Random</TabsTrigger>
          <TabsTrigger value="hot">Hot</TabsTrigger>
          <TabsTrigger value="likes">Most Liked</TabsTrigger>
          <TabsTrigger value="name">A-Z</TabsTrigger>
        </TabsList>
      </Tabs>
      {error && <div className="text-red-500 mb-4">Error: {error}</div>}
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {materials.map((material) => (
            <Card key={material.id} className="hover:shadow-lg transition-shadow h-full flex flex-col cursor-pointer" onClick={() => handleCardClick(material.slug)}>
              <CardContent className="p-0 flex flex-col h-full">
                <div className="relative pt-[100%] bg-gray-200">
                  {material.header_image ? (
                    <Image 
                      src={material.header_image} 
                      alt={material.name} 
                      layout="fill" 
                      objectFit="cover" 
                      className="rounded-t-lg" 
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-full bg-black dark:bg-white opacity-10" />
                    </div>
                  )}
                </div>
                <div className="p-2 flex flex-col flex-grow">
                  <h3 className="font-semibold text-sm mb-1 truncate">{material.name}</h3>
                  <p className="text-xs text-gray-500 mb-2 line-clamp-2 flex-grow">{material.description}</p>
                  <div className="flex justify-between items-center text-xs text-gray-400 mt-auto">
                    <div className="flex space-x-2">
                      <span className="flex items-center"><ThumbsUp className="w-3 h-3 mr-1" />{material.likes || 0}</span>
                      <span className="flex items-center"><MessageSquare className="w-3 h-3 mr-1" />{material.comments || 0}</span>
                    </div>
                    {session && (
                      <Button variant="ghost" size="sm" onClick={(e) => handleAddToProject(e, material)}>
                        <FolderPlus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={isAddToProjectOpen} onOpenChange={setIsAddToProjectOpen}>
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
          <Button onClick={saveMaterialToProject} className="mt-4">Save to Project</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}