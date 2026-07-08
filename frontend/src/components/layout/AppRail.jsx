import { NavLink, useLocation } from "react-router-dom";
import { MessageCircle, Compass, Bell, Settings, LogOut, User, UserCheck } from "lucide-react";
import Logo from "@/components/common/Logo";
import Avatar from "@/components/common/Avatar";
import { cn } from "@/lib/utils";
import { profileApi, friendRequestApi } from "../../lib/api";
import { useEffect, useState } from "react";

const staticNav = [
  { to: "/home", icon: MessageCircle, label: "Chats" },
  { to: "/discover", icon: Compass, label: "Discover" },
  { to: "/profile", icon: User, label: "Profile" },
  { to: "/settings", icon: Settings, label: "Settings" },
];


export default function AppRail() {
  const loc = useLocation();
  const [currentUser, setCurrentUser] = useState("");
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const getuser = async () => {
      try {
        const response = await profileApi.getProfile();
        const userData = response.data || response;
        setCurrentUser(userData);
      } catch (error) {
        console.log("error getting the user : ", error);
      }
    };

    const getPendingRequests = async () => {
      try {
        const res = await friendRequestApi.getRequests();
        setPendingCount((res.data || []).length);
      } catch (_) {
        // silently ignore
      }
    };

    getuser();
    getPendingRequests();
  }, []);

  const username = currentUser?.username || "user";
  const initials = username.substring(0, 2).toUpperCase();

  // Build nav with friend requests item (with dynamic badge)
  const nav = [
    ...staticNav.slice(0, 2),
    { to: "/friend-requests", icon: UserCheck, label: "Requests", badge: pendingCount },
    ...staticNav.slice(2),
  ];

  return (
    <aside className="hidden md:flex w-20 lg:w-72 shrink-0 flex-col glass border-r border-border/60 p-4 lg:p-6">
      <div className="lg:px-2 mb-8 flex justify-center lg:justify-start">
        <div className="hidden lg:block"><Logo /></div>
        <div className="lg:hidden">
          <div className="h-10 w-10 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
              <path d="M4 12c0-4 3-7 7-7s7 3 7 7c0 3-2 5-4 6l-3 4-3-4c-2-1-4-3-4-6z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
              <circle cx="12" cy="11" r="2" fill="white" />
            </svg>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5">
        {nav.map((item) => {
          const active = loc.pathname.startsWith(item.to);
          const hasBadge = item.badge > 0;
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
              {/* Icon + mobile badge dot */}
              <div className="relative shrink-0">
                <item.icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                {hasBadge && (
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background" />
                )}
              </div>

              {/* Label + desktop badge chip */}
              <span className="hidden lg:flex lg:items-center lg:gap-2 font-medium flex-1 min-w-0">
                {item.label}
                {hasBadge && (
                  <span className={cn(
                    "ml-auto text-xs font-semibold px-2 py-0.5 rounded-full",
                    active ? "bg-white/20 text-white" : "bg-red-500 text-white"
                  )}>
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-4 pt-4 border-t border-border/60">
        <NavLink to="/settings" className="flex items-center gap-3 rounded-2xl p-2 lg:p-3 hover:bg-sidebar-accent transition group">
          <Avatar initials={initials} color="from-violet-500 to-fuchsia-400" size="sm" online />
          <div className="hidden lg:block min-w-0 flex-1">
            <div className="font-medium text-sm truncate">{currentUser?.displayName || username}</div>
            <div className="text-xs text-muted-foreground truncate">@{username}</div>
          </div>
          <LogOut className="hidden lg:block h-4 w-4 text-muted-foreground group-hover:text-foreground" />
        </NavLink>
      </div>
    </aside>
  );
}