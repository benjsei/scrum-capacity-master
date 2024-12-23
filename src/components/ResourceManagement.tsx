import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useResourceStore } from "../store/resourceStore";
import { useScrumTeamStore } from "../store/scrumTeamStore";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Resource } from "@/types/sprint";

export const ResourceManagement = () => {
  const { resources, setResources, updateResource, deleteResource, addResource } = useResourceStore();
  const { activeTeam, loadTeams } = useScrumTeamStore();
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);

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

  const handleDeleteResource = async () => {
    if (!resourceToDelete || !activeTeam) {
      toast.error("Veuillez sélectionner une équipe");
      return;
    }

    try {
      await deleteResource(resourceToDelete.id);
      await loadTeams();
      setResourceToDelete(null);
      toast.success("Ressource supprimée");
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error("Erreur lors de la suppression de la ressource");
    }
  };

  const handleAddResource = async () => {
    if (!activeTeam) {
      toast.error("Veuillez sélectionner une équipe");
      return;
    }

    try {
      const newResource = {
        id: crypto.randomUUID(),
        name: "Nouvelle ressource",
        capacityPerDay: 1,
        teamId: activeTeam.id
      };
      
      await addResource(newResource);
      await loadTeams();
      toast.success("Ressource ajoutée");
    } catch (error) {
      console.error('Error adding resource:', error);
      toast.error("Erreur lors de l'ajout de la ressource");
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
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Ressources de l'équipe</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddResource}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une ressource
        </Button>
      </div>
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
              onClick={() => setResourceToDelete(resource)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {teamResources.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucune ressource</p>
        )}
      </div>

      <AlertDialog open={!!resourceToDelete} onOpenChange={() => setResourceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la ressource</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette ressource ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteResource}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
