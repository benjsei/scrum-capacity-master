import { Card } from "@/components/ui/card";
import { useSprintStore } from '../store/sprintStore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const SprintList = () => {
  const { sprints } = useSprintStore();

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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};