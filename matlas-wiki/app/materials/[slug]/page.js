'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FolderPlus } from 'lucide-react';

export default function MaterialPage({ params }) {
  const router = useRouter();
  const { slug } = params;
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const session = useSession();
  const supabase = useSupabaseClient();

  const [userProjects, setUserProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [isAddToProjectOpen, setIsAddToProjectOpen] = useState(false);

  useEffect(() => {
    fetchMaterial();
    if (session) {
      fetchUserProjects();
    }
  }, [slug, session]);

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

  async function fetchUserProjects() {
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
  }

  async function saveMaterialToProject() {
    if (!selectedProject) return;
    try {
      const { error } = await supabase
        .from('project_materials')
        .insert({ 
          project_id: selectedProject, 
          material_id: material.id 
        });

      if (error) throw error;
      alert('Material saved to project successfully!');
      setIsAddToProjectOpen(false);
    } catch (error) {
      console.error('Error saving material to project:', error);
      alert('Failed to save material to project');
    }
  }

  async function createNewProject() {
    if (!newProjectName.trim()) return;
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([
          { name: newProjectName, user_id: session.user.id }
        ])
        .select()
        .single();

      if (error) throw error;
      setUserProjects([...userProjects, data]);
      setSelectedProject(data.id);
      setNewProjectName('');
    } catch (error) {
      console.error('Error creating new project:', error);
      alert('Failed to create new project');
    }
  }

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>;
  if (error) return <div className="container mx-auto px-4 py-8">Error: {error}</div>;
  if (!material) return <div className="container mx-auto px-4 py-8">Material not found</div>;

  const getImageFilename = (url) => {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold">{material.name}</h1>
            {session && (
              <Dialog open={isAddToProjectOpen} onOpenChange={setIsAddToProjectOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Add to Project
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
                  <div className="flex items-center mt-4">
                    <Input
                      placeholder="New Project Name"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="mr-2"
                    />
                    <Button onClick={createNewProject} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button onClick={saveMaterialToProject} className="mt-4">Save to Project</Button>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <div className="prose max-w-none mb-6" dangerouslySetInnerHTML={{ __html: material.description }} />
          
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
          {material.header_image && (
            <Card className="mb-6">
              <CardContent className="p-0">
                <Image 
                  src={material.header_image}
                  alt={material.name}
                  width={400}
                  height={300}
                  layout="responsive"
                  objectFit="cover"
                  className="rounded-t-lg"
                />
                <p className="text-xs text-gray-500 p-2">{getImageFilename(material.header_image)}</p>
              </CardContent>
            </Card>
          )}
          
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