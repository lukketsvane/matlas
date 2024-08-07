// app/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Manrope } from 'next/font/google';
import { cn } from '@/lib/utils';
import './globals.css';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { Button } from "@/components/ui/button";
import { Menu } from 'lucide-react';

const fontHeading = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
});

const fontBody = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

export default function RootLayout({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);
    const handleChange = () => setIsDarkMode(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <html lang="en" className={cn(fontHeading.variable, fontBody.variable, isDarkMode ? 'dark' : '')}>
      <SessionContextProvider supabaseClient={supabase}>
        <body className="min-h-screen flex flex-col bg-background text-foreground antialiased">
          <header className="bg-card text-card-foreground p-4">
            <nav className="container mx-auto flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold text-primary">
                MatLas Wiki
              </Link>
              <div className="md:hidden">
                <Button onClick={toggleMenu} variant="ghost">
                  <Menu />
                </Button>
              </div>
              <ul className={`md:flex md:space-x-4 items-center ${isMenuOpen ? 'block' : 'hidden'} md:block absolute md:relative top-16 md:top-0 right-0 md:right-auto bg-card md:bg-transparent p-4 md:p-0 rounded shadow md:shadow-none`}>
                <li><Link href="/" className="hover:text-primary-foreground block py-2 md:py-0" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
                <li><Link href="/materials" className="hover:text-primary-foreground block py-2 md:py-0" onClick={() => setIsMenuOpen(false)}>Materials Library</Link></li>
                {user && (
                  <li><Link href="/materials/new/edit" className="hover:text-primary-foreground block py-2 md:py-0" onClick={() => setIsMenuOpen(false)}>Add Material</Link></li>
                )}
                {user ? (
                  <>
                    <li><Link href="/profile" className="hover:text-primary-foreground block py-2 md:py-0" onClick={() => setIsMenuOpen(false)}>Profile</Link></li>
                    <li><Button onClick={handleSignOut}>Sign Out</Button></li>
                  </>
                ) : (
                  <li><Link href="/auth" onClick={() => setIsMenuOpen(false)}><Button>Sign In</Button></Link></li>
                )}
              </ul>
            </nav>
          </header>
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="bg-card text-card-foreground p-4 mt-8">
            <div className="container mx-auto text-center text-sm">
              &copy; 2024 Materials Wiki. All rights reserved.
            </div>
          </footer>
        </body>
      </SessionContextProvider>
    </html>
  );
}