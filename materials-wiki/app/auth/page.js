'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('signup');
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      setEmail(storedEmail);
      setActiveTab('signin');
    }
  }, []);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signUp({
      email, password, options: { data: { name } }
    });
    if (error) setError(error.message);
    else {
      localStorage.setItem('userEmail', email);
      router.push('/');
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else {
      localStorage.setItem('userEmail', email);
      router.push('/');
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-start bg-background py-6 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-primary">Materials Wiki</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">The free online encyclopedia for materials that anyone can edit.</p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 gap-4">
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="signin">Sign In</TabsTrigger>
            </TabsList>
            <TabsContent value="signup">
              <form className="space-y-4" onSubmit={handleSignUp}>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" required value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" type="email" placeholder="your@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                {error && <p className="text-red-500">{error}</p>}
                <Button type="submit" className="w-full">Sign Up</Button>
              </form>
            </TabsContent>
            <TabsContent value="signin">
              <form className="space-y-4" onSubmit={handleSignIn}>
                <div>
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" type="email" placeholder="your@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                {error && <p className="text-red-500">{error}</p>}
                <Button type="submit" className="w-full">Sign In</Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}