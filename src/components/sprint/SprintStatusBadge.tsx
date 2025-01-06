import { Sprint } from "@/types/sprint";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { getSprintStatus } from "@/utils/sprintCalculations";

interface SprintStatusBadgeProps {
  sprint: Sprint;
}

export const SprintStatusBadge = ({ sprint }: SprintStatusBadgeProps) => {
  const status = getSprintStatus(sprint);

  if (status === 'En cours') {
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        En cours
      </Badge>
    );
  }
  if (status === 'Succès') {
    return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  }
  return <XCircle className="h-5 w-5 text-red-500" />;
};