import { useEffect } from "react";
import { useManagerStore } from "../store/managerStore";
import { ManagerManagement } from "@/components/ManagerManagement";
import { ManagerProgressChart } from "@/components/ManagerProgressChart";
import { ManagerVelocityChart } from "@/components/ManagerVelocityChart";

const ManagerList = () => {
  const { loadManagers } = useManagerStore();

  useEffect(() => {
    loadManagers();
  }, [loadManagers]);

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
      </div>
    </div>
  );
};

export default ManagerList;