import axios from "axios";
import type {
  User,
  Client,
  Schedule,
  ScheduleFormData,
  LeaveRequest,
  LeaveFormData,
  CarerFormData,
  ClientFormData,
  LoginCredentials,
  TokenResponse,
} from "@/types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem("access_token", access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: LoginCredentials) =>
    axios.post<TokenResponse>(`${API_BASE_URL}/token/`, credentials),

  changePassword: (oldPassword: string, newPassword: string) =>
    api.post("/auth/change-password/", {
      old_password: oldPassword,
      new_password: newPassword,
    }),

  getCurrentUser: () => api.get<User>("/users/me/"),
};

// Users API
export const usersAPI = {
  list: () => api.get<User[]>("/users/"),
  create: (data: CarerFormData) => api.post<User>("/users/", data),
  get: (id: number) => api.get<User>(`/users/${id}/`),
  update: (id: number, data: Partial<User>) =>
    api.put<User>(`/users/${id}/`, data),
  delete: (id: number) => api.delete(`/users/${id}/`),
};

// Clients API
export const clientsAPI = {
  list: () => api.get<Client[]>("/clients/"),
  create: (data: ClientFormData) => api.post<Client>("/clients/", data),
  get: (id: number) => api.get<Client>(`/clients/${id}/`),
  update: (id: number, data: Partial<ClientFormData>) =>
    api.put<Client>(`/clients/${id}/`, data),
  delete: (id: number) => api.delete(`/clients/${id}/`),
};

// Schedules API
export const schedulesAPI = {
  list: () => api.get<Schedule[]>("/schedules/"),
  create: (data: ScheduleFormData) => api.post<Schedule>("/schedules/", data),
  get: (id: number) => api.get<Schedule>(`/schedules/${id}/`),
  update: (id: number, data: Partial<ScheduleFormData>) =>
    api.put<Schedule>(`/schedules/${id}/`, data),
  delete: (id: number) => api.delete(`/schedules/${id}/`),
  myToday: () => api.get<Schedule[]>("/schedules/my_today/"),
};

// Visit Notes API
export const visitNotesAPI = {
  list: () => api.get("/visit-notes/"),
  create: (data: Record<string, unknown>) => api.post("/visit-notes/", data),
  get: (id: number) => api.get(`/visit-notes/${id}/`),
  update: (id: number, data: Record<string, unknown>) =>
    api.put(`/visit-notes/${id}/`, data),
  delete: (id: number) => api.delete(`/visit-notes/${id}/`),
};

// Time Logs API
export const timeLogsAPI = {
  list: () => api.get("/timelogs/"),
  create: (data: Record<string, unknown>) => api.post("/timelogs/", data),
  get: (id: number) => api.get(`/timelogs/${id}/`),
  update: (id: number, data: Record<string, unknown>) =>
    api.put(`/timelogs/${id}/`, data),
  delete: (id: number) => api.delete(`/timelogs/${id}/`),
};

// Messages API
export const messagesAPI = {
  list: () => api.get("/messages/"),
  create: (data: Record<string, unknown>) => api.post("/messages/", data),
  get: (id: number) => api.get(`/messages/${id}/`),
  delete: (id: number) => api.delete(`/messages/${id}/`),
};

// Leave Requests API
export const leaveAPI = {
  list: () => api.get<LeaveRequest[]>("/leave/"),
  create: (data: LeaveFormData) => api.post<LeaveRequest>("/leave/", data),
  get: (id: number) => api.get<LeaveRequest>(`/leave/${id}/`),
  update: (id: number, data: { status: "pending" | "approved" | "rejected" }) =>
    api.patch<LeaveRequest>(`/leave/${id}/`, data),
  delete: (id: number) => api.delete(`/leave/${id}/`),
};
