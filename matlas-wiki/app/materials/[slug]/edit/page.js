'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Plus, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { generateSlug } from '@/lib/utils';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

export default function EditMaterialPage({ params }) {
  const router = useRouter();
  const { slug } = params;
  const session = useSession();
  const supabase = useSupabaseClient();
  const [material, setMaterial] = useState({ name: '', description: '', properties: {}, usage_examples: [], edit_history: [], related_materials: [], header_image: null, slug: '' });
  const [activeTab, setActiveTab] = useState("basic");
  const [headerImageFile, setHeaderImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => { if (slug !== 'new') fetchMaterial(); }, [slug]);

  const fetchMaterial = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('materials').select('*').eq('slug', slug).single();
    if (error) { setError('Failed to fetch material data'); console.error('Error fetching material:', error); }
    else setMaterial(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!session) { setError('You must be logged in to save materials'); return; }
    setLoading(true);
    setError(null);
    setSuccess(null);
    let updatedMaterial = { ...material, slug: generateSlug(material.name) };
    if (headerImageFile) {
      try {
        const fileExt = headerImageFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${updatedMaterial.slug}/${fileName}`;
        const { data, error } = await supabase.storage.from('Article-header').upload(filePath, headerImageFile, { cacheControl: '3600', upsert: false });
        if (error) throw error;
        const { data: publicUrlData } = supabase.storage.from('Article-header').getPublicUrl(filePath);
        updatedMaterial.header_image = publicUrlData.publicUrl;
      } catch (error) {
        setError(`Failed to upload header image: ${error.message}`);
        console.error('Error uploading header image:', error);
        setLoading(false);
        return;
      }
    }
    try {
      let result;
      if (slug === 'new') {
        const { data, error } = await supabase.from('materials').insert([updatedMaterial]).select();
        if (error) throw error;
        result = data[0];
      } else {
        const { data, error } = await supabase.from('materials').update(updatedMaterial).eq('slug', slug).select();
        if (error) throw error;
        result = data[0];
      }
      setSuccess('Material saved successfully');
      router.push(`/materials/${result.slug}`);
    } catch (error) {
      setError(`Failed to save material: ${error.message}`);
      console.error('Error saving material:', error);
    }
    setLoading(false);
  };

  const handleHeaderImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setHeaderImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setMaterial(prev => ({ ...prev, header_image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();
    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          const filePath = `${slug || 'new'}/${fileName}`;
          const { data, error } = await supabase.storage.from('Article-images').upload(filePath, file);
          if (error) throw error;
          const { data: publicUrlData } = supabase.storage.from('Article-images').getPublicUrl(filePath);
          const quill = quillRef.getEditor();
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, 'image', publicUrlData.publicUrl);
        } catch (error) {
          console.error('Error uploading image:', error);
          setError('Failed to upload image');
        }
      }
    };
  };

  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
        ['link', 'image'],
        ['clean']
      ],
      handlers: { image: handleImageUpload }
    },
  };

  const formats = ['header', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'list', 'bullet', 'indent', 'link', 'image'];

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;
  if (!session) return <div className="text-center">Please log in to edit materials.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Editing: {material.name || "New Material"}</h1>
      {error && <Alert variant="destructive" className="mb-4"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
      {success && <Alert className="mb-4"><AlertTitle>Success</AlertTitle><AlertDescription>{success}</AlertDescription></Alert>}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="usage">Usage Examples</TabsTrigger>
          <TabsTrigger value="history">Edit History</TabsTrigger>
          <TabsTrigger value="related">Related Materials</TabsTrigger>
        </TabsList>
        <TabsContent value="basic" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4">
                <Label htmlFor="header-image">Header Image</Label>
                <div className="mt-2">
                  {material.header_image && <Image src={material.header_image} alt="Header" width={300} height={200} className="rounded-md object-cover mb-2" />}
                  <Input id="header-image" type="file" onChange={handleHeaderImageChange} accept="image/*" />
                </div>
              </div>
              <Label htmlFor="name">Material Name</Label>
              <Input id="name" value={material.name} onChange={(e) => setMaterial(prev => ({ ...prev, name: e.target.value }))} className="mb-4" />
              <Label htmlFor="description">Description</Label>
              <ReactQuill value={material.description} onChange={(content) => setMaterial(prev => ({ ...prev, description: content }))} modules={modules} formats={formats} className="h-64 mb-4" />
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
                      <TableCell><Input value={key} onChange={(e) => {
                        const newProperties = { ...material.properties };
                        delete newProperties[key];
                        newProperties[e.target.value] = value;
                        setMaterial(prev => ({ ...prev, properties: newProperties }));
                      }} /></TableCell>
                      <TableCell><Input value={value} onChange={(e) => setMaterial(prev => ({ ...prev, properties: { ...prev.properties, [key]: e.target.value } }))} /></TableCell>
                      <TableCell>
                        <Button variant="destructive" size="icon" onClick={() => {
                          const newProperties = { ...material.properties };
                          delete newProperties[key];
                          setMaterial(prev => ({ ...prev, properties: newProperties }));
                        }}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button onClick={() => setMaterial(prev => ({ ...prev, properties: { ...prev.properties, '': '' } }))} className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Add Property
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="usage" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {material.usage_examples && material.usage_examples.map((example, index) => (
                <div key={index} className="mb-4">
                  <Input value={example.title} onChange={(e) => setMaterial(prev => ({
                    ...prev, usage_examples: prev.usage_examples.map((ex, i) => 
                      i === index ? { ...ex, title: e.target.value } : ex)
                  }))} placeholder="Title" className="mb-2" />
                  <Textarea value={example.description} onChange={(e) => setMaterial(prev => ({
                    ...prev, usage_examples: prev.usage_examples.map((ex, i) => 
                      i === index ? { ...ex, description: e.target.value } : ex)
                  }))} placeholder="Description" />
                  <Button variant="destructive" size="sm" onClick={() => setMaterial(prev => ({
                    ...prev, usage_examples: prev.usage_examples.filter((_, i) => i !== index)
                  }))} className="mt-2">
                    <Trash2 className="mr-2 h-4 w-4" /> Remove
                  </Button>
                </div>
              ))}
              <Button onClick={() => setMaterial(prev => ({ 
                ...prev, usage_examples: [...(prev.usage_examples || []), { title: '', description: '' }] 
              }))} className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Add Usage Example
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history" className="mt-4">
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
              <Button onClick={() => setMaterial(prev => ({ 
                ...prev, edit_history: [...(prev.edit_history || []), { 
                  date: new Date().toISOString(), 
                  editor: session.user.email, 
                  changes: 'Edited material' 
                }] 
              }))} className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Add Edit Record
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="related" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {material.related_materials && material.related_materials.map((related, index) => (
                <div key={index} className="mb-4">
                  <Input value={related.name} onChange={(e) => setMaterial(prev => ({
                    ...prev, related_materials: prev.related_materials.map((rel, i) => 
                      i === index ? { ...rel, name: e.target.value } : rel)
                  }))} placeholder="Material Name" className="mb-2" />
                  <Textarea value={related.description} onChange={(e) => setMaterial(prev => ({
                    ...prev, related_materials: prev.related_materials.map((rel, i) => 
                      i === index ? { ...rel, description: e.target.value } : rel)
                  }))} placeholder="Description" />
                  <Button variant="destructive" size="sm" onClick={() => setMaterial(prev => ({
                    ...prev, related_materials: prev.related_materials.filter((_, i) => i !== index)
                  }))} className="mt-2">
                    <Trash2 className="mr-2 h-4 w-4" /> Remove
                  </Button>
                </div>
              ))}
              <Button onClick={() => setMaterial(prev => ({ 
                ...prev, related_materials: [...(prev.related_materials || []), { name: '', description: '' }] 
              }))} className="mt-4">
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
          Save Changes
        </Button>
      </div>
    </div>
  );
}