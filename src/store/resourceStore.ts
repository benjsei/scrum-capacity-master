import { create } from 'zustand';
import { Resource } from '../types/sprint';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

interface ResourceStore {
  resources: Resource[];
  setResources: (resources: Resource[]) => void;
  findResources: (query: string) => Resource[];
  addResource: (resource: Resource) => Promise<void>;
  updateResource: (id: string, updates: Partial<Resource>) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
}

export const useResourceStore = create<ResourceStore>((set, get) => ({
  resources: [],
  setResources: (resources) => set({ resources }),
  
  findResources: (query) => {
    const resources = get().resources;
    const lowercaseQuery = query.toLowerCase();
    return resources.filter((resource) =>
      resource.name.toLowerCase().includes(lowercaseQuery)
    );
  },

  addResource: async (resource) => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .insert([{
          name: resource.name,
          capacity_per_day: resource.capacityPerDay,
          team_id: resource.teamId
        }])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from insert');

      set((state) => ({
        resources: [...state.resources, {
          id: data.id,
          name: data.name,
          capacityPerDay: data.capacity_per_day || 1,
          teamId: data.team_id
        }]
      }));

      toast.success("Ressource ajoutée avec succès");
    } catch (error) {
      console.error('Error adding resource:', error);
      toast.error("Erreur lors de l'ajout de la ressource");
    }
  },

  updateResource: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('resources')
        .update({
          name: updates.name,
          capacity_per_day: updates.capacityPerDay,
          team_id: updates.teamId
        })
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        resources: state.resources.map((resource) =>
          resource.id === id ? { ...resource, ...updates } : resource
        ),
      }));
    } catch (error) {
      console.error('Error updating resource:', error);
      toast.error("Erreur lors de la mise à jour de la ressource");
      throw error;
    }
  },

  deleteResource: async (id) => {
    try {
      // D'abord, supprimer les références dans sprint_resources
      const { error: sprintResourcesError } = await supabase
        .from('sprint_resources')
        .delete()
        .eq('resource_id', id);

      if (sprintResourcesError) throw sprintResourcesError;

      // Ensuite, supprimer la ressource
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        resources: state.resources.filter((r) => r.id !== id),
      }));

      toast.success("Ressource supprimée avec succès");
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error("Erreur lors de la suppression de la ressource");
      throw error;
    }
  },
}));