import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSprintStore } from '../store/sprintStore';
import { useResourceStore } from '../store/resourceStore';
import { Sprint, Resource } from "../types/sprint";
import { ResourceInput } from "./ResourceInput";
import { toast } from "sonner";
import { TableCell } from "./ui/table";
import { SprintObjectiveSection } from "./sprint/SprintObjectiveSection";
import { supabase } from "@/integrations/supabase/client";
import { initializeDailyCapacities } from "@/utils/sprintUtils";

interface SprintEditFormProps {
  sprint: Sprint;
  onCancel: () => void;
  onSave: () => void;
}

export const SprintEditForm = ({ sprint, onCancel, onSave }: SprintEditFormProps) => {
  const [editedSprint, setEditedSprint] = useState<Sprint>({ ...sprint });
  const [showDailyCapacities, setShowDailyCapacities] = useState<boolean>(false);
  const { updateSprint } = useSprintStore();
  const { addResource } = useResourceStore();

  useEffect(() => {
    const loadSprintResources = async () => {
      try {
        console.log('Loading sprint resources for sprint:', sprint.id);
        const { data: sprintResourcesData, error: sprintResourcesError } = await supabase
          .from('sprint_resources')
          .select(`
            resource_id,
            daily_capacities,
            resources (
              id,
              name,
              capacity_per_day,
              team_id
            )
          `)
          .eq('sprint_id', sprint.id);

        if (sprintResourcesError) throw sprintResourcesError;

        console.log('Loaded sprint resources:', sprintResourcesData);

        if (sprintResourcesData) {
          const resources = sprintResourcesData.map(sr => ({
            id: sr.resources.id,
            name: sr.resources.name,
            capacityPerDay: sr.resources.capacity_per_day || 1,
            teamId: sr.resources.team_id,
            dailyCapacities: Array.isArray(sr.daily_capacities) ? sr.daily_capacities.map((dc: any) => ({
              date: dc.date,
              capacity: dc.capacity
            })) : []
          }));

          setEditedSprint(prev => ({
            ...prev,
            resources: resources.map(resource => 
              initializeDailyCapacities(resource, editedSprint.startDate, editedSprint.duration)
            )
          }));
        }
      } catch (error) {
        console.error('Error loading sprint resources:', error);
        toast.error("Erreur lors du chargement des ressources du sprint");
      }
    };

    loadSprintResources();
  }, [sprint.id, editedSprint.startDate, editedSprint.duration]);

  const handleSave = async () => {
    console.log('handleSave called - Starting save process');
    console.log('Current editedSprint state:', editedSprint);

    if (new Date(editedSprint.startDate) > new Date(editedSprint.endDate)) {
      console.log('Save validation failed: End date before start date');
      toast.error("La date de fin doit être après la date de début");
      return;
    }

    if (editedSprint.objective && editedSprint.objective.length > 300) {
      console.log('Save validation failed: Objective too long');
      toast.error("L'objectif ne peut pas dépasser 300 caractères");
      return;
    }

    try {
      console.log('Starting to save sprint with resources:', editedSprint.resources);

      // Update resources array with saved resources
      const updatedResources = editedSprint.resources;

      // Calculate success based on story points completed
      let updatedFields: Partial<Sprint> = {
        ...editedSprint,
        resources: updatedResources
      };

      if (editedSprint.storyPointsCompleted !== undefined) {
        const commitmentRespected = (editedSprint.storyPointsCompleted / editedSprint.storyPointsCommitted) * 100;
        const isSuccessful = commitmentRespected >= 80;
        const velocityAchieved = editedSprint.storyPointsCompleted / editedSprint.duration;

        updatedFields = {
          ...updatedFields,
          commitmentRespected,
          isSuccessful,
          velocityAchieved
        };
      }

      console.log('Updating sprint with data:', updatedFields);
      await updateSprint(sprint.id, updatedFields);
      
      console.log('Sprint successfully updated');
      toast.success("Sprint mis à jour avec succès!");
      onSave();
    } catch (error) {
      console.error('Error saving sprint:', error);
      toast.error("Erreur lors de la sauvegarde du sprint");
    }
  };

  const handleResourceChange = (resourceId: string, field: keyof Resource, value: string | number) => {
    setEditedSprint(prev => ({
      ...prev,
      resources: prev.resources.map(resource =>
        resource.id === resourceId
          ? { ...resource, [field]: value }
          : resource
      )
    }));
  };

  const handleDailyCapacityChange = (resourceId: string, date: string, capacity: number) => {
    setEditedSprint(prev => ({
      ...prev,
      resources: prev.resources.map(resource =>
        resource.id === resourceId
          ? {
              ...resource,
              dailyCapacities: resource.dailyCapacities?.map(dc =>
                dc.date === date ? { ...dc, capacity } : dc
              ) || []
            }
          : resource
      )
    }));
  };

  const handleDeleteResource = (resourceId: string) => {
    setEditedSprint(prev => ({
      ...prev,
      resources: prev.resources.filter(resource => resource.id !== resourceId)
    }));
  };

  return (
    <>
      <TableCell colSpan={8}>
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium mb-1">Date de début</Label>
              <Input
                type="date"
                value={editedSprint.startDate}
                onChange={(e) => {
                  console.log('Changing start date to:', e.target.value);
                  setEditedSprint(prev => ({
                    ...prev,
                    startDate: e.target.value
                  }));
                }}
              />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-1">Durée (jours)</Label>
              <Input
                type="number"
                min="1"
                value={editedSprint.duration}
                onChange={(e) => {
                  console.log('Changing duration to:', e.target.value);
                  setEditedSprint(prev => ({
                    ...prev,
                    duration: Number(e.target.value)
                  }));
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium mb-1">Story Points engagés</Label>
              <Input
                type="number"
                min="0"
                value={editedSprint.storyPointsCommitted}
                onChange={(e) => setEditedSprint(prev => ({
                  ...prev,
                  storyPointsCommitted: Number(e.target.value)
                }))}
              />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-1">Story Points réalisés</Label>
              <Input
                type="number"
                min="0"
                value={editedSprint.storyPointsCompleted || ''}
                onChange={(e) => setEditedSprint(prev => ({
                  ...prev,
                  storyPointsCompleted: e.target.value ? Number(e.target.value) : undefined
                }))}
              />
            </div>
          </div>

          <SprintObjectiveSection
            objective={editedSprint.objective || ''}
            objectiveAchieved={editedSprint.objectiveAchieved}
            onObjectiveChange={(value) => setEditedSprint(prev => ({ ...prev, objective: value }))}
            onObjectiveAchievedChange={(value) => setEditedSprint(prev => ({ ...prev, objectiveAchieved: value }))}
            isCompleted={editedSprint.storyPointsCompleted !== undefined}
          />

          <div className="space-y-4">
            <Label className="block text-sm font-medium">Ressources</Label>
            {editedSprint.resources.map((resource) => (
              <div key={resource.id} className="space-y-2 p-4 border rounded-lg">
                <ResourceInput
                  resource={resource}
                  onResourceChange={handleResourceChange}
                  onDailyCapacityChange={handleDailyCapacityChange}
                  showDailyCapacities={showDailyCapacities}
                  onToggleDailyCapacities={() => setShowDailyCapacities(!showDailyCapacities)}
                  totalPresenceDays={resource.dailyCapacities?.reduce((sum, dc) => sum + dc.capacity, 0) || 0}
                />
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeleteResource(resource.id)}
                >
                  Supprimer la ressource
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              Sauvegarder
            </Button>
          </div>
        </div>
      </TableCell>
    </>
  );
};
