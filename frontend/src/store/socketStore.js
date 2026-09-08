import { create } from "zustand";
import { socketService } from "../services/socket";
import api from "../services/api";

export const useSocketStore = create((set, get) => ({
  isConnected: false,
  socket: null,
  socketInitialized: false,
  shuttlesMap: {}, // key: shuttleId, value: shuttle object
  simulationRunning: true,

  initSocket: () => {
    if (get().socketInitialized) return get().socket;
    const socket = socketService.connect();
    set({ socket, socketInitialized: true });

    socket.on("connect", () => {
      set({ isConnected: true });
    });

    socket.on("disconnect", () => {
      set({ isConnected: false });
    });

    socket.on("shuttle:location", (data) => {
      set((state) => {
        const existing = state.shuttlesMap[data.shuttleId] || {};
        return {
          shuttlesMap: {
            ...state.shuttlesMap,
            [data.shuttleId]: {
              ...existing,
              currentLocation: data.currentLocation,
              speed: data.speed,
              eta: data.eta,
            },
          },
        };
      });
    });

    socket.on("shuttle:update", (data) => {
      set((state) => ({
        shuttlesMap: {
          ...state.shuttlesMap,
          [data.shuttleId]: {
            ...state.shuttlesMap[data.shuttleId],
            ...data,
          },
        },
      }));
    });

    socket.on("simulation:status", (data) => {
      set({ simulationRunning: data.isRunning });
    });
  },

  setInitialShuttles: (shuttlesList) => {
    const map = {};
    shuttlesList.forEach((s) => {
      map[s.shuttleId] = s;
    });
    set({ shuttlesMap: map });
  },

  startSimulation: async () => {
    try {
      const res = await api.post("/simulation/start");
      if (res.data.success) {
        set({ simulationRunning: true });
      }
      return res.data;
    } catch (err) {
      console.error("Failed to start simulation", err);
    }
  },

  pauseSimulation: async () => {
    try {
      const res = await api.post("/simulation/pause");
      if (res.data.success) {
        set({ simulationRunning: false });
      }
      return res.data;
    } catch (err) {
      console.error("Failed to pause simulation", err);
    }
  },

  resetSimulation: async () => {
    try {
      const res = await api.post("/simulation/reset");
      if (res.data.success) {
        set({ simulationRunning: false });
      }
      return res.data;
    } catch (err) {
      console.error("Failed to reset simulation", err);
    }
  },

  triggerSimulationEvent: async (action, shuttleId) => {
    try {
      const res = await api.post("/simulation/event", { action, shuttleId });
      return res.data;
    } catch (err) {
      console.error(`Failed to trigger simulation event: ${action}`, err);
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },
}));
