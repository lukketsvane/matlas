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
import { Home, Search, Library, PlusCircle, LogOut, LogIn, Menu, Info, Sun, Moon, FolderOpen } from 'lucide-react';

const font = Manrope({ subsets: ['latin'], display: 'swap', variable: '--font-main' });

export default function RootLayout({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const supabase = createClientComponentClient();
  const pathname = usePathname();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);
    const handleChange = () => setIsDarkMode(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
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
                  ? "bg-primary text-primary-foreground" 
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
        <body className="flex h-screen overflow-hidden">
          <aside className="sidebar">
            <div className="flex flex-col h-full justify-between py-4">
              <div className="flex flex-col items-center space-y-4">
                <Link href="/" className="mb-4">
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
              <div className="flex flex-col items-center space-y-4 mt-auto">
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
            </div>
          </aside>
          <div className="flex-grow flex flex-col">
            <header className="bg-card text-card-foreground p-4 md:hidden">
              <Button onClick={toggleSidebar} variant="ghost">
                <Menu className="h-6 w-6" />
              </Button>
            </header>
            <main className="main-content">
              {children}
            </main>
          </div>
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={toggleSidebar}
            />
          )}
        </body>
      </SessionContextProvider>
    </html>
  );
}
