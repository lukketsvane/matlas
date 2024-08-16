// components/AddToProjectDialog.js
import { useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from 'lucide-react';

export default function AddToProjectDialog({ material }) {
  const [isOpen, setIsOpen] = useState(false);
  const [userProjects, setUserProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProjectName, setNewProjectName] = useState('');
  const session = useSession();
  const supabase = createClientComponentClient();

  const fetchUserProjects = async () => {
    if (!session) return;
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('user_id', session.user.id);
      if (error) throw error;
      setUserProjects(data);
    } catch (error) {
      console.error('Error fetching user projects:', error);
    }
  };

  const saveMaterialToProject = async () => {
    if (!selectedProject) return;
    try {
      const { error } = await supabase
        .from('project_materials')
        .insert({ project_id: selectedProject, material_id: material.id });
      if (error) throw error;
      alert('Material saved to project successfully!');
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving material to project:', error);
      alert('Failed to save material to project');
    }
  };

  const createNewProject = async () => {
    if (!newProjectName.trim()) return;
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{ name: newProjectName, user_id: session.user.id }])
        .select()
        .single();
      if (error) throw error;
      setUserProjects([...userProjects, data]);
      setSelectedProject(data.id);
      setNewProjectName('');
    } catch (error) {
      console.error('Error creating new project:', error);
      alert('Failed to create new project');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (open) fetchUserProjects(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Add to Project</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Project</DialogTitle>
        </DialogHeader>
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger>
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {userProjects.map((project) => (
              <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center mt-4">
          <Input
            placeholder="New Project Name"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            className="mr-2"
          />
          <Button onClick={createNewProject} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={saveMaterialToProject} className="mt-4">Save to Project</Button>
      </DialogContent>
    </Dialog>
  );
}