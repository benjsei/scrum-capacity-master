import { useSprintStore } from '../store/sprintStore';
import { useScrumTeamStore } from '../store/scrumTeamStore';
import { toast } from "sonner";

export const useSprintValidation = () => {
  const { sprints } = useSprintStore();
  const { activeTeam } = useScrumTeamStore();

  const validateSprint = (startDate: string, duration: string) => {
    if (!activeTeam) {
      toast.error("Veuillez sélectionner une équipe");
      return false;
    }

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Number(duration) - 1);

    const hasOverlap = sprints.some(s => {
      if (s.teamId !== activeTeam.id) return false;
      const sprintStart = new Date(s.startDate);
      const sprintEnd = new Date(s.endDate);
      const newStart = new Date(startDate);
      const newEnd = endDate;
      
      return (
        (newStart >= sprintStart && newStart <= sprintEnd) ||
        (newEnd >= sprintStart && newEnd <= sprintEnd) ||
        (newStart <= sprintStart && newEnd >= sprintEnd)
      );
    });

    if (hasOverlap) {
      toast.error("Les dates du sprint se chevauchent avec un sprint existant");
      return false;
    }

    return true;
  };

  return { validateSprint };
};