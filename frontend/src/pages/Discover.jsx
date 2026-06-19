import { useState } from "react";
import AppRail from "@/components/layout/AppRail";
import { Input } from "@/components/ui/input";
import { Search, Phone, AtSign, UserPlus, Check, Sparkles } from "lucide-react";
import Avatar from "@/components/common/Avatar";
import { discoverPeople } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export default function Discover() {
  const [mode, setMode] = useState("username");
  const [q, setQ] = useState("");
  const [added, setAdded] = useState({});

  const results = discoverPeople.filter((p) =>
    mode === "username"
      ? p.username.toLowerCase().includes(q.toLowerCase()) || p.name.toLowerCase().includes(q.toLowerCase())
      : true
  );

  return (
    <div className="h-screen w-full flex bg-mesh overflow-hidden">
      <AppRail />
      <main className="flex-1 overflow-y-auto scroll-elegant">
        <div className="max-w-3xl mx-auto px-6 py-10 sm:py-14">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium mb-4">
              <Sparkles className="h-3.5 w-3.5" /> Find your people
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-medium tracking-tight mb-3">
              Who would you like to <em className="text-gradient-accent not-italic">find?</em>
            </h1>
            <p className="text-muted-foreground text-lg">Search by unique username or by phone number — your call.</p>
          </div>

          {/* Mode tabs */}
          <div className="mt-8 inline-flex p-1 rounded-2xl bg-card/60 border border-border/60 shadow-soft">
            <TabBtn active={mode === "username"} onClick={() => setMode("username")} icon={<AtSign className="h-4 w-4" />}>Username</TabBtn>
            <TabBtn active={mode === "phone"} onClick={() => setMode("phone")} icon={<Phone className="h-4 w-4" />}>Phone</TabBtn>
          </div>

          <div className="mt-4 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={mode === "username" ? "@username or display name" : "+1 (415) 555 0000"}
              className="pl-14 h-14 rounded-3xl bg-card/80 border-border/60 shadow-soft text-base"
            />
          </div>

          {/* Results */}
          <div className="mt-8 space-y-2.5">
            {q && results.length === 0 && <EmptyState query={q} />}
            {(q || mode === "phone") && results.map((p, i) => (
              <div
                key={p.id}
                className="glass rounded-3xl p-4 sm:p-5 flex items-center gap-4 hover-lift animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <Avatar initials={p.initials} color={p.avatarColor} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="font-display text-lg font-semibold truncate">{p.name}</div>
                  <div className="text-sm text-muted-foreground truncate">@{p.username} · {p.bio}</div>
                </div>
                <button
                  onClick={() => setAdded({ ...added, [p.id]: true })}
                  className={cn(
                    "h-11 px-4 sm:px-5 rounded-2xl text-sm font-medium transition flex items-center gap-2 shrink-0",
                    added[p.id]
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-gradient-primary text-primary-foreground shadow-soft hover:scale-[1.02]"
                  )}
                >
                  {added[p.id] ? <><Check className="h-4 w-4" /> Added</> : <><UserPlus className="h-4 w-4" /><span className="hidden sm:inline">Add friend</span></>}
                </button>
              </div>
            ))}

            {!q && mode === "username" && (
              <div className="text-center py-20 animate-fade-in">
                <div className="mx-auto h-20 w-20 rounded-[1.5rem] bg-gradient-primary grid place-items-center shadow-glow mb-5 animate-float">
                  <Search className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="font-display text-2xl font-medium mb-2">Start typing to find someone</h3>
                <p className="text-muted-foreground">Try a username like <span className="text-foreground font-medium">@camille.d</span></p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function TabBtn({ active, onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition",
        active ? "bg-gradient-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
      )}
    >{icon}{children}</button>
  );
}

function EmptyState({ query }) {
  return (
    <div className="text-center py-16 animate-fade-in">
      <div className="mx-auto h-16 w-16 rounded-3xl bg-muted grid place-items-center mb-4">
        <Search className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="font-display text-xl font-medium mb-1">No one matches "{query}"</h3>
      <p className="text-sm text-muted-foreground">Double-check the username or try their phone number.</p>
    </div>
  );
}
