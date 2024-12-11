import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useSprintStore } from '../store/sprintStore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SprintEditForm } from "./SprintEditForm";

export const SprintList = () => {
  const { getActiveTeamSprints, completeSprint } = useSprintStore();
  const [completionData, setCompletionData] = useState<{ [key: string]: number }>({});
  const [editingSprint, setEditingSprint] = useState<string | null>(null);
  const sprints = getActiveTeamSprints();

  const handleCompleteSprint = (sprintId: string) => {
    const storyPoints = completionData[sprintId];
    if (storyPoints === undefined) {
      toast.error("Veuillez saisir le nombre de story points réalisés");
      return;
    }
    completeSprint(sprintId, storyPoints);
    toast.success("Sprint terminé avec succès!");
  };

  const getCommitmentColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 70) return "text-orange-500";
    return "text-red-600";
  };

  const calculateTotalManDays = (sprint: any) => {
    return sprint.resources.reduce((total: number, resource: any) => {
      return total + (resource.dailyCapacities?.reduce((sum: number, dc: any) => sum + dc.capacity, 0) || 0);
    }, 0);
  };

  return (
    <Card className="p-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date de début</TableHead>
            <TableHead>Durée</TableHead>
            <TableHead>Story Points engagés</TableHead>
            <TableHead>Capacité théorique</TableHead>
            <TableHead>Jours/homme</TableHead>
            <TableHead>Respect engagement</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sprints.map((sprint) => (
            <TableRow key={sprint.id}>
              {editingSprint === sprint.id ? (
                <SprintEditForm
                  sprint={sprint}
                  onCancel={() => setEditingSprint(null)}
                  onSave={() => setEditingSprint(null)}
                />
              ) : (
                <>
                  <TableCell>{new Date(sprint.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{sprint.duration} jours</TableCell>
                  <TableCell>{sprint.storyPointsCommitted}</TableCell>
                  <TableCell>{sprint.theoreticalCapacity.toFixed(1)}</TableCell>
                  <TableCell>{calculateTotalManDays(sprint).toFixed(1)}</TableCell>
                  <TableCell>
                    {sprint.storyPointsCompleted !== undefined && (
                      <span className={cn(
                        getCommitmentColor((sprint.storyPointsCompleted / sprint.storyPointsCommitted) * 100)
                      )}>
                        {((sprint.storyPointsCompleted / sprint.storyPointsCommitted) * 100).toFixed(0)}%
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {sprint.isSuccessful === undefined ? 'En cours' : 
                     sprint.isSuccessful ? 'Succès' : 'Échec'}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Button
                        onClick={() => setEditingSprint(sprint.id)}
                        variant="outline"
                        size="sm"
                      >
                        Modifier le sprint
                      </Button>
                      
                      {sprint.isSuccessful === undefined && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            placeholder="Story points réalisés"
                            value={completionData[sprint.id] || ''}
                            onChange={(e) => setCompletionData({
                              ...completionData,
                              [sprint.id]: Number(e.target.value)
                            })}
                            className="w-40"
                          />
                          <Button 
                            onClick={() => handleCompleteSprint(sprint.id)}
                            variant="outline"
                            size="sm"
                          >
                            Terminer le sprint
                          </Button>
                        </div>
                      )}
                      {sprint.isSuccessful !== undefined && (
                        <div className="space-y-1">
                          <div>Réalisé: {sprint.storyPointsCompleted} SP</div>
                          <div>Vélocité: {sprint.velocityAchieved?.toFixed(2)} SP/jour</div>
                          {sprint.objective && (
                            <div className="mt-2">
                              <div className="font-semibold">Objectif:</div>
                              <div className="text-sm">{sprint.objective}</div>
                              <div className={cn(
                                "text-sm font-medium",
                                sprint.objectiveAchieved ? "text-green-600" : "text-red-600"
                              )}>
                                {sprint.objectiveAchieved ? "Objectif atteint" : "Objectif non atteint"}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};