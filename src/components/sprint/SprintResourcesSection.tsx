import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Resource } from "@/types/sprint";
import { ResourceInput } from "../ResourceInput";
import { ResourceAutocompleteInput } from "../ResourceAutocompleteInput";
import { useState } from "react";
import { useScrumTeamStore } from "@/store/scrumTeamStore";
import { initializeDailyCapacities } from "@/utils/sprintUtils";

interface SprintResourcesSectionProps {
  resources: Resource[];
  showDailyCapacities: boolean;
  onResourceChange: (id: string, field: keyof Resource, value: string | number) => void;
  onDailyCapacityChange: (resourceId: string, date: string, capacity: number) => void;
  onToggleDailyCapacities: () => void;
  onDeleteResource: (resourceId: string) => void;
  startDate?: string;
  duration?: number;
}

export const SprintResourcesSection = ({
  resources,
  showDailyCapacities,
  onResourceChange,
  onDailyCapacityChange,
  onToggleDailyCapacities,
  onDeleteResource,
  startDate,
  duration,
}: SprintResourcesSectionProps) => {
  const [selectedResource, setSelectedResource] = useState<string>('');
  const { activeTeam } = useScrumTeamStore();

  const resourcePresenceDays: { [key: string]: number } = {};
  resources.forEach(resource => {
    if (resource.dailyCapacities) {
      resourcePresenceDays[resource.id] = resource.dailyCapacities.reduce((sum, dc) => sum + dc.capacity, 0);
    }
  });

  const totalTeamDays = Object.values(resourcePresenceDays).reduce((sum, days) => sum + days, 0);

  const handleAddResource = () => {
    if (!selectedResource || !activeTeam || !startDate || !duration) return;

    const resourceToAdd = activeTeam.resources.find(r => r.id === selectedResource);
    if (!resourceToAdd) return;

    const initializedResource = initializeDailyCapacities(resourceToAdd, startDate, duration);
    onResourceChange(initializedResource.id, 'name', initializedResource.name);
    setSelectedResource('');
  };

  const existingResourceIds = resources.map(r => r.id);
  const availableResources = activeTeam?.resources.filter(r => !existingResourceIds.includes(r.id)) || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>Resources</Label>
        <div className="text-sm text-muted-foreground">
          Total jours/homme : {totalTeamDays.toFixed(1)}
        </div>
      </div>
      
      {resources.map((resource) => (
        <div key={resource.id} className="space-y-2 p-4 border rounded-lg">
          <ResourceInput
            resource={resource}
            onResourceChange={onResourceChange}
            onDailyCapacityChange={onDailyCapacityChange}
            showDailyCapacities={showDailyCapacities}
            onToggleDailyCapacities={onToggleDailyCapacities}
            totalPresenceDays={resourcePresenceDays[resource.id] || 0}
          />
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => onDeleteResource(resource.id)}
          >
            Supprimer la ressource
          </Button>
        </div>
      ))}

      {availableResources.length > 0 && (
        <div className="flex gap-2">
          <ResourceAutocompleteInput
            value={selectedResource}
            onChange={(resource) => setSelectedResource(resource.id)}
            className="flex-1"
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleAddResource}
            disabled={!selectedResource}
          >
            Ajouter la ressource
          </Button>
        </div>
      )}
    </div>
  );
};