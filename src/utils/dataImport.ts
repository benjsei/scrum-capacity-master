import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const importData = async (data: any) => {
  try {
    // First, delete all existing data in reverse order of dependencies
    await supabase.from('sprint_resources').delete().neq('sprint_id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('sprints').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('resources').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('teams').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Import teams first
    const { data: insertedTeams, error: teamsError } = await supabase
      .from('teams')
      .insert(data.teams.map((team: any) => ({
        name: team.name,
        created_at: team.createdAt || new Date().toISOString()
      })))
      .select();

    if (teamsError) throw teamsError;
    if (!insertedTeams) throw new Error('No teams were inserted');

    // Map old team IDs to new UUIDs
    const teamIdMap = new Map(data.teams.map((oldTeam: any, index: number) => 
      [oldTeam.id, insertedTeams[index].id]
    ));

    // Import resources with mapped team IDs
    const { data: insertedResources, error: resourcesError } = await supabase
      .from('resources')
      .insert(data.resources.map((resource: any) => ({
        name: resource.name,
        capacity_per_day: resource.capacityPerDay,
        team_id: teamIdMap.get(resource.teamId)
      })))
      .select();

    if (resourcesError) throw resourcesError;
    if (!insertedResources) throw new Error('No resources were inserted');

    // Map old resource IDs to new UUIDs
    const resourceIdMap = new Map(data.resources.map((oldResource: any, index: number) => 
      [oldResource.id, insertedResources[index].id]
    ));

    // Import sprints with mapped team IDs
    const { data: insertedSprints, error: sprintsError } = await supabase
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
        created_at: sprint.createdAt || new Date().toISOString()
      })))
      .select();

    if (sprintsError) throw sprintsError;
    if (!insertedSprints) throw new Error('No sprints were inserted');

    // Map old sprint IDs to new UUIDs
    const sprintIdMap = new Map(data.sprints.map((oldSprint: any, index: number) => 
      [oldSprint.id, insertedSprints[index].id]
    ));

    // Prepare sprint resources data
    for (const sprint of data.sprints) {
      const newSprintId = sprintIdMap.get(sprint.id);
      if (!newSprintId) continue;

      const sprintResources = sprint.resources
        .filter((resource: any) => resourceIdMap.has(resource.id))
        .map((resource: any) => ({
          sprint_id: newSprintId,
          resource_id: resourceIdMap.get(resource.id),
          daily_capacities: resource.dailyCapacities || []
        }));

      if (sprintResources.length > 0) {
        const { error: sprintResourcesError } = await supabase
          .from('sprint_resources')
          .insert(sprintResources);

        if (sprintResourcesError) {
          console.error('Error inserting sprint resources:', sprintResourcesError);
          throw sprintResourcesError;
        }
      }
    }

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
    const { error: insertError } = await supabase
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
        is_completed: practice.isCompleted || false,
        completed_at: practice.completedAt,
        url: practice.url
      })));

    if (insertError) throw insertError;
  } catch (error) {
    console.error('Error importing practices:', error);
    throw error;
  }
};