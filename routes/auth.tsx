import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { SiteShell } from "@/components/layout/SiteShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in or Sign up — Zonasis" },
      { name: "description", content: "Sign in to your Zonasis account to manage enquiries and saved trips." },
    ],
  }),
  component: AuthPage,
});

function GoogleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.8 6.4 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c10.9 0 19.5-7.9 19.5-19.5 0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.8 6.4 29.2 4.5 24 4.5 16.3 4.5 9.6 9 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 43.5c5.1 0 9.7-1.9 13.2-5.1l-6.1-5c-2 1.4-4.5 2.2-7.1 2.2-5.3 0-9.7-3.1-11.3-7.4l-6.5 5C9.6 39 16.3 43.5 24 43.5z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.4-2.3 4.5-4.3 5.9l6.1 5C40.7 35.6 43.5 30.3 43.5 24c0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);

  async function signInWithGoogle() {
    setBusy("google");
    try {
      const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
      if (res.error) toast.error(res.error.message ?? "Could not sign in with Google");
    } finally {
      setBusy(null);
    }
  }

  async function emailLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy("login");
    const f = new FormData(e.currentTarget);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(f.get("email") ?? ""), password: String(f.get("password") ?? ""),
    });
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    navigate({ to: "/dashboard" });
  }

  async function emailSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy("signup");
    const f = new FormData(e.currentTarget);
    const { error } = await supabase.auth.signUp({
      email: String(f.get("email") ?? ""),
      password: String(f.get("password") ?? ""),
      options: {
        emailRedirectTo: window.location.origin + "/dashboard",
        data: { full_name: String(f.get("full_name") ?? "") },
      },
    });
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success("Account created!");
    navigate({ to: "/dashboard" });
  }

  async function forgotPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy("forgot");
    const f = new FormData(e.currentTarget);
    const { error } = await supabase.auth.resetPasswordForEmail(String(f.get("email") ?? ""), {
      redirectTo: window.location.origin + "/reset-password",
    });
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success("Reset link sent — check your email.");
  }

  return (
    <SiteShell footer={false}>
      <section className="mx-auto grid min-h-[80vh] max-w-md place-items-center px-4 py-12">
        <div className="w-full rounded-3xl border border-border bg-white p-6 shadow-elevated sm:p-8">
          <h1 className="font-display text-2xl font-bold text-foreground">Welcome to Zonasis</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to manage your enquiries and save trips.</p>

          <button onClick={signInWithGoogle} disabled={busy === "google"}
            className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold text-foreground shadow-soft transition hover:bg-section disabled:opacity-60">
            {busy === "google" ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>

          <Tabs defaultValue="login">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="login">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
              <TabsTrigger value="forgot">Forgot</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-4">
              <form className="grid gap-4" onSubmit={emailLogin}>
                <div className="grid gap-2"><Label>Email</Label><Input name="email" type="email" required /></div>
                <div className="grid gap-2"><Label>Password</Label><Input name="password" type="password" required minLength={6} /></div>
                <button disabled={busy === "login"} className="brand-gradient-bg inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-soft disabled:opacity-60">
                  {busy === "login" && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
                </button>
              </form>
            </TabsContent>
            <TabsContent value="signup" className="mt-4">
              <form className="grid gap-4" onSubmit={emailSignup}>
                <div className="grid gap-2"><Label>Full name</Label><Input name="full_name" required maxLength={120} /></div>
                <div className="grid gap-2"><Label>Email</Label><Input name="email" type="email" required /></div>
                <div className="grid gap-2"><Label>Password (min 6 chars)</Label><Input name="password" type="password" required minLength={6} /></div>
                <button disabled={busy === "signup"} className="brand-gradient-bg inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-soft disabled:opacity-60">
                  {busy === "signup" && <Loader2 className="h-4 w-4 animate-spin" />} Create account
                </button>
              </form>
            </TabsContent>
            <TabsContent value="forgot" className="mt-4">
              <form className="grid gap-4" onSubmit={forgotPassword}>
                <div className="grid gap-2"><Label>Email</Label><Input name="email" type="email" required /></div>
                <button disabled={busy === "forgot"} className="brand-gradient-bg inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-soft disabled:opacity-60">
                  {busy === "forgot" && <Loader2 className="h-4 w-4 animate-spin" />} Send reset link
                </button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to our terms & privacy policy. <Link to="/" className="underline">Back to home</Link>
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
