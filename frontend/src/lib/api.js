import axios from "axios";

const API_BASE_URL = "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials : true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => config);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
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

  oauthLogin: async (payloadOrIdToken, provider) => {
    const payload =
      typeof payloadOrIdToken === "object" && payloadOrIdToken !== null
        ? payloadOrIdToken
        : { idToken: payloadOrIdToken, provider };

    const response = await api.post("/auth/Oauth-login", payload);
    return response.data;
  },

  oauthSignup: async (payloadOrIdToken, publicKey, provider) => {
    const payload =
      typeof payloadOrIdToken === "object" && payloadOrIdToken !== null
        ? payloadOrIdToken
        : { idToken: payloadOrIdToken, publicKey, provider };

    const response = await api.post("/auth/Oauth-signup", payload);
    return response.data;
  },

  signout : async () => {
    const resposne = await api.post("/auth/signOut");
    return resposne.data ;
  }
};

export const userApi =  {
  contactList : async() => {
    const response = await api.get("/users/contacts");
    return response.data;
  } ,
  addContact : async(data) => {
    const response = await api.post("/users/add" , data);
    return response.data
  }
}

export const friendRequestApi = {
  sendRequest: async (receiverId) => {
    const response = await api.post("/users/friend-request/send", { receiverId });
    return response.data;
  },

  getRequests: async () => {
    const response = await api.get("/users/friend-request");
    return response.data;
  },

  respondRequest: async (requestId, action) => {
    const response = await api.patch(`/users/friend-request/${requestId}`, { action });
    return response.data;
  },
};

export default api;