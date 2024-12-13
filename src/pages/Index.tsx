import { TeamManagement } from "@/components/TeamManagement";
import { TeamPodium } from "@/components/TeamPodium";
import { TeamVelocityChart } from "@/components/TeamVelocityChart";
import { TeamProgressChart } from '@/components/TeamProgressChart';
import { IndexHeader } from "@/components/IndexHeader";
import { IndexContent } from "@/components/IndexContent";
import { useEffect } from "react";
import { useScrumTeamStore } from '../store/scrumTeamStore';

const Index = () => {
  const { loadTeams } = useScrumTeamStore();

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  return (
    <div className="min-h-screen p-6 space-y-6">
      <IndexHeader />
      <IndexContent />
    </div>
  );
};

export default Index;