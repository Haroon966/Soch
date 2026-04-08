import { create } from 'zustand';
import type { Project } from '../types';

interface ProjectState {
  projects: Record<string, Project>;
  activeProjectId: string | null;
  addProject: (project: Project) => void;
  setActiveProject: (id: string) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: {},
  activeProjectId: null,
  addProject: (project) => set((state) => ({ projects: { ...state.projects, [project.id]: project } })),
  setActiveProject: (id) => set({ activeProjectId: id }),
}));
