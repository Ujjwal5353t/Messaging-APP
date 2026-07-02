import { useState, useEffect } from "react";
import AppRail from "@/components/layout/AppRail";
import { Input } from "@/components/ui/input";
// Added Mail icon for the email tab view
import { Search, Mail, AtSign, UserPlus, Check, Sparkles } from "lucide-react"; 
import Avatar from "@/components/common/Avatar";
import { cn } from "@/lib/utils";
import axios from "axios"; 

export default function Discover() {
  const [mode, setMode] = useState("username");
  const [added, setAdded] = useState({});
  const [searchInput, setSearchInput] = useState('');
  const [results, setResults] = useState([]); 
  const [error, setError] = useState('');

  const handleAddFriend = async (friendId) => {
    const token = localStorage.getItem("Token");

    try {
      await axios.post("http://localhost:8080/users/add" ,
        {
          friendId
        } ,
        {
          headers : {
            authorization : `bearer ${token}`
          }
        }
      )

      setAdded((prev) => ({
        ...prev,
        [friendId] : true
      }));
    } catch (error) {
      console.error(error);
      console.log(err.response?.data);
  console.log(err.response?.status);
    setError(error.response?.data?.message || 'Something went wrong');
    }
  }


  useEffect(() => {
    if (!searchInput.trim()) {
      setResults([]);
      setError('');
      return;
    }

    const delayDebounceTimer = setTimeout(async () => {
      const token = localStorage.getItem("Token");

      try {
        setError('');
        const response = await axios.get("http://localhost:8080/users/find", {
          params: { identifier: searchInput },
          headers: { Authorization: `Bearer ${token}` }
        });

        const userData = response.data.data;
        if (userData) {
          setResults(Array.isArray(userData) ? userData : [userData]);
        } else {
          setResults([]);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Something went wrong');
        setResults([]);
      }
    }, 500); 

    return () => clearTimeout(delayDebounceTimer);
  }, [searchInput]); 

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
            <p className="text-muted-foreground text-lg">Search by unique username or by email — your call.</p>
          </div>

          {/* Mode tabs */}
          <div className="mt-8 inline-flex p-1 rounded-2xl bg-card/60 border border-border/60 shadow-soft">
            <TabBtn active={mode === "username"} onClick={() => setMode("username")} icon={<AtSign className="h-4 w-4" />}>Username</TabBtn>
            {/* ✅ FIXED: Set mode to "email" correctly and swapped to Mail icon */}
            <TabBtn active={mode === "email"} onClick={() => setMode("email")} icon={<Mail className="h-4 w-4" />}>Email</TabBtn>
          </div>

          <div className="mt-4 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={searchInput} 
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={mode === "username" ? "username" : "test@gmail.com"}
              className="pl-14 h-14 rounded-3xl bg-card/80 border-border/60 shadow-soft text-base"
            />
          </div>

          {/* Error Banner */}
          {error && <p className="text-sm text-red-500 mt-2 ml-2">{error}</p>}

          {/* Results */}
          <div className="mt-8 space-y-2.5">
            {searchInput && results.length === 0 && !error && <EmptyState query={searchInput} />}
            {(searchInput || mode === "email") && results.map((p, i) => (
              <div
                key={p.id || p._id || i}
                className="glass rounded-3xl p-4 sm:p-5 flex items-center gap-4 hover-lift animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <Avatar initials={p.initials || "U"} color={p.avatarColor} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="font-display text-lg font-semibold truncate">{p.username}</div>
                  <div className="text-sm text-muted-foreground truncate">{p.email} · {p.bio}</div>
                </div>
                <button
                  onClick={() => handleAddFriend(p._id)}
                  className={cn(
                    "h-11 px-4 sm:px-5 rounded-2xl text-sm font-medium transition flex items-center gap-2 shrink-0",
                    added[p.id || p._id]
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-gradient-primary text-primary-foreground shadow-soft hover:scale-[1.02]"
                  )}
                >
                  {added[p.id || p._id] ? <><Check className="h-4 w-4" /> Added</> : <><UserPlus className="h-4 w-4" /><span className="hidden sm:inline">Add friend</span></>}
                </button>
              </div>
            ))}

            {!searchInput && mode === "username" && (
              <div className="text-center py-20 animate-fade-in">
                <div className="mx-auto h-20 w-20 rounded-[1.5rem] bg-gradient-primary grid place-items-center shadow-glow mb-5 animate-float">
                  <Search className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="font-display text-2xl font-medium mb-2">Start typing to find someone</h3>
                <p className="text-muted-foreground">Try a username like <span className="text-foreground font-medium">camille.d</span></p>
              </div>
            )}

            {!searchInput && mode === "email" && (
              <div className="text-center py-20 animate-fade-in">
                <div className="mx-auto h-20 w-20 rounded-[1.5rem] bg-gradient-primary grid place-items-center shadow-glow mb-5 animate-float">
                  <Mail className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="font-display text-2xl font-medium mb-2">Search by email address</h3>
                <p className="text-muted-foreground">Try an address like <span className="text-foreground font-medium">test@gmail.com</span></p>
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
      <p className="text-sm text-muted-foreground">Double-check the username or email formatting.</p>
    </div>
  );
}