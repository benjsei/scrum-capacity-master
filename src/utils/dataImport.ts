import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Helper function to safely delete data from a table
const safeDelete = async (tableName: string) => {
  const { error } = await supabase
    .from(tableName)
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (error) {
    console.error(`Error deleting from ${tableName}:`, error);
    throw error;
  }
};

// Helper function to safely insert data into a table
const safeInsert = async (tableName: string, data: any[]) => {
  if (!data || data.length === 0) return [];
  
  const { data: inserted, error } = await supabase
    .from(tableName)
    .insert(data)
    .select();
  
  if (error) {
    console.error(`Error inserting into ${tableName}:`, error);
    throw error;
  }
  
  return inserted || [];
};

export const importData = async (data: any) => {
  try {
    console.log('Starting data import...');
    
    // Delete existing data in reverse order of dependencies
    await safeDelete('sprint_resources');
    await safeDelete('agile_practices');
    await safeDelete('sprints');
    await safeDelete('resources');
    await safeDelete('teams');
    await safeDelete('managers');
    await safeDelete('default_practices');
    
    console.log('Existing data cleared successfully');

    // Import managers first
    const insertedManagers = await safeInsert('managers', data.managers?.map((manager: any) => ({
      name: manager.name,
      created_at: manager.created_at || new Date().toISOString()
    })));

    // Map old manager IDs to new UUIDs
    const managerIdMap = new Map(data.managers?.map((oldManager: any, index: number) => 
      [oldManager.id, insertedManagers[index].id]
    ));

    // Import teams with mapped manager IDs
    const insertedTeams = await safeInsert('teams', data.teams?.map((team: any) => ({
      name: team.name,
      manager_id: managerIdMap.get(team.manager_id),
      created_at: team.created_at || new Date().toISOString()
    })));

    // Map old team IDs to new UUIDs
    const teamIdMap = new Map(data.teams?.map((oldTeam: any, index: number) => 
      [oldTeam.id, insertedTeams[index].id]
    ));

    // Import resources with mapped team IDs
    const insertedResources = await safeInsert('resources', data.resources?.map((resource: any) => ({
      name: resource.name,
      capacity_per_day: resource.capacity_per_day,
      team_id: teamIdMap.get(resource.team_id)
    })));

    // Map old resource IDs to new UUIDs
    const resourceIdMap = new Map(data.resources?.map((oldResource: any, index: number) => 
      [oldResource.id, insertedResources[index].id]
    ));

    // Import default practices
    await safeInsert('default_practices', data.default_practices?.map((practice: any) => ({
      day: practice.day,
      who: practice.who,
      type: practice.type,
      action: practice.action,
      sub_actions: practice.sub_actions,
      format: practice.format,
      duration: practice.duration,
      description: practice.description,
      created_at: practice.created_at || new Date().toISOString()
    })));

    // Import sprints with mapped team IDs
    const insertedSprints = await safeInsert('sprints', data.sprints?.map((sprint: any) => ({
      team_id: teamIdMap.get(sprint.team_id),
      start_date: sprint.start_date,
      end_date: sprint.end_date,
      duration: sprint.duration,
      story_points_committed: sprint.story_points_committed,
      story_points_completed: sprint.story_points_completed,
      theoretical_capacity: sprint.theoretical_capacity,
      velocity_achieved: sprint.velocity_achieved,
      commitment_respected: sprint.commitment_respected,
      objective: sprint.objective,
      objective_achieved: sprint.objective_achieved,
      is_successful: sprint.is_successful,
      created_at: sprint.created_at || new Date().toISOString()
    })));

    // Map old sprint IDs to new UUIDs
    const sprintIdMap = new Map(data.sprints?.map((oldSprint: any, index: number) => 
      [oldSprint.id, insertedSprints[index].id]
    ));

    // Import agile practices with mapped team IDs
    await safeInsert('agile_practices', data.agile_practices?.map((practice: any) => ({
      team_id: teamIdMap.get(practice.team_id),
      day: practice.day,
      who: practice.who,
      type: practice.type,
      action: practice.action,
      sub_actions: practice.sub_actions,
      format: practice.format,
      duration: practice.duration,
      is_completed: practice.is_completed,
      completed_at: practice.completed_at,
      url: practice.url,
      description: practice.description
    })));

    // Import sprint resources with mapped IDs
    if (data.sprint_resources && data.sprint_resources.length > 0) {
      await safeInsert('sprint_resources', data.sprint_resources.map((sr: any) => ({
        sprint_id: sprintIdMap.get(sr.sprint_id),
        resource_id: resourceIdMap.get(sr.resource_id),
        daily_capacities: sr.daily_capacities
      })));
    }

    console.log('Data import completed successfully');
    toast.success("Import réussi !");
  } catch (error) {
    console.error('Error importing data:', error);
    toast.error("Erreur lors de l'import: " + (error as Error).message);
    throw error;
  }
};

export const exportData = async () => {
  try {
    console.log('Starting data export...');
    
    // Fetch all data from all tables
    const [
      { data: managers },
      { data: teams },
      { data: resources },
      { data: defaultPractices },
      { data: sprints },
      { data: agilePractices },
      { data: sprintResources }
    ] = await Promise.all([
      supabase.from('managers').select('*'),
      supabase.from('teams').select('*'),
      supabase.from('resources').select('*'),
      supabase.from('default_practices').select('*'),
      supabase.from('sprints').select('*'),
      supabase.from('agile_practices').select('*'),
      supabase.from('sprint_resources').select('*')
    ]);

    const exportData = {
      version: 1,
      managers,
      teams,
      resources,
      default_practices: defaultPractices,
      sprints,
      agile_practices: agilePractices,
      sprint_resources: sprintResources
    };

    // Create and download the JSON file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scrum-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('Data export completed successfully');
    toast.success("Export réussi !");
    return exportData;
  } catch (error) {
    console.error('Error exporting data:', error);
    toast.error("Erreur lors de l'export: " + (error as Error).message);
    throw error;
  }
};