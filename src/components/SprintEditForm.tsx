import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSprintStore } from '../store/sprintStore';
import { useResourceStore } from '../store/resourceStore';
import { Sprint, Resource } from "../types/sprint";
import { ResourceInput } from "./ResourceInput";
import { toast } from "sonner";
import { TableCell } from "./ui/table";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

interface SprintEditFormProps {
  sprint: Sprint;
  onCancel: () => void;
  onSave: () => void;
}

export const SprintEditForm = ({ sprint, onCancel, onSave }: SprintEditFormProps) => {
  const [editedSprint, setEditedSprint] = useState<Sprint>({ ...sprint });
  const [showDailyCapacities, setShowDailyCapacities] = useState<boolean>(false);
  const { updateSprint } = useSprintStore();
  const { findResources } = useResourceStore();

  useEffect(() => {
    const loadResourceNames = async () => {
      const updatedResources = await Promise.all(
        editedSprint.resources.map(async (resource) => {
          const foundResource = (await findResources(resource.id))[0];
          return {
            ...resource,
            name: foundResource?.name || resource.name
          };
        })
      );

      setEditedSprint(prev => ({
        ...prev,
        resources: updatedResources
      }));
    };

    loadResourceNames();
  }, []);

  const handleSave = () => {
    if (new Date(editedSprint.startDate) > new Date(editedSprint.endDate)) {
      toast.error("La date de fin doit être après la date de début");
      return;
    }

    if (editedSprint.objective && editedSprint.objective.length > 300) {
      toast.error("L'objectif ne peut pas dépasser 300 caractères");
      return;
    }

    // Calculate success based on story points completed
    if (editedSprint.storyPointsCompleted !== undefined) {
      const commitmentRespected = (editedSprint.storyPointsCompleted / editedSprint.storyPointsCommitted) * 100;
      const isSuccessful = commitmentRespected >= 80;
      const velocityAchieved = editedSprint.storyPointsCompleted / editedSprint.duration;

      editedSprint.commitmentRespected = commitmentRespected;
      editedSprint.isSuccessful = isSuccessful;
      editedSprint.velocityAchieved = velocityAchieved;
    }

    updateSprint(sprint.id, editedSprint);
    toast.success("Sprint mis à jour avec succès!");
    onSave();
  };

  const handleResourceChange = (resourceId: string, field: keyof Resource, value: string | number) => {
    setEditedSprint(prev => ({
      ...prev,
      resources: prev.resources.map(resource =>
        resource.id === resourceId ? { ...resource, [field]: value } : resource
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
                onChange={(e) => setEditedSprint(prev => ({
                  ...prev,
                  startDate: e.target.value
                }))}
              />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-1">Durée (jours)</Label>
              <Input
                type="number"
                min="1"
                value={editedSprint.duration}
                onChange={(e) => setEditedSprint(prev => ({
                  ...prev,
                  duration: Number(e.target.value)
                }))}
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

          <div>
            <Label className="block text-sm font-medium mb-1">Objectif du sprint</Label>
            <Textarea
              value={editedSprint.objective || ''}
              onChange={(e) => setEditedSprint(prev => ({
                ...prev,
                objective: e.target.value
              }))}
              maxLength={300}
              className="h-24"
              placeholder="Décrivez l'objectif principal du sprint..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={editedSprint.objectiveAchieved || false}
              onCheckedChange={(checked) => setEditedSprint(prev => ({
                ...prev,
                objectiveAchieved: checked
              }))}
            />
            <Label>Objectif atteint</Label>
          </div>

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