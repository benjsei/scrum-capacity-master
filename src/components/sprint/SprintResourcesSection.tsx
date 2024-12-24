import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Resource } from "@/types/sprint";
import { ResourceInput } from "../ResourceInput";
import { ResourceAutocompleteInput } from "../ResourceAutocompleteInput";
import { useState } from "react";
import { useScrumTeamStore } from "@/store/scrumTeamStore";
import { initializeDailyCapacities } from "@/utils/sprintUtils";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";

interface SprintResourcesSectionProps {
  resources: Resource[];
  showDailyCapacities: boolean;
  resourcePresenceDays: { [key: string]: number };
  onResourceChange: (id: string, field: keyof Resource, value: string | number) => void;
  onDailyCapacityChange: (resourceId: string, date: string, capacity: number) => void;
  onToggleDailyCapacities: () => void;
  onDeleteResource: (resourceId: string) => void;
  onTotalDaysChange?: (days: number) => void;
  startDate?: string;
  duration?: number;
}

export const SprintResourcesSection = ({
  resources,
  showDailyCapacities,
  resourcePresenceDays,
  onResourceChange,
  onDailyCapacityChange,
  onToggleDailyCapacities,
  onDeleteResource,
  onTotalDaysChange,
  startDate,
  duration,
}: SprintResourcesSectionProps) => {
  const [selectedResource, setSelectedResource] = useState<string>('');
  const [useSimpleMode, setUseSimpleMode] = useState(false);
  const [totalDays, setTotalDays] = useState('');
  const { activeTeam } = useScrumTeamStore();
  const totalTeamDays = Object.values(resourcePresenceDays).reduce((sum, days) => sum + days, 0);

  const handleAddResource = () => {
    if (!selectedResource || !activeTeam || !startDate || !duration) return;

    const resourceToAdd = activeTeam.resources.find(r => r.id === selectedResource);
    if (!resourceToAdd) return;

    const initializedResource = initializeDailyCapacities(resourceToAdd, startDate, duration);
    onResourceChange(initializedResource.id, 'name', initializedResource.name);
    setSelectedResource('');
  };

  const handleTotalDaysChange = (value: string) => {
    setTotalDays(value);
    const numValue = parseFloat(value) || 0;
    if (onTotalDaysChange) {
      onTotalDaysChange(numValue);
    }
  };

  const existingResourceIds = resources.map(r => r.id);
  const availableResources = activeTeam?.resources.filter(r => !existingResourceIds.includes(r.id)) || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>Resources</Label>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={useSimpleMode}
              onCheckedChange={setUseSimpleMode}
              id="simple-mode"
            />
            <Label htmlFor="simple-mode">Mode simplifié</Label>
          </div>
          <div className="text-sm text-muted-foreground">
            Total jours/homme : {totalTeamDays.toFixed(1)}
          </div>
        </div>
      </div>
      
      {useSimpleMode ? (
        <div className="space-y-2">
          <Label>Nombre total de jours/homme</Label>
          <Input
            type="number"
            value={totalDays}
            onChange={(e) => handleTotalDaysChange(e.target.value)}
            placeholder="Saisir le nombre total de jours/homme"
            step="0.5"
            min="0"
          />
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};