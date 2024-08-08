'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Book, Users, Lightbulb, Code, Twitter, Facebook, Youtube, Linkedin, Instagram } from 'lucide-react';

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isDarkMode, setIsDarkMode] = useState(false);

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
          className={`transition-all duration-200 ${isDarkMode ? "filter invert" : ""}`}
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="expertise">Expertise</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <motion.div {...fadeIn}>
            <Card>
              <CardHeader>
                <CardTitle>Welcome to MatLas Wiki</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  MatLas Wiki is a pioneering design agency and materials library, offering a meticulously curated range of over 300 innovative materials. We stand at the forefront of material innovation, serving as the crucial bridge between cutting-edge material developers and forward-thinking industries seeking to apply these revolutionary solutions.
                </p>
                <p className="mb-4">
                  Our mission is to catalyze innovation by enabling strategic projects and fostering connections across the materials landscape. Whether you're a fast-moving consumer goods company looking to revolutionize packaging, an architectural studio pushing the boundaries of sustainable building, or a fashion brand aiming to disrupt the industry with next-generation textiles, MatLas Wiki is your ultimate resource for material intelligence and sourcing.
                </p>
                <p>
                  Join us on an exhilarating journey as we explore the future of materials and their transformative impact on design, industry, and sustainability. At MatLas Wiki, we're not just observing the future – we're actively shaping it, one innovative material at a time.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="services">
          <motion.div {...fadeIn}>
            <Card>
              <CardHeader>
                <CardTitle>Our Services</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  At MatLas Wiki, we offer a comprehensive suite of services designed to revolutionize how industries interact with and utilize materials. Our offerings span three main realms:
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Book className="mr-2 h-5 w-5 mt-1" />
                    <div>
                      <h3 className="font-semibold">Consulting</h3>
                      <p>Our expert consultants provide tailored advice on material selection, sourcing, and application for your specific projects. We dive deep into your needs, considering factors such as performance requirements, sustainability goals, and cost constraints to recommend the perfect materials for your application.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Users className="mr-2 h-5 w-5 mt-1" />
                    <div>
                      <h3 className="font-semibold">Curation</h3>
                      <p>We meticulously curate materials tailored to your industry needs and innovation goals. Our vast library of over 300 materials is constantly updated with the latest innovations. We create customized material portfolios that align with your brand ethos, project requirements, and future aspirations.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Lightbulb className="mr-2 h-5 w-5 mt-1" />
                    <div>
                      <h3 className="font-semibold">Education</h3>
                      <p>Knowledge is power, especially in the fast-evolving world of materials. We offer workshops, seminars, and comprehensive resources to keep you at the forefront of material innovations. Our educational programs are designed to inspire creativity, foster innovation, and empower your team to leverage cutting-edge materials effectively.</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="expertise">
          <motion.div {...fadeIn}>
            <Card>
              <CardHeader>
                <CardTitle>Our Expertise</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  MatLas Wiki brings together a unique blend of design thinking and materials science expertise, positioning us at the cutting edge of material innovation:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  <li>Comprehensive knowledge of cutting-edge and sustainable materials across various industries</li>
                  <li>Extensive global network of material manufacturers, researchers, and makers</li>
                  <li>Advanced market intelligence and trend forecasting capabilities</li>
                  <li>End-to-end product and experience design, from concept to realization</li>
                  <li>Specialized material sourcing and application consulting for diverse sectors</li>
                  <li>Sustainability assessment and life cycle analysis of materials</li>
                  <li>Innovation workshops and creative material application ideation</li>
                </ul>
                <p className="mb-4">
                  Our team of experts, led by visionary partners Purva Chawla and Adele Orcajada, leverages this multidisciplinary approach to drive innovation across industries. With backgrounds spanning design, engineering, materials science, and sustainability, our team is uniquely positioned to tackle the most complex material challenges and uncover groundbreaking solutions.
                </p>
                <p>
                  At MatLas Wiki, we don't just follow trends – we set them. Our expertise allows us to anticipate future material needs, identify emerging technologies, and guide our clients towards materials that will define the products and experiences of tomorrow.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="contact">
          <motion.div {...fadeIn}>
            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  MatLas Wiki operates globally, with main hubs in London, UK, Dallas, Texas, and Bilbao, Spain. Our international presence allows us to tap into diverse material innovation ecosystems and serve clients worldwide.
                </p>
                <p className="mb-4">
                  We're always excited to connect with potential clients, collaborators, and material enthusiasts. Whether you're looking to revolutionize your product line, seeking sustainable material alternatives, or simply curious about the latest in material innovation, we're here to help.
                </p>
                <p className="mb-4">
                  Reach out to us to:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  <li>Schedule a consultation with our material experts</li>
                  <li>Learn more about our services and how we can tailor them to your needs</li>
                  <li>Explore partnership opportunities or collaborative projects</li>
                  <li>Inquire about our upcoming workshops and educational programs</li>
                  <li>Share your material innovation challenges and brainstorm solutions</li>
                </ul>
                <p className="mb-6">
                  Let's embark on a journey of material discovery and innovation together. The future of materials is here, and MatLas Wiki is your guide to harnessing its full potential.
                </p>
                <Button>
                  Get in Touch <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-12"
      >
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4">Our Global Impact</h2>
            <p className="mb-4">
              MatLas Wiki's influence extends across continents and industries. Our work has catalyzed innovations in sectors ranging from aerospace to fashion, architecture to consumer electronics. We've helped companies reduce their carbon footprint through smart material choices, enabled designers to create products that push the boundaries of form and function, and supported researchers in bringing lab-grown materials to market.
            </p>
            <p className="mb-4">
              Through our global network and comprehensive approach, we've:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Facilitated the adoption of biodegradable packaging materials by major FMCG brands</li>
              <li>Collaborated with architects to integrate self-healing concrete in groundbreaking building designs</li>
              <li>Assisted fashion houses in developing wearable technology using smart textiles</li>
              <li>Supported automotive manufacturers in lightweighting vehicles with advanced composites</li>
              <li>Helped medical device companies improve patient outcomes with biocompatible materials</li>
            </ul>
            <p>
              At MatLas Wiki, we're not just observers of change – we're active participants in shaping a more sustainable, innovative, and materials-driven future. Join us in this exciting journey of discovery and transformation.
            </p>
          </CardContent>
        </Card>
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