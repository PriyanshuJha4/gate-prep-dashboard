"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "info" | "success">("info");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    if (!supabase) {
      setMessageType("error");
      setMessage("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    setIsSubmitting(true);
    if (mode === "forgot") {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        setMessageType(error ? "error" : "success");
        setMessage(error ? error.message : "If an account exists for that email, a password reset link has been sent.");
      } catch {
        setMessageType("error");
        setMessage("We could not send the reset link. Check your connection and try again.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    const result = mode === "signup"
      ? await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: name.trim() } },
        })
      : await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setIsSubmitting(false);

    if (result.error) {
      setMessageType("error");
      setMessage(result.error.message);
      return;
    }
    if (mode === "signup" && !result.data.session) {
      setMessageType("info");
      setMessage("Check your email to confirm the account, then sign in.");
      return;
    }
    router.replace("/");
  };

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-slate-700 bg-slate-900/90 p-6">
      <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Supabase account</p>
      <h1 className="mt-3 text-3xl font-bold text-white">{mode === "signup" ? "Create account" : mode === "forgot" ? "Reset password" : "Sign in"}</h1>
      <p className="mt-2 text-sm text-slate-300">{mode === "forgot" ? "Enter your account email and we’ll send a secure reset link." : "Your study profiles and progress sync through your Supabase account."}</p>

      <form onSubmit={submitAuth} className="mt-6 space-y-4">
        {mode === "signup" && (
          <label className="block space-y-1 text-sm text-slate-300">
            <span className="block">Name</span>
            <input required maxLength={100} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className={inputClass} />
          </label>
        )}
        <label className="block space-y-1 text-sm text-slate-300">
          <span className="block">Email</span>
          <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} />
        </label>
        {mode !== "forgot" && (
          <label className="block space-y-1 text-sm text-slate-300">
            <span className="block">Password</span>
            <input required minLength={8} type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} />
          </label>
        )}
        {message && <p role={messageType === "error" ? "alert" : "status"} className={`text-sm ${messageType === "error" ? "text-rose-300" : messageType === "success" ? "text-emerald-200" : "text-amber-200"}`}>{message}</p>}
        <button disabled={isSubmitting} type="submit" className="w-full rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-60">
          {isSubmitting ? "Please wait…" : mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Sign in"}
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        {mode === "signin" && (
          <button type="button" onClick={() => { setMode("forgot"); setMessage(""); }} className="text-cyan-200 hover:text-cyan-100">Forgot Password?</button>
        )}
        {mode === "forgot" ? (
          <button type="button" onClick={() => { setMode("signin"); setMessage(""); }} className="text-cyan-200 hover:text-cyan-100">Back to sign in</button>
        ) : (
          <button type="button" onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setMessage(""); }} className="text-cyan-200 hover:text-cyan-100">
            {mode === "signup" ? "Already registered? Sign in" : "New here? Create an account"}
          </button>
        )}
      </div>
    </div>
  );
}

const inputClass = "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400";
