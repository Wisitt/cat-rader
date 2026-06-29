import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: { value: number; label: string };
  accent?: "teal" | "amber" | "red" | "purple" | "blue";
  className?: string;
}

const accentStyles = {
  teal: "text-primary",
  amber: "text-amber-600",
  red: "text-red-500",
  purple: "text-match-purple",
  blue: "text-soft-blue",
};

export function StatCard({ label, value, icon: Icon, trend, accent = "teal", className }: StatCardProps) {
  return (
    <div className={cn("rounded-2xl border border-border/80 bg-surface p-4 shadow-soft sm:p-5", className)}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{label}</p>
        {Icon && (
          <div className={cn("rounded-xl border border-border/70 bg-background p-2", accentStyles[accent])}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-text-strong sm:text-3xl">{value}</p>
      {trend && (
        <p className="mt-1 text-xs text-text-muted">
          <span className={trend.value >= 0 ? "text-reunited-green" : "text-emergency-red"}>
            {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>{" "}
          {trend.label}
        </p>
      )}
    </div>
  );
}
