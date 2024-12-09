import { SprintForm } from "@/components/SprintForm";
import { SprintList } from "@/components/SprintList";
import { VelocityChart } from "@/components/VelocityChart";

const Index = () => {
  return (
    <div className="min-h-screen p-6 space-y-6">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Scrum Capacity Manager</h1>
        <p className="text-muted-foreground">Manage your team's capacity and track sprint performance</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Create New Sprint</h2>
          <SprintForm />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Sprint History</h2>
          <SprintList />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Performance Analytics</h2>
        <VelocityChart />
      </div>
    </div>
  );
};

export default Index;