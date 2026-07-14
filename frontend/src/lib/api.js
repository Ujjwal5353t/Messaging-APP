import axios from "axios";

const API_BASE_URL = "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => config);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const publicPaths = ["/login", "/signup"];
      const isPublic = publicPaths.some((p) =>
        window.location.pathname.startsWith(p)
      );
      if (!isPublic) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);


console.log("api.js module is being evaluated!");

let profileCache = { promise: null, timestamp: 0 };
let friendRequestsCache = { promise: null, timestamp: 0 };
let contactsCache = { promise: null, timestamp: 0 };

export const clearApiCache = () => {
  console.log("clearApiCache called! Clearing all cache promises.");
  profileCache.promise = null;
  profileCache.timestamp = 0;
  friendRequestsCache.promise = null;
  friendRequestsCache.timestamp = 0;
  contactsCache.promise = null;
  contactsCache.timestamp = 0;
};

export const profileApi = {
  getProfile: async () => {
    const now = Date.now();
    if (!profileCache.promise || (now - profileCache.timestamp > 10000)) {
      console.log("Fetching profile from backend (cache miss)...");
      profileCache.timestamp = now;
      profileCache.promise = api.get("/users/profile").then((res) => {
        console.log("profile response successfully cached.");
        return res.data;
      }).catch((err) => {
        console.log("profile request failed. Clearing cache.");
        profileCache.promise = null;
        profileCache.timestamp = 0;
        throw err;
      });
    }
    return profileCache.promise;
  },

  updateProfile: async (data) => {
    console.log("updateProfile called.");
    const response = await api.patch("/users/profile", data);
    if (response.data && response.data.success) {
      console.log("updateProfile succeeded. Pre-populating profile cache.");
      profileCache.promise = Promise.resolve(response.data);
      profileCache.timestamp = Date.now();
    } else {
      console.log("updateProfile failed. Clearing profile cache.");
      profileCache.promise = null;
      profileCache.timestamp = 0;
    }
    return response.data;
  },
};

export const authApi = {
  login: async (form) => {
    clearApiCache();
    const response = await api.post("/auth/login", form);
    return response.data;
  },

  register: async (form) => {
    clearApiCache();
    const response = await api.post("/auth/register", form);
    return response.data;
  },

  oauthLogin: async (payloadOrIdToken, provider) => {
    clearApiCache();
    const payload =
      typeof payloadOrIdToken === "object" && payloadOrIdToken !== null
        ? payloadOrIdToken
        : { idToken: payloadOrIdToken, provider };

    const response = await api.post("/auth/Oauth-login", payload);
    return response.data;
  },

  oauthSignup: async (payloadOrIdToken, publicKey, provider) => {
    clearApiCache();
    const payload =
      typeof payloadOrIdToken === "object" && payloadOrIdToken !== null
        ? payloadOrIdToken
        : { idToken: payloadOrIdToken, publicKey, provider };

    const response = await api.post("/auth/Oauth-signup", payload);
    return response.data;
  },

  signout: async () => {
    clearApiCache();
    const response = await api.post("/auth/signOut");
    return response.data;
  },
};

export const userApi = {
  contactList: async () => {
    const now = Date.now();
    if (!contactsCache.promise || (now - contactsCache.timestamp > 5000)) {
      console.log("Fetching contactList from backend (cache miss)...");
      contactsCache.timestamp = now;
      contactsCache.promise = api.get("/users/contacts").then((res) => {
        console.log("contactList response successfully cached.");
        return res.data;
      }).catch((err) => {
        console.log("contactList request failed. Clearing cache.");
        contactsCache.promise = null;
        contactsCache.timestamp = 0;
        throw err;
      });
    }
    return contactsCache.promise;
  },
  addContact: async (data) => {
    console.log("addContact called. Invalidate contactList cache.");
    const response = await api.post("/users/add", data);
    contactsCache.promise = null;
    contactsCache.timestamp = 0;
    return response.data;
  },
};

export const friendRequestApi = {
  sendRequest: async (receiverId) => {
    console.log("sendRequest called. Invalidate friendRequests cache.");
    const response = await api.post("/users/friend-request/send", { receiverId });
    friendRequestsCache.promise = null;
    friendRequestsCache.timestamp = 0;
    return response.data;
  },

  getRequests: async () => {
    const now = Date.now();
    if (!friendRequestsCache.promise || (now - friendRequestsCache.timestamp > 5000)) {
      console.log("Fetching friendRequests from backend (cache miss)...");
      friendRequestsCache.timestamp = now;
      friendRequestsCache.promise = api.get("/users/friend-request").then((res) => {
        console.log("friendRequests response successfully cached.");
        return res.data;
      }).catch((err) => {
        console.log("friendRequests request failed. Clearing cache.");
        friendRequestsCache.promise = null;
        friendRequestsCache.timestamp = 0;
        throw err;
      });
    }
    return friendRequestsCache.promise;
  },

  respondRequest: async (requestId, action) => {
    console.log("respondRequest called. Invalidate friendRequests and contactList cache.");
    const response = await api.patch(`/users/friend-request/${requestId}`, { action });
    friendRequestsCache.promise = null;
    friendRequestsCache.timestamp = 0;
    contactsCache.promise = null;
    contactsCache.timestamp = 0;
    return response.data;
  },
};


export const messageApi = {
  sendMessage: async (data) => {
    const response = await api.post("/message/sendMessage", data);
    return response.data;
  },
  getMessage: async (senderId, receiverId) => {
    const response = await api.get("/message/getMessage", {
      params: {
        senderId: senderId,
        receiverId: receiverId
      }
    });
    return response.data;
  }
}

export default api;