import { SprintForm } from "@/components/SprintForm";
import { SprintList } from "@/components/SprintList";
import { VelocityChart } from "@/components/VelocityChart";
import { TeamVelocityChart } from "@/components/TeamVelocityChart";
import { CommitmentChart } from "@/components/CommitmentChart";
import { TeamManagement } from "@/components/TeamManagement";
import { useScrumTeamStore } from '../store/scrumTeamStore';

const Index = () => {
  const { activeTeam } = useScrumTeamStore();

  return (
    <div className="min-h-screen p-6 space-y-6">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Scrum Capacity Manager</h1>
        <p className="text-muted-foreground">Manage your team's capacity and track sprint performance</p>
      </header>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Team Management</h2>
          <TeamManagement />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Comparaison des équipes</h2>
          <TeamVelocityChart />
        </div>

        {activeTeam ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Create New Sprint for {activeTeam.name}</h2>
                <SprintForm />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Sprint History</h2>
                <SprintList />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <VelocityChart />
              <CommitmentChart />
            </div>
          </>
        ) : (
          <div className="text-center p-8 bg-muted rounded-lg">
            <p>Please select or create a team to manage sprints</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;