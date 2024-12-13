import { useAgilePracticesStore } from '../store/agilePracticesStore';
import { Card } from "@/components/ui/card";
import { User, Users, UserCheck, UserPlus, UsersRound } from "lucide-react";

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

const AgilePractices = () => {
  const { teamPractices } = useAgilePracticesStore();

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Pratiques Agile</h3>
      {teamPractices.map((teamPractice) => (
        <div key={teamPractice.teamId} className="mb-4">
          <h4 className="font-semibold">{teamPractice.teamId}</h4>
          {sortPractices(teamPractice.practices).map((practice) => (
            <div key={practice.id} className="flex items-center space-x-2">
              {getWhoIcon(practice.who)}
              <span>{practice.action}</span>
            </div>
          ))}
        </div>
      ))}
    </Card>
  );
};

export default AgilePractices;
