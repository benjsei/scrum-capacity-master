import { useScrumTeamStore } from '../store/scrumTeamStore';
import { useSprintStore } from '../store/sprintStore';
import { Trophy } from 'lucide-react';
import { useParams } from 'react-router-dom';

export const TeamPodium = () => {
  const { teams } = useScrumTeamStore();
  const { sprints } = useSprintStore();
  const { managerId } = useParams();

  const calculateTeamVelocity = (teamId: string) => {
    const teamSprints = sprints
      .filter(s => 
        s.teamId === teamId && 
        s.velocityAchieved !== undefined && 
        s.isSuccessful
      )
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .slice(0, 3); // Only take the last 3 sprints

    if (teamSprints.length === 0) return 0;
    
    const totalVelocity = teamSprints.reduce((acc, sprint) => acc + (sprint.velocityAchieved || 0), 0);
    return totalVelocity / teamSprints.length;
  };

  const topTeams = teams
    .filter(team => team.managerId === managerId)
    .map(team => ({
      ...team,
      velocity: calculateTeamVelocity(team.id)
    }))
    .sort((a, b) => b.velocity - a.velocity)
    .slice(0, 3);

  return (
    <div className="relative h-64 flex items-end justify-center gap-4 mb-8">
      {/* Second Place */}
      {topTeams[1] && (
        <div className="relative w-32">
          <div className="absolute bottom-0 w-full">
            <div className="h-32 bg-silver rounded-t-lg p-2 flex flex-col items-center justify-end">
              <div className="text-center">
                <div className="font-bold truncate">{topTeams[1].name}</div>
                <div className="text-sm">{topTeams[1].velocity.toFixed(2)} SP/j/h</div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* First Place */}
      {topTeams[0] && (
        <div className="relative w-32">
          <Trophy className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-yellow-500 w-8 h-8" />
          <div className="absolute bottom-0 w-full">
            <div className="h-40 bg-yellow-500 rounded-t-lg p-2 flex flex-col items-center justify-end">
              <div className="text-center text-white">
                <div className="font-bold truncate">{topTeams[0].name}</div>
                <div className="text-sm">{topTeams[0].velocity.toFixed(2)} SP/j/h</div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Third Place */}
      {topTeams[2] && (
        <div className="relative w-32">
          <div className="absolute bottom-0 w-full">
            <div className="h-24 bg-bronze rounded-t-lg p-2 flex flex-col items-center justify-end">
              <div className="text-center">
                <div className="font-bold truncate">{topTeams[2].name}</div>
                <div className="text-sm">{topTeams[2].velocity.toFixed(2)} SP/j/h</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};