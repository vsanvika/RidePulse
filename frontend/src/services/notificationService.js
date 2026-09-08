import api from "./api";

export const notificationApi = {
  getAll: async () => {
    return (await api.get("/notifications")).data;
  },
  markAsRead: async (id) => {
    return (await api.put(`/notifications/${id}/read`)).data;
  },
  markAllAsRead: async () => {
    return (await api.put("/notifications/read-all")).data;
  },
  create: async (data) => {
    return (await api.post("/notifications", data)).data;
  },
};
