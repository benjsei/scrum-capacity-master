import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SprintDatesInputProps {
  startDate: string;
  duration: string;
  onStartDateChange: (date: string) => void;
  onDurationChange: (duration: string) => void;
}

export const SprintDatesInput = ({
  startDate,
  duration,
  onStartDateChange,
  onDurationChange,
}: SprintDatesInputProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="startDate">Start Date</Label>
        <Input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="duration">Duration (days)</Label>
        <Input
          id="duration"
          type="number"
          min="1"
          value={duration}
          onChange={(e) => onDurationChange(e.target.value)}
          required
        />
      </div>
    </div>
  );
};