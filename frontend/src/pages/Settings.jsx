import { useState } from "react";
import AppRail from "@/components/layout/AppRail";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/context/ThemeContext";
import { Moon, Bell, Shield, LogOut, ChevronRight, Eye, MessageSquare, Volume2 } from "lucide-react";
// FIXED: Changed 'Navigate' to 'useNavigate' hook
import { useNavigate } from "react-router-dom"; 
import { authApi } from "../lib/api";
import { useSocket } from "@/context/SocketContext";


export default function Settings() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const { disconnectSocket } = useSocket();
  const [notif, setNotif] = useState({ push: true, sounds: true, preview: false, mentions: true });
  const [privacy, setPrivacy] = useState({ readReceipts: true, lastSeen: true, discoverable: true });

  
  const handleSignout = async (e) => {
    e.preventDefault();
    const res = await authApi.signout();
    if( res.success === true ) {
      disconnectSocket();
      navigate("/login"); 
    }
  };

  return (
    <div className="h-screen w-full flex bg-mesh overflow-hidden">
      <AppRail />
      <main className="flex-1 overflow-y-auto scroll-elegant">
        <div className="max-w-3xl mx-auto px-6 py-10 sm:py-14 space-y-8">
          <div className="animate-slide-up">
            <h1 className="font-display text-4xl sm:text-5xl font-medium tracking-tight">Settings</h1>
          </div>

          {/* Appearance */}
          <Section title="Appearance" icon={<Moon className="h-5 w-5" />}>
            <Row
              title="Dark mode"
              subtitle="Easier on the eyes after sundown."
              control={<Switch checked={theme === "dark"} onCheckedChange={toggle} />}
            />
          </Section>

          {/* Notifications */}
          <Section title="Notifications" icon={<Bell className="h-5 w-5" />}>
            <Row title="Push notifications" subtitle="Receive alerts on this device." control={<Switch checked={notif.push} onCheckedChange={(v) => setNotif({ ...notif, push: v })} />} />
            <Row title="Sounds" subtitle="Play a gentle chime for new messages." control={<Switch checked={notif.sounds} onCheckedChange={(v) => setNotif({ ...notif, sounds: v })} />} icon={<Volume2 className="h-4 w-4" />} />
            <Row title="Message previews" subtitle="Show message text in notifications." control={<Switch checked={notif.preview} onCheckedChange={(v) => setNotif({ ...notif, preview: v })} />} icon={<MessageSquare className="h-4 w-4" />} />
            <Row title="Only mentions in groups" subtitle="Quiet unless someone tags you." control={<Switch checked={notif.mentions} onCheckedChange={(v) => setNotif({ ...notif, mentions: v })} />} last />
          </Section>

          {/* Privacy */}
          <Section title="Privacy" icon={<Shield className="h-5 w-5" />}>
            <Row title="Read receipts" subtitle="Let others see when you've read their messages." control={<Switch checked={privacy.readReceipts} onCheckedChange={(v) => setPrivacy({ ...privacy, readReceipts: v })} />} />
            <Row title="Last seen" subtitle="Show your activity status to friends." control={<Switch checked={privacy.lastSeen} onCheckedChange={(v) => setPrivacy({ ...privacy, lastSeen: v })} />} icon={<Eye className="h-4 w-4" />} />
            <Row title="Discoverable by phone" subtitle="People with your number can find you." control={<Switch checked={privacy.discoverable} onCheckedChange={(v) => setPrivacy({ ...privacy, discoverable: v })} />} />
            <Row title="Blocked accounts" subtitle="Manage who can't reach you." control={<ChevronRight className="h-5 w-5 text-muted-foreground" />} last />
          </Section>

          {/* Danger Zone / Sign Out */}
          <section className="glass rounded-4xl p-6 sm:p-8 shadow-soft animate-fade-in flex items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-semibold">Sign out</h3>
              <p className="text-sm text-muted-foreground">You'll need your password to come back in.</p>
            </div>
            {/* FIXED: Linked to 'handleSignout' */}
            <button onClick={handleSignout} className="h-11 px-5 rounded-2xl bg-destructive/10 text-destructive font-medium hover:bg-destructive/20 transition flex items-center gap-2">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <section className="glass rounded-4xl shadow-soft overflow-hidden animate-fade-in">
      <header className="px-6 sm:px-8 pt-6 pb-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-gradient-primary text-primary-foreground grid place-items-center">{icon}</div>
        <h2 className="font-display text-xl font-semibold">{title}</h2>
      </header>
      <div className="px-6 sm:px-8 pb-2">{children}</div>
    </section>
  );
}

function Row({ title, subtitle, control, icon, last }) {
  return (
    <div className={`flex items-center gap-4 py-4 ${!last && "border-b border-border/50"}`}>
      {icon && <div className="h-8 w-8 rounded-xl bg-muted grid place-items-center text-muted-foreground">{icon}</div>}
      <div className="min-w-0 flex-1">
        <div className="font-medium">{title}</div>
        {subtitle && <div className="text-sm text-muted-foreground">{subtitle}</div>}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}