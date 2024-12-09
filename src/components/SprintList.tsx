import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useSprintStore } from '../store/sprintStore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const SprintList = () => {
  const { sprints, completeSprint } = useSprintStore();
  const [completionData, setCompletionData] = useState<{ [key: string]: number }>({});

  const handleCompleteSprint = (sprintId: string) => {
    const storyPoints = completionData[sprintId];
    if (storyPoints === undefined) {
      toast.error("Please enter the number of completed story points");
      return;
    }
    completeSprint(sprintId, storyPoints);
    toast.success("Sprint completed successfully! This will affect future sprints' theoretical capacity.");
  };

  return (
    <Card className="p-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Start Date</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Story Points Committed</TableHead>
            <TableHead>Theoretical Capacity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sprints.map((sprint) => (
            <TableRow key={sprint.id}>
              <TableCell>{new Date(sprint.startDate).toLocaleDateString()}</TableCell>
              <TableCell>{sprint.duration} days</TableCell>
              <TableCell>{sprint.storyPointsCommitted}</TableCell>
              <TableCell>{sprint.theoreticalCapacity.toFixed(1)}</TableCell>
              <TableCell>
                {sprint.isSuccessful === undefined ? 'In Progress' : 
                 sprint.isSuccessful ? 'Success' : 'Failed'}
              </TableCell>
              <TableCell>
                {sprint.isSuccessful === undefined && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      placeholder="Story points completed"
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
                      Complete Sprint
                    </Button>
                  </div>
                )}
                {sprint.isSuccessful !== undefined && (
                  <div className="space-y-1">
                    <div>Completed: {sprint.storyPointsCompleted} SP</div>
                    <div>Velocity: {sprint.velocityAchieved?.toFixed(2)} SP/day</div>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};