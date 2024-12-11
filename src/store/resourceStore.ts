import { create } from 'zustand';
import { Resource } from '../types/sprint';
import { persist } from 'zustand/middleware';

interface ResourceStore {
  resources: Resource[];
  setResources: (resources: Resource[]) => void;
  addResource: (resource: Resource) => void;
  updateResource: (id: string, updates: Partial<Resource>) => void;
  deleteResource: (id: string) => void;
  findResources: (query: string) => Resource[];
}

export const useResourceStore = create<ResourceStore>()(
  persist(
    (set, get) => ({
      resources: [],
      
      setResources: (resources) => {
        set({ resources });
      },

      addResource: (resource) => {
        const exists = get().resources.some(r => r.name.toLowerCase() === resource.name.toLowerCase());
        if (!exists) {
          set((state) => ({
            resources: [...state.resources, resource]
          }));
        }
      },
      
      updateResource: (id, updates) => {
        set((state) => ({
          resources: state.resources.map(resource =>
            resource.id === id ? { ...resource, ...updates } : resource
          )
        }));
      },

      deleteResource: (id) => {
        set((state) => ({
          resources: state.resources.filter(resource => resource.id !== id)
        }));
      },
      
      findResources: (query) => {
        if (!query) return [];
        const lowerQuery = query.toLowerCase();
        return get().resources.filter(r => 
          r.name.toLowerCase().includes(lowerQuery)
        );
      }
    }),
    {
      name: 'resources-storage',
    }
  )
);