import api from "./api";

export const passApi = {
  generatePass: async (routeId, date) => {
    return (await api.post("/passes/generate", { routeId, date })).data;
  },
  getMyPasses: async () => {
    return (await api.get("/passes/my-passes")).data;
  },
  verifyPass: async (passCode, shuttleId) => {
    return (await api.post("/passes/verify", { passCode, shuttleId })).data;
  },
};
