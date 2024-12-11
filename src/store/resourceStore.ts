import { create } from 'zustand';
import { Resource } from '../types/sprint';

interface ResourceStore {
  resources: Resource[];
}

export const useResourceStore = create<ResourceStore>(() => ({
  resources: [],
}));