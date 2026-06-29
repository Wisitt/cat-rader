import type { User } from "@/types";

export interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export async function authenticate(
  endpoint: "login" | "register" | "google",
  body: Record<string, unknown>,
): Promise<AuthResult> {
  const response = await fetch(`${apiUrl}/auth/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json() as AuthResult | { message?: string | string[] };

  if (!response.ok || !("user" in payload)) {
    const message = "message" in payload ? payload.message : undefined;
    throw new Error(Array.isArray(message) ? message[0] : message || "Authentication could not be completed.");
  }
  return payload;
}

export function persistAuthSession(result: AuthResult) {
  window.localStorage.setItem("petradar:access-token", result.accessToken);
  window.localStorage.setItem("petradar:refresh-token", result.refreshToken);
  window.localStorage.setItem("petradar:user-role", result.user.role);
}
