import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ResourceInput } from "../ResourceInput";

interface SprintResourcesSectionProps {
  resources: Resource[];
  showDailyCapacities: boolean;
  resourcePresenceDays: { [key: string]: number };
  onResourceChange: (resourceId: string, updates: Partial<Resource>) => void;
  onDailyCapacityChange: (resourceId: string, date: string, capacity: number) => void;
  onToggleDailyCapacities: () => void;
  onAddResource: () => void;
  onDeleteResource: (resourceId: string) => void;
}

export const SprintResourcesSection = ({
  resources,
  showDailyCapacities,
  resourcePresenceDays,
  onResourceChange,
  onDailyCapacityChange,
  onToggleDailyCapacities,
  onAddResource,
  onDeleteResource,
}: SprintResourcesSectionProps) => {
  const totalTeamDays = Object.values(resourcePresenceDays).reduce((sum, days) => sum + days, 0);

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
      <Button type="button" variant="outline" onClick={onAddResource}>
        Add Resource
      </Button>
    </div>
  );
};