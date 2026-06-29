"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Button({
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost" | "danger";
}) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold shadow-inner-sm transition focus:outline-none focus:ring-4 focus:ring-primary/15 disabled:opacity-50",
        variant === "primary" && "bg-primary text-white shadow-soft hover:bg-primary-dark",
        variant === "outline" && "border border-input bg-white text-text-strong hover:bg-background",
        variant === "ghost" && "text-text-muted hover:bg-background hover:text-text-strong",
        variant === "danger" && "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
        className
      )}
      {...props}
    />
  );
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border border-border bg-white shadow-soft", className)} {...props} />;
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "teal" | "amber" | "red" | "green" | "purple" | "blue";
  className?: string;
}) {
  const tones = {
    neutral: "border-border bg-background text-text-muted",
    teal: "border-teal-200 bg-teal-50 text-teal-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    red: "border-red-200 bg-red-50 text-red-700",
    green: "border-green-200 bg-green-50 text-green-700",
    purple: "border-purple-200 bg-purple-50 text-purple-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
  };
  return (
    <span className={cn("inline-flex h-6 items-center rounded-full border px-2.5 text-xs font-bold", tones[tone], className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ value }: { value: string }) {
  const normalized = value.replace(/_/g, " ");
  const tone =
    /EMERGENCY|HIGH|REJECTED|BANNED|SUSPENDED/.test(value) ? "red" :
    /MEDIUM|PENDING|NEEDS/.test(value) ? "amber" :
    /VERIFIED|ACTIVE|PUBLISHED|REUNITED|RESOLVED|CONFIRMED/.test(value) ? "green" :
    /DUPLICATE|MATCH|ANALYST/.test(value) ? "purple" :
    "teal";
  return <Badge tone={tone}>{normalized.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}</Badge>;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "teal",
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: "teal" | "amber" | "red" | "green" | "purple" | "blue";
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-text-muted">{label}</p>
        {Icon ? <Icon className={cn("h-4 w-4", tone === "teal" && "text-primary", tone === "red" && "text-red-600", tone === "amber" && "text-amber-600", tone === "purple" && "text-purple-600", tone === "blue" && "text-blue-600", tone === "green" && "text-green-600")} /> : null}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-text-strong">{value}</p>
    </Card>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed border-border bg-white/70 p-6 text-center">
      <div>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-background text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <p className="mt-3 text-sm font-bold text-text-strong">{title}</p>
        <p className="mt-1 max-w-sm text-sm leading-6 text-text-muted">{description}</p>
      </div>
    </div>
  );
}

export function DataTable({
  columns,
  rows,
  pageSize = 8,
}: {
  columns: string[];
  rows: React.ReactNode[][];
  pageSize?: number;
}) {
  const [query, setQuery] = React.useState("");
  const [sortIndex, setSortIndex] = React.useState<number | null>(null);
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");
  const [page, setPage] = React.useState(0);
  const [selected, setSelected] = React.useState<Record<number, boolean>>({});

  const textFor = React.useCallback((node: React.ReactNode): string => {
    if (node === null || node === undefined || typeof node === "boolean") return "";
    if (typeof node === "string" || typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(textFor).join(" ");
    if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
      return textFor(node.props.children);
    }
    return "";
  }, []);

  const filtered = rows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => row.map(textFor).join(" ").toLowerCase().includes(query.toLowerCase()));

  const sorted = [...filtered].sort((a, b) => {
    if (sortIndex === null) return a.index - b.index;
    const left = textFor(a.row[sortIndex]).toLowerCase();
    const right = textFor(b.row[sortIndex]).toLowerCase();
    return sortDir === "asc" ? left.localeCompare(right) : right.localeCompare(left);
  });

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = sorted.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  const toggleSort = (index: number) => {
    if (sortIndex === index) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortIndex(index);
      setSortDir("asc");
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
      <div className="flex flex-col gap-3 border-b border-border bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(0);
          }}
          className="h-10 w-full rounded-xl border border-input bg-white px-3 text-sm text-text-strong shadow-inner-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 sm:max-w-sm"
          placeholder="Search table..."
        />
        <div className="flex items-center gap-2 text-xs font-bold text-text-muted">
          <span>{Object.values(selected).filter(Boolean).length} selected</span>
          <span>{sorted.length} results</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-background text-xs font-bold uppercase tracking-wide text-text-muted">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border accent-primary"
                  checked={visible.length > 0 && visible.every(({ index }) => selected[index])}
                  onChange={(event) =>
                    setSelected((current) => {
                      const next = { ...current };
                      visible.forEach(({ index }) => {
                        next[index] = event.target.checked;
                      });
                      return next;
                    })
                  }
                  aria-label="Select visible rows"
                />
              </th>
              {columns.map((column, index) => (
                <th key={column} className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleSort(index)}
                    className="inline-flex items-center gap-1 font-bold uppercase tracking-wide hover:text-primary"
                  >
                    {column}
                    {sortIndex === index ? <span>{sortDir === "asc" ? "↑" : "↓"}</span> : null}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visible.map(({ row, index }) => (
              <tr key={index} className={cn("hover:bg-background/70", selected[index] && "bg-mint/40")}>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border accent-primary"
                    checked={!!selected[index]}
                    onChange={(event) => setSelected((current) => ({ ...current, [index]: event.target.checked }))}
                    aria-label={`Select row ${index + 1}`}
                  />
                </td>
                {row.map((cell, cellIndex) => <td key={cellIndex} className="px-4 py-3 align-middle">{cell}</td>)}
              </tr>
            ))}
            {visible.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-10 text-center text-sm text-text-muted">
                  No results match the current search.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-border bg-white p-3 text-sm">
        <button
          type="button"
          className="rounded-xl border border-border px-3 py-2 font-bold text-text-muted disabled:opacity-40"
          disabled={currentPage === 0}
          onClick={() => setPage((value) => Math.max(0, value - 1))}
        >
          Previous
        </button>
        <span className="text-xs font-bold text-text-muted">
          Page {currentPage + 1} of {pageCount}
        </span>
        <button
          type="button"
          className="rounded-xl border border-border px-3 py-2 font-bold text-text-muted disabled:opacity-40"
          disabled={currentPage >= pageCount - 1}
          onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = React.useState<Array<{ id: number; text: string; tone: "success" | "error" | "info" }>>([]);

  React.useEffect(() => {
    const pushToast = (text: string, tone: "success" | "error" | "info" = "success") => {
      const id = Date.now() + Math.random();
      setMessages((current) => [...current, { id, text, tone }]);
      window.setTimeout(() => setMessages((current) => current.filter((item) => item.id !== id)), 3200);
    };

    const appendAudit = (action: string) => {
      const logs = JSON.parse(window.localStorage.getItem("petradar:audit") ?? "[]") as Array<Record<string, string>>;
      logs.unshift({
        id: `AUD-${String(logs.length + 1).padStart(4, "0")}`,
        actor: window.localStorage.getItem("petradar:admin-user") ?? "Prototype User",
        action,
        entityType: "UIAction",
        entityId: "local-prototype",
        timestamp: new Date().toISOString(),
      });
      window.localStorage.setItem("petradar:audit", JSON.stringify(logs.slice(0, 100)));
    };

    const onPrototypeToast = (event: Event) => {
      const detail = (event as CustomEvent<{ text?: string; tone?: "success" | "error" | "info" }>).detail;
      pushToast(detail?.text ?? "Action completed.", detail?.tone ?? "success");
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest("button");
      if (!button || button.disabled || button.type === "submit") return;
      if (button.dataset.prototypeHandled === "false") return;

      const text = (button.textContent ?? "Action").replace(/\s+/g, " ").trim();
      if (!text) return;
      if (/reject|delete|suspend|merge|close|false/i.test(text)) {
        const ok = window.confirm(`Confirm action: ${text}?`);
        if (!ok) {
          event.preventDefault();
          event.stopPropagation();
          pushToast(`${text} cancelled.`, "info");
          return;
        }
      }

      button.setAttribute("aria-pressed", button.getAttribute("aria-pressed") === "true" ? "false" : "true");
      appendAudit(text.toUpperCase().replace(/\s+/g, "_"));

      if (/export csv/i.test(text)) {
        const blob = new Blob(["id,type,status\n1,prototype,complete\n"], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "petradar-export.csv";
        link.click();
        URL.revokeObjectURL(url);
      } else if (/export pdf|print/i.test(text)) {
        window.print();
      } else if (/share/i.test(text) && navigator.clipboard) {
        void navigator.clipboard.writeText(window.location.href);
      }

      pushToast(`${text} completed.`);
    };

    const onSubmit = (event: SubmitEvent) => {
      if (event.defaultPrevented) return;
      const form = event.target as HTMLFormElement;
      if (!form || form.dataset.prototypeHandled === "false") return;
      event.preventDefault();
      const requiredControls = Array.from(form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("input, textarea, select"));
      const missing = requiredControls.filter((control) => control.required && !control.value.trim());
      if (missing.length > 0) {
        missing[0].focus();
        pushToast("Please complete required fields.", "error");
        return;
      }
      pushToast("Form saved successfully.");
    };

    window.addEventListener("petradar:toast", onPrototypeToast);
    document.addEventListener("click", onClick);
    document.addEventListener("submit", onSubmit);
    return () => {
      window.removeEventListener("petradar:toast", onPrototypeToast);
      document.removeEventListener("click", onClick);
      document.removeEventListener("submit", onSubmit);
    };
  }, []);

  return (
    <>
      {children}
      <div className="fixed right-4 top-4 z-[9999] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "rounded-2xl border bg-white px-4 py-3 text-sm font-bold shadow-elevated",
              message.tone === "success" && "border-teal-200 text-primary",
              message.tone === "error" && "border-red-200 text-red-700",
              message.tone === "info" && "border-border text-text-strong"
            )}
          >
            {message.text}
          </div>
        ))}
      </div>
    </>
  );
}

export function PrivacyWarningBanner({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900", className)}>
      Exact location should only be shared with trusted responders. Every exact-location access must be logged.
    </div>
  );
}
