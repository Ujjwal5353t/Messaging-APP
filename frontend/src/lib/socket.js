import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:8080";

let socket = null;
let currentConnectingId = null;

/**
 * Returns (and lazily creates) the singleton socket.
 * Call connectSocket(userId) once after the user logs in.
 */
export function getSocket() {
  return socket;
}

export function connectSocket(userId) {
  // If we already have a socket connecting/connected to this userId, reuse it
  if (socket && currentConnectingId === userId) return socket;

  // Disconnect any stale socket before creating a new one
  if (socket) {
    socket.disconnect();
  }

  currentConnectingId = userId;
  socket = io(SOCKET_URL, {
    query: { id: userId },
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("[Socket] Connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("[Socket] Disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("[Socket] Connection error:", err.message);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  currentConnectingId = null;
}

