import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";
import { profileApi } from "@/lib/api";

const SocketContext = createContext({
  socket: null,
  onlineUsers: [],
  currentUserId: null,
  connectUser: () => {},
  disconnectSocket: () => {},
});

export function SocketProvider({ children }) {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [socketReady, setSocketReady] = useState(false);
  const socketRef = useRef(null);

  const connectUser = useCallback((userId) => {
    if (!userId) return;
    if (socketRef.current && socketRef.current.connected && currentUserId === userId) return;

    setCurrentUserId(userId);
    const sock = connectSocket(userId);
    socketRef.current = sock;
    setSocketReady(true);

    sock.on("online_users", (users) => {
      setOnlineUsers(users);
    });

    sock.on("connect", () => {
      setSocketReady((v) => !v);
      setSocketReady((v) => !v);
    });
  }, [currentUserId]);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const user = await profileApi.getProfile();
        const userId = user.data?._id || user._id;
        if (!userId || cancelled) return;

        connectUser(userId);
      } catch {
        // User is not logged in — skip socket connection
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [connectUser]);

  const disconnect = () => {
    disconnectSocket();
    socketRef.current = null;
    setSocketReady(false);
    setCurrentUserId(null);
    setOnlineUsers([]);
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current ?? getSocket(),
        onlineUsers,
        currentUserId,
        connectUser,
        disconnectSocket: disconnect,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);

