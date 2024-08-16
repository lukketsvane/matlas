matlas                                            
├─ matlas-wiki                                 
│  ├─ app                                         
│  │  ├─ api                                      
│  │  │  ├─ materials                             
│  │  │  │  └─ route.js                           
│  │  │  ├─ search                                
│  │  │  │  └─ route.js                           
│  │  │  └─ insert-material.js                    
│  │  ├─ auth                                     
│  │  │  └─ page.js                               
│  │  ├─ materials                                
│  │  │  ├─ [slug]                                
│  │  │  │  ├─ edit                               
│  │  │  │  │  └─ page.js                         
│  │  │  │  └─ page.js                            
│  │  │  └─ page.js                               
│  │  ├─ profile                                  
│  │  │  └─ page.js                               
│  │  ├─ favicon.ico                              
│  │  ├─ globals.css                              
│  │  ├─ layout.js                                
│  │  └─ page.js                                  
│  ├─ components                                  
│  │  ├─ ui                                       
│  │  │  ├─ accordion.jsx                         
│  │  │  ├─ alert-dialog.jsx                      
│  │  │  ├─ alert.jsx                             
│  │  │  ├─ aspect-ratio.jsx                      
│  │  │  ├─ avatar.jsx                            
│  │  │  ├─ badge.jsx                             
│  │  │  ├─ breadcrumb.jsx                        
│  │  │  ├─ button.jsx                            
│  │  │  ├─ calendar.jsx                          
│  │  │  ├─ card.jsx                              
│  │  │  ├─ carousel.jsx                          
│  │  │  ├─ chart.jsx                             
│  │  │  ├─ checkbox.jsx                          
│  │  │  ├─ collapsible.jsx                       
│  │  │  ├─ command.jsx                           
│  │  │  ├─ context-menu.jsx                      
│  │  │  ├─ dialog.jsx                            
│  │  │  ├─ drawer.jsx                            
│  │  │  ├─ dropdown-menu.jsx                     
│  │  │  ├─ form.jsx                              
│  │  │  ├─ hover-card.jsx                        
│  │  │  ├─ input-otp.jsx                         
│  │  │  ├─ input.jsx                             
│  │  │  ├─ label.jsx                             
│  │  │  ├─ menubar.jsx                           
│  │  │  ├─ navigation-menu.jsx                   
│  │  │  ├─ pagination.jsx                        
│  │  │  ├─ popover.jsx                           
│  │  │  ├─ progress.jsx                          
│  │  │  ├─ radio-group.jsx                       
│  │  │  ├─ resizable.jsx                         
│  │  │  ├─ scroll-area.jsx                       
│  │  │  ├─ select.jsx                            
│  │  │  ├─ separator.jsx                         
│  │  │  ├─ sheet.jsx                             
│  │  │  ├─ skeleton.jsx                          
│  │  │  ├─ slider.jsx                            
│  │  │  ├─ sonner.jsx                            
│  │  │  ├─ switch.jsx                            
│  │  │  ├─ table.jsx                             
│  │  │  ├─ tabs.jsx                              
│  │  │  ├─ textarea.jsx                          
│  │  │  ├─ toast.jsx                             
│  │  │  ├─ toaster.jsx                           
│  │  │  ├─ toggle-group.jsx                      
│  │  │  ├─ toggle.jsx                            
│  │  │  ├─ tooltip.jsx                           
│  │  │  └─ use-toast.js                          
│  │  ├─ MarkdownEditor.js                        
│  │  ├─ MaterialCard.js                          
│  │  ├─ PropertyTable.js                         
│  │  ├─ SearchBar.js                             
│  │  └─ component.jsx                            
│  ├─ lib                                         
│  │  ├─ auth.js                                  
│  │  ├─ db.js                                    
│  │  ├─ imageUpload.js                           
│  │  ├─ page.js                                  
│  │  ├─ supabaseClient.js                        
│  │  ├─ theme.js                                 
│  │  └─ utils.js                                 
│  ├─ public                                      
│  │  ├─ matlas-logo.png                          
│  │  ├─ next.svg                                 
│  │  ├─ placeholder.svg                          
│  │  └─ vercel.svg                               
│  ├─ README.md                                   
│  ├─ combined_code.txt                           
│  ├─ components.json                             
│  ├─ ee a compact version of the commit history  
│  ├─ insert-initial-data.js                      
│  ├─ jsconfig.json                               
│  ├─ next.config.mjs                             
│  ├─ package-lock.json                           
│  ├─ package.json                                
│  ├─ postcss.config.mjs                          
│  ├─ t commit but keep the changes               
│  ├─ tailwind.config.js                          
│  └─ write.py                                    
├─ Engineering_Materials_v3.txt                   
├─ README.md                                      
├─ gen.py                                         
├─ materials_to_generate.txt                      
└─ write.py                                       


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

'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useSession } from '@supabase/auth-helpers-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { generateSlug } from '@/lib/utils';

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const INITIAL_MATERIAL = { name: '', description: '', properties: {}, usage_examples: [], edit_history: [], related_materials: [], header_image: null, slug: '' };

const tabOptions = [
  { value: "basic-info", label: "Basic Info" },
  { value: "properties", label: "Properties" },
  { value: "usage-examples", label: "Usage Examples" },
  { value: "edit-history", label: "Edit History" },
  { value: "related-materials", label: "Related Materials" }
];

export default function EditMaterialPage({ params }) {
  const router = useRouter();
  const { slug } = params;
  const session = useSession();
  const supabase = createClientComponentClient();
  const [material, setMaterial] = useState(INITIAL_MATERIAL);
  const [activeTab, setActiveTab] = useState("basic-info");
  const [headerImageFile, setHeaderImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMaterial = useCallback(async () => {
    if (slug === 'new') return;
    setLoading(true);
    const { data, error } = await supabase.from('materials').select('*').eq('slug', slug).single();
    if (error) setError('Failed to fetch material data');
    else setMaterial(data);
    setLoading(false);
  }, [slug, supabase]);

  useEffect(() => { fetchMaterial(); }, [fetchMaterial]);

  const handleSave = async () => {
    if (!session) { setError('You must be logged in to save materials'); return; }
    setLoading(true);
    setError(null);
    let updatedMaterial = { ...material, slug: generateSlug(material.name) };
    if (headerImageFile) {
      const { data, error } = await uploadHeaderImage(updatedMaterial.slug);
      if (error) { setError(`Failed to upload header image: ${error.message}`); setLoading(false); return; }
      updatedMaterial.header_image = data.publicUrl;
    }
    try {
      const { data, error } = await supabase.from('materials').upsert(updatedMaterial).select().single();
      if (error) throw error;
      router.push(`/materials/${data.slug}`);
    } catch (error) {
      setError(`Failed to save material: ${error.message}`);
    }
    setLoading(false);
  };

  const uploadHeaderImage = async (materialSlug) => {
    const fileExt = headerImageFile.name.split('.').pop();
    const filePath = `${materialSlug}/${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from('Article-header').upload(filePath, headerImageFile);
    if (error) throw error;
    return supabase.storage.from('Article-header').getPublicUrl(filePath);
  };

  const handleChange = (field, value) => setMaterial(prev => ({ ...prev, [field]: value }));
  const handleArrayChange = (field, index, value) => setMaterial(prev => ({ ...prev, [field]: prev[field].map((item, i) => i === index ? { ...item, ...value } : item) }));
  const addArrayItem = (field, item) => setMaterial(prev => ({ ...prev, [field]: [...prev[field], item] }));
  const removeArrayItem = (field, index) => setMaterial(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;
  if (!session) return <div className="text-center">Please log in to edit materials.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Editing: {material.name || "New Material"}</h1>
      {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {tabOptions.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="basic-info" className="mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="header-image">Header Image</Label>
                {material.header_image && <Image src={material.header_image} alt="Header" width={300} height={200} className="rounded-md object-cover mt-2" />}
                <Input id="header-image" type="file" onChange={(e) => setHeaderImageFile(e.target.files[0])} accept="image/*" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="name">Material Name</Label>
                <Input id="name" value={material.name} onChange={(e) => handleChange('name', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <MDEditor
                  value={material.description}
                  onChange={(value) => handleChange('description', value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(material.properties || {}).map(([key, value], index) => (
                    <TableRow key={index}>
                      <TableCell><Input value={key} onChange={(e) => { const newProperties = { ...material.properties }; delete newProperties[key]; newProperties[e.target.value] = value; handleChange('properties', newProperties); }} /></TableCell>
                      <TableCell><Input value={value} onChange={(e) => handleChange('properties', { ...material.properties, [key]: e.target.value })} /></TableCell>
                      <TableCell>
                        <Button variant="destructive" size="icon" onClick={() => { const newProperties = { ...material.properties }; delete newProperties[key]; handleChange('properties', newProperties); }}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button onClick={() => handleChange('properties', { ...material.properties, '': '' })} className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Add Property
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage-examples" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {material.usage_examples && material.usage_examples.map((example, index) => (
                <div key={index} className="mb-4">
                  <Input value={example.title} onChange={(e) => handleArrayChange('usage_examples', index, { title: e.target.value })} placeholder="Title" className="mb-2" />
                  <MDEditor
                    value={example.description}
                    onChange={(value) => handleArrayChange('usage_examples', index, { description: value })}
                  />
                  <Button variant="destructive" size="sm" onClick={() => removeArrayItem('usage_examples', index)} className="mt-2">
                    <Trash2 className="mr-2 h-4 w-4" /> Remove
                  </Button>
                </div>
              ))}
              <Button onClick={() => addArrayItem('usage_examples', { title: '', description: '' })} className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Add Usage Example
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit-history" className="mt-4">
          <Card>
            <CardContent className="pt-6">
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
                      <TableCell>{edit.date}</TableCell>
                      <TableCell>{edit.editor}</TableCell>
                      <TableCell>{edit.changes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button onClick={() => addArrayItem('edit_history', { date: new Date().toISOString(), editor: session.user.email, changes: 'Edited material' })} className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Add Edit Record
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="related-materials" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {material.related_materials && material.related_materials.map((related, index) => (
                <div key={index} className="mb-4">
                  <Input value={related.name} onChange={(e) => handleArrayChange('related_materials', index, { name: e.target.value })} placeholder="Material Name" className="mb-2" />
                  <MDEditor
                    value={related.description}
                    onChange={(value) => handleArrayChange('related_materials', index, { description: value })}
                  />
                  <Button variant="destructive" size="sm" onClick={() => removeArrayItem('related_materials', index)} className="mt-2">
                    <Trash2 className="mr-2 h-4 w-4" /> Remove
                  </Button>
                </div>
              ))}
              <Button onClick={() => addArrayItem('related_materials', { name: '', description: '' })} className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Add Related Material
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={() => router.push(`/materials/${slug === 'new' ? '' : slug}`)}>Cancel</Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save
        </Button>
      </div>
    </div>
  );
}

'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from "@/components/ui/button";
import { MaterialCard } from '@/components/MaterialCard';
import SearchBar from '@/components/SearchBar';
import Filters from '@/components/Filters';
import { Grid, List } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from 'framer-motion';

export default function MaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [categories, setCategories] = useState({});
  const [view, setView] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [advancedSearch, setAdvancedSearch] = useState({ inTitle: true, inDescription: false, inProperties: false });
  const [showFilters, setShowFilters] = useState(false);
  const supabase = createClientComponentClient();

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('materials').select('*').order('name');
      if (error) throw error;
      const filteredData = data.filter(material => material.name !== "Ac");
      setMaterials(filteredData);
      const categoriesObj = filteredData.reduce((acc, { category, subcategory }) => {
        if (category) {
          if (!acc[category]) acc[category] = new Set();
          if (subcategory) acc[category].add(subcategory);
        }
        return acc;
      }, {});
      Object.keys(categoriesObj).forEach(category => {
        categoriesObj[category] = Array.from(categoriesObj[category]).sort();
      });
      setCategories(categoriesObj);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchMaterials();
    const subscription = supabase.channel('materials_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'materials' }, fetchMaterials)
      .subscribe();
    return () => supabase.removeChannel(subscription);
  }, [fetchMaterials, supabase]);

  useEffect(() => {
    const filtered = materials.filter(material => {
      const categoryMatch = selectedCategory === 'all' || material.category === selectedCategory;
      const subcategoryMatch = selectedSubcategory === 'all' || material.subcategory === selectedSubcategory;
      const searchMatch = searchTerm === '' || (
        (advancedSearch.inTitle && material.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (advancedSearch.inDescription && material.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (advancedSearch.inProperties && JSON.stringify(material.properties).toLowerCase().includes(searchTerm.toLowerCase()))
      );
      return categoryMatch && subcategoryMatch && searchMatch;
    });
    setFilteredMaterials(filtered);
  }, [materials, selectedCategory, selectedSubcategory, searchTerm, advancedSearch]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setAdvancedSearch({ inTitle: true, inDescription: false, inProperties: false });
    setSearchTerm('');
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 flex flex-col md:flex-row">
      <div className="flex-grow">
        <div className="flex flex-col mb-6">
          <h1 className="text-3xl font-bold text-primary mb-4">Materials Library</h1>
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <Tabs value={view} onValueChange={setView} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="grid"><Grid className="mr-2 h-4 w-4" />Grid</TabsTrigger>
                <TabsTrigger value="table"><List className="mr-2 h-4 w-4" />Table</TabsTrigger>
              </TabsList>
            </Tabs>
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} handleSearch={(e) => e.preventDefault()} />
            <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="md:hidden">
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
        </div>
        {error && <div className="text-red-500 mb-4">Error: {error}</div>}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <AnimatePresence>
            {view === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredMaterials.map((material) => (
                  <motion.div key={material.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                    <MaterialCard material={material} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2 hidden sm:table-cell">Description</th>
                      <th className="text-left p-2 hidden sm:table-cell">Category</th>
                      <th className="text-left p-2 hidden sm:table-cell">Subcategory</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMaterials.map((material) => (
                      <motion.tr key={material.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="border-t">
                        <td className="p-2">{material.name}</td>
                        <td className="p-2 hidden sm:table-cell">{truncateDescription(material.description, 100)}</td>
                        <td className="p-2 hidden sm:table-cell">{material.category}</td>
                        <td className="p-2 hidden sm:table-cell">{material.subcategory}</td>
                        <td className="p-2">
                          <Link href={`/materials/${material.slug}`}><Button size="sm" variant="outline">View</Button></Link>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AnimatePresence>
        )}
      </div>
      <div className={`md:hidden fixed inset-0  backdrop-blur-sm z-50 transition-opacity ${showFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className={`fixed inset-y-0 right-0 w-3/4 bg-background shadow-xl transition-transform ${showFilters ? 'translate-x-0' : 'translate-x-full'}`}>
          <Filters
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedSubcategory={selectedSubcategory}
            setSelectedSubcategory={setSelectedSubcategory}
            advancedSearch={advancedSearch}
            setAdvancedSearch={setAdvancedSearch}
            resetFilters={resetFilters}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
          />
        </div>
      </div>
      <div className="hidden md:block">
        <Filters
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedSubcategory={selectedSubcategory}
          setSelectedSubcategory={setSelectedSubcategory}
          advancedSearch={advancedSearch}
          setAdvancedSearch={setAdvancedSearch}
          resetFilters={resetFilters}
          showFilters={showFilters}
        />
      </div>
    </div>
  );
}

function truncateDescription(description, maxLength) {
  return description.length <= maxLength ? description : description.substr(0, maxLength) + '...';
}