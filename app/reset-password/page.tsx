"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isCheckingLink, setIsCheckingLink] = useState(Boolean(supabase));
  const [isRecoverySession, setIsRecoverySession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) setIsRecoverySession(true);
    });
    void supabase.auth.getSession().then(({ data, error }) => {
      setIsRecoverySession(Boolean(data.session) && !error);
      if (error || !data.session) {
        setMessageType("error");
        setMessage("This reset link is invalid or expired. Request a new one from the sign-in page.");
      }
      setIsCheckingLink(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const updatePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    if (!supabase || !isRecoverySession) {
      setMessageType("error");
      setMessage("This reset session has expired. Request a new password reset link.");
      return;
    }
    if (password.length < 8) {
      setMessageType("error");
      setMessage("Use at least 8 characters for your new password.");
      return;
    }
    if (password !== confirmPassword) {
      setMessageType("error");
      setMessage("The passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setMessageType("error");
        setMessage(error.message);
        return;
      }
      setMessageType("success");
      setMessage("Password updated successfully. Redirecting to your dashboard…");
      window.setTimeout(() => router.replace("/"), 900);
    } catch {
      setMessageType("error");
      setMessage("We could not update the password. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayedMessage = supabase
    ? message
    : "Supabase is not configured. Set the project URL and anon key to reset your password.";

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-slate-700 bg-slate-900/90 p-6">
      <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Account recovery</p>
      <h1 className="mt-3 text-3xl font-bold text-white">Choose a new password</h1>
      <p className="mt-2 text-sm text-slate-300">Reset links are single-use and expire for your security.</p>
      {isCheckingLink ? (
        <p role="status" className="mt-6 text-sm text-slate-300">Verifying reset link…</p>
      ) : isRecoverySession ? (
        <form onSubmit={updatePassword} className="mt-6 space-y-4">
          <label className="block space-y-1 text-sm text-slate-300">
            <span className="block">New password</span>
            <input required minLength={8} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} />
          </label>
          <label className="block space-y-1 text-sm text-slate-300">
            <span className="block">Confirm new password</span>
            <input required minLength={8} type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className={inputClass} />
          </label>
          {displayedMessage && <p role={messageType === "error" ? "alert" : "status"} className={`text-sm ${messageType === "error" ? "text-rose-300" : "text-emerald-200"}`}>{displayedMessage}</p>}
          <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-60">
            {isSubmitting ? "Updating…" : "Update password"}
          </button>
        </form>
      ) : (
        <p role="alert" className="mt-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{displayedMessage || "No valid password recovery session was found."}</p>
      )}
      <button type="button" onClick={() => router.replace("/login")} className="mt-5 text-sm text-cyan-200 hover:text-cyan-100">Back to sign in</button>
    </div>
  );
}

const inputClass = "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400";