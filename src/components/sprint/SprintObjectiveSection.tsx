import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface SprintObjectiveSectionProps {
  objective: string;
  objectiveAchieved?: boolean;
  onObjectiveChange: (value: string) => void;
  onObjectiveAchievedChange: (value: boolean) => void;
  isCompleted?: boolean;
}

export const SprintObjectiveSection = ({
  objective,
  objectiveAchieved,
  onObjectiveChange,
  onObjectiveAchievedChange,
  isCompleted
}: SprintObjectiveSectionProps) => {
  return (
    <div>
      <Label className="block text-sm font-medium mb-1">Objectif du sprint</Label>
      <Textarea
        value={objective || ''}
        onChange={(e) => onObjectiveChange(e.target.value)}
        maxLength={300}
        className="h-24"
        placeholder="Décrivez l'objectif principal du sprint..."
      />
      {isCompleted && (
        <div className="flex items-center space-x-2 mt-2">
          <Switch
            checked={objectiveAchieved || false}
            onCheckedChange={onObjectiveAchievedChange}
          />
          <Label>Objectif atteint</Label>
        </div>
      )}
    </div>
  );
};