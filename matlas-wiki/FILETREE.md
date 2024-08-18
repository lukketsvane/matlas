
c:/Users/Shadow/Documents/GitHub/matlas/matlas-wiki/
  ├─].next/ (ignored)
  ├─].vercel/ (ignored)
  ├─ app/
  │  ├─ api/
  │  │  ├─ materials/
  │  │  │  └─ route.js
  │  │  ├─ search/
  │  │  │  └─ route.js
  │  │  └─ insert-material.js
  │  ├─ auth/
  │  │  └─ page.js
  │  ├─ discover/
  │  │  └─ page.js
  │  ├─ info/
  │  │  └─ page.js
  │  ├─ materials/
  │  │  ├─ [slug]/
  │  │  │  ├─ edit/
  │  │  │  │  └─ page.js
  │  │  │  └─ page.js
  │  │  └─ page.js
  │  ├─ profile/
  │  │  └─ page.js
  │  ├─ projects/
  │  │  ├─ [id]/
  │  │  │  └─ page.js
  │  │  └─ page.js
  │  ├─ favicon.ico
  │  ├─ globals.css
  │  ├─ layout.js
  │  └─ page.js
  ├─ components/
  │  ├─ ui/
  │  │  ├─ accordion.jsx
  │  │  ├─ alert-dialog.jsx
  │  │  ├─ alert.jsx
  │  │  ├─ aspect-ratio.jsx
  │  │  ├─ avatar.jsx
  │  │  ├─ badge.jsx
  │  │  ├─ breadcrumb.jsx
  │  │  ├─ button.jsx
  │  │  ├─ calendar.jsx
  │  │  ├─ card.jsx
  │  │  ├─ carousel.jsx
  │  │  ├─ chart.jsx
  │  │  ├─ checkbox.jsx
  │  │  ├─ collapsible.jsx
  │  │  ├─ command.jsx
  │  │  ├─ context-menu.jsx
  │  │  ├─ dialog.jsx
  │  │  ├─ drawer.jsx
  │  │  ├─ dropdown-menu.jsx
  │  │  ├─ form.jsx
  │  │  ├─ hover-card.jsx
  │  │  ├─ input-otp.jsx
  │  │  ├─ input.jsx
  │  │  ├─ label.jsx
  │  │  ├─ menubar.jsx
  │  │  ├─ navigation-menu.jsx
  │  │  ├─ pagination.jsx
  │  │  ├─ popover.jsx
  │  │  ├─ progress.jsx
  │  │  ├─ radio-group.jsx
  │  │  ├─ resizable.jsx
  │  │  ├─ scroll-area.jsx
  │  │  ├─ select.jsx
  │  │  ├─ separator.jsx
  │  │  ├─ sheet.jsx
  │  │  ├─ skeleton.jsx
  │  │  ├─ slider.jsx
  │  │  ├─ sonner.jsx
  │  │  ├─ switch.jsx
  │  │  ├─ table.jsx
  │  │  ├─ tabs.jsx
  │  │  ├─ textarea.jsx
  │  │  ├─ toast.jsx
  │  │  ├─ toaster.jsx
  │  │  ├─ toggle-group.jsx
  │  │  ├─ toggle.jsx
  │  │  ├─ tooltip.jsx
  │  │  └─ use-toast.js
  │  ├─ AddToProjectDialog.js
  │  ├─ component.jsx
  │  ├─ Filters.js
  │  ├─ MarkdownEditor.js
  │  ├─ MarkdownRenderer.js
  │  ├─ MaterialCard.js
  │  ├─ MaterialTabs.js
  │  ├─ PropertyTable.js
  │  └─ SearchBar.js
  ├─ lib/
  │  ├─ auth.js
  │  ├─ db.js
  │  ├─ imageUpload.js
  │  ├─ page.js
  │  ├─ supabaseClient.js
  │  ├─ theme.js
  │  └─ utils.js
  ├─]node_modules/ (ignored)
  ├─ public/
  │  ├─ default-avatar.png
  │  ├─ logo-icon.svg
  │  ├─ mat-driven.jpg
  │  ├─ matlas-logo.png
  │  ├─ next.svg
  │  ├─ placeholder.svg
  │  ├─ v0-background.svg
  │  └─ vercel.svg
  ├─ .env
  ├─ .eslintrc
  ├─ .eslintrc.json
  ├─ .gitignore
  ├─ components.json
  ├─ FILETREE.md
  ├─ insert-initial-data.js
  ├─ jsconfig.json
  ├─ next.config.mjs
  ├─ package-lock.json
  ├─ package.json
  ├─ postcss.config.mjs
  ├─ README.md
  └─ tailwind.config.js


/./matlas-wiki/app/api/search/route.js
import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  
  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .ilike('name', `%${query}%`)
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}


/./matlas-wiki/app/api/insert-material.js
import { supabase } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const materialData = {
    name: 'Titanium Alloy',
    description: 'A strong and lightweight metal',
    properties: {
      "Density": "4.5 g/cm³",
      "Melting Point": "1,668°C",
      "Tensile Strength": "900 MPa",
      "Hardness": "36 HRC",
      "Thermal Conductivity": "21.9 W/m·K",
      "Corrosion Resistance": "Excellent"
    },
    usage_examples: [
      {
        "title": "Aerospace",
        "description": "Titanium alloys are widely used in aircraft and spacecraft due to their high strength-to-weight ratio and corrosion resistance."
      },
      {
        "title": "Medical Implants",
        "description": "Titanium alloys are biocompatible and are commonly used in medical implants such as hip and knee replacements, dental implants, and pacemaker cases."
      },
      {
        "title": "Automotive",
        "description": "Titanium alloys are used in high-performance automotive applications, such as engine components, suspension parts, and exhaust systems, due to their strength and low weight."
      }
    ],
    edit_history: [
      {
        "date": "2024-06-15",
        "editor": "John Doe",
        "changes": "Updated tensile strength and hardness values."
      },
      {
        "date": "2024-05-20",
        "editor": "Jane Smith",
        "changes": "Added information about medical implant applications."
      },
      {
        "date": "2024-04-01",
        "editor": "Bob Johnson",
        "changes": "Initial creation of the material page."
      }
    ],
    related_materials: [
      {
        "name": "Stainless Steel",
        "description": "A corrosion-resistant alloy with a wide range of applications."
      },
      {
        "name": "Aluminum Alloy",
        "description": "A lightweight and versatile metal with excellent corrosion resistance."
      },
      {
        "name": "Carbon Fiber",
        "description": "A strong and lightweight composite material with numerous applications."
      }
    ]
  };

  try {
    const { data, error } = await supabase
      .from('materials')
      .insert([materialData]);

    if (error) throw error;

    res.status(200).json({ message: 'Material inserted successfully', data });
  } catch (error) {
    res.status(500).json({ message: 'Error inserting material', error: error.message });
  }
}

/./matlas-wiki/app/materials/[slug]/edit/page.js
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

/./matlas-wiki/app/materials/[slug]/page.js
'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from '@supabase/auth-helpers-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from "@/components/ui/button";
import { Pencil } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import AddToProjectDialog from '@/components/AddToProjectDialog';
import MaterialTabs from '@/components/MaterialTabs';
import MarkdownRenderer from '@/components/MarkdownRenderer';

export default function MaterialPage({ params }) {
  const { slug } = params;
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const session = useSession();
  const supabase = createClientComponentClient();
  const [isSearchVisible, setIsSearchVisible] = useState(true);
  const lastScrollTop = useRef(0);

  useEffect(() => {
    fetchMaterial();
    const handleScroll = () => {
      const st = window.pageYOffset || document.documentElement.scrollTop;
      setIsSearchVisible(st <= lastScrollTop.current || st <= 100);
      lastScrollTop.current = st <= 0 ? 0 : st;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [slug]);

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

  if (loading) return <div className="flex justify-center items-center h-screen"></div>;
  if (error) return <div className="px-4 py-8">Error: {error}</div>;
  if (!material) return <div className="px-4 py-8">Material not found</div>;

  return (
    <div className="max-w-screen-xl mx-auto">
      <SearchBar isVisible={isSearchVisible} />
      {material.header_image && (
        <div className="w-full h-64 sm:h-96 relative">
          <Image 
            src={material.header_image}
            alt={material.name}
            layout="fill"
            objectFit="cover"
            priority
            className="w-screen"
          />
        </div>
      )}
      <div className="px-4 mt-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">{material.name}</h1>
          <div className="flex items-center">
            {session && (
              <>
                <Link href={`/materials/${material.slug}/edit`}>
                  <Button variant="outline" size="icon" className="mr-2">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
                <AddToProjectDialog material={material} />
              </>
            )}
          </div>
        </div>
        <MarkdownRenderer content={material.description} />
        <MaterialTabs material={material} />
      </div>
    </div>
  );
}

/./matlas-wiki/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


/./matlas-wiki/app/materials/page.js
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
          <div></div>
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

/./matlas-wiki/app/profile/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Github, Twitter, Linkedin, Globe } from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: null, content: null });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push('/auth');

    try {
      const [profileData, contributionsData] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('contributions').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ]);

      if (profileData.data) setProfile(profileData.data);
      if (contributionsData.data) setContributions(contributionsData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage({ type: 'error', content: 'Failed to load profile data. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => setProfile({ ...profile, [e.target.id]: e.target.value });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage({ type: null, content: null });
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('profiles').upsert({ ...profile, id: user.id, updated_at: new Date() });
    setMessage(error
      ? { type: 'error', content: 'Failed to update profile. Please try again.' }
      : { type: 'success', content: 'Profile updated successfully!' }
    );
    setIsEditing(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      setProfile({ ...profile, avatar_url: publicUrl });
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id);
      setMessage({ type: 'success', content: 'Avatar updated successfully!' });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setMessage({ type: 'error', content: 'Failed to upload avatar. Please try again.' });
    }
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Your Profile</h1>
      {message.content && (
        <Alert variant={message.type === 'error' ? "destructive" : "default"} className="mb-6">
          <AlertDescription>{message.content}</AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile?.avatar_url} alt={profile?.name} />
                  <AvatarFallback>{profile?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <Input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={!isEditing} />
              </div>
              <Tabs defaultValue="basic">
                <TabsList>
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="social">Social Links</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-4">
                  {['name', 'email', 'bio', 'location', 'website'].map((field) => (
                    <div key={field}>
                      <Label htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                      {field === 'bio' ? (
                        <Textarea
                          id={field}
                          value={profile?.[field] || ''}
                          onChange={handleChange}
                          disabled={!isEditing || field === 'email'}
                          className="mt-1"
                        />
                      ) : (
                        <Input
                          id={field}
                          value={profile?.[field] || ''}
                          onChange={handleChange}
                          disabled={!isEditing || field === 'email'}
                          className="mt-1"
                        />
                      )}
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="social" className="space-y-4">
                  {['github_username', 'twitter_username', 'linkedin_url'].map((field) => (
                    <div key={field}>
                      <Label htmlFor={field}>{field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Label>
                      <Input
                        id={field}
                        value={profile?.[field] || ''}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </form>
          </CardContent>
          <CardFooter>
            <Button type={isEditing ? "submit" : "button"} onClick={() => isEditing ? handleProfileUpdate() : setIsEditing(true)}>
              {isEditing ? "Save Changes" : "Edit Profile"}
            </Button>
          </CardFooter>
        </Card>
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col space-y-2">
              {profile?.github_username && (
                <a href={`https://github.com/${profile.github_username}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-blue-500 hover:underline">
                  <Github size={20} />
                  <span>{profile.github_username}</span>
                </a>
              )}
              {profile?.twitter_username && (
                <a href={`https://twitter.com/${profile.twitter_username}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-blue-500 hover:underline">
                  <Twitter size={20} />
                  <span>{profile.twitter_username}</span>
                </a>
              )}
              {profile?.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-blue-500 hover:underline">
                  <Linkedin size={20} />
                  <span>LinkedIn Profile</span>
                </a>
              )}
              {profile?.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-blue-500 hover:underline">
                  <Globe size={20} />
                  <span>Personal Website</span>
                </a>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Your Contributions</CardTitle>
            </CardHeader>
            <CardContent>
              {contributions.length > 0 ? (
                <ul className="space-y-4">
                  {contributions.map((contribution) => (
                    <li key={contribution.id} className="border-b pb-4 last:border-b-0">
                      <h3 className="font-semibold">{contribution.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(contribution.created_at).toLocaleDateString()}
                      </p>
                      <p className="mt-2">{contribution.description}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>You haven&apos;t made any contributions yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-12 w-64 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-32" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/./matlas-wiki/components/MaterialCard.js
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
      <div className="flex flex-col flex-grow p-2">
        <CardHeader className="p-0 ">
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

/./matlas-wiki/app/layout.js
// app/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Manrope } from 'next/font/google';
import { cn } from '@/lib/utils';
import './globals.css';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Home, Search, Library, PlusCircle, User, LogOut, LogIn, Menu, Info, Sun, Moon, FolderOpen } from 'lucide-react';

const font = Manrope({ subsets: ['latin'], display: 'swap', variable: '--font-main' });

export default function RootLayout({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const supabase = createClientComponentClient();
  const pathname = usePathname();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);
    const handleChange = () => setIsDarkMode(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));

    const handleScroll = () => {
      const st = window.pageYOffset || document.documentElement.scrollTop;
      setIsMenuVisible(st < lastScrollTop.current);
      lastScrollTop.current = st <= 0 ? 0 : st;
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener('scroll', handleScroll);
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsSidebarOpen(false);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const NavLink = ({ href, icon: Icon, tooltip }) => {
    const isActive = pathname === href;
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link 
              href={href} 
              className={cn(
                "p-2 rounded-md transition-colors duration-200",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg transform scale-105" 
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={() => setIsSidebarOpen(false)}
            >
              <Icon className="h-6 w-6" />
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <html lang="en" className={cn(font.variable, isDarkMode ? 'dark' : '')}>
      <SessionContextProvider supabaseClient={supabase}>
        <body className="flex h-screen bg-background text-foreground antialiased">
          <aside className={`fixed inset-y-0 z-30 flex flex-col justify-between bg-card text-card-foreground w-16 md:w-20 transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${isMenuVisible ? '' : '-translate-y-full'}`}>
            <div className="flex flex-col items-center mt-4 space-y-4">
              <Link href="/" className="block mb-4">
                <Image
                  src="/logo-icon.svg"
                  alt="MatLas Wiki Logo"
                  width={32}
                  height={32}
                  className={isDarkMode ? "filter invert" : ""}
                />
              </Link>
              <NavLink href="/" icon={Home} tooltip="Home" />
              <NavLink href="/discover" icon={Search} tooltip="Discover" />
              <NavLink href="/materials" icon={Library} tooltip="Materials" />
              {user && <NavLink href="/projects" icon={FolderOpen} tooltip="Projects" />}
              {user && <NavLink href="/materials/new/edit" icon={PlusCircle} tooltip="Add Material" />}
            </div>
            <div className="flex flex-col items-center mb-4 space-y-4">
              {user && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link 
                        href="/profile" 
                        className="p-2 rounded-md transition-colors duration-200 hover:bg-accent hover:text-accent-foreground"
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <Image
                          src={user.user_metadata.avatar_url || "/default-avatar.png"}
                          alt="User Avatar"
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Profile</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <NavLink href="/info" icon={Info} tooltip="Information" />
              <Button onClick={toggleDarkMode} variant="ghost" size="icon">
                {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
              </Button>
              {user ? (
                <Button onClick={handleSignOut} variant="ghost" size="icon">
                  <LogOut className="h-6 w-6" />
                </Button>
              ) : (
                <Link href="/auth">
                  <Button variant="ghost" size="icon">
                    <LogIn className="h-6 w-6" />
                  </Button>
                </Link>
              )}
            </div>
          </aside>
          <div className="flex-grow flex flex-col ml-0 md:ml-16 md:ml-20">
            <header className="bg-card text-card-foreground p-4 md:hidden">
              <Button onClick={toggleSidebar} variant="ghost">
                <Menu className="h-6 w-6" />
              </Button>
            </header>
            <main className="flex-grow overflow-auto">
              {children}
            </main>
          </div>
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </body>
      </SessionContextProvider>
    </html>
  );
}


/./matlas-wiki/app/page.js
'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Search } from 'lucide-react';
import { MaterialCard } from '@/components/MaterialCard';
import { motion } from 'framer-motion';

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [randomMaterials, setRandomMaterials] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClientComponentClient();
      setLoading(true);
      setError(null);

      try {
        const { data: materialsData, error: materialsError } = await supabase
          .from('materials')
          .select('id, name, description, header_image, slug, category, subcategory')
          .limit(3);

        if (materialsError) throw new Error(materialsError.message);
        setRandomMaterials(materialsData);

        const { data: allMaterials, error: allMaterialsError } = await supabase
          .from('materials')
          .select('category, subcategory');

        if (allMaterialsError) throw new Error(allMaterialsError.message);

        const categoriesObj = allMaterials.reduce((acc, material) => {
          if (material.category) {
            if (!acc[material.category]) {
              acc[material.category] = new Set();
            }
            if (material.subcategory) {
              acc[material.category].add(material.subcategory);
            }
          }
          return acc;
        }, {});

        Object.keys(categoriesObj).forEach(category => {
          categoriesObj[category] = Array.from(categoriesObj[category]);
        });

        setCategories(categoriesObj);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/materials?search=${encodeURIComponent(searchTerm)}`);
  };

  const handleCategoryClick = (category) => {
    router.push(`/materials?category=${encodeURIComponent(category)}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="flex flex-col items-center mb-12">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Image src="/matlas-logo.png" alt="MatLas Wiki logo" width={200} height={200} className="mb-8" />
        </motion.div>
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-4xl font-bold text-primary mb-6"
        >
          MatLas Wiki
        </motion.h1>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-xl mb-6"
        >
          The Free Material Encyclopedia
        </motion.p>
        <motion.form 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          onSubmit={handleSearch} 
          className="w-full max-w-2xl mb-8"
        >
          <div className="relative">
            <Search 
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" 
              onClick={handleSearch}
            />
            <Input 
              type="text" 
              placeholder="Search materials..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="pl-10 pr-4"
            />
          </div>
        </motion.form>
      </div>

      <motion.h2 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="text-2xl font-bold mb-4"
      >
        Random Materials
      </motion.h2>
      {error && <div className="text-red-500">Error: {error}</div>}
      {!loading && !error && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2"
        >
          {randomMaterials.map((material, index) => (
            <motion.div
              key={material.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 + (index * 0.1), duration: 0.5 }}
            >
              <MaterialCard material={material} />
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.h2 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="text-2xl font-bold mb-4"
      >
        Material Categories
      </motion.h2>
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8"
      >
        {Object.entries(categories).map(([category, subcategories], index) => (
          <motion.div
            key={category}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.4 + (index * 0.05), duration: 0.5 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-3">
                <CardTitle className="text-lg">{category}</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <p className="text-sm text-muted-foreground mb-2">{subcategories.length} subcategories</p>
                <Button variant="outline" size="sm" onClick={() => handleCategoryClick(category)} className="w-full">
                  Explore
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.5 }}
        className="text-center"
      >
        <Button variant="outline" className="text-primary">
          Read MatLas Wiki in your language <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
}

