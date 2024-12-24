import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SprintPersonDaysInputProps {
  totalPersonDays: number | undefined;
  onTotalPersonDaysChange: (value: number) => void;
}

export const SprintPersonDaysInput = ({
  totalPersonDays,
  onTotalPersonDaysChange,
}: SprintPersonDaysInputProps) => {
  return (
    <div className="space-y-2">
      <Label>Nombre de jours/homme</Label>
      <Input
        type="number"
        min="0"
        step="0.5"
        value={totalPersonDays || ''}
        onChange={(e) => onTotalPersonDaysChange(Number(e.target.value))}
        placeholder="Saisir le nombre de jours/homme"
      />
    </div>
  );
};