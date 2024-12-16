import { supabase } from '@/integrations/supabase/client';
import { AgilePractice } from '@/types/agilePractice';

export const fetchTeamPractices = async (teamId: string) => {
  const { data, error } = await supabase
    .from('agile_practices')
    .select('*')
    .eq('team_id', teamId);

  if (error) throw error;
  return data;
};

export const fetchDefaultPractices = async () => {
  const { data, error } = await supabase
    .from('default_practices')
    .select('*');

  if (error) throw error;
  return data;
};

export const createTeamPractices = async (teamId: string, practices: Partial<AgilePractice>[]) => {
  const practicesForInsertion = practices.map(p => ({
    team_id: teamId,
    day: p.day,
    who: p.who,
    type: p.type,
    action: p.action,
    sub_actions: p.subActions,
    format: p.format,
    duration: p.duration,
    is_completed: false,
    description: p.description
  }));

  const { data, error } = await supabase
    .from('agile_practices')
    .insert(practicesForInsertion)
    .select();

  if (error) throw error;
  return data;
};

export const updatePracticeCompletion = async (practiceId: string, isCompleted: boolean) => {
  const { error } = await supabase
    .from('agile_practices')
    .update({ 
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null
    })
    .eq('id', practiceId);

  if (error) throw error;
};

export const updatePracticeUrlInDb = async (practiceId: string, url: string) => {
  const { error } = await supabase
    .from('agile_practices')
    .update({ url })
    .eq('id', practiceId);

  if (error) throw error;
};