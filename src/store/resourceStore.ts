import { create } from 'zustand';
import { Resource } from '../types/sprint';

interface GlobalResource extends Resource {
  email?: string;
  firstName?: string;
  lastName?: string;
}

interface ResourceStore {
  resources: GlobalResource[];
  addResource: (resource: GlobalResource) => void;
  updateResource: (id: string, resource: Partial<GlobalResource>) => void;
  deleteResource: (id: string) => void;
}

export const useResourceStore = create<ResourceStore>((set) => ({
  resources: [],
  addResource: (resource) => 
    set((state) => ({
      resources: [...state.resources, resource]
    })),
  updateResource: (id, updates) =>
    set((state) => ({
      resources: state.resources.map((resource) =>
        resource.id === id ? { ...resource, ...updates } : resource
      )
    })),
  deleteResource: (id) =>
    set((state) => ({
      resources: state.resources.filter((resource) => resource.id !== id)
    })),
}));