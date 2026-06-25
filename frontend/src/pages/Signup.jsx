import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { localSignup } from "@/Authentication/localSignup";
import Logo from "@/components/common/Logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
// Added ArrowLeft here
import { ArrowRight, ArrowLeft, Camera, Check, Loader2 } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ username: "", email: "", password: "", bio: "" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const next = (e) => { e.preventDefault(); setStep((s) => s + 1); };
  
  // Added back navigation handler
  const prev = () => { setStep((s) => s - 1); };

  const finish = async (e) => {
    setLoading(true);
    setError("");

    try {
      await localSignup({
        e,
        form,
        navigate,
      });
    } catch (err) {
      console.log("BACKEND RESPONSE:", err.response?.data);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-6">
      <div className="w-full max-w-lg animate-slide-up">
        <div className="flex justify-center mb-8"><Logo /></div>

        <div className="glass-strong rounded-4xl p-8 sm:p-10 shadow-elegant border">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2].map((n) => (
              <div key={n} className="flex-1 flex items-center gap-2">
                <div className={`h-8 w-8 rounded-full grid place-items-center text-xs font-semibold transition
                  ${step >= n ? "bg-gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {step > n ? <Check className="h-4 w-4" /> : n}
                </div>
                {n < 2 && <div className={`h-0.5 flex-1 rounded-full ${step > n ? "bg-gradient-primary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>

          <div className="mb-8 space-y-2">
            <h2 className="font-display text-3xl font-semibold">
              {step === 1 && "Create your account"}
              {step === 2 && "Style It"}
            </h2>
            <p className="text-muted-foreground">
              {step === 1 && "Just the essentials to get you in."}
              {step === 2 && "Add a face and a few words. You can edit anytime."}
            </p>
          </div>

          {step === 1 && (
            <form onSubmit={next} className="space-y-4">
              <FieldRow label="username">
                <Input value={form.username} onChange={set("username")} required className="h-12 rounded-2xl bg-background/60" placeholder="Mo Lester" />
              </FieldRow>
              <FieldRow label="Email">
                <Input type="email" value={form.email} onChange={set("email")} required className="h-12 rounded-2xl bg-background/60" placeholder="test@gmail.app" />
              </FieldRow>
              <FieldRow label="Password">
                <Input type="password" value={form.password} onChange={set("password")} required className="h-12 rounded-2xl bg-background/60" placeholder="At least 8 characters" />
              </FieldRow>
              <SubmitBtn label="Continue" />
            </form>
          )}

          {step === 2 && (
            <form onSubmit={finish} className="space-y-5">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="h-20 w-20 rounded-3xl bg-aurora grid place-items-center text-white font-display text-2xl shadow-glow">
                    {form.username?.[0]?.toUpperCase() || "A"}
                  </div>
                  <button type="button" className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-background border grid place-items-center shadow-soft hover:scale-105 transition">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <div className="font-display text-lg font-medium">{form.username || "Your name"}</div>
                  <div className="text-sm text-muted-foreground">@{form.username || "username"}</div>
                </div>
              </div>
              <FieldRow label="Bio" hint="A sentence or two — what are you about?">
                <Textarea value={form.bio} onChange={set("bio")} rows={3} className="rounded-2xl bg-background/60 resize-none" placeholder="Designer, dreamer, occasional baker." />
              </FieldRow>
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">
                  {error}
                </div>
              )}

              {/* Wrapped buttons in a responsive layout */}
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prev}
                  disabled={loading}
                  className="h-12 px-5 rounded-2xl border bg-background/40 hover:bg-muted text-muted-foreground group"
                >
                  <ArrowLeft className="mr-1 h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                  Back
                </Button>
                
                <div className="flex-1">
                  <SubmitBtn
                    label={loading ? "Creating Account ..." : "Enter VAU"}
                    loading={loading}
                  />
                </div>
              </div>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-foreground hover:text-accent transition">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function FieldRow({ label, hint, children }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function SubmitBtn({ loading, label }) {
  return (
    <Button
      type="submit"
      disabled={loading}
      className="w-full h-12 rounded-2xl bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-soft group"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {label}
        </>
      ) : (
        <>
          {label}
          <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </>
      )}
    </Button>
  );
}