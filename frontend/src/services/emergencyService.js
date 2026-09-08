import api from "./api";

export const emergencyApi = {
  submitReport: async (data) => {
    return (await api.post("/emergencies", data)).data;
  },
  getAll: async () => {
    return (await api.get("/emergencies")).data;
  },
  updateStatus: async (id, status) => {
    return (await api.put(`/emergencies/${id}/status`, { status })).data;
  },
};
