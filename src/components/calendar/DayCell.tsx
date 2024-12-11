import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";

interface DayCellProps {
  date: Date;
  capacity: number;
  isWeekend: boolean;
  isInSprintRange: boolean;
  onCapacityChange: (capacity: number) => void;
}

export const DayCell = ({
  date,
  capacity,
  isWeekend,
  isInSprintRange,
  onCapacityChange,
}: DayCellProps) => {
  return (
    <div 
      className={cn(
        "p-2 rounded border",
        isWeekend ? "bg-gray-100" : "bg-white",
        !isInSprintRange && "opacity-50"
      )}
    >
      <Label className="text-xs block mb-1">
        {date.getDate()}/{date.getMonth() + 1}
      </Label>
      {isInSprintRange ? (
        <Input
          type="number"
          step="0.1"
          min="0"
          value={capacity}
          onChange={(e) => onCapacityChange(Number(e.target.value))}
          className="h-8 text-sm"
        />
      ) : (
        <div className="h-8" />
      )}
    </div>
  );
};