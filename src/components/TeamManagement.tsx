import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { useManagerStore } from "../store/managerStore";
import { useScrumTeamStore } from "../store/scrumTeamStore";
import { toast } from "sonner";
import { TeamProgressChart } from "./TeamProgressChart";
import { TeamVelocityChart } from "./TeamVelocityChart";
import { TeamsCommitmentChart } from "./TeamsCommitmentChart";
import { TeamPodium } from "./TeamPodium";

export const TeamManagement = () => {
  const { managerId } = useParams();
  const navigate = useNavigate();
  const [newTeamName, setNewTeamName] = useState("");
  const { managers } = useManagerStore();
  const { teams, addTeam, deleteTeam, updateTeamName } = useScrumTeamStore();
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const manager = managers.find(m => m.id === managerId);
  const managerTeams = teams.filter(team => team.managerId === managerId);

  const handleAddTeam = async () => {
    if (newTeamName.trim() && managerId) {
      await addTeam(newTeamName, managerId);
      setNewTeamName("");
      toast.success("Équipe ajoutée avec succès");
    }
  };

  const handleStartEditing = (teamId: string, currentName: string) => {
    setEditingTeamId(teamId);
    setEditingName(currentName);
  };

  const handleSaveEdit = async (teamId: string) => {
    if (editingName.trim()) {
      await updateTeamName(teamId, editingName.trim());
      setEditingTeamId(null);
      setEditingName("");
      toast.success("Nom de l'équipe mis à jour");
    }
  };

  const handleCancelEdit = () => {
    setEditingTeamId(null);
    setEditingName("");
  };

  const handleDeleteTeam = async (teamId: string) => {
    await deleteTeam(teamId);
    toast.success("Équipe supprimée avec succès");
  };

  if (!manager) {
    return null;
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/managers")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold">Équipes de {manager.name}</h1>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Nom de l'équipe"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            className="max-w-sm"
          />
          <Button onClick={handleAddTeam}>Ajouter</Button>
        </div>

        <div className="rounded-md border">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium">Nom</th>
                  <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {managerTeams.map((team) => (
                  <tr
                    key={team.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle">
                      {editingTeamId === team.id ? (
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="max-w-sm"
                        />
                      ) : (
                        team.name
                      )}
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/team/${team.id}`)}
                        >
                          Détails
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/team/${team.id}/practices`)}
                        >
                          Pratiques
                        </Button>
                        {editingTeamId === team.id ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSaveEdit(team.id)}
                            >
                              Enregistrer
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCancelEdit}
                            >
                              Annuler
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartEditing(team.id, team.name)}
                          >
                            Modifier
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteTeam(team.id)}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <TeamPodium />
        
        <div className="grid gap-6 mt-6">
          <TeamProgressChart />
          <TeamVelocityChart />
          <TeamsCommitmentChart />
        </div>
      </div>
    </div>
  );
};