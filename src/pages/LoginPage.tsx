import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "../components/Button.tsx";
import { Field } from "../components/Field.tsx";
import { useAuth } from "../hooks/useAuth.ts";
import { BUSINESS_NAME } from "../lib/brand.ts";

export function LoginPage() {
  const { ready, profile, login } = useAuth();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!ready) return null;
  if (profile) return <Navigate to={profile.role === "owner" ? "/dashboard" : "/home"} replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (!userId.trim() || !password) {
      setError("Enter your user ID and password.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await login(userId, password);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not sign in. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-surface">
      <header className="bg-ink px-5 pt-[max(2.5rem,env(safe-area-inset-top))] pb-8 text-white">
        <p className="text-sm font-medium text-white/70">{BUSINESS_NAME}</p>
        <h1 className="mt-2 text-[32px] leading-9 font-semibold">Field sales</h1>
        <p className="mt-2 text-[15px] text-white/75">Sign in to record a shop visit.</p>
      </header>
      <form className="flex flex-1 flex-col gap-4 px-4 py-6" onSubmit={onSubmit}>
        <Field label="User ID">
          <input
            className="control"
            value={userId}
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="username"
            onChange={(event) => setUserId(event.target.value)}
          />
        </Field>
        <Field label="Password">
          <input
            className="control"
            type="password"
            value={password}
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>
        {error ? <p className="text-[15px] text-bad">{error}</p> : null}
        <div className="mt-2">
          <Button type="submit" disabled={busy}>
            {busy ? "Signing in..." : "Login"}
          </Button>
        </div>
      </form>
    </div>
  );
}
