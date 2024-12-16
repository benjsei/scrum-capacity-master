import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TeamManagementProps {
  managerId: string | null;
}

export const TeamManagement = ({ managerId: propManagerId }: TeamManagementProps) => {
  const navigate = useNavigate();
  const { managerId: urlManagerId } = useParams();
  const managerId = urlManagerId || propManagerId;
  
  const [teams, setTeams] = useState<any[]>([]);
  const [newTeamName, setNewTeamName] = useState("");
  const [manager, setManager] = useState<any>(null);

  useEffect(() => {
    if (managerId) {
      loadTeams();
      loadManager();
    }
  }, [managerId]);

  const loadManager = async () => {
    if (!managerId) return;

    const { data, error } = await supabase
      .from('managers')
      .select('*')
      .eq('id', managerId)
      .single();

    if (error) {
      toast.error("Erreur lors du chargement du manager");
      return;
    }

    setManager(data);
  };

  const loadTeams = async () => {
    if (!managerId) return;

    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('manager_id', managerId);

    if (error) {
      toast.error("Erreur lors du chargement des équipes");
      return;
    }

    setTeams(data || []);
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !managerId) return;

    const { error } = await supabase
      .from('teams')
      .insert([{ name: newTeamName, manager_id: managerId }]);

    if (error) {
      toast.error("Erreur lors de la création de l'équipe");
      return;
    }

    toast.success("Équipe créée avec succès");
    setNewTeamName("");
    loadTeams();
  };

  const handleDeleteTeam = async (teamId: string) => {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (error) {
      toast.error("Erreur lors de la suppression de l'équipe");
      return;
    }

    toast.success("Équipe supprimée avec succès");
    loadTeams();
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <header className="text-center mb-8 relative">
        <div className="absolute left-0 top-0">
          <Button variant="outline" size="icon" onClick={() => navigate('/managers')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-primary">Pratiques et Capacité Scrum</h1>
        <p className="text-muted-foreground">Gérez la capacité de votre équipe et suivez la performance des sprints</p>
      </header>

      {manager && (
        <h2 className="text-2xl font-semibold mb-4">
          Équipes de {manager.name}
        </h2>
      )}

      <form onSubmit={handleCreateTeam} className="flex gap-4 mb-6">
        <Input
          placeholder="Nom de la nouvelle équipe"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </form>

      <div className="grid gap-4">
        {teams.map((team) => (
          <Card key={team.id} className="p-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">{team.name}</h3>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => navigate(`/team/${team.id}`)}
                >
                  Voir détails
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleDeleteTeam(team.id)}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};