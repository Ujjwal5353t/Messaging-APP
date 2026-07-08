import { useState, useEffect } from "react";
import AppRail from "@/components/layout/AppRail";
import Avatar from "@/components/common/Avatar";
import { cn } from "@/lib/utils";
import { friendRequestApi } from "../lib/api";
import { UserCheck, UserX, Bell, Clock, Users } from "lucide-react";

export default function FriendRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [responded, setResponded] = useState({}); // requestId -> "accepted" | "rejected"

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await friendRequestApi.getRequests();
        setRequests(res.data || []);
      } catch (err) {
        console.error("Failed to fetch friend requests:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleRespond = async (requestId, action) => {
    setActionLoading((prev) => ({ ...prev, [requestId]: action }));
    try {
      await friendRequestApi.respondRequest(requestId, action);
      setResponded((prev) => ({ ...prev, [requestId]: action }));
    } catch (err) {
      console.error(`Failed to ${action} request:`, err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: null }));
    }
  };

  const pendingRequests = requests.filter((r) => !responded[r._id]);
  const respondedRequests = requests.filter((r) => responded[r._id]);

  return (
    <div className="h-screen w-full flex bg-mesh overflow-hidden">
      <AppRail />
      <main className="flex-1 overflow-y-auto scroll-elegant">
        <div className="max-w-3xl mx-auto px-6 py-10 sm:py-14">

          {/* Header */}
          <div className="animate-slide-up mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium mb-4">
              <Bell className="h-3.5 w-3.5" /> Incoming requests
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-medium tracking-tight mb-3">
              Friend <em className="text-gradient-accent not-italic">Requests</em>
            </h1>
            <p className="text-muted-foreground text-lg">
              People who want to connect with you.
            </p>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass rounded-3xl p-5 flex items-center gap-4 animate-pulse">
                  <div className="h-14 w-14 rounded-full bg-muted/60 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-muted/60 rounded-full" />
                    <div className="h-3 w-48 bg-muted/40 rounded-full" />
                  </div>
                  <div className="h-11 w-28 bg-muted/40 rounded-2xl" />
                </div>
              ))}
            </div>
          )}

          {/* Pending requests */}
          {!loading && pendingRequests.length > 0 && (
            <div className="space-y-3">
              {pendingRequests.map((req, i) => {
                const sender = req.sender;
                const initials = (sender?.username || "U").substring(0, 2).toUpperCase();
                const isAccepting = actionLoading[req._id] === "accept";
                const isRejecting = actionLoading[req._id] === "reject";
                const isAnyLoading = isAccepting || isRejecting;

                return (
                  <div
                    key={req._id}
                    className="glass rounded-3xl p-4 sm:p-5 flex items-center gap-4 hover-lift animate-fade-in"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <Avatar initials={initials} color="from-violet-400 to-fuchsia-500" size="lg" />
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-lg font-semibold truncate">
                        {sender?.username || "Unknown"}
                      </div>
                      <div className="text-sm text-muted-foreground truncate flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        {sender?.bio || "Wants to be your friend"}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Reject */}
                      <button
                        onClick={() => handleRespond(req._id, "reject")}
                        disabled={isAnyLoading}
                        className={cn(
                          "h-10 px-4 rounded-2xl text-sm font-medium transition flex items-center gap-2",
                          "border border-border/60 text-muted-foreground hover:text-red-400 hover:border-red-400/50 hover:bg-red-400/10",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        {isRejecting ? (
                          <span className="h-4 w-4 border-2 border-muted border-t-foreground rounded-full animate-spin" />
                        ) : (
                          <UserX className="h-4 w-4" />
                        )}
                        <span className="hidden sm:inline">{isRejecting ? "Declining…" : "Decline"}</span>
                      </button>

                      {/* Accept */}
                      <button
                        onClick={() => handleRespond(req._id, "accept")}
                        disabled={isAnyLoading}
                        className={cn(
                          "h-10 px-4 rounded-2xl text-sm font-medium transition flex items-center gap-2",
                          "bg-gradient-primary text-primary-foreground shadow-soft hover:scale-[1.02]",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        {isAccepting ? (
                          <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}
                        <span className="hidden sm:inline">{isAccepting ? "Accepting…" : "Accept"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Already responded (slide-out confirmation) */}
          {!loading && respondedRequests.length > 0 && (
            <div className="mt-6 space-y-2">
              {respondedRequests.map((req) => {
                const wasAccepted = responded[req._id] === "accept";
                const sender = req.sender;
                const initials = (sender?.username || "U").substring(0, 2).toUpperCase();
                return (
                  <div
                    key={req._id}
                    className="rounded-3xl p-4 sm:p-5 flex items-center gap-4 bg-card/40 border border-border/40 opacity-60"
                  >
                    <Avatar initials={initials} color="from-slate-400 to-slate-500" size="lg" />
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-base font-semibold truncate text-muted-foreground">
                        {sender?.username || "Unknown"}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "h-9 px-4 rounded-2xl text-xs font-medium flex items-center gap-2",
                        wasAccepted
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {wasAccepted ? (
                        <><UserCheck className="h-3.5 w-3.5" /> Added as friend</>
                      ) : (
                        <><UserX className="h-3.5 w-3.5" /> Declined</>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {!loading && requests.length === 0 && (
            <div className="text-center py-24 animate-fade-in">
              <div className="mx-auto h-24 w-24 rounded-[2rem] bg-gradient-primary grid place-items-center shadow-glow mb-6 animate-float">
                <Users className="h-10 w-10 text-primary-foreground" />
              </div>
              <h3 className="font-display text-2xl font-medium mb-2">No pending requests</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">
                When someone sends you a friend request, it will appear here.
              </p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
