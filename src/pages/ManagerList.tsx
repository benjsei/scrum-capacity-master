import { useEffect } from "react";
import { useManagerStore } from "../store/managerStore";
import { useScrumTeamStore } from "../store/scrumTeamStore";
import { useAgilePracticesStore } from "../store/agilePracticesStore";
import { ManagerManagement } from "@/components/ManagerManagement";
import { ManagerProgressChart } from "@/components/ManagerProgressChart";
import { ManagerVelocityChart } from "@/components/ManagerVelocityChart";
import { ManagerCommitmentChart } from "@/components/ManagerCommitmentChart";

const ManagerList = () => {
  const { loadManagers } = useManagerStore();
  const { loadTeams } = useScrumTeamStore();
  const { initializePractices } = useAgilePracticesStore();

  useEffect(() => {
    const initializeData = async () => {
      await loadManagers();
      await loadTeams();
      // Initialize practices for each team
      const teams = await loadTeams();
      for (const team of teams) {
        await initializePractices(team.id);
      }
    };
    
    initializeData();
  }, [loadManagers, loadTeams, initializePractices]);

  return (
    <div className="min-h-screen p-6 space-y-6">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Pratiques et Capacité Scrum</h1>
        <p className="text-muted-foreground">Gérez la capacité de votre équipe et suivez la performance des sprints</p>
      </header>
      
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Gestion des managers</h2>
        <ManagerManagement />
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Progression des pratiques par manager</h2>
          <ManagerProgressChart />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Vélocité par manager</h2>
          <ManagerVelocityChart />
        </div>

        <div>
          <ManagerCommitmentChart />
        </div>
      </div>
    </div>
  );
};

export default ManagerList;