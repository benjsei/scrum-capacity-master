import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useResourceStore } from "../store/resourceStore";
import { useScrumTeamStore } from "../store/scrumTeamStore";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const ResourceManagement = () => {
  const { resources, setResources, updateResource, deleteResource } = useResourceStore();
  const { activeTeam, loadTeams } = useScrumTeamStore();

  // Load resources when component mounts or when activeTeam changes
  useEffect(() => {
    const loadResources = async () => {
      if (!activeTeam) return;

      try {
        console.log('Loading resources for team:', activeTeam.id);
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .eq('team_id', activeTeam.id);

        if (error) {
          console.error('Error loading resources:', error);
          throw error;
        }

        console.log('Loaded resources:', data);
        const formattedResources = data.map(resource => ({
          id: resource.id,
          name: resource.name,
          capacityPerDay: resource.capacity_per_day || 1,
          teamId: resource.team_id
        }));

        setResources(formattedResources);
      } catch (error) {
        console.error('Error loading resources:', error);
        toast.error("Erreur lors du chargement des ressources");
      }
    };

    loadResources();
  }, [activeTeam, setResources]);

  // Recharger les équipes après chaque modification
  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  const handleUpdateResource = async (id: string, name: string) => {
    if (!activeTeam) {
      toast.error("Veuillez sélectionner une équipe");
      return;
    }

    if (name.trim()) {
      try {
        await updateResource(id, { name: name.trim() });
        await loadTeams();
        toast.success("Ressource mise à jour");
      } catch (error) {
        console.error('Error updating resource:', error);
        toast.error("Erreur lors de la mise à jour de la ressource");
      }
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!activeTeam) {
      toast.error("Veuillez sélectionner une équipe");
      return;
    }

    try {
      await deleteResource(id);
      await loadTeams();
      toast.success("Ressource supprimée");
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error("Erreur lors de la suppression de la ressource");
    }
  };

  // Filtrer les ressources pour n'afficher que celles de l'équipe active
  const teamResources = resources.filter(r => 
    activeTeam ? r.teamId === activeTeam.id : false
  );

  if (!activeTeam) {
    return (
      <div className="text-center text-muted-foreground">
        Veuillez sélectionner une équipe pour gérer les ressources
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {teamResources.map((resource) => (
          <div key={resource.id} className="flex items-center gap-2">
            <Input
              defaultValue={resource.name}
              onBlur={(e) => handleUpdateResource(resource.id, e.target.value)}
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteResource(resource.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {teamResources.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucune ressource</p>
        )}
      </div>
    </div>
  );
};