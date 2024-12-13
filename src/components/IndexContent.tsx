import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamProgressChart } from "@/components/TeamProgressChart";
import { useScrumTeamStore } from "../store/scrumTeamStore";
import { useAgilePracticesStore } from "../store/agilePracticesStore";

const IndexContent = () => {
  const navigate = useNavigate();
  const { teams } = useScrumTeamStore();
  const { practices } = useAgilePracticesStore();

  const getPracticesProgress = (teamId: string) => {
    const teamPractices = practices.filter(p => p.teamId === teamId);
    if (teamPractices.length === 0) return 0;
    return Math.round((teamPractices.filter(p => p.isCompleted).length / teamPractices.length) * 100);
  };

  useEffect(() => {
    // Fetch teams or any necessary data here
  }, []);

  return (
    <div className="container mx-auto p-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <Card key={team.id} className="relative">
            <CardHeader>
              <CardTitle>{team.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-[200px]">
                <TeamProgressChart teamId={team.id} />
              </div>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1 relative overflow-hidden group"
                  onClick={() => navigate(`/team/${team.id}/practices`)}
                >
                  <div className="absolute inset-0 bg-primary/10 origin-left transition-transform duration-300" 
                       style={{ transform: `scaleX(${getPracticesProgress(team.id) / 100})` }} />
                  <span className="relative z-10">Pratiques</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate(`/team/${team.id}`)}
                >
                  Sprints
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default IndexContent;