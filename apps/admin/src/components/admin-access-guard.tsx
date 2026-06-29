"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { Button, Card } from "@petradar/ui";

const allowedRoles = new Set(["ADMIN", "SUPER_ADMIN", "ANALYST", "CONTENT_EDITOR", "RESCUE_COORDINATOR"]);

export function AdminAccessGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"checking" | "allowed" | "denied">("checking");

  useEffect(() => {
    const role = window.localStorage.getItem("petradar:admin-role");
    setStatus(role && allowedRoles.has(role) ? "allowed" : "denied");
  }, []);

  if (status === "checking") {
    return (
      <div className="grid h-dvh place-items-center bg-background">
        <div className="text-sm font-bold text-text-muted">Checking admin permissions...</div>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="grid min-h-dvh place-items-center bg-background p-4">
        <Card className="max-w-md p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-700">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-text-strong">Admin access required</h1>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            This back office is restricted to admin, analyst, content editor, and rescue coordinator roles.
          </p>
          <Button className="mt-6" onClick={() => (window.location.href = "/login")}>Go to Admin Login</Button>
          <Link href="http://127.0.0.1:3000" className="mt-4 block text-sm font-bold text-primary">
            Open user app
          </Link>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
