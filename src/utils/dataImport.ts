import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type TableName = keyof Database['public']['Tables'];
type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row'];
type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert'];

// Helper function to safely delete data from a table
const safeDelete = async (tableName: TableName) => {
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
const safeInsert = async <T extends TableName>(
  tableName: T,
  data: TableInsert<T>[]
): Promise<TableRow<T>[]> => {
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

export const importData = async (data: {
  managers?: TableInsert<'managers'>[],
  teams?: TableInsert<'teams'>[],
  resources?: TableInsert<'resources'>[],
  default_practices?: TableInsert<'default_practices'>[],
  sprints?: TableInsert<'sprints'>[],
  agile_practices?: TableInsert<'agile_practices'>[],
  sprint_resources?: TableInsert<'sprint_resources'>[]
}) => {
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
    const insertedManagers = await safeInsert('managers', data.managers || []);

    // Map old manager IDs to new UUIDs
    const managerIdMap = new Map(data.managers?.map((oldManager, index) => 
      [oldManager.id, insertedManagers[index].id]
    ));

    // Import teams with mapped manager IDs
    const insertedTeams = await safeInsert('teams', (data.teams || []).map(team => ({
      ...team,
      manager_id: team.manager_id ? managerIdMap.get(team.manager_id) : null
    })));

    // Map old team IDs to new UUIDs
    const teamIdMap = new Map(data.teams?.map((oldTeam, index) => 
      [oldTeam.id, insertedTeams[index].id]
    ));

    // Import resources with mapped team IDs
    const insertedResources = await safeInsert('resources', (data.resources || []).map(resource => ({
      ...resource,
      team_id: resource.team_id ? teamIdMap.get(resource.team_id) : null
    })));

    // Map old resource IDs to new UUIDs
    const resourceIdMap = new Map(data.resources?.map((oldResource, index) => 
      [oldResource.id, insertedResources[index].id]
    ));

    // Import default practices
    if (data.default_practices) {
      await safeInsert('default_practices', data.default_practices);
    }

    // Import sprints with mapped team IDs
    const insertedSprints = await safeInsert('sprints', (data.sprints || []).map(sprint => ({
      ...sprint,
      team_id: sprint.team_id ? teamIdMap.get(sprint.team_id) : null
    })));

    // Map old sprint IDs to new UUIDs
    const sprintIdMap = new Map(data.sprints?.map((oldSprint, index) => 
      [oldSprint.id, insertedSprints[index].id]
    ));

    // Import agile practices with mapped team IDs
    if (data.agile_practices) {
      await safeInsert('agile_practices', data.agile_practices.map(practice => ({
        ...practice,
        team_id: practice.team_id ? teamIdMap.get(practice.team_id) : null
      })));
    }

    // Import sprint resources with mapped IDs
    if (data.sprint_resources) {
      await safeInsert('sprint_resources', data.sprint_resources.map(sr => ({
        ...sr,
        sprint_id: sprintIdMap.get(sr.sprint_id)!,
        resource_id: resourceIdMap.get(sr.resource_id)!
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