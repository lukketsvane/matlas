// app/auth/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { supabase } from '../../lib/db';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        }
      }
    });
    if (error) setError(error.message);
    else router.push('/');
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) setError(error.message);
    else router.push('/');
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-background py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-primary sm:text-4xl">Materials Wiki</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          The free online encyclopedia for materials that anyone can edit.
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <Tabs defaultValue="signup" className="w-full">
            <TabsList className="grid w-full grid-cols-2 gap-4">
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="signin">Sign In</TabsTrigger>
            </TabsList>
            <TabsContent value="signup">
              <form className="mt-6 space-y-6" onSubmit={handleSignUp}>
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
                <Button type="submit" className="w-full">
                  Sign Up
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signin">
              <form className="mt-6 space-y-6" onSubmit={handleSignIn}>
                <div>
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" type="email" placeholder="your@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                {error && <p className="text-red-500">{error}</p>}
                <Button type="submit" className="w-full">
                  Sign In
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}