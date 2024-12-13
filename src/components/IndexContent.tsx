import { TeamManagement } from "./TeamManagement";
import { TeamPodium } from "./TeamPodium";
import { TeamProgressChart } from "./TeamProgressChart";
import { TeamVelocityChart } from "./TeamVelocityChart";

export const IndexContent = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Gestion des équipes</h2>
        <TeamManagement />
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
    </div>
  );
};