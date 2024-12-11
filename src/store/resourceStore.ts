import { create } from 'zustand';
import { Resource } from '../types/sprint';
import { persist } from 'zustand/middleware';

interface ResourceStore {
  resources: Resource[];
  addResource: (resource: Resource) => void;
  findResources: (query: string) => Resource[];
}

export const useResourceStore = create<ResourceStore>()(
  persist(
    (set, get) => ({
      resources: [],
      
      addResource: (resource) => {
        const exists = get().resources.some(r => r.name.toLowerCase() === resource.name.toLowerCase());
        if (!exists) {
          set((state) => ({
            resources: [...state.resources, resource]
          }));
        }
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