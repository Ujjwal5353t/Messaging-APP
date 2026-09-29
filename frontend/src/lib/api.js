import axios from "axios";

const API_BASE_URL = "https://messaging-app-nylc.onrender.com";

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
        window.location.pathname.startsWith(p) || window.location.hash.startsWith("#" + p)
      );
      if (!isPublic) {
        if (window.location.protocol === "file:") {
          window.location.hash = "#/login";
        } else {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);



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
        return res.data;
      }).catch((err) => {
        profileCache.promise = null;
        profileCache.timestamp = 0;
        throw err;
      });
    }
    return profileCache.promise;
  },

  updateProfile: async (data) => {
    const response = await api.patch("/users/profile", data);
    if (response.data && response.data.success) {
      
      profileCache.promise = Promise.resolve(response.data);
      profileCache.timestamp = Date.now();
    } else {
      
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
       
        return res.data;
      }).catch((err) => {
        
        contactsCache.promise = null;
        contactsCache.timestamp = 0;
        throw err;
      });
    }
    return contactsCache.promise;
  },
  addContact: async (data) => {
    const response = await api.post("/users/add", data);
    contactsCache.promise = null;
    contactsCache.timestamp = 0;
    return response.data;
  },
  getPublicKey : async (data) => {
    const response = await api.get("/users/getPublicKey" , {
      params : {
        receiverId : data
      }
    })

    return response.data;
  }
};

export const friendRequestApi = {
  sendRequest: async (receiverId) => {
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
        return res.data;
      }).catch((err) => {
        friendRequestsCache.promise = null;
        friendRequestsCache.timestamp = 0;
        throw err;
      });
    }
    return friendRequestsCache.promise;
  },

  respondRequest: async (requestId, action) => {
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