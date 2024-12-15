import { create } from 'zustand';
import { Resource } from '../types/sprint';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

interface ResourceStore {
  resources: Resource[];
  setResources: (resources: Resource[]) => void;
  addResource: (resource: Resource) => Promise<Resource>;
  findResources: (query: string) => Resource[];
  updateResource: (resourceId: string, updates: Partial<Resource>) => Promise<void>;
  deleteResource: (resourceId: string) => Promise<void>;
}

export const useResourceStore = create<ResourceStore>((set, get) => ({
  resources: [],
  setResources: (resources) => set({ resources }),

  addResource: async (resource: Resource) => {
    try {
      console.log('Adding resource with data:', resource);
      const { data, error } = await supabase
        .from('resources')
        .insert({
          id: resource.id,
          name: resource.name,
          capacity_per_day: resource.capacityPerDay,
          team_id: resource.teamId
        })
        .select()
        .single();

      if (error) {
        console.error('Error in supabase insert:', error);
        throw error;
      }
      
      if (!data) {
        console.error('No data returned from insert');
        throw new Error('No data returned from insert');
      }

      console.log('Resource added successfully:', data);

      const newResource: Resource = {
        id: data.id,
        name: data.name,
        capacityPerDay: data.capacity_per_day || 1,
        teamId: data.team_id
      };

      set((state) => ({
        resources: [...state.resources, newResource]
      }));

      return newResource;
    } catch (error) {
      console.error('Error adding resource:', error);
      toast.error("Erreur lors de l'ajout de la ressource");
      throw error;
    }
  },

  findResources: (query: string) => {
    const resources = get().resources;
    return resources.filter(resource =>
      resource.name.toLowerCase().includes(query.toLowerCase())
    );
  },

  updateResource: async (resourceId: string, updates: Partial<Resource>) => {
    try {
      const { error } = await supabase
        .from('resources')
        .update({
          name: updates.name,
          capacity_per_day: updates.capacityPerDay,
          team_id: updates.teamId
        })
        .eq('id', resourceId);

      if (error) throw error;

      set((state) => ({
        resources: state.resources.map((resource) =>
          resource.id === resourceId
            ? { ...resource, ...updates }
            : resource
        ),
      }));
    } catch (error) {
      console.error('Error updating resource:', error);
      toast.error("Erreur lors de la mise à jour de la ressource");
      throw error;
    }
  },

  deleteResource: async (resourceId: string) => {
    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId);

      if (error) throw error;

      set((state) => ({
        resources: state.resources.filter((r) => r.id !== resourceId),
      }));
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error("Erreur lors de la suppression de la ressource");
      throw error;
    }
  },
}));