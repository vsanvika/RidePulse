import api from "./api";

export async function loginApi(email, password) {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
}

export async function registerApi(data) {
  const response = await api.post("/auth/register", data);
  return response.data;
}

export async function logoutApi() {
  const response = await api.post("/auth/logout");
  return response.data;
}

export async function getMeApi() {
  const response = await api.get("/auth/me");
  return response.data;
}

export async function updateProfileApi(data) {
  const response = await api.put("/auth/profile", data);
  return response.data;
}

export async function toggleFavoriteApi(type, id) {
  const response = await api.post("/auth/favorites", { type, id });
  return response.data;
}
