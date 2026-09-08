import api from "./api";

export const predictionApi = {
  getCrowdPrediction: async (routeId = "R01") => {
    return (await api.get(`/predictions/crowd/${routeId}`)).data;
  },
  getInsights: async () => {
    return (await api.get("/predictions/insights")).data;
  },
};
