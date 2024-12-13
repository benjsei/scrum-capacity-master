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

const sortDays = (days: string[]) => {
  return days.sort((a, b) => {
    const numA = parseInt(a.replace('N', '0').replace('+', '')) || 0;
    const numB = parseInt(b.replace('N', '0').replace('+', '')) || 0;
    return numA - numB;
  });
};

const TeamPractices = () => {
  const { teamPractices } = useAgilePracticesStore();
  const practicesByDay = teamPractices.reduce((acc: any, practice: any) => {
    const day = practice.day;
    if (!acc[day]) acc[day] = [];
    acc[day].push(practice);
    return acc;
  }, {});

  return (
    <div className="min-h-screen p-6 space-y-6">
      <h1 className="text-3xl font-bold">Pratiques de l'équipe</h1>
      <div className="space-y-8">
        {sortDays(Object.keys(practicesByDay)).map((day) => (
          <div key={day} className="space-y-4">
            <h2 className="text-xl font-semibold">{day}</h2>
            {sortPractices(practicesByDay[day]).map((practice: any) => (
              <Card key={practice.id} className="p-4">
                <div className="flex items-center">
                  {getWhoIcon(practice.who)}
                  <span className="ml-2">{practice.action}</span>
                </div>
              </Card>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamPractices;
