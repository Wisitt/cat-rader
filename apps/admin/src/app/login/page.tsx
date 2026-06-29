"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, PawPrint, ShieldCheck } from "lucide-react";
import { Button, Card } from "@petradar/ui";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@petradar.app");
  const [password, setPassword] = useState("password");
  const [role, setRole] = useState("SUPER_ADMIN");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!email.includes("@")) {
      setError("Enter a valid admin email.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    window.setTimeout(() => {
      window.localStorage.setItem("petradar:admin-role", role);
      window.localStorage.setItem("petradar:admin-user", email);
      window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text: "Admin login successful." } }));
      router.push("/dashboard");
    }, 500);
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-background p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-soft">
            <PawPrint className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-text-strong">PetRadar Admin</h1>
          <p className="mt-2 text-sm text-text-muted">Sign in to the back office portal.</p>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-wide text-text-muted">Email</span>
            <input className="field" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-wide text-text-muted">Password</span>
            <input className="field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-wide text-text-muted">Demo role</span>
            <select className="field" value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Admin</option>
              <option value="ANALYST">Analyst</option>
              <option value="CONTENT_EDITOR">Content Editor</option>
              <option value="REPORTER">Reporter (blocked)</option>
            </select>
          </label>
          {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            <LockKeyhole className="h-4 w-4" /> {loading ? "Logging in..." : "Log in"}
          </Button>
        </form>
        <div className="mt-6 rounded-2xl border border-border bg-background p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-text-strong"><ShieldCheck className="h-4 w-4 text-primary" /> Permission separated</p>
          <p className="mt-1 text-xs leading-5 text-text-muted">Admin workflows are isolated from the public user app and require server-side permission checks.</p>
        </div>
        <Link href="http://127.0.0.1:3000/login" className="mt-4 block text-center text-sm font-bold text-primary">Open user login</Link>
      </Card>
    </div>
  );
}
