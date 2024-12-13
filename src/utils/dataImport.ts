import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const importData = async (data: any) => {
  try {
    // First, delete all existing data in reverse order of dependencies
    const { error: deleteSprintResourcesError } = await supabase
      .from('sprint_resources')
      .delete()
      .not('sprint_id', 'is', null);
    
    if (deleteSprintResourcesError) throw deleteSprintResourcesError;

    const { error: deleteSprintsError } = await supabase
      .from('sprints')
      .delete()
      .not('id', 'is', null);
    
    if (deleteSprintsError) throw deleteSprintsError;

    const { error: deleteResourcesError } = await supabase
      .from('resources')
      .delete()
      .not('id', 'is', null);
    
    if (deleteResourcesError) throw deleteResourcesError;

    const { error: deleteTeamsError } = await supabase
      .from('teams')
      .delete()
      .not('id', 'is', null);
    
    if (deleteTeamsError) throw deleteTeamsError;

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

    // Import sprint resources with mapped IDs
    const sprintResources = data.sprints.flatMap((sprint: any) => 
      sprint.resources.map((resource: any) => ({
        sprint_id: sprintIdMap.get(sprint.id),
        resource_id: resourceIdMap.get(resource.id),
        daily_capacities: resource.dailyCapacities || []
      }))
    ).filter(sr => sr.sprint_id && sr.resource_id); // Filter out any invalid mappings

    if (sprintResources.length > 0) {
      const { error: sprintResourcesError } = await supabase
        .from('sprint_resources')
        .insert(sprintResources);

      if (sprintResourcesError) throw sprintResourcesError;
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
    const { error: deleteError } = await supabase
      .from('agile_practices')
      .delete()
      .eq('team_id', teamId);

    if (deleteError) throw deleteError;

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