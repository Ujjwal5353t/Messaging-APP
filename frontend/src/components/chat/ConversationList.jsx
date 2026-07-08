import { Search, Pin, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import Avatar from "@/components/common/Avatar";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function ConversationList({ conversations, activeId, onSelect, onNewChat }) {
  const [q, setQ] = useState("");
  
  
  const safeConversations = Array.isArray(conversations) ? conversations : [];

  const filtered = safeConversations.filter((c) => 
    (c.username || "").toLowerCase().includes(q.toLowerCase())
  );
  
  const pinned = filtered.filter((c) => c.pinned);
  const rest = filtered.filter((c) => !c.pinned);

  return (
    <div className="w-full md:w-[360px] lg:w-[380px] shrink-0 flex flex-col border-r border-border/60 bg-card/30 backdrop-blur-xl">
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-5">
          <h1 className="font-display text-3xl font-semibold">Chats</h1>
          <button
            onClick={onNewChat}
            className="h-10 w-10 rounded-2xl bg-gradient-primary text-primary-foreground grid place-items-center shadow-glow hover:scale-105 active:scale-95 transition"
            aria-label="New chat"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search conversations…"
            className="pl-11 h-11 rounded-2xl bg-background/60 border-border/60"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-elegant px-3 pb-6">
        {pinned.length > 0 && (
          <>
            <SectionLabel icon={<Pin className="h-3 w-3" />}>Pinned</SectionLabel>
            <div className="space-y-1 mb-4">
              {pinned.map((c) => {
                const id = c._id || c.id; // 🔑 Handle MongoDB ID variant mapping
                return <Row key={id} c={c} active={id === activeId} onClick={() => onSelect(id)} />;
              })}
            </div>
          </>
        )}
        
        <SectionLabel>All conversations</SectionLabel>
        <div className="space-y-1">
          {rest.map((c) => {
            const id = c._id || c.id; 
            return <Row key={id} c={c} active={id === activeId} onClick={() => onSelect(id)} />;
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 px-6 animate-fade-in">
            <div className="mx-auto h-16 w-16 rounded-3xl bg-muted grid place-items-center mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Add someone to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ children, icon }) {
  return (
    <div className="flex items-center gap-1.5 px-3 mt-2 mb-2 text-[11px] uppercase tracking-[0.14em] font-semibold text-muted-foreground/80">
      {icon}{children}
    </div>
  );
}

function Row({ c, active, onClick }) {
  const userInitials = c.initials || (c.username ? c.username.substring(0, 2).toUpperCase() : "??");

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-2xl text-left transition group relative",
        active
          ? "bg-gradient-to-r from-primary/10 to-accent/5 shadow-soft"
          : "hover:bg-sidebar-accent/70"
      )}
    >
      {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-gradient-primary" />}
      <Avatar initials={userInitials} color={c.avatarColor} online={c.online} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          {/* 🔑 Updated from c.name to c.username */}
          <span className={cn("truncate font-medium", active && "text-foreground")}>
            {c.username}
          </span>
          <span className={cn("text-xs shrink-0", c.unread > 0 ? "text-accent font-semibold" : "text-muted-foreground")}>
            {c.time || "Now"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className={cn("truncate text-sm", c.unread > 0 ? "text-foreground/80" : "text-muted-foreground")}>
            {c.typing ? <span className="text-accent italic">typing…</span> : (c.lastMessage || c.bio || "Click to open chat")}
          </span>
          {c.unread > 0 && (
            <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-accent text-white text-[11px] font-semibold grid place-items-center shadow-soft">
              {c.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}