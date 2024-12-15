import { useState } from "react";
import { useManagerStore } from "../store/managerStore";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAgilePracticesStore } from "../store/agilePracticesStore";
import { useScrumTeamStore } from "../store/scrumTeamStore";

export const ManagerManagement = () => {
  const [newManagerName, setNewManagerName] = useState("");
  const { managers, addManager, deleteManager } = useManagerStore();
  const { teams } = useScrumTeamStore();
  const { getPracticesForTeam } = useAgilePracticesStore();

  const handleAddManager = async () => {
    if (newManagerName.trim()) {
      await addManager(newManagerName.trim());
      setNewManagerName("");
    }
  };

  const getManagerProgress = (managerId: string) => {
    const managerTeams = teams.filter(team => team.managerId === managerId);
    if (managerTeams.length === 0) return 0;
    
    let totalProgress = 0;
    managerTeams.forEach(team => {
      const practices = getPracticesForTeam(team.id);
      if (practices.length > 0) {
        totalProgress += (practices.filter(p => p.isCompleted).length / practices.length);
      }
    });
    
    return Math.round((totalProgress / managerTeams.length) * 100);
  };

  return (
    <Card className="p-6">
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Nom du manager"
          value={newManagerName}
          onChange={(e) => setNewManagerName(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleAddManager}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>

      <div className="space-y-4">
        {managers.map((manager) => (
          <div
            key={manager.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{manager.name}</span>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/teams?managerId=${manager.id}`}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <Users className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => deleteManager(manager.id)}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <Progress value={getManagerProgress(manager.id)} className="h-2" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};