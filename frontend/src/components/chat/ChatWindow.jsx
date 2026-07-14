import { useEffect, useRef, useState, useCallback } from "react";
import { Phone, Video, Info, Smile, Paperclip, Image as ImageIcon, Mic, Send, Check, CheckCheck, ArrowLeft } from "lucide-react";
import Avatar from "@/components/common/Avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { profileApi } from "../../lib/api";
import { useSocket } from "@/context/SocketContext";

const EMOJI = ["✨","🌙","☕","🌸","🔥","💫","🫶","😊","😂","🎧","🌿","💌"];
const TYPING_DEBOUNCE_MS = 1500;

export default function ChatWindow({ conversation, messages, currentUserId, onBack, onMessageAdded }) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [local, setLocal] = useState(messages);
  const [remoteTyping, setRemoteTyping] = useState(false);
  const endRef = useRef(null);
  const typingTimerRef = useRef(null);
  const isTypingRef = useRef(false);
  const { socket } = useSocket();

  const conversationId = conversation._id || conversation.id;

  useEffect(() => { setLocal(messages); }, [messages]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [local, remoteTyping]);

  // Reset typing when conversation switches
  useEffect(() => {
    setRemoteTyping(false);
  }, [conversationId]);

  // Listen to typing events directly in ChatWindow for instant, reliable updates
  useEffect(() => {
    if (!socket) return;

    const handleTyping = ({ senderId, typing }) => {
      // Only care about typing from the person we're currently chatting with
      if (senderId === conversationId) {
        setRemoteTyping(typing);
      }
    };

    socket.on("user_typing", handleTyping);
    return () => socket.off("user_typing", handleTyping);
  }, [socket, conversationId]);

  // Mark messages as seen when the window is open
  useEffect(() => {
    if (!socket || !currentUserId) return;
    local.forEach((m) => {
      if (m.from === "them" && m.status !== "Seen" && m.id && !m.id.startsWith("__pending")) {
        socket.emit("message_seen", {
          messageId: m.id,
          senderId: conversationId,
        });
      }
    });
  }, [local, socket, currentUserId, conversationId]);

  const displayName = conversation.username || conversation.name || "Unknown";
  const initials = conversation.initials || (displayName ? displayName.substring(0, 2).toUpperCase() : "??");
  const avatarColor = conversation.avatarColor;

  const isOnline = conversation.online || (() => {
    if (!conversation.lastSeen) return false;
    const diffMs = new Date() - new Date(conversation.lastSeen);
    return diffMs < 300000;
  })();

  const getLastSeenText = () => {
    if (remoteTyping) {
      return (
        <span className="text-accent flex items-center gap-1">
          typing
          <span className="flex gap-0.5 ml-0.5">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </span>
        </span>
      );
    }

    if (isOnline) {
      return (
        <><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Active now</>
      );
    }

    const dateString = conversation.lastSeen;
    if (!dateString) return "Last seen recently";

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 60) return `Last seen ${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `Last seen ${diffHours}h ago`;
      return `Last seen on ${date.toLocaleDateString()}`;
    } catch (e) {
      return "Last seen recently";
    }
  };

  // Emit typing_stop and clean up timer
  const stopTyping = useCallback(() => {
    if (!socket || !currentUserId) return;
    if (isTypingRef.current) {
      socket.emit("typing_stop", {
        senderId: currentUserId,
        receiverId: conversationId,
      });
      isTypingRef.current = false;
    }
    clearTimeout(typingTimerRef.current);
  }, [socket, currentUserId, conversationId]);

  // Handle text input with typing indicator debounce
  const handleTextChange = (e) => {
    setText(e.target.value);
    if (!socket || !currentUserId) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("typing_start", {
        senderId: currentUserId,
        receiverId: conversationId,
      });
    }

    // Reset the debounce timer
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(stopTyping, TYPING_DEBOUNCE_MS);
  };

  // Cleanup typing on unmount or conversation switch
  useEffect(() => {
    return () => {
      stopTyping();
    };
  }, [stopTyping]);

  const send = async (e) => {
    try {
      e?.preventDefault();
      const trimmed = text.trim();
      if (!trimmed) return;

      stopTyping();

      let senderId = currentUserId;
      if (!senderId) {
        const user = await profileApi.getProfile();
        const userData = user.data || user;
        senderId = userData._id;
      }

      const receiverId = conversationId;
      setText("");
      setShowEmoji(false);

      if (socket && socket.connected) {
        // Optimistic UI
        const pendingId = "__pending_" + Date.now();
        const optimistic = {
          id: pendingId,
          from: "me",
          text: trimmed,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          read: false,
          status: "Sending",
        };
        setLocal((prev) => [...prev, optimistic]);
        if (onMessageAdded) onMessageAdded(optimistic);

        socket.emit("send_message", {
          senderId,
          receiverId,
          msg: trimmed,
        });
      } else {
        // HTTP fallback
        console.warn("[ChatWindow] Socket not connected — falling back to HTTP");
        const { messageApi } = await import("../../lib/api");
        const response = await messageApi.sendMessage({ senderId, receiverId, msg: trimmed });
        if (response && response.success) {
          const newMsg = {
            id: response.response?._id || Date.now().toString(),
            from: "me",
            text: trimmed,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            read: false,
            status: "Sent",
          };
          setLocal((prev) => [...prev, newMsg]);
          if (onMessageAdded) onMessageAdded(newMsg);
        }
      }
    } catch (error) {
      console.log("Error sending message:", error);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-mesh">
      {/* Header */}
      <header className="glass border-b border-border/60 px-4 sm:px-6 py-4 flex items-center gap-3">
        <button onClick={onBack} className="md:hidden h-9 w-9 rounded-xl hover:bg-muted grid place-items-center transition" aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Avatar initials={initials} color={avatarColor} online={isOnline} />
        <div className="min-w-0 flex-1">
          <div className="font-display text-lg font-semibold truncate">{displayName}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            {getLastSeenText()}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <IconBtn><Phone className="h-4.5 w-4.5" /></IconBtn>
          <IconBtn><Video className="h-4.5 w-4.5" /></IconBtn>
          <IconBtn><Info className="h-4.5 w-4.5" /></IconBtn>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scroll-elegant px-4 sm:px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-2">
          <DateDivider label="Today" />
          {local.map((m, i) => {
            const prev = local[i - 1];
            const grouped = prev && prev.from === m.from;
            return <Bubble key={m.id} m={m} grouped={grouped} convo={conversation} />;
          })}

          {/* Typing bubble — driven by local socket state */}
          {remoteTyping && (
            <div className="flex items-end gap-2 animate-fade-in mt-3">
              <Avatar initials={initials} color={avatarColor} size="xs" />
              <div className="bg-card rounded-3xl rounded-bl-md px-5 py-3.5 shadow-bubble border border-border/40">
                <span className="flex gap-1.5 items-center">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* Composer */}
      <div className="px-4 sm:px-8 pb-6 pt-2">
        <div className="max-w-3xl mx-auto relative">
          {showEmoji && (
            <div className="absolute bottom-full mb-2 left-12 glass-strong rounded-2xl p-3 shadow-elegant border animate-scale-in grid grid-cols-6 gap-1">
              {EMOJI.map((e) => (
                <button key={e} onClick={() => setText(text + e)} className="h-9 w-9 rounded-xl hover:bg-muted text-xl transition">{e}</button>
              ))}
            </div>
          )}
          <form onSubmit={send} className="glass-strong rounded-3xl shadow-elegant border border-border/60 flex items-end gap-1 p-2 pl-3">
            <IconBtn onClick={() => setShowEmoji((v) => !v)} type="button"><Smile className="h-5 w-5" /></IconBtn>
            <IconBtn type="button"><Paperclip className="h-5 w-5" /></IconBtn>
            <IconBtn type="button"><ImageIcon className="h-5 w-5" /></IconBtn>
            <Input
              value={text}
              onChange={handleTextChange}
              onBlur={stopTyping}
              placeholder="Write something thoughtful…"
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 h-11 text-[15px]"
            />
            {text.trim() ? (
              <button type="submit" className="h-10 w-10 rounded-2xl bg-gradient-primary text-primary-foreground grid place-items-center shadow-soft hover:scale-105 active:scale-95 transition">
                <Send className="h-4.5 w-4.5" />
              </button>
            ) : (
              <button type="button" className="h-10 w-10 rounded-2xl bg-gradient-accent text-white grid place-items-center shadow-soft hover:scale-105 active:scale-95 transition">
                <Mic className="h-4.5 w-4.5" />
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

function IconBtn({ children, ...props }) {
  return (
    <button
      {...props}
      className="h-10 w-10 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground grid place-items-center transition"
    >{children}</button>
  );
}

function DateDivider({ label }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="h-px flex-1 bg-border/60" />
      <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium">{label}</span>
      <div className="h-px flex-1 bg-border/60" />
    </div>
  );
}

function Bubble({ m, grouped, convo }) {
  const mine = m.from === "me";
  const convoDisplayName = convo.username || convo.name || "Unknown";
  const convoInitials = convo.initials || (convoDisplayName ? convoDisplayName.substring(0, 2).toUpperCase() : "??");
  const convoAvatarColor = convo.avatarColor;

  const StatusIcon = () => {
    if (!mine) return null;
    if (m.status === "Sending") {
      return (
        <span className="inline-block h-3 w-3 rounded-full border-2 border-muted-foreground/40 border-t-muted-foreground animate-spin" />
      );
    }
    if (m.status === "Seen" || m.read) return <CheckCheck className="h-3.5 w-3.5 text-accent" />;
    if (m.status === "Delivered") return <CheckCheck className="h-3.5 w-3.5 text-muted-foreground/60" />;
    return <Check className="h-3.5 w-3.5 text-muted-foreground/60" />;
  };

  return (
    <div className={cn("flex items-end gap-2 animate-bubble-in", mine ? "justify-end" : "justify-start", grouped ? "mt-0.5" : "mt-3")}>
      {!mine && (
        <div className={cn("w-8", grouped && "invisible")}>
          {!grouped && <Avatar initials={convoInitials} color={convoAvatarColor} size="xs" />}
        </div>
      )}
      <div className={cn("max-w-[78%] sm:max-w-[65%]")}>
        {!grouped && m.name && <div className="text-[11px] text-muted-foreground mb-1 ml-3 font-medium">{m.name}</div>}
        <div
          className={cn(
            "px-5 py-2.5 shadow-bubble text-[15px] leading-relaxed",
            mine
              ? "bg-gradient-primary text-primary-foreground rounded-3xl rounded-br-md"
              : "bg-card border border-border/40 rounded-3xl rounded-bl-md"
          )}
        >
          {m.text}
        </div>
        <div className={cn("flex items-center gap-1 mt-1 px-2 text-[11px] text-muted-foreground", mine ? "justify-end" : "justify-start")}>
          <span>{m.time}</span>
          <StatusIcon />
        </div>
      </div>
    </div>
  );
}
