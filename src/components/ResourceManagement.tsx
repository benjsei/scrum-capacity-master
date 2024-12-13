import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useResourceStore } from "../store/resourceStore";
import { useScrumTeamStore } from "../store/scrumTeamStore";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useEffect } from "react";

export const ResourceManagement = () => {
  const { resources, updateResource, deleteResource } = useResourceStore();
  const { activeTeam, loadTeams } = useScrumTeamStore();

  useEffect(() => {
    // Recharger les équipes après chaque modification pour avoir les données à jour
    loadTeams();
  }, [loadTeams]);

  const handleUpdateResource = async (id: string, name: string) => {
    if (!activeTeam) {
      toast.error("Veuillez sélectionner une équipe");
      return;
    }

    if (name.trim()) {
      await updateResource(id, { name: name.trim() });
      await loadTeams(); // Recharger les données après la mise à jour
      toast.success("Ressource mise à jour");
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!activeTeam) {
      toast.error("Veuillez sélectionner une équipe");
      return;
    }

    await deleteResource(id);
    await loadTeams(); // Recharger les données après la suppression
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