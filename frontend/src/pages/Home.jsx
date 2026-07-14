import { useEffect, useRef, useState, useCallback } from "react";
import AppRail from "@/components/layout/AppRail";
import ConversationList from "@/components/chat/ConversationList";
import ChatWindow from "@/components/chat/ChatWindow";
import WelcomeDashboard from "@/components/chat/WelcomeDashboard";

import { useNavigate } from "react-router-dom";
import { userApi, messageApi } from "../lib/api";
import { useSocket } from "@/context/SocketContext";
import { getMyPrivateKey, deriveSharedKey, decryptMessage } from "@/lib/crypto";

export default function Home() {
  const [seed, setSeed] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();
  const { socket, onlineUsers, currentUserId } = useSocket();
  const activeIdRef = useRef(activeId);
  const currentUserIdRef = useRef(currentUserId);

  // E2EE state
  const privateKeyRef = useRef(null);      // Our X25519 private key JWK
  const sharedKeysRef = useRef(new Map());  // contactId → AES-GCM CryptoKey
  const pendingPlaintextRef = useRef(new Map()); // ciphertext → plaintext (for optimistic matching)

  // Keep refs in sync for use inside socket callbacks
  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);
  useEffect(() => { currentUserIdRef.current = currentUserId; }, [currentUserId]);

  // Load private key from Electron's safeStorage when currentUserId is loaded
  useEffect(() => {
    if (!currentUserId) return;
    getMyPrivateKey(currentUserId).then((key) => {
      privateKeyRef.current = key;
      if (key) console.log("[E2EE] Private key loaded from safeStorage for", currentUserId);
    });
  }, [currentUserId]);


  /**
   * Get or derive the shared AES-GCM key for a given contact.
   * Caches in sharedKeysRef so ECDH is only done once per contact per session.
   */
  const getSharedKey = useCallback(async (contactId, contactPublicKey) => {
    if (!privateKeyRef.current || !contactPublicKey) return null;

    if (sharedKeysRef.current.has(contactId)) {
      return sharedKeysRef.current.get(contactId);
    }

    try {
      const key = await deriveSharedKey(privateKeyRef.current, contactPublicKey);
      sharedKeysRef.current.set(contactId, key);
      return key;
    } catch (err) {
      console.error("[E2EE] Failed to derive shared key for", contactId, err);
      return null;
    }
  }, []);

 
  const tryDecrypt = useCallback(async (ciphertext, nonce, contactId, contactPublicKey) => {
    if (!nonce || !privateKeyRef.current) return ciphertext;
    try {
      const sharedKey = await getSharedKey(contactId, contactPublicKey);
      if (!sharedKey) return ciphertext;
      return await decryptMessage(ciphertext, nonce, sharedKey);
    } catch (err) {
      console.error("[E2EE] Decryption failed:", err);
      return "[Encrypted message]"; 
    }
  }, [getSharedKey]);

  // Helper: find a contact's publicKey from seed by contactId
  const getContactPubKey = useCallback((contactId) => {
    const seedRef = seed;
    const contact = seedRef.find((c) => (c._id || c.id) === contactId);
    return contact?.publicKey || null;
  }, [seed]);

  const decryptContactsList = useCallback(async (contacts) => {
    if (!Array.isArray(contacts)) return [];
    return await Promise.all(
      contacts.map(async (c) => {
        let lastMsgText = null;
        if (c.lastMsg) {
          if (typeof c.lastMsg === "object") {
            lastMsgText = await tryDecrypt(c.lastMsg.content, c.lastMsg.nonce, c._id || c.id, c.publicKey);
          } else {
            lastMsgText = c.lastMsg;
          }
        }
        return {
          ...c,
          lastMsg: lastMsgText
        };
      })
    );
  }, [tryDecrypt]);

  // Initial contact fetch
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await userApi.contactList();
        if (response && Array.isArray(response.contacts)) {
          const decrypted = await decryptContactsList(response.contacts);
          setSeed(decrypted);
        } else {
          setSeed([]);
        }
      } catch (error) {
        console.log("Error retrieving contacts:", error);
      }
    };
    fetchContacts();
  }, [decryptContactsList]);

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
          // Determine the contact's public key for decryption
          const contact = seed.find((c) => (c._id || c.id) === activeId);
          const contactPubKey = contact?.publicKey || null;

          const mapped = await Promise.all(
            messageResponse.response.map(async (m) => {
              // Decrypt if nonce is present (E2EE message)
              // For "me" messages: use the contact's pubKey (same shared secret)
              // For "them" messages: use the contact's pubKey
              const text = await tryDecrypt(m.content, m.nonce, activeId, contactPubKey);
              return {
                id: m._id,
                from: m.sender === currentUserId ? "me" : "them",
                text,
                time: m.createdAt
                  ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "",
                read: m.status === "Seen",
                status: m.status,
              };
            })
          );
          setMessages(mapped);
        }
      } catch (error) {
        console.log("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [activeId, currentUserId, seed, tryDecrypt]);


  const refreshContacts = useCallback(async () => {
    try {
      const response = await userApi.contactList();
      if (response && Array.isArray(response.contacts)) {
        const decrypted = await decryptContactsList(response.contacts);
        setSeed((prev) => {
          const merged = decrypted.map((c) => {
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
  }, [decryptContactsList]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = async (payload) => {
      const { sender, content, nonce, createdAt, _id } = payload;

      // Decrypt if E2EE (nonce present)
      const contactPubKey = getContactPubKey(sender);
      const text = await tryDecrypt(content, nonce, sender, contactPubKey);

      const newMsg = {
        id: _id,
        from: "them",
        text,
        time: createdAt
          ? new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        read: false,
        status: payload.status,
      };

      if (activeIdRef.current === sender) {
        setMessages((prev) => [...prev, newMsg]);
        socket.emit("message_seen", { messageId: _id, senderId: sender });
      } else {
        setSeed((prev) =>
          prev.map((c) =>
            (c._id || c.id) === sender
              ? { ...c, unread: (c.unread || 0) + 1, lastMsg: text }
              : c
          )
        );
      }

      refreshContacts();
    };

    const handleMessageSent = (payload) => {
      const { _id, content, status } = payload;
      // When E2EE is active, the server echoes back ciphertext.
      // Look up the original plaintext from our pending map.
      const plaintext = pendingPlaintextRef.current.get(content) || content;
      pendingPlaintextRef.current.delete(content);

      setMessages((prev) => {
        const idx = prev.findIndex(
          (m) => m.status === "Sending" && m.text === plaintext
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
  }, [socket, refreshContacts, tryDecrypt, getContactPubKey]);

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
            getSharedKey={getSharedKey}
            pendingPlaintextRef={pendingPlaintextRef}
          />
        ) : (
          <WelcomeDashboard onNewChat={() => navigate("/discover")} />
        )}
      </div>
    </div>
  );
}