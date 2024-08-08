'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useSession } from '@supabase/auth-helpers-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/ui/pagination";
import { Search, Filter, Grid, List } from 'lucide-react';

export default function DiscoverPage() {
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [view, setView] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddToProjectOpen, setIsAddToProjectOpen] = useState(false);
  const [userProjects, setUserProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const itemsPerPage = 12;
  const router = useRouter();
  const session = useSession();
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchMaterials();
    if (session) {
      fetchUserProjects();
    }
  }, [session]);

  const fetchMaterials = async () => {
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

      const { data, error } = await query.order('name');

      if (error) throw error;
      setMaterials(data);

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
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError('Failed to fetch materials');
    } finally {
      setLoading(false);
    }
  };

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
    setCurrentPage(1);
    fetchMaterials();
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

  const paginatedMaterials = materials.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
          <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
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

      {!loading && !error && (
        <div className={view === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
          {paginatedMaterials.map((material) => (
            <Card key={material.id} className={view === 'grid' ? "hover:shadow-lg transition-shadow" : "flex items-center"}>
              {view === 'grid' && material.header_image && (
                <div className="h-48 relative">
                  <Image
                    src={material.header_image}
                    alt={material.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-t-lg"
                  />
                </div>
              )}
              <div className={view === 'grid' ? "" : "flex-1"}>
                <CardHeader>
                  <CardTitle className={view === 'grid' ? "text-xl" : "text-lg"}>{material.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {material.description ? `${material.description.substring(0, 100)}...` : 'No description available.'}
                  </p>
                  <div className="flex justify-between items-center">
                    <Link href={`/materials/${material.slug}`}>
                      <Button variant="outline" size="sm">View Details</Button>
                    </Link>
                    {session && (
                      <Button variant="ghost" size="sm" onClick={() => handleAddToProject(material)}>
                        Add to Project
                      </Button>
                    )}
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Pagination
        className="mt-8"
        currentPage={currentPage}
        totalPages={Math.ceil(materials.length / itemsPerPage)}
        onPageChange={setCurrentPage}
      />

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