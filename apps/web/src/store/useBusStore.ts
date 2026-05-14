import { create } from 'zustand';
import type { BusLocationUpdate, Bus } from '@repo/utils/types';

function getBearing(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (val: number) => (val * Math.PI) / 180;
  const toDeg = (val: number) => (val * 180) / Math.PI;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const λ1 = toRad(lon1);
  const λ2 = toRad(lon2);

  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  const θ = Math.atan2(y, x);
  return (toDeg(θ) + 360) % 360;
}

interface BusState {
  locations: Record<string, BusLocationUpdate>;
  activeBuses: Bus[];
  selectedBusId: string | null;
  setLocations: (locations: Record<string, BusLocationUpdate>) => void;
  updateLocation: (update: BusLocationUpdate) => void;
  setActiveBuses: (buses: Bus[]) => void;
  setSelectedBus: (id: string | null) => void;
}

export const useBusStore = create<BusState>((set) => ({
  locations: {},
  activeBuses: [],
  selectedBusId: null,
  setLocations: (locations) => set({ locations }),
  updateLocation: (update: BusLocationUpdate) =>
    set((state) => {
      const existing = state.locations[update.vehicleId];
      let heading = existing?.heading ?? 0;
      
      // Calculate new heading if location changed significantly
      if (existing && existing.latitude && existing.longitude) {
        const dist = Math.sqrt(Math.pow(existing.latitude - update.latitude, 2) + Math.pow(existing.longitude - update.longitude, 2));
        if (dist > 0.00001) {
          heading = getBearing(existing.latitude, existing.longitude, update.latitude, update.longitude);
        }
      }

      return {
        locations: {
          ...state.locations,
          [update.vehicleId]: {
            ...existing, // preserve previous fields like registration
            ...update,
            heading,
          }
        }
      };
    }),
  setActiveBuses: (activeBuses) => set({ activeBuses }),
  setSelectedBus: (selectedBusId) => set({ selectedBusId }),
}));
