// app/profile/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase, uploadFileToSupabase } from '../../lib/db';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [contributions, setContributions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const router = useRouter();

  const fetchUserProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) {
        console.error('Error fetching profile:', error);
      } else if (data) {
        setName(data.name || '');
        setBio(data.bio || '');
        setWebsite(data.website || '');
        setAvatarUrl(data.avatar_url || '');
      }
    } else {
      router.push('/auth');
    }
  }, [router]);

  const fetchUserContributions = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('contributions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching contributions:', error);
      } else {
        setContributions(data);
      }
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
    fetchUserContributions();
  }, [fetchUserProfile, fetchUserContributions]);

  async function handleProfileUpdate(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        name,
        bio,
        website,
        avatar_url: avatarUrl,
        updated_at: new Date(),
      });

    if (error) {
      setError('Failed to update profile. Please try again.');
    } else {
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    }
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const publicUrl = await uploadFileToSupabase(file, 'avatars', user.id);
      setAvatarUrl(publicUrl);
      
      // Update the profile with the new avatar URL
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      setSuccess('Avatar updated successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setError('Failed to upload avatar. Please try again.');
    }
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="mb-6">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={avatarUrl} alt={name} />
                  <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                </Avatar>
                <Input 
                  type="file" 
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email} disabled />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                  id="bio" 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input 
                  id="website" 
                  value={website} 
                  onChange={(e) => setWebsite(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              {isEditing ? (
                <Button type="submit">Save Changes</Button>
              ) : (
                <Button type="button" onClick={() => setIsEditing(true)}>Edit Profile</Button>
              )}
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
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
                    <p>{contribution.description}</p>
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
  );
}