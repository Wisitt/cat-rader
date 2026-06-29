"use client";

import { useMemo, useState } from "react";
import { mockNotifications } from "@/lib/mock-data";
import { GitMerge, AlertTriangle, MapPin, CheckCircle, Info, Settings } from "lucide-react";
import Link from "next/link";
import type { NotificationType } from "@/types";
import { cn } from "@/lib/utils";

const icons: Record<NotificationType, React.ElementType> = {
  MATCH_FOUND: GitMerge,
  RESCUE_UPDATE: AlertTriangle,
  SIGHTING_NEAR: MapPin,
  STATUS_CHANGE: CheckCircle,
  SYSTEM: Info,
};

const iconColors: Record<NotificationType, string> = {
  MATCH_FOUND: "text-match-purple bg-purple-50",
  RESCUE_UPDATE: "text-emergency-red bg-red-50",
  SIGHTING_NEAR: "text-soft-blue bg-blue-50",
  STATUS_CHANGE: "text-primary bg-mint",
  SYSTEM: "text-text-muted bg-background",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [tab, setTab] = useState("All");
  const unread = notifications.filter((n) => !n.isRead);
  const filtered = useMemo(() => {
    if (tab === "Unread") return notifications.filter((n) => !n.isRead);
    if (tab === "Cases") return notifications.filter((n) => n.type === "RESCUE_UPDATE" || n.type === "STATUS_CHANGE" || n.type === "SIGHTING_NEAR");
    if (tab === "Matches") return notifications.filter((n) => n.type === "MATCH_FOUND");
    if (tab === "System") return notifications.filter((n) => n.type === "SYSTEM");
    return notifications;
  }, [notifications, tab]);

  function markRead(id: string) {
    setNotifications((current) => current.map((item) => item.id === id ? { ...item, isRead: true } : item));
    window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text: "Notification marked as read." } }));
  }

  function markAllRead() {
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
    window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text: "All notifications marked as read." } }));
  }

  return (
    <div className="page-shell max-w-5xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-strong">Notification Center</h1>
          <p className="mt-1 text-sm text-text-muted">Stay updated on important activity and cases.</p>
        </div>
        <button onClick={() => window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text: "Notification preferences saved." } }))} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-bold text-text-strong shadow-inner-sm">
          <Settings className="h-4 w-4" /> Settings
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {["All", "Unread", "Cases", "Matches", "System"].map((filter) => (
          <button key={filter} onClick={() => setTab(filter)} className={tab === filter ? "chip border-primary bg-primary text-white hover:text-white" : "chip"}>
            {filter === "Unread" ? `Unread ${unread.length}` : filter}
          </button>
        ))}
        <button onClick={markAllRead} className="ml-auto hidden text-xs font-bold text-primary sm:block">Mark all as read</button>
      </div>

      <div className="panel overflow-hidden">
        {filtered.map((n) => {
          const Icon = icons[n.type];
          return (
            <Link
              key={n.id}
              href={n.link ?? "/notifications"}
              onClick={() => markRead(n.id)}
              className={cn(
                "flex gap-3 border-b border-border p-4 transition-colors last:border-b-0",
                n.isRead
                  ? "bg-white"
                  : "bg-mint/30"
              )}
            >
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl", iconColors[n.type])}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn("text-sm font-medium", n.isRead ? "text-text-strong" : "text-text-strong")}>{n.title}</p>
                  {!n.isRead && <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />}
                </div>
                <p className="mt-0.5 text-sm text-text-muted">{n.body}</p>
                <p className="mt-1 text-xs text-text-muted">
                  {new Date(n.createdAt).toLocaleString("en-US", {
                    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
            </Link>
          );
        })}
        {filtered.length === 0 ? <div className="p-8 text-center text-sm text-text-muted">No notifications in this tab.</div> : null}
      </div>
    </div>
  );
}
