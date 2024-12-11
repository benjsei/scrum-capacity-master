import { Input } from "./ui/input";
import { Resource } from "../types/sprint";
import { ResourceDailyCapacityCalendar } from "./ResourceDailyCapacityCalendar";

interface ResourceInputProps {
  resource: Resource;
  onResourceChange: (id: string, field: keyof Resource, value: string | number) => void;
  onDailyCapacityChange: (resourceId: string, date: string, capacity: number) => void;
  showDailyCapacities: { [key: string]: boolean };
  onToggleDailyCapacities: (resourceId: string) => void;
  totalPresenceDays: number;
}

export const ResourceInput = ({
  resource,
  onResourceChange,
  onDailyCapacityChange,
  showDailyCapacities,
  onToggleDailyCapacities,
  totalPresenceDays,
}: ResourceInputProps) => {
  return (
    <div className="space-y-2">
      <div className="flex gap-4">
        <Input
          placeholder="Nom"
          value={resource.name}
          onChange={(e) => onResourceChange(resource.id, 'name', e.target.value)}
          required
        />
        <Input
          type="number"
          value={totalPresenceDays.toFixed(1)}
          readOnly
          className="bg-muted w-32"
        />
      </div>
      
      <ResourceDailyCapacityCalendar
        resource={resource}
        onDailyCapacityChange={onDailyCapacityChange}
        showDailyCapacities={showDailyCapacities[resource.id]}
        onToggleDailyCapacities={() => onToggleDailyCapacities(resource.id)}
      />
    </div>
  );
};