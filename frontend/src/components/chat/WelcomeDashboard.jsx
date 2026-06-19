import { MessageCircle, Sparkles, Users, Lock } from "lucide-react";

export default function WelcomeDashboard({ onNewChat }) {
  const stats = [
    { icon: MessageCircle, label: "Conversations", value: "12" },
    { icon: Users, label: "Friends", value: "47" },
    { icon: Sparkles, label: "Unread", value: "4" },
  ];
  return (
    <div className="flex-1 flex flex-col bg-mesh relative overflow-hidden">
      <div className="absolute top-20 -right-20 h-96 w-96 rounded-full bg-aurora opacity-20 blur-3xl animate-float" />
      <div className="absolute bottom-0 -left-20 h-80 w-80 rounded-full bg-gradient-accent opacity-15 blur-3xl" />

      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-2xl mx-auto text-center animate-fade-in">
        <div className="relative mb-8">
          <div className="h-24 w-24 rounded-[2rem] bg-gradient-primary grid place-items-center shadow-glow animate-float">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none">
              <path d="M4 12c0-4 3-7 7-7s7 3 7 7c0 3-2 5-4 6l-3 4-3-4c-2-1-4-3-4-6z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
              <circle cx="12" cy="11" r="2.5" fill="white"/>
            </svg>
          </div>
          <div className="absolute -top-2 -right-2 h-8 w-8 rounded-2xl bg-gradient-accent grid place-items-center shadow-soft">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl font-medium leading-tight mb-4">
          A quieter place <br/>to <em className="text-gradient-accent not-italic">say something</em>.
        </h1>
        <p className="text-muted-foreground text-lg max-w-md leading-relaxed mb-8">
          Pick a conversation from the left, or start a fresh one. Pulse is end-to-end encrypted —
          your words are yours.
        </p>

        <div className="flex flex-wrap gap-3 justify-center mb-12">
          <button
            onClick={onNewChat}
            className="h-12 px-6 rounded-2xl bg-gradient-primary text-primary-foreground font-medium shadow-soft hover-lift"
          >
            Start a new chat
          </button>
          <button className="h-12 px-6 rounded-2xl border bg-card/60 hover:bg-card font-medium transition">
            Invite friends
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 w-full max-w-md">
          {stats.map((s) => (
            <div key={s.label} className="glass rounded-2xl p-4 hover-lift">
              <s.icon className="h-5 w-5 text-accent mx-auto mb-2" />
              <div className="font-display text-2xl font-semibold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" /> End-to-end encrypted · Crafted with care
        </div>
      </div>
    </div>
  );
}
