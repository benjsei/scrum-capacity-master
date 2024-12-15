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
        <Label htmlFor="startDate">Date de début</Label>
        <Input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          required
          min={new Date().toISOString().split('T')[0]} // Prevent past dates
        />
      </div>
      <div>
        <Label htmlFor="duration">Durée (jours)</Label>
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