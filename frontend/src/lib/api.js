import axios from "axios";

const API_BASE_URL = "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials : true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("Token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("Token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const profileApi = {
  getProfile: async () => {
    const response = await api.get("/users/profile");
    return response.data;
  },

  updateProfile: async (data) => {
    console.log("Backend called");
    const response = await api.patch("/users/profile", data);
    return response.data;
  },
};

export const authApi = {
  login: async (form) => {
    const response = await api.post("/auth/login", form);
    return response.data;
  },

  register: async (form) => {
    const response = await api.post("/auth/register", form);
    return response.data;
  },

  oauthLogin: async (idToken, provider) => {
    const response = await api.post("/auth/Oauth-login", { idToken, provider });
    return response.data;
  },

  oauthSignup: async (idToken, publicKey, provider) => {
    const response = await api.post("/auth/Oauth-signup", { idToken, publicKey, provider });
    return response.data;
  },
};

export default api;