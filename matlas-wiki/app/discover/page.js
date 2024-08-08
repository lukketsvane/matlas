'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useSession } from '@supabase/auth-helpers-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Grid, List } from 'lucide-react';
import { MaterialCard } from '@/components/MaterialCard';

export default function DiscoverPage() {
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [view, setView] = useState('grid');
  const [isAddToProjectOpen, setIsAddToProjectOpen] = useState(false);
  const [userProjects, setUserProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const itemsPerPage = 12;
  const router = useRouter();
  const session = useSession();
  const supabase = createClientComponentClient();
  const observerRef = useRef(null);

  const fetchMaterials = useCallback(async (reset = false) => {
    if (reset) {
      setPage(0);
      setMaterials([]);
    }
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('materials').select('*');

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (selectedSubcategory !== 'all') {
        query = query.eq('subcategory', selectedSubcategory);
      }

      const { data, error } = await query
        .order('name')
        .range(page * itemsPerPage, (page + 1) * itemsPerPage - 1);

      if (error) throw error;
      
      setMaterials(prev => reset ? data : [...prev, ...data]);
      setHasMore(data.length === itemsPerPage);

      if (reset) {
        const categoriesObj = data.reduce((acc, material) => {
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
      }
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError('Failed to fetch materials');
    } finally {
      setLoading(false);
    }
  }, [supabase, searchTerm, selectedCategory, selectedSubcategory, page, itemsPerPage]);

  useEffect(() => {
    fetchMaterials(true);
    if (session) {
      fetchUserProjects();
    }
  }, [session, fetchMaterials]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prevPage => prevPage + 1);
        }
      },
      { threshold: 1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasMore, loading]);

  const fetchUserProjects = async () => {
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

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMaterials(true);
  };

  const handleAddToProject = (material) => {
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
      setIsAddToProjectOpen(false);
      // Optionally, show a success message
    } catch (error) {
      console.error('Error saving material to project:', error);
      // Optionally, show an error message
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Discover Materials</h1>
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <Tabs value={view} onValueChange={setView} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="grid"><Grid className="mr-2 h-4 w-4" /> Grid</TabsTrigger>
            <TabsTrigger value="list"><List className="mr-2 h-4 w-4" /> List</TabsTrigger>
          </TabsList>
        </Tabs>
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
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
        <Select value={selectedCategory} onValueChange={(value) => { setSelectedCategory(value); fetchMaterials(true); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.keys(categories).map((category) => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedCategory !== 'all' && (
          <Select value={selectedSubcategory} onValueChange={(value) => { setSelectedSubcategory(value); fetchMaterials(true); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Subcategory" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subcategories</SelectItem>
              {categories[selectedCategory]?.map((subcategory) => (
                <SelectItem key={subcategory} value={subcategory}>{subcategory}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {materials.map((material) => (
            <MaterialCard 
              key={material.id} 
              material={material} 
              onAddToProject={session ? () => handleAddToProject(material) : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Description</th>
                <th className="text-left p-2">Category</th>
                <th className="text-left p-2">Subcategory</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((material) => (
                <tr key={material.id} className="border-t">
                  <td className="p-2">{material.name}</td>
                  <td className="p-2">{material.description.substring(0, 100)}...</td>
                  <td className="p-2">{material.category}</td>
                  <td className="p-2">{material.subcategory}</td>
                  <td className="p-2">
                    <Button onClick={() => router.push(`/materials/${material.slug}`)} size="sm" variant="outline">
                      View Details
                    </Button>
                    {session && (
                      <Button onClick={() => handleAddToProject(material)} size="sm" variant="ghost" className="ml-2">
                        Add to Project
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {loading && <p className="text-center mt-4">Loading materials...</p>}
      
      <div ref={observerRef} className="h-10 mt-4" />

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
          <Button onClick={saveMaterialToProject}>Save to Project</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}