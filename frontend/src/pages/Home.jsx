import { useEffect, useRef, useState, useCallback } from "react";
import AppRail from "@/components/layout/AppRail";
import ConversationList from "@/components/chat/ConversationList";
import ChatWindow from "@/components/chat/ChatWindow";
import WelcomeDashboard from "@/components/chat/WelcomeDashboard";

import { useNavigate } from "react-router-dom";
import { userApi, messageApi } from "../lib/api";
import { useSocket } from "@/context/SocketContext";

export default function Home() {
  const [seed, setSeed] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();
  const { socket, onlineUsers, currentUserId } = useSocket();
  const activeIdRef = useRef(activeId);
  const currentUserIdRef = useRef(currentUserId);

  // Keep refs in sync for use inside socket callbacks
  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);
  useEffect(() => { currentUserIdRef.current = currentUserId; }, [currentUserId]);


  // Initial contact fetch
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await userApi.contactList();
        if (response && Array.isArray(response.contacts)) {
          setSeed(response.contacts);
        } else {
          setSeed([]);
        }
      } catch (error) {
        console.log("Error retrieving contacts:", error);
      }
    };
    fetchContacts();
  }, []);

  // Sync online status from socket into seed
  useEffect(() => {
    if (!onlineUsers || onlineUsers.length === 0) return;
    setSeed((prev) =>
      prev.map((c) => ({
        ...c,
        online: onlineUsers.includes(c._id || c.id),
      }))
    );
  }, [onlineUsers]);

  // Fetch message history when activeId or currentUserId changes
  useEffect(() => {
    if (!activeId || !currentUserId) {
      if (!activeId) setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const messageResponse = await messageApi.getMessage(currentUserId, activeId);
        if (messageResponse && Array.isArray(messageResponse.response)) {
          const mapped = messageResponse.response.map((m) => ({
            id: m._id,
            from: m.sender === currentUserId ? "me" : "them",
            text: m.content,
            time: m.createdAt
              ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "",
            read: m.status === "Seen",
            status: m.status,
          }));
          setMessages(mapped);
        }
      } catch (error) {
        console.log("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [activeId, currentUserId]);


  // Refresh contact list when a new message comes in (to update lastMsg preview)
  const refreshContacts = useCallback(async () => {
    try {
      const response = await userApi.contactList();
      if (response && Array.isArray(response.contacts)) {
        setSeed((prev) => {
          const merged = response.contacts.map((c) => {
            const existing = prev.find((p) => (p._id || p.id) === (c._id || c.id));
            // Use whichever unread count is higher: local (live) or backend (persisted)
            const localUnread = existing?.unread || 0;
            const backendUnread = c.unread || 0;
            return {
              ...c,
              online: existing?.online ?? false,
              typing: existing?.typing ?? false,
              unread: Math.max(localUnread, backendUnread),
            };
          });
          return merged;
        });
      }
    } catch {}
  }, []);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    // Incoming message from the other person
    const handleReceiveMessage = (payload) => {
      const { sender, content, createdAt, _id } = payload;
      const newMsg = {
        id: _id,
        from: "them",
        text: content,
        time: createdAt
          ? new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        read: false,
        status: payload.status,
      };

      // If the chat with this sender is currently open, append the message
      if (activeIdRef.current === sender) {
        setMessages((prev) => [...prev, newMsg]);

        // Mark as seen since window is open
        socket.emit("message_seen", { messageId: _id, senderId: sender });
      } else {
        // Otherwise increment unread count in the sidebar
        setSeed((prev) =>
          prev.map((c) =>
            (c._id || c.id) === sender
              ? { ...c, unread: (c.unread || 0) + 1, lastMsg: content }
              : c
          )
        );
      }

      refreshContacts();
    };

    // Confirmation that our sent message was processed
    const handleMessageSent = (payload) => {
      const { _id, content, status } = payload;
      setMessages((prev) => {
        // Find the optimistic "Sending" message that matches this content
        const idx = prev.findIndex(
          (m) => m.status === "Sending" && m.text === content
        );
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            id: _id,
            status,
          };
          return updated;
        }
        return prev;
      });
      refreshContacts();
    };

    // Typing indicator
    const handleUserTyping = ({ senderId, typing }) => {
      setSeed((prev) =>
        prev.map((c) =>
          (c._id || c.id) === senderId ? { ...c, typing } : c
        )
      );
    };

    // Read receipts / delivered updates
    const handleMessageStatusUpdate = ({ messageId, status }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, status, read: status === "Seen" } : m
        )
      );
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("message_sent", handleMessageSent);
    socket.on("user_typing", handleUserTyping);
    socket.on("message_status_update", handleMessageStatusUpdate);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("message_sent", handleMessageSent);
      socket.off("user_typing", handleUserTyping);
      socket.off("message_status_update", handleMessageStatusUpdate);
    };
  }, [socket, refreshContacts]);

  // Clear unread count when switching to a conversation
  const select = (id) => {
    setActiveId(id);
    setMobileShowChat(true);
    setSeed((prev) =>
      prev.map((c) => ((c._id || c.id) === id ? { ...c, unread: 0 } : c))
    );
  };

  const active = seed.find((c) => (c.id || c._id) === activeId);
  const totalUnread = seed.reduce((sum, c) => sum + (c.unread || 0), 0);

  return (
    <div className="h-screen w-full flex bg-background overflow-hidden">
      <AppRail totalUnread={totalUnread} />

      {/* Conversation list — hidden on mobile when chat open */}
      <div className={mobileShowChat ? "hidden md:flex" : "flex flex-1 md:flex-initial"}>
        <ConversationList
          conversations={seed}
          activeId={activeId}
          onSelect={select}
          onNewChat={() => navigate("/discover")}
        />
      </div>

      {/* Main area */}
      <div className={`flex-1 min-w-0 ${!mobileShowChat ? "hidden md:flex" : "flex"}`}>
        {active ? (
          <ChatWindow
            conversation={active}
            messages={messages}
            currentUserId={currentUserId}
            onBack={() => setMobileShowChat(false)}
            onMessageAdded={(msg) => setMessages((prev) => [...prev, msg])}
          />
        ) : (
          <WelcomeDashboard onNewChat={() => navigate("/discover")} />
        )}
      </div>
    </div>
  );
}