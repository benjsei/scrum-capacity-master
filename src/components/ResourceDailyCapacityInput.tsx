import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { ResourceDailyCapacity, Resource } from "../types/sprint";

interface ResourceDailyCapacityInputProps {
  resource: Resource;
  onDailyCapacityChange: (resourceId: string, date: string, capacity: number) => void;
  showDailyCapacities: boolean;
  onToggleDailyCapacities: () => void;
}

export const ResourceDailyCapacityInput = ({
  resource,
  onDailyCapacityChange,
  showDailyCapacities,
  onToggleDailyCapacities,
}: ResourceDailyCapacityInputProps) => {
  return (
    <div className="space-y-2">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onToggleDailyCapacities}
      >
        {showDailyCapacities ? 'Hide Daily' : 'Show Daily'}
      </Button>
      
      {showDailyCapacities && resource.dailyCapacities && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
          {resource.dailyCapacities.map((dc) => (
            <div key={dc.date} className="flex flex-col space-y-1">
              <Label className="text-xs">{new Date(dc.date).toLocaleDateString()}</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                value={dc.capacity}
                onChange={(e) => onDailyCapacityChange(resource.id, dc.date, Number(e.target.value))}
                className="h-8"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};