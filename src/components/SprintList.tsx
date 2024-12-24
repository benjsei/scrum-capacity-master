import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useSprintStore } from '../store/sprintStore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SprintEditForm } from "./SprintEditForm";
import { Badge } from "@/components/ui/badge";

export const SprintList = () => {
  const { getActiveTeamSprints, completeSprint, loadSprints } = useSprintStore();
  const [completionData, setCompletionData] = useState<{ [key: string]: number }>({});
  const [editingSprint, setEditingSprint] = useState<string | null>(null);
  const [expandedObjectives, setExpandedObjectives] = useState<{ [key: string]: boolean }>({});
  
  useEffect(() => {
    loadSprints();
  }, [loadSprints]);

  const sprints = getActiveTeamSprints().sort((a, b) => 
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  const handleCompleteSprint = (sprintId: string) => {
    const storyPoints = completionData[sprintId];
    if (storyPoints === undefined) {
      toast.error("Veuillez saisir le nombre de story points réalisés");
      return;
    }
    completeSprint(sprintId, { storyPointsCompleted: storyPoints });
    toast.success("Sprint terminé avec succès!");
  };

  const getSprintStatus = (sprint: any) => {
    if (sprint.storyPointsCompleted === undefined || sprint.storyPointsCompleted === null) {
      return 'En cours';
    }
    if (sprint.isSuccessful === true) {
      return 'Succès';
    }
    if (sprint.isSuccessful === false) {
      return 'Échec';
    }
    const commitmentPercentage = (sprint.storyPointsCompleted / sprint.storyPointsCommitted) * 100;
    return commitmentPercentage >= 80 ? 'Succès' : 'Échec';
  };

  const toggleObjective = (sprintId: string) => {
    setExpandedObjectives(prev => ({
      ...prev,
      [sprintId]: !prev[sprintId]
    }));
  };

  const calculateTotalCapacity = (sprint: any) => {
    if (!sprint.resources || !Array.isArray(sprint.resources)) return 0;
    
    return sprint.resources.reduce((total, resource) => {
      if (!resource.dailyCapacities) return total;
      const resourceTotal = resource.dailyCapacities.reduce((sum, dc) => {
        return sum + (dc?.capacity || 0);
      }, 0);
      return total + (resourceTotal || 0);
    }, 0);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage > 100) return "bg-emerald-700";
    if (percentage >= 90) return "bg-emerald-500";
    if (percentage >= 70) return "bg-orange-500";
    return "bg-red-500";
  };

  const getStatusBadge = (sprint: any) => {
    const status = getSprintStatus(sprint);
    if (status === 'En cours') {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          En cours
        </Badge>
      );
    }
    if (status === 'Succès') {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  return (
    <Card className="p-6">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
            <TableRow>
              <TableHead>Date de début</TableHead>
              <TableHead>Durée</TableHead>
              <TableHead>Story Points</TableHead>
              <TableHead>Capacité théorique</TableHead>
              <TableHead>Jours/homme</TableHead>
              <TableHead>Vélocité</TableHead>
              <TableHead>Engagement</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
          {sprints.map((sprint) => (
            <TableRow key={sprint.id} className="h-12">
              {editingSprint === sprint.id ? (
                <SprintEditForm
                  sprint={sprint}
                  onCancel={() => setEditingSprint(null)}
                  onSave={() => setEditingSprint(null)}
                />
              ) : (
                <>
                  <TableCell className="py-2">{new Date(sprint.startDate).toLocaleDateString()}</TableCell>
                  <TableCell className="py-2">{sprint.duration} jours</TableCell>
                  <TableCell className="py-2">
                    {sprint.storyPointsCompleted !== undefined && sprint.storyPointsCompleted !== null ? 
                      `${sprint.storyPointsCompleted}/${sprint.storyPointsCommitted}` :
                      `-/${sprint.storyPointsCommitted}`
                    }
                  </TableCell>
                  <TableCell className="py-2">
                    {sprint.theoreticalCapacity?.toFixed(1) || 'vide'}
                  </TableCell>
                  <TableCell className="py-2">
                    {calculateTotalCapacity(sprint).toFixed(1) || 'vide'}
                  </TableCell>
                  <TableCell className="py-2">
                    {sprint.velocityAchieved !== undefined && sprint.velocityAchieved !== null ? (
                      <span>{sprint.velocityAchieved.toFixed(2)} SP/jour</span>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="py-2">
                    {sprint.storyPointsCompleted !== undefined && sprint.storyPointsCompleted !== null && (
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-[60px] bg-secondary rounded-full h-2 overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all duration-300",
                              getProgressColor((sprint.storyPointsCompleted / sprint.storyPointsCommitted) * 100)
                            )}
                            style={{
                              width: `${Math.min((sprint.storyPointsCompleted / sprint.storyPointsCommitted) * 100, 100)}%`
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {`${Math.round((sprint.storyPointsCompleted / sprint.storyPointsCommitted) * 100)}%`}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="py-2">
                    {getStatusBadge(sprint)}
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="space-y-2">
                      <Button
                        onClick={() => setEditingSprint(sprint.id)}
                        variant="outline"
                        size="sm"
                      >
                        Modifier
                      </Button>
                      
                      {sprint.storyPointsCompleted === undefined && (
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
                            Terminer
                          </Button>
                        </div>
                      )}
                      {sprint.objective && (
                        <div className="mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleObjective(sprint.id)}
                            className="flex items-center gap-1 p-0 h-auto"
                          >
                            {expandedObjectives[sprint.id] ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                            <span>Objectif</span>
                          </Button>
                          {expandedObjectives[sprint.id] && (
                            <>
                              <div className="text-sm mt-1">{sprint.objective || 'vide'}</div>
                              <div className={cn(
                                "text-sm font-medium",
                                sprint.objectiveAchieved ? "text-green-600" : "text-red-600"
                              )}>
                                {sprint.objectiveAchieved ? "Objectif atteint" : "Objectif non atteint"}
                              </div>
                            </>
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
      </div>
    </Card>
  );
};