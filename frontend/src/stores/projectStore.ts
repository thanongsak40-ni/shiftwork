import { create } from 'zustand';
import { mockProjects as initialProjects } from '../data/mockData';

interface CostSharing {
  destinationProjectId: string;
  percentage: number;
}

interface Project {
  id: string;
  name: string;
  location?: string;
  themeColor: string;
  managerId: string;
  responsiblePerson?: string;
  isActive: boolean;
  costSharing?: CostSharing[];
  createdAt: string;
  updatedAt: string;
}

interface ProjectStore {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => Project | undefined;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: initialProjects.map(p => ({
    ...p,
    costSharing: (p as any).costSharing || [],
  })) as Project[],

  addProject: (projectData) => {
    const newProject: Project = {
      ...projectData,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      projects: [...state.projects, newProject],
    }));
  },

  updateProject: (id, updates) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id
          ? { ...p, ...updates, updatedAt: new Date().toISOString() }
          : p
      ),
    }));
  },

  deleteProject: (id) => {
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
    }));
  },

  getProject: (id) => {
    return get().projects.find((p) => p.id === id);
  },
}));
