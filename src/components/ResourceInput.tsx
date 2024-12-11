import { Input } from "./ui/input";
import { Resource } from "../types/sprint";
import { ResourceDailyCapacityCalendar } from "./ResourceDailyCapacityCalendar";
import { useResourceStore } from "../store/resourceStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

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
  const { resources } = useResourceStore();

  return (
    <div className="space-y-2">
      <div className="flex gap-4">
        <Select
          value={resource.name}
          onValueChange={(value) => onResourceChange(resource.id, 'name', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionner une ressource" />
          </SelectTrigger>
          <SelectContent>
            {resources.map((r) => (
              <SelectItem key={r.id} value={r.name}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
        showDailyCapacities={showDailyCapacities}
        onToggleDailyCapacities={onToggleDailyCapacities}
      />
    </div>
  );
};