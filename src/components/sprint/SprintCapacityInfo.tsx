import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SprintCapacityInfoProps {
  averageVelocity: number;
  theoreticalCapacity: number;
  storyPoints: string;
  onStoryPointsChange: (points: string) => void;
}

export const SprintCapacityInfo = ({
  averageVelocity,
  theoreticalCapacity,
  storyPoints,
  onStoryPointsChange,
}: SprintCapacityInfoProps) => {
  return (
    <div className="space-y-2">
      <div>
        <Label>Average Velocity (SP/day/resource)</Label>
        <Input
          type="number"
          value={averageVelocity.toFixed(2)}
          readOnly
          className="bg-muted"
        />
      </div>

      <div>
        <Label htmlFor="theoreticalCapacity">Theoretical Capacity (SP)</Label>
        <Input
          id="theoreticalCapacity"
          type="number"
          value={theoreticalCapacity.toFixed(1)}
          readOnly
          className="bg-muted"
        />
      </div>

      <div>
        <Label htmlFor="storyPoints">Story Points Committed</Label>
        <Input
          id="storyPoints"
          type="number"
          min="0"
          value={storyPoints}
          onChange={(e) => onStoryPointsChange(e.target.value)}
          required
        />
      </div>
    </div>
  );
};