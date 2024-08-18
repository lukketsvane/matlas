// layout.js
'use client';
import { useState, useEffect, useRef } from 'react';
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

const manrope = Manrope({ subsets: ['latin'], display: 'swap', variable: '--font-sans' });

export default function RootLayout({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const supabase = createClientComponentClient();
  const pathname = usePathname();
  const lastScrollTop = useRef(0);

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

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const NavLink = ({ href, icon: Icon, tooltip }) => {
    const isActive = pathname === href;
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={href} className={cn(
              "p-2 rounded-md transition-colors duration-200",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground"
            )} onClick={() => setIsSidebarOpen(false)}>
              <Icon className="h-6 w-6" />
            </Link>
          </TooltipTrigger>
          <TooltipContent><p>{tooltip}</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <html lang="en" className={cn(manrope.variable, isDarkMode ? 'dark' : '')}>
      <SessionContextProvider supabaseClient={supabase}>
        <body className="flex h-screen bg-background text-foreground antialiased">
          <aside className={`fixed inset-y-0 z-30 flex flex-col justify-between bg-card text-card-foreground w-16 md:w-20 transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${isMenuVisible ? '' : '-translate-y-full'}`}>
            <div className="flex flex-col items-center mt-4 space-y-4">
              <Link href="/" className="block mb-4">
                <Image src="/logo-icon.svg" alt="MatLas Wiki Logo" width={32} height={32} className={isDarkMode ? "filter invert" : ""} />
              </Link>
              <NavLink href="/" icon={Home} tooltip="Home" />
              <NavLink href="/discover" icon={Search} tooltip="Discover" />
              <NavLink href="/materials" icon={Library} tooltip="Materials" />
              {user && <NavLink href="/projects" icon={FolderOpen} tooltip="Projects" />}
              {user && <NavLink href="/materials/category/new/new/new/edit" icon={PlusCircle} tooltip="Add Material" />}
            </div>
            <div className="flex flex-col items-center mb-4 space-y-4">
              {user && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href="/profile" className="p-2 rounded-md transition-colors duration-200 hover:bg-accent hover:text-accent-foreground" onClick={() => setIsSidebarOpen(false)}>
                        <Image src={user.user_metadata.avatar_url || "/default-avatar.png"} alt="User Avatar" width={24} height={24} className="rounded-full" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent><p>Profile</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <NavLink href="/info" icon={Info} tooltip="Information" />
              <Button onClick={toggleDarkMode} variant="ghost" size="icon" className="text-foreground">
                {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
              </Button>
              {user ? (
                <Button onClick={handleSignOut} variant="ghost" size="icon" className="text-foreground">
                  <LogOut className="h-6 w-6" />
                </Button>
              ) : (
                <Link href="/auth">
                  <Button variant="ghost" size="icon" className="text-foreground">
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
            <main className="flex-grow overflow-auto">{children}</main>
          </div>
          {isSidebarOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)} />
          )}
        </body>
      </SessionContextProvider>
    </html>
  );
}