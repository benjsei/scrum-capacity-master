import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useScrumTeamStore } from '../store/scrumTeamStore';

export const IndexHeader = () => {
  return (
    <header className="text-center mb-8 relative">
      <h1 className="text-3xl font-bold text-primary">Pratiques et Capacité Scrum</h1>
      <p className="text-muted-foreground">Gérez la capacité de votre équipe et suivez la performance des sprints</p>
    </header>
  );
};