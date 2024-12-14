import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Resource } from "@/types/sprint";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResourceInput } from "../ResourceInput";

interface SprintResourcesSectionProps {
  resources: Resource[];
  availableResources: Resource[];
  showDailyCapacities: boolean;
  resourcePresenceDays: { [key: string]: number };
  onResourceChange: (id: string, field: keyof Resource, value: string | number) => void;
  onDailyCapacityChange: (resourceId: string, date: string, capacity: number) => void;
  onToggleDailyCapacities: () => void;
  onAddResource: (resource: Resource) => void;
  onDeleteResource: (resourceId: string) => void;
}

export const SprintResourcesSection = ({
  resources,
  availableResources,
  showDailyCapacities,
  resourcePresenceDays,
  onResourceChange,
  onDailyCapacityChange,
  onToggleDailyCapacities,
  onAddResource,
  onDeleteResource,
}: SprintResourcesSectionProps) => {
  const totalTeamDays = Object.values(resourcePresenceDays).reduce((sum, days) => sum + days, 0);

  // Filter out resources that are already added
  const unusedResources = availableResources.filter(
    ar => !resources.some(r => r.id === ar.id)
  );

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

      {unusedResources.length > 0 && (
        <div className="flex gap-2">
          <Select
            onValueChange={(value) => {
              const resource = availableResources.find(r => r.id === value);
              if (resource) {
                onAddResource({
                  ...resource,
                  dailyCapacities: []
                });
              }
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Ajouter une ressource" />
            </SelectTrigger>
            <SelectContent>
              {unusedResources.map((resource) => (
                <SelectItem key={resource.id} value={resource.id}>
                  {resource.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};