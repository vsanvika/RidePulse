import api from "./api";

export const sustainabilityApi = {
  getStats: async () => {
    return (await api.get("/sustainability/stats")).data;
  },
};
