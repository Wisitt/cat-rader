"use client";

import { useEffect } from "react";
import type { ComponentProps, MouseEvent, ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import type { UserRole } from "@/types";
import {
  getRouteAccess,
  isRoleAllowed,
  loginHref,
} from "@/lib/access-control";
import { useAuthStore } from "@/store/auth-store";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { mockPets } from "@/lib/mock-data";
import type { PetPassport } from "@/types";

function petOwnerId(petId: string) {
  if (typeof window === "undefined") return undefined;
  try {
    const stored = window.localStorage.getItem("petradar:pets");
    const pets = stored ? JSON.parse(stored) as PetPassport[] : mockPets;
    return pets.find((pet) => pet.id === petId)?.ownerId;
  } catch {
    return mockPets.find((pet) => pet.id === petId)?.ownerId;
  }
}

export function AccessGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const access = getRouteAccess(pathname);
  const petRoute = pathname.match(/^\/pets\/([^/]+)/);
  const petId = petRoute?.[1] !== "new" ? petRoute?.[1] : undefined;
  const ownsRequestedPet = !petId || petOwnerId(petId) === user?.id;

  useEffect(() => {
    if (!access.public && hasHydrated && !isAuthenticated) {
      router.replace(loginHref(pathname, access.loginReason ?? "Log in to continue."));
    }
  }, [access.loginReason, access.public, hasHydrated, isAuthenticated, pathname, router]);

  if (access.public) return <>{children}</>;

  if (!hasHydrated) {
    return (
      <div className="grid min-h-full place-items-center p-6">
        <div className="text-sm font-bold text-text-muted">Checking access...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="grid min-h-full place-items-center p-6">
        <div className="text-sm font-bold text-text-muted">Opening secure login...</div>
      </div>
    );
  }

  if (!isRoleAllowed(user?.role, access)) {
    return (
      <div className="grid min-h-full place-items-center p-4">
        <section className="panel max-w-md p-7 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-text-strong">Volunteer access required</h1>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            This page contains assigned cases and private coordination details. Apply as a volunteer before continuing.
          </p>
          <Link href="/volunteer#join" className={cn(buttonVariants(), "mt-6")}>
            View volunteer information
          </Link>
        </section>
      </div>
    );
  }

  if (!ownsRequestedPet) {
    return (
      <div className="grid min-h-full place-items-center p-4">
        <section className="panel max-w-md p-7 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-700">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-text-strong">Pet owner access required</h1>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            This Pet Passport belongs to another account. Identity, QR, and vaccination records stay private to the owner.
          </p>
          <Link href="/pets" className={cn(buttonVariants(), "mt-6")}>Back to My Pets</Link>
        </section>
      </div>
    );
  }

  return <>{children}</>;
}

interface ProtectedLinkProps extends ComponentProps<typeof Link> {
  reason: string;
  requiredRole?: UserRole;
}

export function ProtectedLink({
  href,
  reason,
  requiredRole,
  onClick,
  ...props
}: ProtectedLinkProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const role = useAuthStore((state) => state.user?.role);
  const destination = typeof href === "string" ? href : href.pathname ?? "/map";
  const allowed = isAuthenticated && (!requiredRole || role === requiredRole);
  const target = allowed ? href : loginHref(destination, reason);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (!hasHydrated) event.preventDefault();
  }

  return <Link href={target} onClick={handleClick} aria-disabled={!hasHydrated} {...props} />;
}

export function LoginRequiredNote({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted">
      <LockKeyhole className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}
