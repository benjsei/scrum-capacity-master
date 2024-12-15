import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

interface Manager {
  id: string;
  name: string;
  createdAt: string;
}

interface ManagerStore {
  managers: Manager[];
  loadManagers: () => Promise<void>;
  addManager: (name: string) => Promise<void>;
  deleteManager: (id: string) => Promise<void>;
}

export const useManagerStore = create<ManagerStore>((set) => ({
  managers: [],
  
  loadManagers: async () => {
    try {
      const { data, error } = await supabase
        .from('managers')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      set({ managers: data });
    } catch (error) {
      console.error('Error loading managers:', error);
      toast.error("Erreur lors du chargement des managers");
    }
  },
  
  addManager: async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('managers')
        .insert([{ name }])
        .select()
        .single();
        
      if (error) throw error;
      
      set(state => ({
        managers: [...state.managers, data]
      }));
      
      toast.success("Manager ajouté avec succès");
    } catch (error) {
      console.error('Error adding manager:', error);
      toast.error("Erreur lors de l'ajout du manager");
    }
  },
  
  deleteManager: async (id: string) => {
    try {
      const { error } = await supabase
        .from('managers')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      set(state => ({
        managers: state.managers.filter(manager => manager.id !== id)
      }));
      
      toast.success("Manager supprimé avec succès");
    } catch (error) {
      console.error('Error deleting manager:', error);
      toast.error("Erreur lors de la suppression du manager");
    }
  }
}));