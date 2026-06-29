import type { UserRole } from "@/types";

export interface RouteAccess {
  public: boolean;
  roles?: UserRole[];
  loginReason?: string;
  fallback: string;
}

interface RouteRule extends RouteAccess {
  match: (pathname: string) => boolean;
}

const protectedRoute = (
  prefix: string,
  loginReason: string,
  roles?: UserRole[],
): RouteRule => ({
  match: (pathname) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  public: false,
  roles,
  loginReason,
  fallback: "/login",
});

export const PROTECTED_ROUTE_ACCESS: RouteRule[] = [
  {
    match: (pathname) => pathname === "/lost-pets/new",
    public: false,
    loginReason: "Log in to create a lost pet post and receive possible match alerts.",
    fallback: "/login",
  },
  protectedRoute("/pets", "Log in to manage Pet Passports, QR profiles, and health records."),
  protectedRoute("/matches", "Log in to review matches connected to your lost pet posts."),
  protectedRoute("/my-petradar", "Log in to view your reports, saved cases, and activity."),
  protectedRoute("/notifications", "Log in to see your alerts and case updates."),
  protectedRoute("/profile", "Log in to view and update your profile."),
  protectedRoute("/settings", "Log in to manage your account and privacy settings."),
  protectedRoute("/dashboard", "Log in to view your PetRadar activity."),
  protectedRoute(
    "/volunteer-profile",
    "Log in with a volunteer account to view assigned cases.",
    ["VOLUNTEER"],
  ),
  protectedRoute(
    "/rescue-cases",
    "Log in with a volunteer account to coordinate this rescue case.",
    ["VOLUNTEER"],
  ),
];

const PUBLIC_ACCESS: RouteAccess = {
  public: true,
  fallback: "/map",
};

export const PUBLIC_ROUTE_ACCESS = [
  "/",
  "/map",
  "/lost-pets",
  "/sightings",
  "/report",
  "/volunteer",
  "/safety",
  "/help",
  "/about",
  "/privacy",
  "/resources",
  "/p",
] as const;

const UNKNOWN_ROUTE_ACCESS: RouteAccess = {
  public: false,
  loginReason: "Log in to continue to this PetRadar page.",
  fallback: "/login",
};

export function getRouteAccess(pathname: string): RouteAccess {
  const protectedAccess = PROTECTED_ROUTE_ACCESS.find((rule) => rule.match(pathname));
  if (protectedAccess) return protectedAccess;

  const isPublic = PUBLIC_ROUTE_ACCESS.some((route) =>
    route === "/" ? pathname === "/" : pathname === route || pathname.startsWith(`${route}/`),
  );
  return isPublic ? PUBLIC_ACCESS : UNKNOWN_ROUTE_ACCESS;
}

export function isRoleAllowed(role: UserRole | undefined, access: RouteAccess) {
  return !access.roles?.length || Boolean(role && access.roles.includes(role));
}

export function safeReturnTo(value: string | string[] | undefined, fallback = "/map") {
  const destination = Array.isArray(value) ? value[0] : value;
  if (!destination || !destination.startsWith("/") || destination.startsWith("//")) return fallback;
  return destination;
}

export function loginHref(destination: string, reason: string) {
  const query = new URLSearchParams({ returnTo: safeReturnTo(destination), reason });
  return `/login?${query.toString()}`;
}

export function defaultRouteForRole(role: UserRole) {
  if (role === "PET_OWNER") return "/pets";
  if (role === "VOLUNTEER") return "/volunteer";
  if (role === "ADMIN") return "/map";
  return "/map";
}

export function roleForIntent(destination: string): UserRole | undefined {
  if (
    destination.startsWith("/pets") ||
    destination.startsWith("/matches") ||
    destination === "/lost-pets/new"
  ) {
    return "PET_OWNER";
  }
  if (destination.startsWith("/volunteer") || destination.startsWith("/rescue-cases")) {
    return "VOLUNTEER";
  }
  return undefined;
}
