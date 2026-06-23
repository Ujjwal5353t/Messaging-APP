import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Logo from "@/components/common/Logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, ArrowRight } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    


    setTimeout(() => navigate("/home"), 600);
  };

  return (
    <div className="min-h-screen bg-mesh grid lg:grid-cols-2">
      {/* Left — Brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-aurora opacity-30 blur-3xl animate-float" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-gradient-accent opacity-25 blur-3xl" />

        <Logo />

        <div className="relative space-y-6 max-w-md animate-fade-in">
          <h1 className="font-display text-5xl leading-[1.05] font-medium">
            Conversations that <em className="text-gradient-accent not-italic">feel like</em> the room you're in.
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Pulse is a calmer, warmer place to talk. Built for people who care about
            craft, quiet, and the little details.
          </p>
        </div>

        <div className="relative flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex -space-x-2">
            {["from-rose-400 to-orange-300","from-violet-500 to-fuchsia-400","from-emerald-400 to-teal-500"].map((c,i)=>(
              <div key={i} className={`h-9 w-9 rounded-full bg-gradient-to-br ${c} ring-2 ring-background`} />
            ))}
          </div>
          <span>Trusted by 14,000+ thoughtful conversationalists</span>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-slide-up">
          <div className="lg:hidden mb-8"><Logo /></div>

          <div className="glass-strong rounded-4xl p-8 sm:p-10 shadow-elegant border">
            <div className="mb-8 space-y-2">
              <h2 className="font-display text-3xl font-semibold">Welcome back</h2>
              <p className="text-muted-foreground">Sign in to pick up where you left off.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email or username</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-11 h-12 rounded-2xl bg-background/60" placeholder="you@pulse.app" required />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Password</label>
                  <a className="text-xs text-accent hover:underline" href="#">Forgot?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="password" className="pl-11 h-12 rounded-2xl bg-background/60" placeholder="••••••••" required />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-2xl bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-soft group"
              >
                {loading ? "Signing in…" : (<>Sign in <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" /></>)}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" /> or continue with <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {["Google","Apple","X"].map(p => (
                <button key={p} className="h-11 rounded-2xl border bg-background/40 hover:bg-background transition text-sm font-medium">{p}</button>
              ))}
            </div>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              New here?{" "}
              <Link to="/signup" className="font-medium text-foreground hover:text-accent transition">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
