import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useScrumTeamStore } from '../store/scrumTeamStore';
import { useAgilePracticesStore } from '../store/agilePracticesStore';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ListTodo, SparklesIcon, Percent } from 'lucide-react';

export const TeamManagement = () => {
  const [newTeamName, setNewTeamName] = useState('');
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const { teams, addTeam, deleteTeam, setActiveTeam, activeTeam, updateTeamName } = useScrumTeamStore();
  const { getPracticesForTeam } = useAgilePracticesStore();
  const navigate = useNavigate();

  const handleCreateTeam = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!newTeamName.trim()) {
      toast.error('Please enter a team name');
      return;
    }

    const newTeam = {
      id: Date.now().toString(),
      name: newTeamName.trim(),
      createdAt: new Date().toISOString(),
      resources: [],
    };

    addTeam(newTeam);
    setNewTeamName('');
    toast.success('Team created successfully!');
  };

  const handleStartEditing = (teamId: string, currentName: string) => {
    setEditingTeamId(teamId);
    setEditingName(currentName);
  };

  const handleSaveEdit = (teamId: string) => {
    if (!editingName.trim()) {
      toast.error('Team name cannot be empty');
      return;
    }
    updateTeamName(teamId, editingName.trim());
    setEditingTeamId(null);
    toast.success('Team name updated successfully!');
  };

  const handleNavigateToSprints = (team: any) => {
    setActiveTeam(team);
    navigate(`/team/${team.id}`);
  };

  const handleNavigateToPractices = (team: any) => {
    setActiveTeam(team);
    navigate(`/team/${team.id}/practices`);
  };

  const getTeamProgress = (teamId: string) => {
    const practices = getPracticesForTeam(teamId);
    if (practices.length === 0) return 0;
    return Math.round((practices.filter(p => p.isCompleted).length / practices.length) * 100);
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="space-y-4">
          <Label htmlFor="teamName">New Team Name</Label>
          <form onSubmit={handleCreateTeam} className="flex gap-2">
            <Input
              id="teamName"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Enter team name"
            />
            <Button type="submit">Create Team</Button>
          </form>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Teams</h3>
          <div className="space-y-2">
            {teams.map((team) => (
              <div key={team.id} className="flex items-center justify-between p-2 border rounded">
                {editingTeamId === team.id ? (
                  <div className="flex gap-2 flex-1 mr-2">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      placeholder="Enter new name"
                    />
                    <Button onClick={() => handleSaveEdit(team.id)}>Save</Button>
                    <Button variant="outline" onClick={() => setEditingTeamId(null)}>Cancel</Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <span>{team.name}</span>
                      <span className="text-sm text-muted-foreground">
                        <Percent className="h-4 w-4 inline mr-1" />
                        {getTeamProgress(team.id)}%
                      </span>
                    </div>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => handleNavigateToSprints(team)}
                      >
                        <SparklesIcon className="w-4 h-4 mr-2" />
                        Sprints
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleNavigateToPractices(team)}
                      >
                        <ListTodo className="w-4 h-4 mr-2" />
                        Pratiques
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleStartEditing(team.id, team.name)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => deleteTeam(team.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};