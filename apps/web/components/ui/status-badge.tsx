import { cn } from "@/lib/utils";
import type { SightingStatus, Urgency, VerificationStatus, LostPetStatus, MatchStatus, RescueStatus } from "@/types";

type BadgeValue =
  | SightingStatus
  | Urgency
  | VerificationStatus
  | LostPetStatus
  | MatchStatus
  | RescueStatus;

const styles: Record<string, string> = {
  // Sighting status
  STRAY: "bg-teal-50 text-teal-700 border-teal-200",
  INJURED: "bg-red-50 text-red-700 border-red-200",
  POSSIBLE_LOST: "bg-purple-50 text-purple-700 border-purple-200",
  RESCUE_NEEDED: "bg-orange-50 text-orange-700 border-orange-200",
  RESOLVED: "bg-green-50 text-green-700 border-green-200",
  // Urgency
  LOW: "bg-emerald-50 text-emerald-700 border-emerald-200",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
  HIGH: "bg-orange-50 text-orange-700 border-orange-200",
  EMERGENCY: "bg-red-600 text-white border-red-600 shadow-soft",
  // Verification
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  VERIFIED: "bg-teal-50 text-teal-700 border-teal-200",
  REJECTED: "bg-gray-100 text-gray-500 border-gray-200",
  DUPLICATE: "bg-gray-100 text-gray-500 border-gray-200",
  // Lost pet
  ACTIVE: "bg-teal-50 text-teal-700 border-teal-200",
  FOUND: "bg-green-50 text-green-700 border-green-200",
  CLOSED: "bg-gray-50 text-gray-500 border-gray-200",
  // Match
  CONFIRMED: "bg-green-50 text-green-700 border-green-200",
  // Rescue
  OPEN: "bg-blue-50 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
  RESCUED: "bg-green-50 text-green-700 border-green-200",
};

const labels: Record<string, string> = {
  POSSIBLE_LOST: "Possible Lost",
  RESCUE_NEEDED: "Rescue Needed",
  IN_PROGRESS: "In Progress",
};

interface StatusBadgeProps {
  value: BadgeValue;
  className?: string;
}

export function StatusBadge({ value, className }: StatusBadgeProps) {
  const style = styles[value] ?? "bg-gray-50 text-gray-600 border-gray-200";
  const label = labels[value] ?? value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold leading-none",
        style,
        className
      )}
    >
      {label}
    </span>
  );
}
