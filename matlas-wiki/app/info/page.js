// app/info/page.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowRight, Book, Users, Lightbulb, Code } from 'lucide-react';

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1 
        className="text-4xl font-bold mb-6 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        About MatLas Wiki
      </motion.h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="contribute">Contribute</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <motion.div {...fadeIn}>
            <Card>
              <CardHeader>
                <CardTitle>Welcome to MatLas Wiki</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  MatLas Wiki is a comprehensive material property atlas, serving as an invaluable resource connecting industrial designers with engineers. Our platform functions as a Wikipedia-like database dedicated to materials, offering a vast library that covers a wide range of materials including metals, polymers, ceramics, and composites.
                </p>
                <p className="mb-4">
                  Our mission is to provide a centralized, user-friendly platform where professionals and enthusiasts can explore, learn about, and compare various materials. Whether you&apos;re an engineer looking for the perfect material for your next project, a designer seeking inspiration, or a student learning about material properties, MatLas Wiki is your go-to resource.
                </p>
                <p>
                  Join us in our journey to make material information accessible, comprehensive, and collaborative. Together, we&apos;re building the future of material science knowledge sharing.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="features">
          <motion.div {...fadeIn}>
            <Card>
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Book className="mr-2 h-5 w-5 mt-1" />
                    <div>
                      <h3 className="font-semibold">Extensive Material Library</h3>
                      <p>Access detailed information on a wide range of materials, from common metals to cutting-edge composites.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Users className="mr-2 h-5 w-5 mt-1" />
                    <div>
                      <h3 className="font-semibold">Collaborative Platform</h3>
                      <p>Contribute your knowledge, edit entries, and engage with a community of material experts and enthusiasts.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Lightbulb className="mr-2 h-5 w-5 mt-1" />
                    <div>
                      <h3 className="font-semibold">Advanced Search and Comparison</h3>
                      <p>Utilize our powerful search tools and comparison features to find the perfect material for your needs.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Code className="mr-2 h-5 w-5 mt-1" />
                    <div>
                      <h3 className="font-semibold">API Access</h3>
                      <p>Integrate MatLas Wiki data into your own applications with our developer-friendly API.</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="community">
          <motion.div {...fadeIn}>
            <Card>
              <CardHeader>
                <CardTitle>Join Our Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  MatLas Wiki thrives on the collective knowledge and passion of its community. Here&apos;s how you can get involved:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  <li>Contribute your expertise by adding or editing material entries</li>
                  <li>Participate in discussions and forums to share insights and ask questions</li>
                  <li>Attend our virtual meetups and webinars featuring industry experts</li>
                  <li>Follow us on social media for the latest updates and material science news</li>
                </ul>
                <p className="mb-4">
                  By joining our community, you&apos;ll connect with professionals, researchers, and enthusiasts from around the world, all united by a passion for materials science.
                </p>
                <Button>
                  Join Our Community <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="contribute">
          <motion.div {...fadeIn}>
            <Card>
              <CardHeader>
                <CardTitle>How to Contribute</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  MatLas Wiki is an open platform that relies on contributions from experts like you. Here&apos;s how you can help expand and improve our material database:
                </p>
                <ol className="list-decimal list-inside space-y-2 mb-4">
                  <li>Create an account and verify your email</li>
                  <li>Browse existing entries to familiarize yourself with our format</li>
                  <li>Click on &quot;Add Material&quot; to create a new entry or &quot;Edit&quot; to improve an existing one</li>
                  <li>Provide accurate, well-sourced information and cite your references</li>
                  <li>Submit your changes for review by our expert moderators</li>
                </ol>
                <p className="mb-4">
                  We also welcome contributions to our codebase. If you&apos;re a developer interested in improving MatLas Wiki&apos;s functionality, check out our GitHub repository:
                </p>
                <Link href="https://github.com/matlas-wiki/matlas" className="text-primary hover:underline">
                  github.com/matlas-wiki/matlas
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}