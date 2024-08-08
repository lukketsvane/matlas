// app/discover/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import Image from 'next/image'; // Import Image from next/image
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ThumbsUp, MessageSquare } from 'lucide-react';

export default function DiscoverPage() {
  const [materials, setMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('random');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const supabase = createClientComponentClient();

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('materials').select('*');
      
      switch (activeTab) {
        case 'hot':
          query = query.order('views', { ascending: false });
          break;
        case 'likes':
          query = query.order('likes', { ascending: false });
          break;
        case 'random':
          break;
        default:
          query = query.order('name', { ascending: true });
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
  }, [supabase, activeTab]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMaterials();
  };

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
      
      {!loading && !error && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {materials.map((material) => (
            <Link href={`/materials/${material.slug}`} key={material.id}>
              <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="relative pt-[100%] bg-gray-200">
                    {material.header_image && (
                      <Image
                        src={material.header_image}
                        alt={material.name}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-t-lg"
                      />
                    )}
                  </div>
                  <div className="p-2 flex flex-col flex-grow">
                    <h3 className="font-semibold text-sm mb-1 truncate">{material.name}</h3>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2 flex-grow">{material.description}</p>
                    <div className="flex justify-between text-xs text-gray-400 mt-auto">
                      <span className="flex items-center">
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        {material.likes || 0}
                      </span>
                      <span className="flex items-center">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        {material.comments || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}