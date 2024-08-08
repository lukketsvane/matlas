'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Github, Twitter, Linkedin, Globe } from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: null, content: null });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push('/auth');

    try {
      const [profileData, contributionsData] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('contributions').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ]);

      if (profileData.data) setProfile(profileData.data);
      if (contributionsData.data) setContributions(contributionsData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage({ type: 'error', content: 'Failed to load profile data. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => setProfile({ ...profile, [e.target.id]: e.target.value });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage({ type: null, content: null });
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('profiles').upsert({ ...profile, id: user.id, updated_at: new Date() });
    setMessage(error
      ? { type: 'error', content: 'Failed to update profile. Please try again.' }
      : { type: 'success', content: 'Profile updated successfully!' }
    );
    setIsEditing(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      setProfile({ ...profile, avatar_url: publicUrl });
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id);
      setMessage({ type: 'success', content: 'Avatar updated successfully!' });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setMessage({ type: 'error', content: 'Failed to upload avatar. Please try again.' });
    }
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Your Profile</h1>
      {message.content && (
        <Alert variant={message.type === 'error' ? "destructive" : "default"} className="mb-6">
          <AlertDescription>{message.content}</AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile?.avatar_url} alt={profile?.name} />
                  <AvatarFallback>{profile?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <Input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={!isEditing} />
              </div>
              <Tabs defaultValue="basic">
                <TabsList>
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="social">Social Links</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-4">
                  {['name', 'email', 'bio', 'location', 'website'].map((field) => (
                    <div key={field}>
                      <Label htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                      {field === 'bio' ? (
                        <Textarea
                          id={field}
                          value={profile?.[field] || ''}
                          onChange={handleChange}
                          disabled={!isEditing || field === 'email'}
                          className="mt-1"
                        />
                      ) : (
                        <Input
                          id={field}
                          value={profile?.[field] || ''}
                          onChange={handleChange}
                          disabled={!isEditing || field === 'email'}
                          className="mt-1"
                        />
                      )}
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="social" className="space-y-4">
                  {['github_username', 'twitter_username', 'linkedin_url'].map((field) => (
                    <div key={field}>
                      <Label htmlFor={field}>{field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Label>
                      <Input
                        id={field}
                        value={profile?.[field] || ''}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </form>
          </CardContent>
          <CardFooter>
            <Button type={isEditing ? "submit" : "button"} onClick={() => isEditing ? handleProfileUpdate() : setIsEditing(true)}>
              {isEditing ? "Save Changes" : "Edit Profile"}
            </Button>
          </CardFooter>
        </Card>
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col space-y-2">
              {profile?.github_username && (
                <a href={`https://github.com/${profile.github_username}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-blue-500 hover:underline">
                  <Github size={20} />
                  <span>{profile.github_username}</span>
                </a>
              )}
              {profile?.twitter_username && (
                <a href={`https://twitter.com/${profile.twitter_username}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-blue-500 hover:underline">
                  <Twitter size={20} />
                  <span>{profile.twitter_username}</span>
                </a>
              )}
              {profile?.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-blue-500 hover:underline">
                  <Linkedin size={20} />
                  <span>LinkedIn Profile</span>
                </a>
              )}
              {profile?.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-blue-500 hover:underline">
                  <Globe size={20} />
                  <span>Personal Website</span>
                </a>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Your Contributions</CardTitle>
            </CardHeader>
            <CardContent>
              {contributions.length > 0 ? (
                <ul className="space-y-4">
                  {contributions.map((contribution) => (
                    <li key={contribution.id} className="border-b pb-4 last:border-b-0">
                      <h3 className="font-semibold">{contribution.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(contribution.created_at).toLocaleDateString()}
                      </p>
                      <p className="mt-2">{contribution.description}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>You haven&apos;t made any contributions yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-12 w-64 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-32" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}