import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const importData = async (data: any) => {
  try {
    // Delete existing data
    await supabase.from('sprint_resources').delete().neq('sprint_id', null);
    await supabase.from('sprints').delete().neq('id', null);
    await supabase.from('resources').delete().neq('id', null);
    await supabase.from('teams').delete().neq('id', null);

    // Import teams first
    const { error: teamsError } = await supabase
      .from('teams')
      .insert(data.teams.map((team: any) => ({
        name: team.name,
        created_at: team.createdAt
      })));

    if (teamsError) throw teamsError;

    // Get the newly created teams to map old IDs to new IDs
    const { data: newTeams } = await supabase.from('teams').select('*');
    const teamIdMap = new Map(data.teams.map((oldTeam: any, index: number) => [oldTeam.id, newTeams[index].id]));

    // Import resources with mapped team IDs
    const { error: resourcesError } = await supabase
      .from('resources')
      .insert(data.resources.map((resource: any) => ({
        name: resource.name,
        capacity_per_day: resource.capacityPerDay,
        team_id: teamIdMap.get(resource.teamId)
      })));

    if (resourcesError) throw resourcesError;

    // Get the newly created resources to map old IDs to new IDs
    const { data: newResources } = await supabase.from('resources').select('*');
    const resourceIdMap = new Map(data.resources.map((oldResource: any, index: number) => [oldResource.id, newResources[index].id]));

    // Import sprints with mapped team IDs
    const { error: sprintsError } = await supabase
      .from('sprints')
      .insert(data.sprints.map((sprint: any) => ({
        team_id: teamIdMap.get(sprint.teamId),
        start_date: sprint.startDate,
        end_date: sprint.endDate,
        duration: sprint.duration,
        story_points_committed: sprint.storyPointsCommitted,
        story_points_completed: sprint.storyPointsCompleted,
        theoretical_capacity: sprint.theoreticalCapacity,
        velocity_achieved: sprint.velocityAchieved,
        commitment_respected: sprint.commitmentRespected,
        objective: sprint.objective,
        objective_achieved: sprint.objectiveAchieved,
        created_at: sprint.createdAt
      })));

    if (sprintsError) throw sprintsError;

    // Get the newly created sprints to map old IDs to new IDs
    const { data: newSprints } = await supabase.from('sprints').select('*');
    const sprintIdMap = new Map(data.sprints.map((oldSprint: any, index: number) => [oldSprint.id, newSprints[index].id]));

    // Import sprint resources with mapped IDs
    const sprintResources = data.sprints.flatMap((sprint: any) => 
      sprint.resources.map((resource: any) => ({
        sprint_id: sprintIdMap.get(sprint.id),
        resource_id: resourceIdMap.get(resource.id),
        daily_capacities: resource.dailyCapacities
      }))
    );

    const { error: sprintResourcesError } = await supabase
      .from('sprint_resources')
      .insert(sprintResources);

    if (sprintResourcesError) throw sprintResourcesError;

    toast.success("Import réussi avec écrasement des données existantes !");
  } catch (error) {
    console.error('Error importing data:', error);
    toast.error("Erreur lors de l'import: " + (error as Error).message);
    throw error;
  }
};

export const importPractices = async (teamId: string, practices: any[]) => {
  try {
    // Delete existing practices for the team
    await supabase
      .from('agile_practices')
      .delete()
      .eq('team_id', teamId);

    // Insert new practices
    const { error } = await supabase
      .from('agile_practices')
      .insert(practices.map(practice => ({
        team_id: teamId,
        day: practice.day,
        who: practice.who,
        type: practice.type,
        action: practice.action,
        sub_actions: practice.subActions,
        format: practice.format,
        duration: practice.duration,
        is_completed: practice.isCompleted,
        completed_at: practice.completedAt,
        url: practice.url
      })));

    if (error) throw error;
  } catch (error) {
    console.error('Error importing practices:', error);
    throw error;
  }
};