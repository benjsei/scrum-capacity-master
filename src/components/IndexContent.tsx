import { Card } from "@/components/ui/card";
import { useAgilePracticesStore } from '../store/agilePracticesStore';
import { TeamProgressChart } from './TeamProgressChart';
import { useScrumTeamStore } from '../store/scrumTeamStore';

interface TeamProgressChartProps {
  teamId: string;
}

const IndexContent = () => {
  const { activeTeam } = useScrumTeamStore();
  const { teamPractices, getPracticesForTeam } = useAgilePracticesStore();

  const getPracticesProgress = (teamId: string) => {
    const practices = getPracticesForTeam(teamId);
    if (!practices) return 0;
    
    const completedPractices = practices.filter(p => p.isCompleted).length;
    return practices.length > 0 ? (completedPractices / practices.length) * 100 : 0;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTeam && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Progression des pratiques</h3>
            <TeamProgressChart teamId={activeTeam.id} />
          </Card>
        )}
      </div>
    </div>
  );
};

export default IndexContent;