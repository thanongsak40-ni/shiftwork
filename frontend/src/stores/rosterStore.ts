import { create } from 'zustand';

interface RosterChanges {
  [staffId: string]: {
    [day: number]: string;
  };
}

interface RosterStore {
  rosterChanges: RosterChanges;
  updateRosterShift: (staffId: string, day: number, shiftCode: string) => void;
  getRosterShift: (staffId: string, day: number, defaultShift: string) => string;
  clearChanges: () => void;
}

export const useRosterStore = create<RosterStore>((set, get) => ({
  rosterChanges: {},

  updateRosterShift: (staffId: string, day: number, shiftCode: string) => {
    set((state) => ({
      rosterChanges: {
        ...state.rosterChanges,
        [staffId]: {
          ...state.rosterChanges[staffId],
          [day]: shiftCode,
        },
      },
    }));
  },

  getRosterShift: (staffId: string, day: number, defaultShift: string) => {
    const state = get();
    return state.rosterChanges[staffId]?.[day] || defaultShift;
  },

  clearChanges: () => set({ rosterChanges: {} }),
}));
