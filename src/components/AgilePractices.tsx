import { useAgilePracticesStore } from '../store/agilePracticesStore';
import { Card } from "@/components/ui/card";
import { User, Users, UserCheck, UserPlus, UsersRound } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect } from 'react';

interface AgilePracticesProps {
  teamId: string;
  dayFilter?: string;
}

const getWhoIcon = (who: string) => {
  switch (who.toUpperCase()) {
    case 'COLLECTIF':
      return <Users className="h-4 w-4" />;
    case 'SCRUM MASTER':
      return <UserCheck className="h-4 w-4" />;
    case 'PRODUCT OWNER':
      return <UserPlus className="h-4 w-4" />;
    case 'EQUIPE':
      return <UsersRound className="h-4 w-4" />;
    default:
      return <User className="h-4 w-4" />;
  }
};

const sortPractices = (practices: any[]) => {
  const typeOrder = {
    "ETAT D'ESPRIT": 1,
    "ACTIONS": 2
  };

  return practices.sort((a, b) => {
    const typeA = typeOrder[a.type] || 999;
    const typeB = typeOrder[b.type] || 999;
    return typeA - typeB;
  });
};

const AgilePractices = ({ teamId, dayFilter }: AgilePracticesProps) => {
  const { teamPractices, initializePractices, togglePracticeCompletion } = useAgilePracticesStore();
  const teamPractice = teamPractices.find(tp => tp.teamId === teamId);
  
  useEffect(() => {
    if (teamId) {
      initializePractices(teamId);
    }
  }, [teamId, initializePractices]);
  
  if (!teamPractice || !teamPractice.practices || teamPractice.practices.length === 0) {
    return <div className="text-center text-muted-foreground">Chargement des pratiques...</div>;
  }

  const filteredPractices = dayFilter 
    ? teamPractice.practices.filter(p => p.day === dayFilter)
    : teamPractice.practices;

  if (filteredPractices.length === 0) {
    return <div className="text-center text-muted-foreground">Aucune pratique pour ce jour</div>;
  }

  return (
    <div className="space-y-4">
      {sortPractices(filteredPractices).map((practice) => (
        <Card key={practice.id} className="p-4">
          <div className="flex items-center gap-4">
            <Checkbox
              id={`practice-${practice.id}`}
              checked={practice.isCompleted}
              onCheckedChange={() => togglePracticeCompletion(teamId, practice.id)}
            />
            {getWhoIcon(practice.who)}
            <div className="flex flex-col">
              <span className="font-medium">{practice.action}</span>
              {practice.subActions && (
                <span className="text-sm text-muted-foreground">{practice.subActions}</span>
              )}
              {practice.format && practice.duration && (
                <span className="text-sm text-muted-foreground">
                  {practice.format} • {practice.duration}
                </span>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AgilePractices;