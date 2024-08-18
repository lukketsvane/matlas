'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Search, Shuffle, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from '@supabase/auth-helpers-react';

const MaterialCard = ({ material }) => {
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
      <div className="h-40 relative">
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
        <h3 className="text-lg font-bold mb-2">{material.name}</h3>
        <div className="text-sm text-muted-foreground mb-4 flex-grow overflow-hidden">
          <MarkdownRenderer content={stripHtmlTags(material.description).substring(0, 150) + '...'} />
        </div>
        <div className="flex justify-between items-center mt-auto">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/materials/category/${material.category}/${material.subcategory}/${material.slug}`}>
              View Details
            </Link>
          </Button>
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
      </div>
    </Card>
  );
};

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

  const handleFeelingLucky = async () => {
    const supabase = createClientComponentClient();
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('slug, category, subcategory')
        .limit(1)
        .order('RANDOM()');

      if (error) throw error;
      if (data && data.length > 0) {
        const material = data[0];
        router.push(`/materials/category/${material.category}/${material.subcategory}/${material.slug}`);
      }
    } catch (err) {
      console.error('Error fetching random material:', err);
    }
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
          className="w-full max-w-2xl mb-4"
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
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <Button onClick={handleFeelingLucky} variant="outline" className="flex items-center">
            <Shuffle className="mr-2 h-4 w-4" />
            I'm Feeling Lucky
          </Button>
        </motion.div>
      </div>

      <motion.h2 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.5 }}
        className="text-2xl font-bold mb-4"
      >
        Random Materials
      </motion.h2>
      {error && <div className="text-red-500">Error: {error}</div>}
      {!loading && !error && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {randomMaterials.map((material, index) => (
            <motion.div
              key={material.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2 + (index * 0.1), duration: 0.5 }}
            >
              <MaterialCard material={material} />
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.h2 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.5 }}
        className="text-2xl font-bold mb-4"
      >
        Material Categories
      </motion.h2>
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8"
      >
        {Object.entries(categories).map(([category, subcategories], index) => (
          <motion.div
            key={category}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.6 + (index * 0.05), duration: 0.5 }}
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
        transition={{ delay: 1.8, duration: 0.5 }}
        className="text-center"
      >
        <Button variant="outline" className="text-primary">
          Read MatLas Wiki in your language <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
}