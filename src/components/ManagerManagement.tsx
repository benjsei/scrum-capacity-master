import { useState } from "react";
import { useManagerStore } from "../store/managerStore";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAgilePracticesStore } from "../store/agilePracticesStore";
import { useScrumTeamStore } from "../store/scrumTeamStore";

export const ManagerManagement = () => {
  const [newManagerName, setNewManagerName] = useState("");
  const [editingManagerId, setEditingManagerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const { managers, addManager, deleteManager, updateManagerName } = useManagerStore();
  const { teams } = useScrumTeamStore();
  const { getPracticesForTeam } = useAgilePracticesStore();

  const handleAddManager = async () => {
    if (newManagerName.trim()) {
      await addManager(newManagerName.trim());
      setNewManagerName("");
    }
  };

  const handleStartEditing = (managerId: string, currentName: string) => {
    setEditingManagerId(managerId);
    setEditingName(currentName);
  };

  const handleSaveEdit = async (managerId: string) => {
    if (editingName.trim()) {
      await updateManagerName(managerId, editingName.trim());
      setEditingManagerId(null);
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
                {editingManagerId === manager.id ? (
                  <div className="flex gap-2">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="max-w-[200px]"
                    />
                    <Button onClick={() => handleSaveEdit(manager.id)}>
                      Enregistrer
                    </Button>
                    <Button variant="outline" onClick={() => setEditingManagerId(null)}>
                      Annuler
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{manager.name}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartEditing(manager.id, manager.name)}
                    >
                      Modifier
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Link
                    to={`/teams/${manager.id}`}
                    className="text-sm"
                  >
                    <Button variant="outline">
                      Équipes
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    onClick={() => deleteManager(manager.id)}
                  >
                    Supprimer
                  </Button>
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