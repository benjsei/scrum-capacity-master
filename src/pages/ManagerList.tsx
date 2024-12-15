import { useEffect } from "react";
import { useManagerStore } from "../store/managerStore";
import { ManagerManagement } from "@/components/ManagerManagement";
import { ManagerProgressChart } from "@/components/ManagerProgressChart";
import { ManagerVelocityChart } from "@/components/ManagerVelocityChart";
import { Link } from "react-router-dom";

const ManagerList = () => {
  const { loadManagers } = useManagerStore();

  useEffect(() => {
    loadManagers();
  }, [loadManagers]);

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des managers</h1>
        <Link
          to="/teams"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Voir les équipes
        </Link>
      </div>
      
      <div className="space-y-6">
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