'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ProfilePage() {
  const [profile, setProfile] = useState({ name: '', bio: '', website: '', avatar_url: '' });
  const [contributions, setContributions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: null, content: null });
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/auth');

      const [profileData, contributionsData] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('contributions').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ]);

      if (profileData.data) setProfile(profileData.data);
      if (contributionsData.data) setContributions(contributionsData.data);
    };
    fetchData();
  }, [router, supabase]);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      {message.content && (
        <Alert variant={message.type === 'error' ? "destructive" : "default"} className="mb-6">
          <AlertDescription>{message.content}</AlertDescription>
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
                  <AvatarImage src={profile.avatar_url} alt={profile.name} />
                  <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <Input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={!isEditing} />
              </div>
              {['name', 'email', 'bio', 'website'].map((field) => (
                <div key={field}>
                  <Label htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                  {field === 'bio' ? (
                    <Textarea
                      id={field}
                      value={profile[field] || ''}
                      onChange={handleChange}
                      disabled={!isEditing || field === 'email'}
                    />
                  ) : (
                    <Input
                      id={field}
                      value={profile[field] || ''}
                      onChange={handleChange}
                      disabled={!isEditing || field === 'email'}
                    />
                  )}
                </div>
              ))}
              <Button type={isEditing ? "submit" : "button"} onClick={() => !isEditing && setIsEditing(true)}>
                {isEditing ? "Save Changes" : "Edit Profile"}
              </Button>
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