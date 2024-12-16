import { TeamManagement } from "./TeamManagement";
import { TeamPodium } from "./TeamPodium";
import { TeamProgressChart } from "./TeamProgressChart";
import { TeamVelocityChart } from "./TeamVelocityChart";
import { TeamsCommitmentChart } from "./TeamsCommitmentChart";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useManagerStore } from "@/store/managerStore";
import { useScrumTeamStore } from "@/store/scrumTeamStore";

export const IndexContent = () => {
  const navigate = useNavigate();
  const { managerId } = useParams();
  const { managers } = useManagerStore();
  const { teams } = useScrumTeamStore();

  const filteredTeams = managerId 
    ? teams.filter(team => team.managerId === managerId)
    : teams;

  const getManagerName = (teamManagerId: string | undefined) => {
    if (!teamManagerId) return "Sans manager";
    const manager = managers.find(m => m.id === teamManagerId);
    return manager ? manager.name : "Sans manager";
  };

  const currentManager = managerId ? managers.find(m => m.id === managerId) : null;
  const pageTitle = currentManager 
    ? `Équipes de ${currentManager.name}`
    : "Toutes les équipes";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/managers")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {pageTitle}
          </h2>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">{pageTitle}</h2>
        <TeamManagement managerId={managerId} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Podium des équipes</h2>
        <TeamPodium />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Progression des pratiques</h2>
        <TeamProgressChart />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Comparaison des équipes</h2>
        <TeamVelocityChart />
      </div>

      <div>
        <TeamsCommitmentChart />
      </div>
    </div>
  );
};