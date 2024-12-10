import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useScrumTeamStore } from '../store/scrumTeamStore';
import { toast } from 'sonner';

export const TeamManagement = () => {
  const [newTeamName, setNewTeamName] = useState('');
  const { teams, addTeam, deleteTeam, setActiveTeam, activeTeam } = useScrumTeamStore();

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) {
      toast.error('Please enter a team name');
      return;
    }

    const newTeam = {
      id: Date.now().toString(),
      name: newTeamName.trim(),
      createdAt: new Date().toISOString(),
    };

    addTeam(newTeam);
    setNewTeamName('');
    toast.success('Team created successfully!');
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="space-y-4">
          <Label htmlFor="teamName">New Team Name</Label>
          <div className="flex gap-2">
            <Input
              id="teamName"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Enter team name"
            />
            <Button onClick={handleCreateTeam}>Create Team</Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Teams</h3>
          <div className="space-y-2">
            {teams.map((team) => (
              <div key={team.id} className="flex items-center justify-between p-2 border rounded">
                <span>{team.name}</span>
                <div className="space-x-2">
                  <Button
                    variant={activeTeam?.id === team.id ? "default" : "outline"}
                    onClick={() => setActiveTeam(team)}
                  >
                    {activeTeam?.id === team.id ? 'Selected' : 'Select'}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => deleteTeam(team.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};