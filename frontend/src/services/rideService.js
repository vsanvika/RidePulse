import api from "./api";

export const rideApi = {
  getHistory: async () => {
    return (await api.get("/rides/history")).data;
  },
  recordRide: async (data) => {
    return (await api.post("/rides", data)).data;
  },
};
