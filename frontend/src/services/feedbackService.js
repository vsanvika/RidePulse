import api from "./api";

export const feedbackApi = {
  create: async (data) => (await api.post("/feedback", data)).data,
  mine: async () => (await api.get("/feedback/mine")).data,
};