import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  Heart,
  HeartHandshake,
  Map,
  PawPrint,
  Plus,
  ShieldCheck,
  User,
} from "lucide-react";
import type { UserRole } from "@/types";

export interface DesktopNavItem {
  href: string;
  label: string;
  badge?: number;
}

export interface MobileNavItem extends DesktopNavItem {
  icon: LucideIcon;
  primary?: boolean;
  loginReason?: string;
}

export const PUBLIC_DESKTOP_NAV: DesktopNavItem[] = [
  { href: "/map", label: "Explore Map" },
  { href: "/lost-pets", label: "Lost Pets" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#pet-passport", label: "Pet Passport" },
  { href: "/safety", label: "Safety" },
  { href: "/help", label: "Help Center" },
];

const SIGNED_IN_DESKTOP_NAV: Record<Exclude<UserRole, "GUEST" | "ADMIN">, DesktopNavItem[]> = {
  REPORTER: [
    { href: "/map", label: "Map" },
    { href: "/lost-pets", label: "Lost Pets" },
    { href: "/pets", label: "My Pets" },
  ],
  PET_OWNER: [
    { href: "/map", label: "Map" },
    { href: "/lost-pets", label: "Lost Pets" },
    { href: "/pets", label: "My Pets" },
    { href: "/matches", label: "Matches", badge: 3 },
  ],
  VOLUNTEER: [
    { href: "/map", label: "Map" },
    { href: "/volunteer", label: "Nearby Cases" },
    { href: "/volunteer-profile", label: "My Cases" },
    { href: "/lost-pets", label: "Lost Pets" },
  ],
};

const GUEST_MOBILE_NAV: MobileNavItem[] = [
  { href: "/map", label: "Map", icon: Map },
  { href: "/lost-pets", label: "Lost Pets", icon: Heart },
  { href: "/report", label: "Report", icon: Plus, primary: true },
  { href: "/safety", label: "Safety", icon: ShieldCheck },
  {
    href: "/profile",
    label: "Log in",
    icon: User,
    loginReason: "Log in to view your profile.",
  },
];

const SIGNED_IN_MOBILE_NAV: Record<Exclude<UserRole, "GUEST" | "ADMIN">, MobileNavItem[]> = {
  REPORTER: [
    { href: "/map", label: "Map", icon: Map },
    { href: "/lost-pets", label: "Lost Pets", icon: Heart },
    { href: "/report", label: "Report", icon: Plus, primary: true },
    { href: "/pets", label: "My Pets", icon: PawPrint },
    { href: "/profile", label: "Profile", icon: User },
  ],
  PET_OWNER: [
    { href: "/map", label: "Map", icon: Map },
    { href: "/lost-pets", label: "Lost Pets", icon: Heart },
    { href: "/report", label: "Report", icon: Plus, primary: true },
    { href: "/pets", label: "My Pets", icon: PawPrint },
    { href: "/profile", label: "Profile", icon: User },
  ],
  VOLUNTEER: [
    { href: "/map", label: "Map", icon: Map },
    { href: "/volunteer", label: "Nearby", icon: HeartHandshake },
    { href: "/report", label: "Report", icon: Plus, primary: true },
    { href: "/volunteer-profile", label: "My Cases", icon: ClipboardList },
    { href: "/profile", label: "Profile", icon: User },
  ],
};

export function desktopNavigation(role: UserRole | undefined, isAuthenticated: boolean) {
  if (!isAuthenticated) return PUBLIC_DESKTOP_NAV;
  if (!role || role === "GUEST" || role === "ADMIN") return [{ href: "/map", label: "Map" }];
  return SIGNED_IN_DESKTOP_NAV[role];
}

export function mobileNavigation(role: UserRole | undefined, isAuthenticated: boolean) {
  if (!isAuthenticated) return GUEST_MOBILE_NAV;
  if (!role || role === "GUEST" || role === "ADMIN") return GUEST_MOBILE_NAV;
  return SIGNED_IN_MOBILE_NAV[role];
}

export function isNavigationActive(pathname: string, href: string) {
  const route = href.split("#")[0];
  if (route === "/") return false;
  return pathname === route || pathname.startsWith(`${route}/`);
}
