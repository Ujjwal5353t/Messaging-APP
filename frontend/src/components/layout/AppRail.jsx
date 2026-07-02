import { NavLink, useLocation } from "react-router-dom";
import { MessageCircle, Compass, Bell, Settings, LogOut, User } from "lucide-react";
import Logo from "@/components/common/Logo";
import Avatar from "@/components/common/Avatar";
import { currentUser } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/home", icon: MessageCircle, label: "Chats" },
  { to: "/discover", icon: Compass, label: "Discover" },
  { to: "/notifications", icon: Bell, label: "Activity" },
  { to: "/profile", icon: User, label: "Profile" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function AppRail() {
  const loc = useLocation();
  return (
    <aside className="hidden md:flex w-20 lg:w-72 shrink-0 flex-col glass border-r border-border/60 p-4 lg:p-6">
      <div className="lg:px-2 mb-8 flex justify-center lg:justify-start">
        <div className="hidden lg:block"><Logo /></div>
        <div className="lg:hidden">
          <div className="h-10 w-10 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
              <path d="M4 12c0-4 3-7 7-7s7 3 7 7c0 3-2 5-4 6l-3 4-3-4c-2-1-4-3-4-6z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
              <circle cx="12" cy="11" r="2" fill="white"/>
            </svg>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5">
        {nav.map((item) => {
          const active = loc.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "group flex items-center gap-3 rounded-2xl px-3 py-3 lg:px-4 transition relative overflow-hidden",
                active
                  ? "bg-gradient-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2.5 : 2} />
              <span className="hidden lg:inline font-medium">{item.label}</span>
              {item.label === "Activity" && (
                <span className="hidden lg:inline ml-auto h-2 w-2 rounded-full bg-accent animate-pulse" />
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-4 pt-4 border-t border-border/60">
        <NavLink to="/settings" className="flex items-center gap-3 rounded-2xl p-2 lg:p-3 hover:bg-sidebar-accent transition group">
          <Avatar initials={currentUser.initials} color={currentUser.avatarColor} size="sm" online />
          <div className="hidden lg:block min-w-0 flex-1">
            <div className="font-medium text-sm truncate">{currentUser.displayName}</div>
            <div className="text-xs text-muted-foreground truncate">@{currentUser.username}</div>
          </div>
          <LogOut className="hidden lg:block h-4 w-4 text-muted-foreground group-hover:text-foreground" />
        </NavLink>
      </div>
    </aside>
  );
}
