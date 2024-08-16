// matlas-wiki\app\materials\[slug]\page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const MarkdownComponents = {
  h1: ({ node, ...props }) => <h1 className="text-2xl font-normal mt-6 mb-1 pb-1 border-b border-gray-200" {...props} />,
  h2: ({ node, ...props }) => <h2 className="text-xl font-normal mt-6 mb-1 pb-1 border-b border-gray-200" {...props} />,
  h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-1" {...props} />,
  ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2" {...props} />,
  ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2" {...props} />,
  li: ({ node, ...props }) => <li className="mb-1" {...props} />,
  p: ({ node, ...props }) => <p className="my-2" {...props} />,
  a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" {...props} />,
  strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
  em: ({ node, ...props }) => <em className="italic" {...props} />,
  blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-300 pl-4 my-2 text-gray-600" {...props} />,
  code: ({ node, inline, ...props }) => 
    inline ? (
      <code className="bg-gray-100 border border-gray-200 rounded px-1" {...props} />
    ) : (
      <pre className="bg-gray-100 border border-gray-200 p-4 my-4 whitespace-pre-wrap">
        <code {...props} />
      </pre>
    ),
  table: ({ node, ...props }) => <table className="border-collapse my-4 w-full" {...props} />,
  th: ({ node, ...props }) => <th className="border border-gray-300 px-4 py-2 bg-gray-100 font-bold" {...props} />,
  td: ({ node, ...props }) => <td className="border border-gray-300 px-4 py-2" {...props} />,
};

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

  if (error) return <div className="px-4 py-8">Error: {error}</div>;
  if (!material) return <div className="px-4 py-8"></div>;

  return (
    <div className="max-w-screen-xl mx-auto">
      {material.header_image && (
  <div className="w-full h-64 relative mb-4 sm:px-4">
    <div className="absolute inset-0 sm:static">
      <Image 
        src={material.header_image}
        alt={material.name}
        layout="fill"
        objectFit="cover"
        priority
        className="sm:rounded-lg"
      />
    </div>
  </div>
)}
      <div className="px-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-normal">{material.name}</h1>
          {session && (
            <Dialog open={isAddToProjectOpen} onOpenChange={setIsAddToProjectOpen}>
              <DialogTrigger asChild>
                <button className="px-3 py-1 text-sm bg-gray-100 border border-gray-300 rounded hover:bg-gray-200">
                  Add to Project
                </button>
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
        <div className="prose max-w-none">
          <ReactMarkdown components={MarkdownComponents}>{material.description}</ReactMarkdown>
        </div>
        
        <Tabs defaultValue="properties" className="mt-8">
          <TabsList>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="usage">Usage Examples</TabsTrigger>
            <TabsTrigger value="history">Edit History</TabsTrigger>
          </TabsList>
          <TabsContent value="properties">
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
          </TabsContent>
          <TabsContent value="usage">
            {material.usage_examples && material.usage_examples.map((example, index) => (
              <div key={index} className="mb-4">
                <h3 className="text-lg font-semibold">{example.title}</h3>
                <ReactMarkdown components={MarkdownComponents}>{example.description}</ReactMarkdown>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="history">
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
          </TabsContent>
        </Tabs>
        
        {session && (
          <div className="mt-8">
            <Link href={`/materials/${material.slug}/edit`}>
              <Button className="w-full">Edit Material</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}