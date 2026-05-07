import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "Min 6 characters").max(128),
  fullName: z.string().trim().min(1, "Required").max(100).optional(),
});

export default function Auth() {
  const [params] = useSearchParams();
  const initialMode = params.get("mode") === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) navigate("/account", { replace: true });
  }, [user, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({
      email,
      password,
      fullName: mode === "signup" ? fullName : undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Welcome to Maison Æra");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/account",
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:block flex-1 bg-cream relative">
        <img
          src="/src/assets/editorial.jpg"
          alt=""
          className="w-full h-full object-cover"
          onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
        />
        <Link
          to="/"
          className="absolute top-8 left-8 font-display text-2xl text-bone mix-blend-difference"
        >
          Maison <span className="italic font-light">Æra</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <Link to="/" className="md:hidden font-display text-2xl block mb-10">
            Maison <span className="italic font-light">Æra</span>
          </Link>
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
            {mode === "signin" ? "Welcome back" : "Join the maison"}
          </p>
          <h1 className="font-display text-4xl mb-8">
            {mode === "signin" ? "Sign in" : "Create account"}
          </h1>

          <button
            onClick={google}
            disabled={busy}
            className="w-full border border-border py-3 text-sm flex items-center justify-center gap-3 hover:bg-cream transition-colors disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 my-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <div className="flex-1 h-px bg-border" /> or <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-2">Name</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border-b border-border py-3 bg-transparent focus:border-espresso outline-none"
                  required
                />
              </div>
            )}
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-b border-border py-3 bg-transparent focus:border-espresso outline-none"
                required
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b border-border py-3 bg-transparent focus:border-espresso outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full bg-espresso text-bone py-4 text-xs uppercase tracking-[0.25em] hover:bg-ember transition-colors duration-500 disabled:opacity-50"
            >
              {busy ? "..." : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-8 text-sm text-muted-foreground text-center">
            {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-foreground underline-grow"
            >
              {mode === "signin" ? "Create account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
