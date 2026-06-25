import { useState } from "react";
import AppRail from "@/components/layout/AppRail";
import Avatar from "@/components/common/Avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/context/ThemeContext";
import { currentUser } from "@/lib/mockData";
import { Moon, Bell, Shield, Camera, LogOut, ChevronRight, Eye, MessageSquare, Volume2 } from "lucide-react";
// FIXED: Changed 'Navigate' to 'useNavigate' hook
import { useNavigate } from "react-router-dom"; 

export default function Settings() {
  const navigate = useNavigate(); // FIXED: Initialized the navigation hook
  const { theme, toggle } = useTheme();
  const [notif, setNotif] = useState({ push: true, sounds: true, preview: false, mentions: true });
  const [privacy, setPrivacy] = useState({ readReceipts: true, lastSeen: true, discoverable: true });

  // FIXED: Moved signout inside the component so it can use 'navigate'
  const handleSignout = (e) => {
    e.preventDefault();
    localStorage.removeItem("Token"); // Clear authentication token
    navigate("/login"); // Redirect to login
  };

  return (
    <div className="h-screen w-full flex bg-mesh overflow-hidden">
      <AppRail />
      <main className="flex-1 overflow-y-auto scroll-elegant">
        <div className="max-w-3xl mx-auto px-6 py-10 sm:py-14 space-y-8">
          <div className="animate-slide-up">
            <h1 className="font-display text-4xl sm:text-5xl font-medium tracking-tight">Settings</h1>
            <p className="text-muted-foreground mt-2 text-lg">Make Pulse feel like yours.</p>
          </div>

          {/* Profile card */}
          <section className="glass rounded-4xl p-6 sm:p-8 shadow-soft animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="relative shrink-0 mx-auto sm:mx-0">
                <Avatar initials={currentUser.initials} color={currentUser.avatarColor} size="2xl" />
                <button className="absolute bottom-1 right-1 h-10 w-10 rounded-2xl bg-background border grid place-items-center shadow-soft hover:scale-105 transition">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 space-y-4 w-full">
                <Field label="Display name"><Input defaultValue={currentUser.displayName} className="h-11 rounded-2xl bg-background/60" /></Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Username">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                      <Input defaultValue={currentUser.username} className="pl-8 h-11 rounded-2xl bg-background/60" />
                    </div>
                  </Field>
                  <Field label="Phone"><Input defaultValue={currentUser.phone} className="h-11 rounded-2xl bg-background/60" /></Field>
                </div>
                <Field label="Bio"><Textarea defaultValue={currentUser.bio} rows={2} className="rounded-2xl bg-background/60 resize-none" /></Field>
              </div>
            </div>
          </section>

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

/* UI Child Components stay safely outside */
function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">{label}</label>
      {children}
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