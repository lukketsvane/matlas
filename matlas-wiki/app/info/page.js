/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Book, Users, Lightbulb, Twitter, Facebook, Youtube, Linkedin, Instagram } from 'lucide-react';

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div 
        className="flex items-center justify-center mb-8"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Image
          src="/mat-driven.jpg"
          alt="MatLas Wiki Logo"
          width={200}
          height={200}
        />
      </motion.div>

      <motion.h1 
        className="text-4xl font-bold mb-6 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        About MatLas Wiki
      </motion.h1>

      <p className="mb-6 text-center">
        MatLas Wiki serves as a design agency and materials library, focusing on material innovation and bridging the gap between material developers and industries.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="expertise">Expertise</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <div className="flex flex-col md:flex-row">
          <TabsContent value="overview" className="flex-1">
            <motion.div {...fadeIn}>
              <h2 className="text-2xl font-bold mb-4">Overview</h2>
              <p className="mb-4">
                MatLas Wiki connects industries with cutting-edge materials, offering resources to support innovation in areas like packaging, architecture, and fashion.
              </p>
              <p className="mb-4">
                The platform's mission is to drive material innovation by facilitating strategic projects and providing access to curated materials and expertise.
              </p>
              <p>
                MatLas Wiki aims to help industries explore and implement advanced materials to enhance their products and services.
              </p>
            </motion.div>
          </TabsContent>

          <TabsContent value="services" className="flex-1">
            <motion.div {...fadeIn}>
              <h2 className="text-2xl font-bold mb-4">Services</h2>
              <p className="mb-4">
                A range of services is offered to optimize material use and application across industries.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Book className="mr-2 h-5 w-5 mt-1" />
                  <div>
                    <h3 className="font-semibold">Consulting</h3>
                    <p>Tailored advice on material selection, sourcing, and application, considering factors like performance, sustainability, and cost.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Users className="mr-2 h-5 w-5 mt-1" />
                  <div>
                    <h3 className="font-semibold">Curation</h3>
                    <p>Custom-curated material portfolios aligned with industry needs, brand ethos, and project goals.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Lightbulb className="mr-2 h-5 w-5 mt-1" />
                  <div>
                    <h3 className="font-semibold">Education</h3>
                    <p>Workshops, seminars, and resources designed to keep teams informed about the latest in material innovations.</p>
                  </div>
                </li>
              </ul>
            </motion.div>
          </TabsContent>

          <TabsContent value="expertise" className="flex-1">
            <motion.div {...fadeIn}>
              <h2 className="text-2xl font-bold mb-4">Expertise</h2>
              <p className="mb-4">
                MatLas Wiki combines design thinking and materials science to offer deep expertise in sustainable and cutting-edge materials, trend forecasting, and more.
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>In-depth knowledge of sustainable materials</li>
                <li>Access to a global network of material experts</li>
                <li>Trend forecasting and market intelligence</li>
                <li>Comprehensive product and experience design</li>
                <li>Specialized material sourcing and consulting</li>
                <li>Sustainability assessments and life cycle analysis</li>
                <li>Creative material application workshops</li>
              </ul>
              <p>
                This expertise supports clients in anticipating future material needs and integrating innovative solutions into their projects.
              </p>
            </motion.div>
          </TabsContent>

          <TabsContent value="contact" className="flex-1">
            <motion.div {...fadeIn}>
              <h2 className="text-2xl font-bold mb-4">Contact</h2>
              <p className="mb-4">
                MatLas Wiki operates from London, Dallas, and Bilbao, and is available for material consulting, partnership discussions, and educational inquiries.
              </p>
              <p className="mb-4">
                Reach out for consultations, service information, partnership opportunities, or to learn more about workshops and other programs.
              </p>
              <Button>
                Get in Touch <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </TabsContent>
        </div>
      </Tabs>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-12"
      >
        <h2 className="text-2xl font-bold mb-4">Industry Applications</h2>
        <p className="mb-4">
          MatLas Wiki supports innovation in various sectors, including aerospace, fashion, architecture, and consumer electronics. The platform assists in material selection and application to enhance product development and sustainability efforts.
        </p>
        <p className="mb-4">
          Examples include the adoption of biodegradable packaging, integration of advanced composites in automotive design, and development of wearable technology.
        </p>
        <p>
          The goal is to enable industries to make informed material choices that lead to better products and sustainable practices.
        </p>
      </motion.div>

      <motion.div 
        className="mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <Separator className="my-8" />
        <div className="flex justify-center space-x-6">
          <Link href="#" className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100">
            <Twitter className="h-6 w-6" />
          </Link>
          <Link href="#" className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100">
            <Facebook className="h-6 w-6" />
          </Link>
          <Link href="#" className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100">
            <Youtube className="h-6 w-6" />
          </Link>
          <Link href="#" className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100">
            <Linkedin className="h-6 w-6" />
          </Link>
          <Link href="#" className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100">
            <Instagram className="h-6 w-6" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
