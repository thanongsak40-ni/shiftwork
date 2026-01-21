import { create } from 'zustand';
import { mockStaff as initialStaff } from '../data/mockData';

interface Staff {
  id: string;
  code: string;
  name: string;
  position: string;
  phone?: string;
  wagePerDay: number;
  staffType: string;
  availability: string;
  isActive: boolean;
  projectId: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
    themeColor: string;
  };
}

interface StaffStore {
  staff: Staff[];
  addStaff: (staff: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateStaff: (id: string, updates: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;
  setStaffInactive: (id: string) => void;
  getStaff: (id: string) => Staff | undefined;
  getStaffByProject: (projectId: string) => Staff[];
  getActiveStaffByProject: (projectId: string) => Staff[];
}

export const useStaffStore = create<StaffStore>((set, get) => ({
  staff: initialStaff as Staff[],

  addStaff: (staffData) => {
    const newStaff: Staff = {
      ...staffData,
      id: `staff-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      staff: [...state.staff, newStaff],
    }));
  },

  updateStaff: (id, updates) => {
    set((state) => ({
      staff: state.staff.map((s) =>
        s.id === id
          ? { ...s, ...updates, updatedAt: new Date().toISOString() }
          : s
      ),
    }));
  },

  deleteStaff: (id) => {
    set((state) => ({
      staff: state.staff.filter((s) => s.id !== id),
    }));
  },

  setStaffInactive: (id) => {
    set((state) => ({
      staff: state.staff.map((s) =>
        s.id === id
          ? { ...s, isActive: false, updatedAt: new Date().toISOString() }
          : s
      ),
    }));
  },

  getStaff: (id) => {
    return get().staff.find((s) => s.id === id);
  },

  getStaffByProject: (projectId) => {
    return get().staff.filter((s) => s.projectId === projectId);
  },

  getActiveStaffByProject: (projectId) => {
    return get().staff.filter((s) => s.projectId === projectId && s.isActive);
  },
}));
