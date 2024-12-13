import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamProgressChart } from "@/components/TeamProgressChart";
import { useScrumTeamStore } from "../store/scrumTeamStore";
import { useAgilePracticesStore } from "../store/agilePracticesStore";
import { Progress } from "@/components/ui/progress";

export const IndexContent = () => {
  const navigate = useNavigate();
  const { teams } = useScrumTeamStore();
  const { getPracticesProgress } = useAgilePracticesStore();

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
              <TeamProgressChart teamId={team.id} />
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate(`/team/${team.id}/practices`)}
                >
                  <div className="w-full">
                    <span className="block mb-1">Pratiques</span>
                    <Progress 
                      value={getPracticesProgress(team.id)} 
                      className="h-2"
                    />
                  </div>
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