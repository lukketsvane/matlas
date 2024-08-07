'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useSession } from '@supabase/auth-helpers-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, Trash2, Eye } from 'lucide-react';
import dynamic from 'next/dynamic';
import { generateSlug } from '@/lib/utils';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false, loading: () => <p>Loading editor...</p> });
import 'react-quill/dist/quill.snow.css';

const INITIAL_MATERIAL = {
  name: '',
  description: '',
  properties: {},
  usage_examples: [],
  edit_history: [],
  related_materials: [],
  header_image: null,
  slug: ''
};

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
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    if (slug !== 'new') fetchMaterial();
  }, [slug]);

  const fetchMaterial = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('materials').select('*').eq('slug', slug).single();
    if (error) setError('Failed to fetch material data');
    else setMaterial(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!session) {
      setError('You must be logged in to save materials');
      return;
    }
    setLoading(true);
    setError(null);
    let updatedMaterial = { ...material, slug: generateSlug(material.name) };
    if (headerImageFile) {
      const { data, error } = await uploadHeaderImage(updatedMaterial.slug);
      if (error) {
        setError(`Failed to upload header image: ${error.message}`);
        setLoading(false);
        return;
      }
      updatedMaterial.header_image = data.publicUrl;
    }
    try {
      const { data, error } = await supabase.from('materials')
        .upsert(updatedMaterial)
        .select()
        .single();
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

  const handleArrayChange = (field, index, value) => {
    setMaterial(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? { ...item, ...value } : item)
    }));
  };

  const addArrayItem = (field, item) => {
    setMaterial(prev => ({ ...prev, [field]: [...prev[field], item] }));
  };

  const removeArrayItem = (field, index) => {
    setMaterial(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;
  if (!session) return <div className="text-center">Please log in to edit materials.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Editing: {material.name || "New Material"}</h1>
      {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {["Basic Info", "Properties", "Usage Examples", "Edit History", "Related Materials"].map((tab) => (
            <TabsTrigger key={tab} value={tab.toLowerCase().replace(' ', '-')}>{tab}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="basic-info" className="mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="header-image">Header Image</Label>
                {material.header_image && (
                  <Image src={material.header_image} alt="Header" width={300} height={200} className="rounded-md object-cover mt-2" />
                )}
                <Input id="header-image" type="file" onChange={(e) => setHeaderImageFile(e.target.files[0])} accept="image/*" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="name">Material Name</Label>
                <Input id="name" value={material.name} onChange={(e) => handleChange('name', e.target.value)} />
              </div>
              <div className="relative">
                <Label htmlFor="description">Description</Label>
                <Button
                  onClick={() => setIsPreview(!isPreview)}
                  className="absolute top-0 right-0 p-2 bg-transparent hover:bg-transparent"
                >
                  <Eye className="h-5 w-5 text-foreground" />
                </Button>
                {isPreview ? (
                  <div className="prose max-w-none mt-2" dangerouslySetInnerHTML={{ __html: material.description }} />
                ) : (
                  <ReactQuill
                    value={material.description}
                    onChange={(content) => handleChange('description', content)}
                    className="h-[calc(100vh-400px)] mt-2"
                  />
                )}
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
                      <TableCell><Input value={key} onChange={(e) => {
                        const newProperties = { ...material.properties };
                        delete newProperties[key];
                        newProperties[e.target.value] = value;
                        handleChange('properties', newProperties);
                      }} /></TableCell>
                      <TableCell><Input value={value} onChange={(e) => handleChange('properties', { ...material.properties, [key]: e.target.value })} /></TableCell>
                      <TableCell>
                        <Button variant="destructive" size="icon" onClick={() => {
                          const newProperties = { ...material.properties };
                          delete newProperties[key];
                          handleChange('properties', newProperties);
                        }}><Trash2 className="h-4 w-4" /></Button>
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
                  <Input
                    value={example.title}
                    onChange={(e) => handleArrayChange('usage_examples', index, { title: e.target.value })}
                    placeholder="Title"
                    className="mb-2"
                  />
                  <Textarea
                    value={example.description}
                    onChange={(e) => handleArrayChange('usage_examples', index, { description: e.target.value })}
                    placeholder="Description"
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
              <Button onClick={() => addArrayItem('edit_history', {
                date: new Date().toISOString(),
                editor: session.user.email,
                changes: 'Edited material'
              })} className="mt-4">
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
                  <Input
                    value={related.name}
                    onChange={(e) => handleArrayChange('related_materials', index, { name: e.target.value })}
                    placeholder="Material Name"
                    className="mb-2"
                  />
                  <Textarea
                    value={related.description}
                    onChange={(e) => handleArrayChange('related_materials', index, { description: e.target.value })}
                    placeholder="Description"
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
          Save Changes
        </Button>
      </div>
    </div>
  );
}