"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertOctagon,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Download,
  Edit2,
  FileClock,
  FileText,
  Filter,
  Flame,
  Globe2,
  LockKeyhole,
  MapPin,
  Megaphone,
  Plus,
  Save,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  mockAnalytics,
  mockAuditLogs,
  mockFaqs,
  mockPages,
  mockReports,
  mockRescueCases,
  mockUsers,
} from "@petradar/api-client";
import { Badge, Button, Card, DataTable, PrivacyWarningBanner, StatCard, StatusBadge } from "@petradar/ui";
import type { AnimalSighting, AuditLog, CMSPage, FAQ, RescueCase, RescueStatus, Species, User, VerificationStatus } from "@petradar/types";

// ── Local types ────────────────────────────────────────────────────────────────

type AbuseStatus = "PENDING" | "REVIEWED" | "DISMISSED" | "ACTIONED";
interface AbuseReport {
  id: string;
  reportedEntity: string;
  reason: string;
  reporter: string;
  status: AbuseStatus;
  evidence: string;
  createdAt: string;
  notes?: string;
}

interface CMSItem {
  id: string;
  title: string;
  type: "page" | "faq" | "safety" | "help" | "announcement";
  question?: string;
  slug?: string;
  category?: string;
  audience?: string;
  publishAt?: string;
  content?: string;
  status: "DRAFT" | "PUBLISHED";
  updatedAt: string;
}

interface AdminSettings {
  defaultPublicRadius: number;
  sessionTimeoutMinutes: number;
  notifyOnHighUrgency: boolean;
  notifyOnNewReport: boolean;
  requireTwoFactorForExact: boolean;
}

interface CaseNote { ts: string; actor: string; text: string }
interface RescueCaseState extends RescueCase { notes?: CaseNote[] }

// ── Seed mock data for local-only types ────────────────────────────────────────

const SEED_ABUSE: AbuseReport[] = [
  { id: "ABU-001", reportedEntity: "CAT-00021", reason: "Exact location disclosed", reporter: "Nicha P.", status: "PENDING", evidence: "Screenshot shows exact coordinates shared in a public comment thread.", createdAt: "2026-06-26T08:00:00Z" },
  { id: "ABU-002", reportedEntity: "USR-002", reason: "Harassment of reporter", reporter: "Pim R.", status: "PENDING", evidence: "Three threatening messages sent through the app contact form.", createdAt: "2026-06-25T14:30:00Z" },
  { id: "ABU-003", reportedEntity: "CAT-00022", reason: "False report", reporter: "Karn T.", status: "REVIEWED", evidence: "Photo analysis shows a different animal from a prior year.", createdAt: "2026-06-25T10:00:00Z", notes: "Rejected – confirmed not the same animal" },
  { id: "ABU-004", reportedEntity: "USR-008", reason: "Spam submissions", reporter: "Lek A.", status: "ACTIONED", evidence: "15 identical reports submitted within 2 hours from same account.", createdAt: "2026-06-24T19:00:00Z", notes: "Account suspended." },
];

const SEED_CMS: CMSItem[] = [
  ...mockPages.map<CMSItem>((p) => ({ id: p.id, type: "page" as const, title: p.title, slug: p.slug, status: p.status, updatedAt: p.updatedAt, content: "Page content goes here." })),
  ...mockFaqs.map<CMSItem>((f) => ({ id: f.id, type: "faq" as const, title: f.question, question: f.question, category: f.category, status: f.status, updatedAt: "2026-06-20", content: "Answer goes here." })),
  { id: "ANN-001", type: "announcement", title: "New volunteer verification process", audience: "Volunteers", status: "PUBLISHED", publishAt: "2026-06-25", updatedAt: "2026-06-25" },
  { id: "ANN-002", type: "announcement", title: "PetRadar iOS app update v2.1", audience: "All users", status: "DRAFT", publishAt: "2026-07-01", updatedAt: "2026-06-24" },
  { id: "SAFE-001", type: "safety", title: "How to safely approach an injured animal", category: "Field Safety", status: "PUBLISHED", updatedAt: "2026-06-20" },
  { id: "SAFE-002", type: "safety", title: "Reporting guidelines for strays", category: "Reports", status: "PUBLISHED", updatedAt: "2026-06-18" },
  { id: "HELP-001", type: "help", title: "Getting started with PetRadar", category: "Onboarding", status: "PUBLISHED", updatedAt: "2026-06-22" },
  { id: "HELP-002", type: "help", title: "How to post a lost pet listing", category: "Lost Pets", status: "DRAFT", updatedAt: "2026-06-19" },
];

const SEED_SETTINGS: AdminSettings = { defaultPublicRadius: 250, sessionTimeoutMinutes: 60, notifyOnHighUrgency: true, notifyOnNewReport: false, requireTwoFactorForExact: true };

const ROLE_PERMISSIONS: Record<string, string[]> = {
  Guest:              ["view_public_map"],
  Reporter:           ["view_public_map", "submit_reports"],
  "Pet Owner":        ["view_public_map", "submit_reports", "manage_pets", "post_lost_pet"],
  Volunteer:          ["view_public_map", "submit_reports", "view_assigned_cases"],
  "Verified Volunteer":["view_public_map", "submit_reports", "view_assigned_cases", "view_exact_location"],
  "Rescue Coordinator":["view_public_map", "submit_reports", "view_assigned_cases", "view_exact_location", "manage_rescue_cases", "assign_volunteers"],
  "Content Editor":   ["view_public_map", "manage_cms_content"],
  Analyst:            ["view_public_map", "view_analytics", "export_data"],
  Admin:              ["view_public_map", "submit_reports", "verify_reports", "manage_rescue_cases", "manage_users", "view_exact_location", "view_analytics", "manage_cms_content", "view_audit_logs"],
  "Super Admin":      ["view_public_map", "submit_reports", "verify_reports", "manage_rescue_cases", "manage_users", "view_exact_location", "view_analytics", "manage_cms_content", "view_audit_logs", "manage_roles", "manage_settings"],
};

const ALL_PERMISSIONS = Array.from(new Set(Object.values(ROLE_PERMISSIONS).flat())).sort();

// ── State helpers ─────────────────────────────────────────────────────────────

function loadState<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : null; } catch { return null; }
}

function saveState<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function adminActor(): string {
  return loadState<string>("petradar:admin-role") ?? "Admin";
}

function addAudit(action: string, entityType: string, entityId: string): void {
  const prev = loadState<AuditLog[]>("petradar:admin:audit") ?? [];
  const entry: AuditLog = { id: `AUD-${Date.now()}`, actor: adminActor(), action, entityType, entityId, timestamp: new Date().toISOString(), ipAddress: "192.0.2.1" };
  saveState("petradar:admin:audit", [entry, ...prev].slice(0, 200));
}

function showToast(text: string, type: "success" | "error" = "success"): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text, type } }));
}

// ── Shared UI components ──────────────────────────────────────────────────────

function ConfirmModal({ open, title, body, onConfirm, onCancel, danger = false }: { open: boolean; title: string; body: string; onConfirm: () => void; onCancel: () => void; danger?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-elevated">
        <h2 className="text-lg font-bold text-text-strong">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-text-muted">{body}</p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition ${danger ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:bg-primary-dark"}`}
          >
            Confirm
          </button>
          <button onClick={onCancel} className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-text-muted hover:bg-background">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function Drawer({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);
  return (
    <>
      {open && <div className="fixed inset-0 z-[800] bg-black/30" onClick={onClose} />}
      <div className={`fixed inset-y-0 right-0 z-[810] flex w-full max-w-lg flex-col bg-white shadow-elevated transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-bold text-text-strong">{title}</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl border border-border text-text-muted hover:bg-background">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`chip transition-colors ${active ? "border-primary bg-primary text-white" : ""}`}
    >
      {label}
    </button>
  );
}

const formatDate = (value: string) =>
  new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

function PageHeader({ title, description, actions }: { title: string; description: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-strong">{title}</h1>
        <p className="mt-1 text-sm text-text-muted">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

function ReportThumb({ src, alt }: { src: string; alt: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className="h-12 w-12 rounded-xl object-cover" />;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-bold text-text-muted">{children}</span>;
}

// ── AdminDashboardPage ─────────────────────────────────────────────────────────

export function AdminDashboardPage() {
  const [reports]  = useState<AnimalSighting[]>(() => loadState("petradar:admin:reports") ?? mockReports);
  const [rescues]  = useState<RescueCaseState[]>(() => loadState("petradar:admin:rescue-cases") ?? mockRescueCases);
  const recentLogs = useMemo(() => {
    const local = loadState<AuditLog[]>("petradar:admin:audit") ?? [];
    return [...local, ...mockAuditLogs].slice(0, 8);
  }, []);

  const highUrgency = reports.filter((r) => r.urgency === "HIGH" || r.urgency === "EMERGENCY").length;
  const duplicates  = reports.filter((r) => r.duplicateRisk === "HIGH").length;

  return (
    <div className="admin-shell space-y-5">
      <PageHeader
        title="Admin Dashboard"
        description="Operational overview for report verification, rescue workflow, and system health."
        actions={
          <Link href="/verification" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-dark">
            <ClipboardCheck className="h-4 w-4" /> Review Queue
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Link href="/verification?status=PENDING">
          <StatCard label="Pending Reports" value={reports.filter((r) => r.verificationStatus === "PENDING").length} icon={ClipboardCheck} />
        </Link>
        <Link href="/verification?urgency=HIGH">
          <StatCard label="High Urgency" value={highUrgency} icon={AlertOctagon} tone="red" />
        </Link>
        <Link href="/duplicates">
          <StatCard label="Duplicate Risk" value={duplicates} icon={FileText} tone="purple" />
        </Link>
        <Link href="/rescue-cases">
          <StatCard label="Open Rescues" value={rescues.filter((c) => c.status !== "CLOSED").length} icon={Flame} tone="amber" />
        </Link>
        <Link href="/volunteers">
          <StatCard label="Assignments" value={rescues.filter((c) => c.assignedTo).length} icon={Users} tone="blue" />
        </Link>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-bold text-text-strong">Recent Admin Actions</h2>
          </div>
          <div className="divide-y divide-border">
            {recentLogs.slice(0, 8).map((log) => (
              <div key={log.id} className="grid gap-2 p-4 sm:grid-cols-[140px_minmax(0,1fr)_160px]">
                <p className="text-xs font-bold text-text-muted">{formatDate(log.timestamp)}</p>
                <div>
                  <p className="text-sm font-bold text-text-strong">{log.action.replace(/_/g, " ")}</p>
                  <p className="text-xs text-text-muted">{log.entityType} · {log.entityId}</p>
                </div>
                <p className="text-sm font-semibold text-primary">{log.actor}</p>
              </div>
            ))}
            {recentLogs.length === 0 && (
              <p className="p-5 text-sm text-text-muted">No admin actions yet.</p>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-bold text-text-strong">System Health Summary</h2>
          <div className="mt-4 space-y-3">
            {([
              ["API status", "Operational", "green"],
              ["Storage", "99.9% available", "green"],
              ["PostGIS queries", "Healthy", "green"],
              ["Exact access logs", "Enabled", "teal"],
            ] as [string, string, "green" | "teal"][]).map(([label, value, tone]) => (
              <div key={label} className="flex items-center justify-between rounded-xl bg-background p-3">
                <span className="text-sm font-semibold text-text-muted">{label}</span>
                <Badge tone={tone}>{value}</Badge>
              </div>
            ))}
          </div>
          <PrivacyWarningBanner className="mt-4" />
        </Card>
      </div>
    </div>
  );
}

// ── VerificationQueuePage ─────────────────────────────────────────────────────

export function VerificationQueuePage() {
  const [reports, setReports] = useState<AnimalSighting[]>(() => loadState("petradar:admin:reports") ?? mockReports);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [speciesF, setSpeciesF] = useState<Species | "">("");
  const [urgencyF, setUrgencyF] = useState<string>("");
  const [statusF,  setStatusF]  = useState<VerificationStatus | "">("");
  const [dupF,     setDupF]     = useState<string>("");
  const [confirm,  setConfirm]  = useState<{ title: string; body: string; onConfirm: () => void; danger?: boolean } | null>(null);

  useEffect(() => { const s = loadState<AnimalSighting[]>("petradar:admin:reports"); if (s) setReports(s); }, []);

  function bulkUpdate(ids: string[], update: Partial<AnimalSighting>, auditAction: string) {
    setReports((prev) => {
      const next = prev.map((r) => ids.includes(r.id) ? { ...r, ...update } : r);
      saveState("petradar:admin:reports", next);
      return next;
    });
    ids.forEach((id) => addAudit(auditAction, "AnimalSighting", id));
    showToast(`${ids.length} report(s) updated.`);
    setSelected(new Set());
  }

  const filtered = useMemo(() => reports.filter((r) => {
    if (speciesF && r.species !== speciesF) return false;
    if (urgencyF && r.urgency !== urgencyF) return false;
    if (statusF && r.verificationStatus !== statusF) return false;
    if (dupF && r.duplicateRisk !== dupF) return false;
    return true;
  }), [reports, speciesF, urgencyF, statusF, dupF]);

  const selIds = Array.from(selected);

  const rows = filtered.map((report) => [
    <input
      key="chk"
      type="checkbox"
      className="h-4 w-4 rounded border-border accent-primary"
      checked={selected.has(report.id)}
      onChange={(e) => setSelected((prev) => { const n = new Set(prev); e.target.checked ? n.add(report.id) : n.delete(report.id); return n; })}
    />,
    <Link key="id" href={`/verification/${report.id}`} className="font-bold text-primary">{report.id}</Link>,
    <ReportThumb key="photo" src={report.photoUrl} alt={report.id} />,
    report.species,
    report.condition,
    report.area,
    report.reporter,
    formatDate(report.createdAt),
    <span key="trust" className="font-bold text-text-strong">{report.reporterTrust}</span>,
    <StatusBadge key="dup" value={report.duplicateRisk} />,
    <StatusBadge key="urg" value={report.urgency} />,
    <StatusBadge key="stat" value={report.verificationStatus} />,
    <Link key="open" href={`/verification/${report.id}`} className="text-sm font-bold text-primary">Open</Link>,
  ]);

  return (
    <div className="admin-shell space-y-5">
      {confirm && <ConfirmModal open title={confirm.title} body={confirm.body} onConfirm={() => { confirm.onConfirm(); setConfirm(null); }} onCancel={() => setConfirm(null)} danger={confirm.danger} />}
      <PageHeader
        title="Verification Queue"
        description="Review and verify recent animal reports from the community."
        actions={
          <button className="chip" onClick={() => { setSpeciesF(""); setUrgencyF(""); setStatusF(""); setDupF(""); }}>
            <Filter className="h-4 w-4" /> Clear Filters
          </button>
        }
      />

      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-text-muted">Species:</span>
          {(["", "CAT", "DOG", "OTHER"] as const).map((v) => (
            <FilterChip key={v} label={v || "All"} active={speciesF === v} onClick={() => setSpeciesF(v)} />
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-text-muted">Urgency:</span>
          {["", "EMERGENCY", "HIGH", "MEDIUM", "LOW"].map((v) => (
            <FilterChip key={v} label={v || "All"} active={urgencyF === v} onClick={() => setUrgencyF(v)} />
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-text-muted">Status:</span>
          {(["", "PENDING", "VERIFIED", "REJECTED"] as const).map((v) => (
            <FilterChip key={v} label={v || "All"} active={statusF === v} onClick={() => setStatusF(v as VerificationStatus | "")} />
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-text-muted">Dup risk:</span>
          {["", "HIGH", "MEDIUM", "LOW"].map((v) => (
            <FilterChip key={v} label={v || "All"} active={dupF === v} onClick={() => setDupF(v)} />
          ))}
        </div>
      </div>

      <DataTable
        columns={["", "Report ID", "Photo", "Species", "Condition", "Area", "Reporter", "Created", "Trust", "Duplicate", "Urgency", "Status", ""]}
        rows={rows}
      />

      <div className="grid gap-2 sm:grid-cols-4">
        <Button
          onClick={() => {
            if (!selIds.length) { showToast("Select reports first.", "error"); return; }
            setConfirm({ title: "Approve Selected", body: `Approve ${selIds.length} report(s)? This will mark them as VERIFIED.`, onConfirm: () => bulkUpdate(selIds, { verificationStatus: "VERIFIED" }, "BULK_APPROVED") });
          }}
        >
          <Check className="h-4 w-4" /> Approve Selected {selIds.length > 0 && `(${selIds.length})`}
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            if (!selIds.length) { showToast("Select reports first.", "error"); return; }
            setConfirm({ title: "Reject Selected", body: `Reject ${selIds.length} report(s)? They will be marked as REJECTED.`, danger: true, onConfirm: () => bulkUpdate(selIds, { verificationStatus: "REJECTED" }, "BULK_REJECTED") });
          }}
        >
          <X className="h-4 w-4" /> Reject Selected
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            if (!selIds.length) { showToast("Select reports first.", "error"); return; }
            setConfirm({ title: "Mark as Duplicate", body: `Mark ${selIds.length} report(s) as duplicates?`, onConfirm: () => bulkUpdate(selIds, { verificationStatus: "DUPLICATE" }, "BULK_MARKED_DUPLICATE") });
          }}
        >
          Mark Duplicate
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            if (!selIds.length) { showToast("Select reports first.", "error"); return; }
            setConfirm({ title: "Convert to Rescue Case", body: `Convert ${selIds.length} report(s) to rescue cases?`, onConfirm: () => { bulkUpdate(selIds, { verificationStatus: "VERIFIED" }, "BULK_CONVERTED_RESCUE"); showToast("Converted — see Rescue Operations."); } });
          }}
        >
          Convert to Rescue
        </Button>
      </div>
    </div>
  );
}

// ── ReportDetailPage ──────────────────────────────────────────────────────────

export function ReportDetailPage({ id, mode = "verification" }: { id: string; mode?: "verification" | "reports" }) {
  const [reports, setReports] = useState<AnimalSighting[]>(() => loadState("petradar:admin:reports") ?? mockReports);
  const report = reports.find((r) => r.id === id) ?? reports[0];
  const [decision, setDecision] = useState(report.verificationStatus);
  const [dupCheck, setDupCheck] = useState(report.duplicateRisk);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [confirm, setConfirm] = useState<{ title: string; body: string; onConfirm: () => void; danger?: boolean } | null>(null);

  function save(override?: Partial<AnimalSighting>) {
    setReports((prev) => {
      const next = prev.map((r) => r.id === report.id ? { ...r, verificationStatus: decision as VerificationStatus, duplicateRisk: dupCheck as "LOW" | "MEDIUM" | "HIGH", ...override } : r);
      saveState("petradar:admin:reports", next);
      return next;
    });
    addAudit(`DECISION_${decision}`, "AnimalSighting", report.id);
    if (note) addAudit("INTERNAL_NOTE_ADDED", "AnimalSighting", report.id);
    setSaved(true);
    showToast("Decision saved.");
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="admin-shell space-y-5">
      {confirm && <ConfirmModal open title={confirm.title} body={confirm.body} onConfirm={() => { confirm.onConfirm(); setConfirm(null); }} onCancel={() => setConfirm(null)} danger={confirm.danger} />}
      <PageHeader
        title={mode === "verification" ? "Admin Report Detail" : "Report Moderation Detail"}
        description={`${report.id} · ${report.area} · exact access restricted`}
        actions={
          <Button onClick={() => save()}>
            {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? "Saved!" : "Save Decision"}
          </Button>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <Card className="grid gap-4 p-4 lg:grid-cols-[360px_minmax(0,1fr)]">
            <div>
              <ReportThumb src={report.photoUrl} alt={report.id} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={report.photoUrl} alt={report.id} className="mt-3 aspect-[4/3] w-full rounded-2xl object-cover" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-background p-4">
                <h2 className="text-sm font-bold text-text-strong">Animal Details</h2>
                <dl className="mt-3 space-y-2 text-sm">
                  {[["Species", report.species], ["Condition", report.condition], ["Color", report.color], ["Area", report.area], ["Report ID", report.id]].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4">
                      <dt className="text-text-muted">{label}</dt>
                      <dd className="font-bold text-text-strong">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="rounded-2xl bg-background p-4">
                <h2 className="text-sm font-bold text-text-strong">Reporter</h2>
                <p className="mt-3 text-sm font-bold text-text-strong">{report.reporter}</p>
                <p className="text-xs text-text-muted">Trust score {report.reporterTrust}/100</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <StatusBadge value={report.urgency} />
                  <StatusBadge value={report.duplicateRisk} />
                </div>
              </div>
              <div className="rounded-2xl bg-[linear-gradient(135deg,#e9f6f1,#f8faf7)] p-4 md:col-span-2">
                <h2 className="text-sm font-bold text-text-strong">Approximate Location Map</h2>
                <div className="mt-3 grid h-56 place-items-center rounded-2xl border border-border bg-white/80 text-center">
                  <div>
                    <MapPin className="mx-auto h-8 w-8 text-primary" />
                    <p className="mt-2 text-sm font-bold text-text-strong">{report.area}</p>
                    <p className="text-xs text-text-muted">Public approximate coordinates only</p>
                    <p className="mt-1 text-xs text-text-muted">{report.publicLatitude.toFixed(4)}, {report.publicLongitude.toFixed(4)} (approx.)</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-bold text-text-strong">Similar Sightings Nearby</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {reports.filter((r) => r.id !== report.id && r.species === report.species).slice(0, 3).map((item) => (
                <Link href={`/duplicates/${item.id}`} key={item.id} className="rounded-2xl border border-border bg-background p-3 hover:border-primary/30">
                  <p className="text-sm font-bold text-text-strong">{item.id}</p>
                  <p className="mt-1 text-xs text-text-muted">{item.area} · {item.duplicateRisk} risk</p>
                  <div className="mt-2"><StatusBadge value={item.verificationStatus} /></div>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card className="p-5">
            <h2 className="text-sm font-bold text-text-strong">Admin Decision</h2>
            <div className="mt-4 space-y-4">
              <label className="block space-y-2">
                <FieldLabel>Verification Status</FieldLabel>
                <select className="field" value={decision} onChange={(e) => setDecision(e.target.value as VerificationStatus)}>
                  <option value="PENDING">Pending</option>
                  <option value="VERIFIED">Approved / Verified</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="DUPLICATE">Duplicate</option>
                </select>
              </label>
              <label className="block space-y-2">
                <FieldLabel>Duplicate Check</FieldLabel>
                <select className="field" value={dupCheck} onChange={(e) => setDupCheck(e.target.value as "LOW" | "MEDIUM" | "HIGH")}>
                  <option value="LOW">Not a duplicate</option>
                  <option value="MEDIUM">Possibly duplicate</option>
                  <option value="HIGH">Likely duplicate</option>
                </select>
              </label>
              <label className="block space-y-2">
                <FieldLabel>Internal Note</FieldLabel>
                <textarea className="field h-28 py-3" placeholder="Add a note for internal team..." value={note} onChange={(e) => setNote(e.target.value)} />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setDecision("VERIFIED"); save({ verificationStatus: "VERIFIED" }); }}
                  className="rounded-xl bg-primary px-3 py-2.5 text-sm font-bold text-white hover:bg-primary-dark"
                >
                  <Check className="mr-1 inline h-4 w-4" /> Approve
                </button>
                <button
                  onClick={() => setConfirm({ title: "Reject Report", body: "Mark this report as rejected?", danger: true, onConfirm: () => { setDecision("REJECTED"); save({ verificationStatus: "REJECTED" }); } })}
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100"
                >
                  <X className="mr-1 inline h-4 w-4" /> Reject
                </button>
              </div>
              <Button className="w-full" onClick={() => save()}>
                <Save className="h-4 w-4" /> Save Decision
              </Button>
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="text-sm font-bold text-text-strong">Exact Location Access</h2>
            <PrivacyWarningBanner className="mt-3" />
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => setConfirm({
                title: "Request Exact Location",
                body: "Accessing exact coordinates creates a permanent audit log entry. Only proceed if authorized.",
                onConfirm: () => { addAudit("VIEWED_EXACT_LOCATION", "AnimalSighting", report.id); showToast("Exact location access logged."); }
              })}
            >
              <LockKeyhole className="h-4 w-4" /> Request Exact Location
            </Button>
          </Card>
        </aside>
      </div>
    </div>
  );
}

// ── ReportsPage ───────────────────────────────────────────────────────────────

export function ReportsPage() {
  const [reports, setReports] = useState<AnimalSighting[]>(() => loadState("petradar:admin:reports") ?? mockReports);
  const [statusF, setStatusF] = useState<VerificationStatus | "">("");
  const [confirm, setConfirm] = useState<{ title: string; body: string; onConfirm: () => void; danger?: boolean } | null>(null);

  useEffect(() => { const s = loadState<AnimalSighting[]>("petradar:admin:reports"); if (s) setReports(s); }, []);

  function updateReport(id: string, update: Partial<AnimalSighting>, action: string) {
    setReports((prev) => { const next = prev.map((r) => r.id === id ? { ...r, ...update } : r); saveState("petradar:admin:reports", next); return next; });
    addAudit(action, "AnimalSighting", id);
    showToast("Report updated.");
  }

  const filtered = useMemo(() => reports.filter((r) => !statusF || r.verificationStatus === statusF), [reports, statusF]);

  function exportCsv() {
    const header = "ID,Species,Condition,Area,Reporter,Urgency,Status,Created";
    const body = filtered.map((r) => `${r.id},${r.species},${r.condition},${r.area},${r.reporter},${r.urgency},${r.verificationStatus},${r.createdAt}`).join("\n");
    const blob = new Blob([header + "\n" + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "petradar-reports.csv"; a.click(); URL.revokeObjectURL(url);
    addAudit("EXPORTED_REPORTS_CSV", "AnimalSighting", "all");
    showToast("CSV exported.");
  }

  const rows = filtered.map((r) => [
    <Link key="id" href={`/reports/${r.id}`} className="font-bold text-primary">{r.id}</Link>,
    <ReportThumb key="photo" src={r.photoUrl} alt={r.id} />,
    r.species,
    r.condition,
    r.area,
    r.reporter,
    r.reporterTrust,
    <StatusBadge key="urg" value={r.urgency} />,
    <StatusBadge key="stat" value={r.verificationStatus} />,
    <div key="actions" className="flex gap-2">
      <button className="text-xs font-bold text-primary hover:underline" onClick={() => updateReport(r.id, { verificationStatus: "VERIFIED" }, "APPROVED_REPORT")}>Approve</button>
      <button className="text-xs font-bold text-red-600 hover:underline" onClick={() => setConfirm({ title: "Reject Report", body: `Reject ${r.id}?`, danger: true, onConfirm: () => updateReport(r.id, { verificationStatus: "REJECTED" }, "REJECTED_REPORT") })}>Reject</button>
    </div>,
  ]);

  return (
    <div className="admin-shell space-y-5">
      {confirm && <ConfirmModal open title={confirm.title} body={confirm.body} onConfirm={() => { confirm.onConfirm(); setConfirm(null); }} onCancel={() => setConfirm(null)} danger={confirm.danger} />}
      <PageHeader
        title="Report Moderation"
        description="All submitted reports, verification decisions, and conversion workflow."
        actions={<Button onClick={exportCsv}><Download className="h-4 w-4" /> Export CSV</Button>}
      />
      <div className="flex flex-wrap gap-2">
        {(["", "PENDING", "VERIFIED", "REJECTED", "DUPLICATE"] as const).map((v) => (
          <FilterChip key={v} label={v || "All Reports"} active={statusF === v} onClick={() => setStatusF(v)} />
        ))}
      </div>
      <DataTable
        columns={["Report ID", "Photo", "Species", "Condition", "Area", "Reporter", "Trust", "Urgency", "Status", "Actions"]}
        rows={rows}
      />
    </div>
  );
}

// ── DuplicateListPage ─────────────────────────────────────────────────────────

export function DuplicateListPage() {
  const [reports] = useState<AnimalSighting[]>(() => loadState("petradar:admin:reports") ?? mockReports);
  const [riskF, setRiskF] = useState<string>("");
  const filtered = useMemo(() => reports.filter((r) => (!riskF || r.duplicateRisk === riskF) && r.duplicateRisk !== "LOW"), [reports, riskF]);

  return (
    <div className="admin-shell space-y-5">
      <PageHeader title="Duplicate Review" description="High-risk duplicate candidates needing moderation decisions." />
      <div className="flex gap-2">
        {["", "HIGH", "MEDIUM"].map((v) => (
          <FilterChip key={v} label={v || "All"} active={riskF === v} onClick={() => setRiskF(v)} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {filtered.map((report) => (
          <Link href={`/duplicates/${report.id}`} key={report.id}>
            <Card className="p-4 transition hover:shadow-card">
              <div className="flex gap-3">
                <ReportThumb src={report.photoUrl} alt={report.id} />
                <div>
                  <p className="font-bold text-text-strong">{report.id}</p>
                  <p className="text-sm text-text-muted">{report.area} · {report.species}</p>
                  <div className="mt-2 flex gap-1.5">
                    <StatusBadge value={report.duplicateRisk} />
                    <StatusBadge value={report.verificationStatus} />
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 && <p className="col-span-3 py-8 text-center text-sm text-text-muted">No duplicate candidates for this filter.</p>}
      </div>
    </div>
  );
}

// ── DuplicateReviewPage ───────────────────────────────────────────────────────

export function DuplicateReviewPage({ id }: { id: string }) {
  const [reports, setReports] = useState<AnimalSighting[]>(() => loadState("petradar:admin:reports") ?? mockReports);
  const [confirm, setConfirm] = useState<{ title: string; body: string; onConfirm: () => void } | null>(null);
  const [resolved, setResolved] = useState<string | null>(null);
  const original = reports[0];
  const incoming = reports.find((r) => r.id === id) ?? reports[2];

  function resolveAction(action: "MERGED" | "KEPT_SEPARATE" | "UNCERTAIN") {
    if (action === "MERGED") {
      setReports((prev) => { const next = prev.map((r) => r.id === incoming.id ? { ...r, verificationStatus: "DUPLICATE" as VerificationStatus } : r); saveState("petradar:admin:reports", next); return next; });
    }
    addAudit(`DUPLICATE_${action}`, "AnimalSighting", incoming.id);
    setResolved(action);
    showToast(action === "MERGED" ? "Merged into existing case." : action === "KEPT_SEPARATE" ? "Kept as separate case." : "Marked as uncertain.");
  }

  return (
    <div className="admin-shell space-y-5">
      {confirm && <ConfirmModal open title={confirm.title} body={confirm.body} onConfirm={() => { confirm.onConfirm(); setConfirm(null); }} onCancel={() => setConfirm(null)} />}
      <PageHeader title="Duplicate Sighting Review" description="Compare reports to decide whether they describe the same animal." />
      {resolved && (
        <div className="rounded-2xl bg-mint p-4 text-sm font-bold text-primary">
          <CheckCircle2 className="mr-2 inline h-4 w-4" />
          Decision recorded: {resolved.replace(/_/g, " ")}
        </div>
      )}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px_minmax(0,1fr)]">
        {[original, incoming].map((report, idx) => (
          <Card key={report.id} className="p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-text-muted">{idx === 0 ? "Original Report" : "New Report"}</p>
            <h2 className="mt-2 text-xl font-bold text-text-strong">{report.id}</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={report.photoUrl} alt={report.id} className="mt-4 aspect-[4/3] w-full rounded-2xl object-cover" />
            <p className="mt-3 text-sm text-text-muted">{report.area} · {formatDate(report.createdAt)}</p>
            <div className="mt-2 flex gap-1.5">
              <StatusBadge value={report.species} />
              <StatusBadge value={report.verificationStatus} />
            </div>
          </Card>
        ))}
        <Card className="order-first grid content-center p-5 text-center xl:order-none">
          <p className="text-5xl font-bold text-primary">76%</p>
          <p className="mt-2 text-sm font-bold text-text-strong">Likely Same Animal</p>
          <div className="mt-6 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-background p-3"><p className="font-bold">35 min</p><p className="text-text-muted">Time diff</p></div>
            <div className="rounded-xl bg-background p-3"><p className="font-bold">320 m</p><p className="text-text-muted">Distance</p></div>
          </div>
        </Card>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5">
          <h2 className="text-sm font-bold">Matching Traits</h2>
          <ul className="mt-3 space-y-2 text-sm text-text-muted">
            {["Same species", "Similar color", "Collar note matches", "Similar facial features"].map((item) => (
              <li key={item} className="flex gap-2"><Check className="h-4 w-4 text-primary" />{item}</li>
            ))}
          </ul>
        </Card>
        <Card className="p-5">
          <h2 className="text-sm font-bold">Map Comparison</h2>
          <div className="mt-3 grid h-40 place-items-center rounded-2xl bg-background text-sm text-text-muted">Two approximate report radiuses overlap</div>
        </Card>
        <Card className="p-5">
          <h2 className="text-sm font-bold">Photo Comparison</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[original, incoming].map((item) => <ReportThumb key={item.id} src={item.photoUrl} alt={item.id} />)}
          </div>
        </Card>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <Button onClick={() => setConfirm({ title: "Merge into Existing Case", body: `This will mark ${incoming.id} as a duplicate of ${original.id}.`, onConfirm: () => resolveAction("MERGED") })}>Merge into Existing Case</Button>
        <Button variant="outline" onClick={() => resolveAction("KEPT_SEPARATE")}>Keep Separate</Button>
        <Button variant="outline" onClick={() => resolveAction("UNCERTAIN")}>Mark as Uncertain</Button>
      </div>
    </div>
  );
}

// ── RescueOperationsPage ──────────────────────────────────────────────────────

export function RescueOperationsPage() {
  const [cases, setCases] = useState<RescueCaseState[]>(() => loadState("petradar:admin:rescue-cases") ?? mockRescueCases);
  const [urgencyF, setUrgencyF] = useState<string>("");
  const [assignDrawer, setAssignDrawer] = useState<RescueCaseState | null>(null);
  const [assignTo, setAssignTo] = useState("");
  const volunteers = mockUsers.filter((u) => u.role === "VERIFIED_VOLUNTEER" || u.role === "VOLUNTEER" || u.role === "RESCUE_COORDINATOR");
  const columns: RescueStatus[] = ["NEW_REPORT", "NEEDS_VERIFICATION", "WATCHING", "NEEDS_RESCUE", "VOLUNTEER_ASSIGNED", "AT_CLINIC", "FOSTER_NEEDED", "REUNITED_ADOPTED", "CLOSED"];

  useEffect(() => { const s = loadState<RescueCaseState[]>("petradar:admin:rescue-cases"); if (s) setCases(s); }, []);

  function updateStatus(id: string, status: RescueStatus) {
    setCases((prev) => { const next = prev.map((c) => c.id === id ? { ...c, status, updatedAt: new Date().toISOString() } : c); saveState("petradar:admin:rescue-cases", next); return next; });
    addAudit("UPDATED_RESCUE_STATUS", "RescueCase", id);
    showToast("Status updated.");
  }

  function assignVolunteer() {
    if (!assignDrawer || !assignTo) { showToast("Select a volunteer.", "error"); return; }
    setCases((prev) => { const next = prev.map((c) => c.id === assignDrawer.id ? { ...c, assignedTo: assignTo, status: "VOLUNTEER_ASSIGNED" as RescueStatus, updatedAt: new Date().toISOString() } : c); saveState("petradar:admin:rescue-cases", next); return next; });
    addAudit("ASSIGNED_VOLUNTEER", "RescueCase", assignDrawer.id);
    showToast(`Assigned to ${assignTo}.`);
    setAssignDrawer(null);
    setAssignTo("");
  }

  const filtered = useMemo(() => cases.filter((c) => !urgencyF || c.urgency === urgencyF), [cases, urgencyF]);

  return (
    <div className="admin-shell space-y-5">
      <Drawer open={!!assignDrawer} title={`Assign Volunteer — ${assignDrawer?.id ?? ""}`} onClose={() => setAssignDrawer(null)}>
        <div className="space-y-4">
          <label className="block space-y-2">
            <FieldLabel>Select Volunteer</FieldLabel>
            <select className="field" value={assignTo} onChange={(e) => setAssignTo(e.target.value)}>
              <option value="">— choose volunteer —</option>
              {volunteers.map((v) => <option key={v.id} value={v.name}>{v.name} ({v.role.replace(/_/g, " ")}, trust {v.trustScore})</option>)}
            </select>
          </label>
          <Button className="w-full" onClick={assignVolunteer}>Confirm Assignment</Button>
        </div>
      </Drawer>

      <PageHeader
        title="Rescue Operations"
        description="Coordinate rescue workflow, assignments, and timeline updates."
        actions={
          <div className="flex gap-2">
            {["", "EMERGENCY", "HIGH", "MEDIUM"].map((v) => (
              <FilterChip key={v} label={v || "All urgency"} active={urgencyF === v} onClick={() => setUrgencyF(v)} />
            ))}
          </div>
        }
      />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {columns.map((status) => {
          const columnCases = filtered.filter((c) => c.status === status);
          return (
            <section key={status} className="rounded-2xl border border-border bg-white/80 p-3 shadow-soft">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wide text-text-muted">{status.replace(/_/g, " ")}</h2>
                <Badge>{columnCases.length}</Badge>
              </div>
              <div className="space-y-3">
                {columnCases.length === 0 && (
                  <p className="rounded-xl bg-background py-4 text-center text-xs text-text-muted">Empty</p>
                )}
                {columnCases.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-border bg-white p-3">
                    <div className="flex gap-3">
                      <ReportThumb src={item.photoUrl} alt={item.id} />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-text-strong">{item.id}</p>
                        <p className="truncate text-xs text-text-muted">{item.title}</p>
                        <div className="mt-1"><StatusBadge value={item.urgency} /></div>
                      </div>
                    </div>
                    {item.assignedTo && (
                      <p className="mt-2 text-xs text-text-muted">Assigned: <span className="font-bold">{item.assignedTo}</span></p>
                    )}
                    <div className="mt-2 flex gap-1.5">
                      <select
                        className="field flex-1 py-1 text-xs"
                        value={item.status}
                        onChange={(e) => updateStatus(item.id, e.target.value as RescueStatus)}
                      >
                        {columns.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                      </select>
                      <button
                        onClick={() => setAssignDrawer(item)}
                        className="flex h-7 shrink-0 items-center gap-1 rounded-lg border border-border px-2 text-xs font-bold text-primary hover:bg-mint"
                      >
                        <Users className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

// ── RescueCaseDetailPage ──────────────────────────────────────────────────────

export function RescueCaseDetailPage({ id }: { id: string }) {
  const [cases, setCases] = useState<RescueCaseState[]>(() => loadState("petradar:admin:rescue-cases") ?? mockRescueCases);
  const item = cases.find((c) => c.id === id) ?? cases[0];
  const [status, setStatus] = useState<RescueStatus>(item.status);
  const [noteText, setNoteText] = useState("");
  const [noteDrawer, setNoteDrawer] = useState(false);
  const [assignDrawer, setAssignDrawer] = useState(false);
  const [assignTo, setAssignTo] = useState(item.assignedTo ?? "");
  const volunteers = mockUsers.filter((u) => u.role === "VERIFIED_VOLUNTEER" || u.role === "VOLUNTEER" || u.role === "RESCUE_COORDINATOR");
  const columns: RescueStatus[] = ["NEW_REPORT", "NEEDS_VERIFICATION", "WATCHING", "NEEDS_RESCUE", "VOLUNTEER_ASSIGNED", "AT_CLINIC", "FOSTER_NEEDED", "REUNITED_ADOPTED", "CLOSED"];
  const notes: CaseNote[] = item.notes ?? [{ ts: item.updatedAt, actor: "System", text: "Case created from verified report." }];

  function saveStatus() {
    setCases((prev) => { const next = prev.map((c) => c.id === item.id ? { ...c, status, updatedAt: new Date().toISOString() } : c); saveState("petradar:admin:rescue-cases", next); return next; });
    addAudit("UPDATED_RESCUE_STATUS", "RescueCase", item.id);
    showToast("Status updated.");
  }

  function addNote() {
    if (!noteText.trim()) return;
    const newNote: CaseNote = { ts: new Date().toISOString(), actor: adminActor(), text: noteText.trim() };
    setCases((prev) => { const next = prev.map((c) => c.id === item.id ? { ...c, notes: [newNote, ...(c.notes ?? [])] } : c); saveState("petradar:admin:rescue-cases", next); return next; });
    addAudit("ADDED_INTERNAL_NOTE", "RescueCase", item.id);
    showToast("Note added.");
    setNoteText("");
    setNoteDrawer(false);
  }

  function confirmAssign() {
    if (!assignTo) { showToast("Select a volunteer.", "error"); return; }
    setCases((prev) => { const next = prev.map((c) => c.id === item.id ? { ...c, assignedTo: assignTo, updatedAt: new Date().toISOString() } : c); saveState("petradar:admin:rescue-cases", next); return next; });
    addAudit("ASSIGNED_VOLUNTEER", "RescueCase", item.id);
    showToast(`Assigned to ${assignTo}.`);
    setAssignDrawer(false);
  }

  return (
    <div className="admin-shell space-y-5">
      <Drawer open={noteDrawer} title="Add Internal Note" onClose={() => setNoteDrawer(false)}>
        <div className="space-y-4">
          <label className="block space-y-2">
            <FieldLabel>Note</FieldLabel>
            <textarea className="field h-40 py-3" placeholder="Write a note for the internal team..." value={noteText} onChange={(e) => setNoteText(e.target.value)} />
          </label>
          <Button className="w-full" onClick={addNote}>Save Note</Button>
        </div>
      </Drawer>
      <Drawer open={assignDrawer} title={`Assign Volunteer — ${item.id}`} onClose={() => setAssignDrawer(false)}>
        <div className="space-y-4">
          <label className="block space-y-2">
            <FieldLabel>Volunteer</FieldLabel>
            <select className="field" value={assignTo} onChange={(e) => setAssignTo(e.target.value)}>
              <option value="">— choose —</option>
              {volunteers.map((v) => <option key={v.id} value={v.name}>{v.name} — {v.role.replace(/_/g, " ")} (trust {v.trustScore})</option>)}
            </select>
          </label>
          <Button className="w-full" onClick={confirmAssign}>Confirm Assignment</Button>
        </div>
      </Drawer>

      <PageHeader
        title={item.id}
        description={`${item.title} · ${item.area}`}
        actions={
          <div className="flex gap-2">
            <select className="field py-2 text-sm font-bold" value={status} onChange={(e) => setStatus(e.target.value as RescueStatus)}>
              {columns.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
            </select>
            <Button onClick={saveStatus}>Update Status</Button>
            <Button variant="outline" onClick={() => setNoteDrawer(true)}>Add Note</Button>
            <Button variant="outline" onClick={() => setAssignDrawer(true)}>Assign Volunteer</Button>
          </div>
        }
      />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="p-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.photoUrl} alt={item.id} className="aspect-[16/8] w-full rounded-2xl object-cover" />
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <StatCard label="Urgency" value={item.urgency} icon={AlertOctagon} />
            <StatCard label="Status" value={item.status.replace(/_/g, " ")} icon={Flame} />
            <StatCard label="Assigned" value={item.assignedTo ?? "Unassigned"} icon={Users} />
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="text-sm font-bold">Timeline</h2>
          <div className="mt-4 space-y-4">
            {notes.map((n, i) => (
              <div key={i} className="flex gap-3">
                <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-primary" />
                <div>
                  <p className="text-sm font-bold text-text-strong">{n.text}</p>
                  <p className="text-xs text-text-muted">{formatDate(n.ts)} · {n.actor}</p>
                </div>
              </div>
            ))}
          </div>
          <PrivacyWarningBanner className="mt-4" />
        </Card>
      </div>
    </div>
  );
}

// ── PeopleManagementPage ──────────────────────────────────────────────────────

export function PeopleManagementPage({ type, id }: { type: "volunteers" | "users"; id?: string }) {
  const [users, setUsers] = useState<User[]>(() => loadState("petradar:admin:users") ?? mockUsers);
  const [roleF, setRoleF] = useState("");
  const [statusF, setStatusF] = useState("");
  const [confirm, setConfirm] = useState<{ title: string; body: string; onConfirm: () => void; danger?: boolean } | null>(null);
  const [roleDrawer, setRoleDrawer] = useState<User | null>(null);
  const [newRole, setNewRole] = useState("");

  useEffect(() => { const s = loadState<User[]>("petradar:admin:users"); if (s) setUsers(s); }, []);

  const roles = ["GUEST", "REPORTER", "PET_OWNER", "VOLUNTEER", "VERIFIED_VOLUNTEER", "RESCUE_COORDINATOR", "CONTENT_EDITOR", "ANALYST", "ADMIN", "SUPER_ADMIN"];

  function updateUser(userId: string, update: Partial<User>, action: string) {
    setUsers((prev) => { const next = prev.map((u) => u.id === userId ? { ...u, ...update } : u); saveState("petradar:admin:users", next); return next; });
    addAudit(action, "User", userId);
    showToast("User updated.");
  }

  function changeRole() {
    if (!roleDrawer || !newRole) return;
    updateUser(roleDrawer.id, { role: newRole as User["role"] }, "CHANGED_USER_ROLE");
    setRoleDrawer(null);
  }

  const user = id ? users.find((u) => u.id === id) ?? users[0] : null;

  if (user) {
    return (
      <div className="admin-shell space-y-5">
        {confirm && <ConfirmModal open title={confirm.title} body={confirm.body} onConfirm={() => { confirm.onConfirm(); setConfirm(null); }} onCancel={() => setConfirm(null)} danger={confirm.danger} />}
        <Drawer open={!!roleDrawer} title={`Change Role — ${roleDrawer?.name}`} onClose={() => setRoleDrawer(null)}>
          <div className="space-y-4">
            <label className="block space-y-2">
              <FieldLabel>New Role</FieldLabel>
              <select className="field" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                <option value="">— select role —</option>
                {roles.map((r) => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
              </select>
            </label>
            <Button className="w-full" onClick={changeRole}>Confirm Role Change</Button>
          </div>
        </Drawer>
        <PageHeader
          title={user.name}
          description={`${user.role.replace(/_/g, " ")} · Trust score ${user.trustScore}`}
          actions={
            <div className="flex gap-2">
              <Button onClick={() => { setRoleDrawer(user); setNewRole(user.role); }}>Change Role</Button>
              {user.status === "ACTIVE" ? (
                <Button variant="danger" onClick={() => setConfirm({ title: "Suspend User", body: `Suspend ${user.name}? They will lose access.`, danger: true, onConfirm: () => updateUser(user.id, { status: "SUSPENDED" }, "SUSPENDED_USER") })}>
                  Suspend
                </Button>
              ) : (
                <Button variant="outline" onClick={() => updateUser(user.id, { status: "ACTIVE" }, "RESTORED_USER")}>Restore</Button>
              )}
            </div>
          }
        />
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="p-5">
            <h2 className="text-sm font-bold">Activity History</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <StatCard label="Reports" value={user.reportsSubmitted} />
              <StatCard label="Lost Pet Posts" value={user.lostPetPosts} />
              <StatCard label="Trust Score" value={user.trustScore} />
            </div>
            <div className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between rounded-xl bg-background px-4 py-3">
                <span className="text-text-muted">Email</span><span className="font-bold">{user.email}</span>
              </div>
              <div className="flex justify-between rounded-xl bg-background px-4 py-3">
                <span className="text-text-muted">Member since</span><span className="font-bold">{new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="text-sm font-bold">Role & Access</h2>
            <div className="mt-4 space-y-3">
              <StatusBadge value={user.status} />
              <StatusBadge value={user.role} />
              <Button className="w-full" variant="outline" onClick={() => { addAudit("VIEWED_EXACT_ACCESS_GRANTS", "User", user.id); showToast("Exact access grant log: no grants on file."); }}>
                View Exact Access Grants
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const filtered = useMemo(() => {
    let list = type === "volunteers" ? users.filter((u) => u.role === "VOLUNTEER" || u.role === "VERIFIED_VOLUNTEER" || u.role === "RESCUE_COORDINATOR") : users;
    if (roleF) list = list.filter((u) => u.role === roleF);
    if (statusF) list = list.filter((u) => u.status === statusF);
    return list;
  }, [users, type, roleF, statusF]);

  const rows = filtered.map((u) => [
    <Link key="name" href={`/${type}/${u.id}`} className="font-bold text-primary">{u.name}</Link>,
    u.email,
    <StatusBadge key="role" value={u.role} />,
    u.trustScore,
    u.reportsSubmitted,
    u.lostPetPosts,
    <StatusBadge key="status" value={u.status} />,
    <div key="actions" className="flex gap-2">
      <button className="text-xs font-bold text-primary hover:underline" onClick={() => { setRoleDrawer(u); setNewRole(u.role); }}>Role</button>
      {u.status === "ACTIVE"
        ? <button className="text-xs font-bold text-red-600 hover:underline" onClick={() => setConfirm({ title: "Suspend User", body: `Suspend ${u.name}?`, danger: true, onConfirm: () => updateUser(u.id, { status: "SUSPENDED" }, "SUSPENDED_USER") })}>Suspend</button>
        : <button className="text-xs font-bold text-primary hover:underline" onClick={() => updateUser(u.id, { status: "ACTIVE" }, "RESTORED_USER")}>Restore</button>}
    </div>,
  ]);

  return (
    <div className="admin-shell space-y-5">
      {confirm && <ConfirmModal open title={confirm.title} body={confirm.body} onConfirm={() => { confirm.onConfirm(); setConfirm(null); }} onCancel={() => setConfirm(null)} danger={confirm.danger} />}
      <Drawer open={!!roleDrawer} title={`Change Role — ${roleDrawer?.name}`} onClose={() => setRoleDrawer(null)}>
        <div className="space-y-4">
          <label className="block space-y-2">
            <FieldLabel>New Role</FieldLabel>
            <select className="field" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
              <option value="">— select role —</option>
              {roles.map((r) => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
            </select>
          </label>
          <Button className="w-full" onClick={changeRole}>Confirm Role Change</Button>
        </div>
      </Drawer>
      <PageHeader
        title={type === "volunteers" ? "Volunteer Management" : "User Management"}
        description={type === "volunteers" ? "Verify, suspend, assign, and review volunteer capacity." : "Manage users, roles, trust scores, and activity history."}
      />
      <div className="flex flex-wrap gap-2">
        <FilterChip label="All" active={!roleF} onClick={() => setRoleF("")} />
        {["VOLUNTEER", "VERIFIED_VOLUNTEER", "RESCUE_COORDINATOR", "REPORTER", "PET_OWNER"].map((r) => (
          <FilterChip key={r} label={r.replace(/_/g, " ")} active={roleF === r} onClick={() => setRoleF(r === roleF ? "" : r)} />
        ))}
        <div className="h-5 w-px bg-border" />
        <FilterChip label="Active" active={statusF === "ACTIVE"} onClick={() => setStatusF(statusF === "ACTIVE" ? "" : "ACTIVE")} />
        <FilterChip label="Suspended" active={statusF === "SUSPENDED"} onClick={() => setStatusF(statusF === "SUSPENDED" ? "" : "SUSPENDED")} />
      </div>
      <DataTable
        columns={["Name", "Email", "Role", "Trust", "Reports", "Lost Pets", "Status", "Actions"]}
        rows={rows}
      />
    </div>
  );
}

// ── RolesPage ─────────────────────────────────────────────────────────────────

export function RolesPage() {
  const [perms, setPerms] = useState<Record<string, Set<string>>>(() => {
    const stored = loadState<Record<string, string[]>>("petradar:admin:role-permissions");
    if (stored) return Object.fromEntries(Object.entries(stored).map(([k, v]) => [k, new Set(v)]));
    return Object.fromEntries(Object.entries(ROLE_PERMISSIONS).map(([k, v]) => [k, new Set(v)]));
  });
  const [saved, setSaved] = useState(false);

  function toggle(role: string, perm: string) {
    setPerms((prev) => {
      const next = { ...prev };
      const rolePerms = new Set(prev[role]);
      rolePerms.has(perm) ? rolePerms.delete(perm) : rolePerms.add(perm);
      next[role] = rolePerms;
      return next;
    });
    setSaved(false);
  }

  function savePerms() {
    saveState("petradar:admin:role-permissions", Object.fromEntries(Object.entries(perms).map(([k, v]) => [k, Array.from(v)])));
    addAudit("UPDATED_ROLE_PERMISSIONS", "Role", "all");
    setSaved(true);
    showToast("Role permissions saved.");
    setTimeout(() => setSaved(false), 2000);
  }

  const roles = Object.keys(ROLE_PERMISSIONS);

  return (
    <div className="admin-shell space-y-5">
      <PageHeader
        title="Role Management"
        description="Configure role boundaries and permission grants. Backend enforcement required."
        actions={
          <Button onClick={savePerms}>
            {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        }
      />
      <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-card">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-background">
              <th className="sticky left-0 bg-background px-4 py-3 text-left text-xs font-bold text-text-muted">Permission</th>
              {roles.map((r) => (
                <th key={r} className="px-3 py-3 text-center text-xs font-bold text-text-muted">{r}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {ALL_PERMISSIONS.map((perm) => (
              <tr key={perm} className="hover:bg-background/50">
                <td className="sticky left-0 bg-white px-4 py-2.5 font-mono text-xs text-text-muted">{perm.replace(/_/g, " ")}</td>
                {roles.map((role) => (
                  <td key={role} className="px-3 py-2.5 text-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded accent-primary"
                      checked={perms[role]?.has(perm) ?? false}
                      onChange={() => toggle(role, perm)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm leading-6 text-text-muted">
            <strong>Note:</strong> These toggles configure the admin CMS display layer. All permission enforcement must be independently implemented in the backend API with proper JWT claims and database-level checks.
          </p>
        </div>
      </Card>
    </div>
  );
}

// ── PrivacyPage ───────────────────────────────────────────────────────────────

export function PrivacyPage({ caseId }: { caseId?: string }) {
  const [radius, setRadius] = useState<number>(() => loadState<AdminSettings>("petradar:admin:settings")?.defaultPublicRadius ?? 250);
  const [sensitiveIds, setSensitiveIds] = useState<Set<string>>(() => new Set(loadState<string[]>("petradar:admin:sensitive-cases") ?? []));
  const cases = useMemo(() => loadState<RescueCaseState[]>("petradar:admin:rescue-cases") ?? mockRescueCases, []);
  const [saved, setSaved] = useState(false);

  function savePrivacy() {
    const settings = loadState<AdminSettings>("petradar:admin:settings") ?? SEED_SETTINGS;
    saveState("petradar:admin:settings", { ...settings, defaultPublicRadius: radius });
    saveState("petradar:admin:sensitive-cases", Array.from(sensitiveIds));
    addAudit("UPDATED_PRIVACY_SETTINGS", "PrivacyControl", "global");
    setSaved(true);
    showToast("Privacy settings saved.");
    setTimeout(() => setSaved(false), 2000);
  }

  function toggleSensitive(id: string) {
    setSensitiveIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    addAudit("TOGGLED_SENSITIVE_CASE", "RescueCase", id);
    showToast(`Case ${id} sensitivity toggled.`);
  }

  return (
    <div className="admin-shell space-y-5">
      <PageHeader
        title="Privacy Control Panel"
        description={caseId ? `Control location visibility for ${caseId}.` : "Review exact location access rules and sensitive case controls."}
        actions={
          <Button onClick={savePrivacy}>
            {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? "Saved!" : "Save Privacy Settings"}
          </Button>
        }
      />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="p-5">
          <h2 className="text-sm font-bold">Location Visibility</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-primary bg-mint p-4">
              <h3 className="font-bold text-primary">Approximate (Public)</h3>
              <p className="mt-2 text-sm text-text-muted">Public users never receive exact coordinates.</p>
              <label className="mt-4 block space-y-2">
                <FieldLabel>Public radius (meters)</FieldLabel>
                <input type="number" min={50} max={5000} step={50} className="field" value={radius} onChange={(e) => setRadius(Number(e.target.value))} />
              </label>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <h3 className="font-bold">Exact (Restricted)</h3>
              <p className="mt-2 text-sm text-text-muted">Only admin, super admin, rescue coordinators, and authorized volunteers.</p>
            </div>
          </div>

          <h2 className="mt-6 text-sm font-bold">Sensitive Cases</h2>
          <div className="mt-3 space-y-2">
            {cases.slice(0, 6).map((c) => (
              <label key={c.id} className="flex items-center justify-between rounded-xl bg-background px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-text-strong">{c.id} — {c.title}</p>
                  <p className="text-xs text-text-muted">{c.area}</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded accent-primary"
                  checked={sensitiveIds.has(c.id)}
                  onChange={() => toggleSensitive(c.id)}
                />
              </label>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="text-sm font-bold">Access Control</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Admin", "Verified Volunteer", "Rescue Coordinator"].map((role) => (
              <span key={role} className="flex items-center gap-1 rounded-full bg-mint px-3 py-1.5 text-xs font-bold text-primary">
                <Check className="h-3.5 w-3.5" /> {role}
              </span>
            ))}
            {["General Volunteer", "Public User"].map((role) => (
              <span key={role} className="flex items-center gap-1 rounded-full bg-background px-3 py-1.5 text-xs font-bold text-text-muted">
                <X className="h-3.5 w-3.5 text-red-400" /> {role}
              </span>
            ))}
          </div>
          <PrivacyWarningBanner className="mt-4" />
        </Card>
      </div>
    </div>
  );
}

// ── AbuseReportsPage ──────────────────────────────────────────────────────────

export function AbuseReportsPage({ id }: { id?: string }) {
  const [reports, setReports] = useState<AbuseReport[]>(() => loadState("petradar:admin:abuse-reports") ?? SEED_ABUSE);
  const [statusF, setStatusF] = useState<AbuseStatus | "">("");
  const [note, setNote] = useState("");

  useEffect(() => { const s = loadState<AbuseReport[]>("petradar:admin:abuse-reports"); if (s) setReports(s); }, []);

  function resolve(abuseId: string, action: AbuseStatus, noteText: string) {
    setReports((prev) => { const next = prev.map((r) => r.id === abuseId ? { ...r, status: action, notes: noteText || r.notes } : r); saveState("petradar:admin:abuse-reports", next); return next; });
    addAudit(`ABUSE_REPORT_${action}`, "AbuseReport", abuseId);
    showToast(`Report marked as ${action}.`);
    setNote("");
  }

  if (id) {
    const report = reports.find((r) => r.id === id) ?? reports[0];
    return (
      <div className="admin-shell space-y-5">
        <PageHeader title={`Abuse Report ${report.id}`} description={`${report.reason} · ${report.reportedEntity}`} />
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="p-5">
            <h2 className="font-bold">Evidence</h2>
            <p className="mt-3 text-sm leading-6 text-text-muted">{report.evidence}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3 text-sm">
              <div className="rounded-xl bg-background p-3"><p className="text-text-muted text-xs mb-1">Reporter</p><p className="font-bold">{report.reporter}</p></div>
              <div className="rounded-xl bg-background p-3"><p className="text-text-muted text-xs mb-1">Entity</p><p className="font-bold">{report.reportedEntity}</p></div>
              <div className="rounded-xl bg-background p-3"><p className="text-text-muted text-xs mb-1">Status</p><StatusBadge value={report.status} /></div>
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="font-bold">Admin Decision</h2>
            {report.notes && <p className="mt-2 rounded-xl bg-mint p-3 text-sm font-semibold text-primary">{report.notes}</p>}
            <textarea className="field mt-4 h-32 py-3" placeholder="Decision notes..." value={note} onChange={(e) => setNote(e.target.value)} />
            <div className="mt-3 grid gap-2">
              <Button className="w-full" onClick={() => resolve(report.id, "ACTIONED", note)}>Action Taken</Button>
              <Button variant="outline" className="w-full" onClick={() => resolve(report.id, "DISMISSED", note)}>Dismiss</Button>
              <Button variant="outline" className="w-full" onClick={() => resolve(report.id, "REVIEWED", note)}>Mark Reviewed</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const filtered = useMemo(() => reports.filter((r) => !statusF || r.status === statusF), [reports, statusF]);
  const rows = filtered.map((r) => [
    <Link key="id" href={`/abuse-reports/${r.id}`} className="font-bold text-primary">{r.id}</Link>,
    r.reportedEntity,
    r.reason,
    r.reporter,
    formatDate(r.createdAt),
    <StatusBadge key="stat" value={r.status} />,
    <Link key="open" href={`/abuse-reports/${r.id}`} className="text-xs font-bold text-primary">Review</Link>,
  ]);

  return (
    <div className="admin-shell space-y-5">
      <PageHeader title="Abuse Reports" description="Review reported entities, evidence, admin decisions, and action history." />
      <div className="flex gap-2 flex-wrap">
        {(["", "PENDING", "REVIEWED", "ACTIONED", "DISMISSED"] as const).map((v) => (
          <FilterChip key={v} label={v || "All"} active={statusF === v} onClick={() => setStatusF(v)} />
        ))}
      </div>
      <DataTable columns={["ID", "Reported Entity", "Reason", "Reporter", "Date", "Status", ""]} rows={rows} />
    </div>
  );
}

// ── AnalyticsPage ─────────────────────────────────────────────────────────────

export function AnalyticsPage({ heatmap = false, exportMode = false }: { heatmap?: boolean; exportMode?: boolean }) {
  const [dateRange, setDateRange] = useState("month");
  const [speciesF, setSpeciesF] = useState<Species | "">("");
  const reports = useMemo(() => loadState<AnimalSighting[]>("petradar:admin:reports") ?? mockReports, []);

  const stats = useMemo(() => {
    const filtered = reports.filter((r) => !speciesF || r.species === speciesF);
    return {
      total: filtered.length,
      injured: filtered.filter((r) => r.condition.toLowerCase().includes("injur")).length,
      verified: filtered.filter((r) => r.verificationStatus === "VERIFIED").length,
      pending: filtered.filter((r) => r.verificationStatus === "PENDING").length,
      high: filtered.filter((r) => r.urgency === "HIGH" || r.urgency === "EMERGENCY").length,
    };
  }, [reports, speciesF]);

  const barData = [
    { label: "Mon", value: 12 },
    { label: "Tue", value: 18 },
    { label: "Wed", value: 9 },
    { label: "Thu", value: 24 },
    { label: "Fri", value: 16 },
    { label: "Sat", value: 31 },
    { label: "Sun", value: 21 },
  ];
  const maxBar = Math.max(...barData.map((d) => d.value));

  function exportCsv() {
    const rows = (loadState<AnimalSighting[]>("petradar:admin:reports") ?? mockReports).map((r) =>
      `${r.id},${r.species},${r.area},${r.urgency},${r.verificationStatus},${r.createdAt}`
    );
    const blob = new Blob(["ID,Species,Area,Urgency,Status,Created\n" + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "petradar-analytics.csv"; a.click(); URL.revokeObjectURL(url);
    addAudit("EXPORTED_ANALYTICS_CSV", "Analytics", dateRange);
    showToast("Analytics CSV exported.");
  }

  return (
    <div className="admin-shell space-y-5">
      <PageHeader
        title={exportMode ? "Executive Report" : heatmap ? "Community Heatmap" : "Analytics Dashboard"}
        description="Operational analytics, high-density zones, report trends, and export workflows."
        actions={
          <div className="flex gap-2">
            <select className="field py-2 text-sm" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              <option value="week">This week</option>
              <option value="month">This month</option>
              <option value="quarter">This quarter</option>
              <option value="year">This year</option>
            </select>
            <Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4" /> Export CSV</Button>
            <Button variant="outline" onClick={() => { addAudit("EXPORTED_ANALYTICS_PDF", "Analytics", dateRange); window.print(); }}>Export PDF</Button>
          </div>
        }
      />

      <div className="flex gap-2 flex-wrap">
        {(["", "CAT", "DOG", "OTHER"] as const).map((v) => (
          <FilterChip key={v} label={v || "All species"} active={speciesF === v} onClick={() => setSpeciesF(v)} />
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Sightings" value={mockAnalytics.totalSightings} icon={BarChart3} />
        <StatCard label="Injured Cases" value={mockAnalytics.injuredCases} icon={AlertOctagon} tone="red" />
        <StatCard label="Lost Matches" value={mockAnalytics.lostPetMatches} icon={ShieldCheck} tone="purple" />
        <StatCard label="Rescue Cases" value={mockAnalytics.rescueCases} icon={Flame} tone="amber" />
        <StatCard label="Resolved" value={mockAnalytics.resolvedCases} icon={Check} tone="green" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="p-5">
          <h2 className="text-sm font-bold">{heatmap ? "Density Heatmap" : "Reports This Week"}</h2>
          {heatmap ? (
            <div className="mt-4 grid h-96 place-items-center rounded-2xl bg-[radial-gradient(circle_at_25%_40%,rgba(239,68,68,.7),transparent_10rem),radial-gradient(circle_at_65%_45%,rgba(59,130,246,.5),transparent_9rem),radial-gradient(circle_at_50%_72%,rgba(245,158,11,.5),transparent_8rem),#eef4ef] text-sm font-bold text-text-strong">
              Bangkok activity density map
            </div>
          ) : (
            <div className="mt-4 flex h-64 items-end gap-2 rounded-2xl bg-background p-4">
              {barData.map((d) => (
                <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs font-bold text-text-strong">{d.value}</span>
                  <div
                    className="w-full rounded-t-lg bg-primary transition-all"
                    style={{ height: `${(d.value / maxBar) * 180}px` }}
                  />
                  <span className="text-xs text-text-muted">{d.label}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card className="p-5">
          <h2 className="text-sm font-bold">High-Density Zones</h2>
          <div className="mt-4 space-y-3">
            {[["Ari - Phahon Yothin", "HIGH", stats.high], ["Lat Phrao 71", "MEDIUM", stats.pending], ["Ratchada - Huai Khwang", "MEDIUM", stats.verified]].map(([zone, level, count]) => (
              <div key={zone as string} className="flex items-center justify-between rounded-xl bg-background p-3">
                <span className="text-sm font-bold">{zone}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">{count} reports</span>
                  <StatusBadge value={level as string} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
            <div className="flex justify-between"><span className="text-text-muted">This {dateRange} total</span><span className="font-bold">{stats.total} reports</span></div>
            <div className="flex justify-between"><span className="text-text-muted">Verified</span><span className="font-bold text-primary">{stats.verified}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">Pending review</span><span className="font-bold text-amber-600">{stats.pending}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">High urgency</span><span className="font-bold text-red-600">{stats.high}</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── ContentPage ───────────────────────────────────────────────────────────────

type ContentSection = "overview" | "pages" | "faqs" | "help-center" | "safety-guidelines" | "announcements";

export function ContentPage({ section = "overview" }: { section?: string }) {
  const [items, setItems] = useState<CMSItem[]>(() => loadState("petradar:admin:cms") ?? SEED_CMS);
  const [createDrawer, setCreateDrawer] = useState(false);
  const [editTarget, setEditTarget] = useState<CMSItem | null>(null);
  const [confirm, setConfirm] = useState<{ title: string; body: string; onConfirm: () => void } | null>(null);
  const [form, setForm] = useState({ title: "", content: "", category: "", status: "DRAFT" as "DRAFT" | "PUBLISHED", slug: "", audience: "", question: "" });

  useEffect(() => { const s = loadState<CMSItem[]>("petradar:admin:cms"); if (s) setItems(s); }, []);

  function save(updatedItems: CMSItem[]) {
    setItems(updatedItems);
    saveState("petradar:admin:cms", updatedItems);
  }

  function createItem() {
    if (!form.title.trim()) { showToast("Title is required.", "error"); return; }
    const typeMap: Record<ContentSection, CMSItem["type"]> = { overview: "page", pages: "page", faqs: "faq", "help-center": "help", "safety-guidelines": "safety", announcements: "announcement" };
    const newItem: CMSItem = { id: `CMS-${Date.now()}`, type: typeMap[section as ContentSection] ?? "page", title: form.title, content: form.content, category: form.category, status: form.status as "DRAFT" | "PUBLISHED", updatedAt: new Date().toISOString(), slug: form.slug, audience: form.audience, question: form.question || form.title };
    save([newItem, ...items]);
    addAudit("CREATED_CMS_ITEM", newItem.type, newItem.id);
    showToast("Content created.");
    setCreateDrawer(false);
    setForm({ title: "", content: "", category: "", status: "DRAFT", slug: "", audience: "", question: "" });
  }

  function updateItem() {
    if (!editTarget) return;
    save(items.map((i) => i.id === editTarget.id ? { ...editTarget, title: form.title, content: form.content, category: form.category, status: form.status, slug: form.slug, audience: form.audience, question: form.question || form.title, updatedAt: new Date().toISOString() } : i));
    addAudit("UPDATED_CMS_ITEM", editTarget.type, editTarget.id);
    showToast("Content updated.");
    setEditTarget(null);
  }

  function openEdit(item: CMSItem) {
    setEditTarget(item);
    setForm({ title: item.title, content: item.content ?? "", category: item.category ?? "", status: item.status, slug: item.slug ?? "", audience: item.audience ?? "", question: item.question ?? "" });
  }

  function togglePublish(item: CMSItem) {
    const next = item.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    save(items.map((i) => i.id === item.id ? { ...i, status: next, updatedAt: new Date().toISOString() } : i));
    addAudit(next === "PUBLISHED" ? "PUBLISHED_CONTENT" : "UNPUBLISHED_CONTENT", item.type, item.id);
    showToast(next === "PUBLISHED" ? "Published." : "Reverted to draft.");
  }

  function deleteItem(item: CMSItem) {
    save(items.filter((i) => i.id !== item.id));
    addAudit("DELETED_CMS_ITEM", item.type, item.id);
    showToast("Content deleted.");
  }

  const sectionTypeMap: Record<string, CMSItem["type"] | null> = { overview: null, pages: "page", faqs: "faq", "help-center": "help", "safety-guidelines": "safety", announcements: "announcement" };
  const targetType = sectionTypeMap[section] ?? null;
  const filtered = targetType ? items.filter((i) => i.type === targetType) : items;

  const title = section === "overview" ? "Content CMS" : section.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const FormFields = (
    <div className="space-y-4">
      <label className="block space-y-1.5">
        <FieldLabel>Title{section === "faqs" ? " / Question" : ""}</FieldLabel>
        <input className="field" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Enter title..." />
      </label>
      {section === "pages" && (
        <label className="block space-y-1.5">
          <FieldLabel>Slug</FieldLabel>
          <input className="field" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="/path/to/page" />
        </label>
      )}
      {section === "faqs" || section === "help-center" || section === "safety-guidelines" ? (
        <label className="block space-y-1.5">
          <FieldLabel>Category</FieldLabel>
          <input className="field" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="e.g. Privacy, Rescue" />
        </label>
      ) : null}
      {section === "announcements" && (
        <label className="block space-y-1.5">
          <FieldLabel>Audience</FieldLabel>
          <input className="field" value={form.audience} onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value }))} placeholder="e.g. All users, Volunteers" />
        </label>
      )}
      <label className="block space-y-1.5">
        <FieldLabel>Content</FieldLabel>
        <textarea className="field h-40 py-3" value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder="Write content here..." />
      </label>
      <label className="block space-y-1.5">
        <FieldLabel>Status</FieldLabel>
        <select className="field" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "DRAFT" | "PUBLISHED" }))}>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
      </label>
    </div>
  );

  const rows = filtered.map((item) => [
    item.id,
    item.title,
    item.category ?? item.audience ?? item.slug ?? "—",
    formatDate(item.updatedAt),
    <StatusBadge key="stat" value={item.status} />,
    <div key="actions" className="flex gap-2">
      <button className="text-xs font-bold text-primary hover:underline" onClick={() => openEdit(item)}>
        <Edit2 className="mr-0.5 inline h-3 w-3" />Edit
      </button>
      <button className="text-xs font-bold text-text-muted hover:text-primary hover:underline" onClick={() => togglePublish(item)}>
        {item.status === "PUBLISHED" ? "Unpublish" : "Publish"}
      </button>
      <button className="text-xs font-bold text-red-600 hover:underline" onClick={() => setConfirm({ title: "Delete Content", body: `Delete "${item.title}"? This cannot be undone.`, onConfirm: () => deleteItem(item) })}>
        <Trash2 className="mr-0.5 inline h-3 w-3" />Del
      </button>
    </div>,
  ]);

  return (
    <div className="admin-shell space-y-5">
      {confirm && <ConfirmModal open title={confirm.title} body={confirm.body} onConfirm={() => { confirm.onConfirm(); setConfirm(null); }} onCancel={() => setConfirm(null)} danger />}
      <Drawer open={createDrawer} title={`New ${title}`} onClose={() => setCreateDrawer(false)}>
        {FormFields}
        <Button className="mt-5 w-full" onClick={createItem}><Plus className="h-4 w-4" /> Create</Button>
      </Drawer>
      <Drawer open={!!editTarget} title={`Edit: ${editTarget?.title ?? ""}`} onClose={() => setEditTarget(null)}>
        {FormFields}
        <Button className="mt-5 w-full" onClick={updateItem}><Save className="h-4 w-4" /> Save Changes</Button>
      </Drawer>

      <PageHeader
        title={title}
        description="Manage landing copy, FAQ, help center, safety guidelines, announcements."
        actions={
          <Button onClick={() => { setForm({ title: "", content: "", category: "", status: "DRAFT", slug: "", audience: "", question: "" }); setCreateDrawer(true); }}>
            <Plus className="h-4 w-4" /> New Content
          </Button>
        }
      />
      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {(["overview", "pages", "faqs", "help-center", "safety-guidelines", "announcements"] as ContentSection[]).map((item) => (
          <Link key={item} href={item === "overview" ? "/content" : `/content/${item}`} className={`chip capitalize ${section === item ? "border-primary bg-primary text-white" : ""}`}>
            {item.replace("-", " ")}
          </Link>
        ))}
      </div>
      <DataTable
        columns={["ID", "Title", "Meta", "Updated", "Status", "Actions"]}
        rows={rows}
      />
    </div>
  );
}

// ── AuditLogsPage ─────────────────────────────────────────────────────────────

export function AuditLogsPage() {
  const [actorF, setActorF] = useState("");
  const [actionF, setActionF] = useState("");

  const allLogs = useMemo(() => {
    const local = loadState<AuditLog[]>("petradar:admin:audit") ?? [];
    const combined = [...local, ...mockAuditLogs];
    const seen = new Set<string>();
    return combined.filter((l) => { if (seen.has(l.id)) return false; seen.add(l.id); return true; });
  }, []);

  const filtered = useMemo(() => allLogs.filter((l) => {
    if (actorF && !l.actor.toLowerCase().includes(actorF.toLowerCase())) return false;
    if (actionF && !l.action.toLowerCase().includes(actionF.toLowerCase())) return false;
    return true;
  }), [allLogs, actorF, actionF]);

  function exportCsv() {
    const rows = filtered.map((l) => `${l.id},${l.actor},${l.action},${l.entityType},${l.entityId},${l.timestamp},${l.ipAddress}`);
    const blob = new Blob(["ID,Actor,Action,EntityType,EntityID,Timestamp,IP\n" + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "petradar-audit.csv"; a.click(); URL.revokeObjectURL(url);
  }

  const rows = filtered.map((l) => [l.actor, l.action.replace(/_/g, " "), l.entityType, l.entityId, formatDate(l.timestamp), l.ipAddress]);

  return (
    <div className="admin-shell space-y-5">
      <PageHeader
        title="Audit Logs"
        description={`Admin action history · ${filtered.length} entries`}
        actions={<Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4" /> Export CSV</Button>}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input className="field pl-9 text-sm" placeholder="Filter by actor..." value={actorF} onChange={(e) => setActorF(e.target.value)} />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input className="field pl-9 text-sm" placeholder="Filter by action..." value={actionF} onChange={(e) => setActionF(e.target.value)} />
        </div>
      </div>
      <DataTable
        columns={["Actor", "Action", "Entity Type", "Entity ID", "Timestamp", "IP/Device"]}
        rows={rows}
      />
    </div>
  );
}

// ── SettingsPage ──────────────────────────────────────────────────────────────

export function SettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>(() => loadState("petradar:admin:settings") ?? SEED_SETTINGS);
  const [saved, setSaved] = useState(false);

  function save() {
    saveState("petradar:admin:settings", settings);
    addAudit("UPDATED_ADMIN_SETTINGS", "Settings", "global");
    setSaved(true);
    showToast("Settings saved.");
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="admin-shell space-y-5">
      <PageHeader
        title="Admin Settings"
        description="Back office security, moderation defaults, and CMS configuration."
        actions={
          <Button onClick={save}>
            {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? "Saved!" : "Save Settings"}
          </Button>
        }
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-bold">Location Privacy</h2>
          <div className="mt-4 space-y-4">
            <label className="block space-y-2">
              <FieldLabel>Default public radius (meters)</FieldLabel>
              <input type="number" className="field" min={50} max={5000} step={50} value={settings.defaultPublicRadius} onChange={(e) => setSettings((s) => ({ ...s, defaultPublicRadius: Number(e.target.value) }))} />
            </label>
            <label className="flex items-center justify-between rounded-2xl bg-background p-3">
              <div>
                <p className="text-sm font-bold">Require 2FA for exact location</p>
                <p className="text-xs text-text-muted">Admins must verify before viewing exact coords</p>
              </div>
              <input type="checkbox" className="h-5 w-5 rounded accent-primary" checked={settings.requireTwoFactorForExact} onChange={(e) => setSettings((s) => ({ ...s, requireTwoFactorForExact: e.target.checked }))} />
            </label>
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-bold">Session Security</h2>
          <div className="mt-4 space-y-4">
            <label className="block space-y-2">
              <FieldLabel>Session timeout (minutes)</FieldLabel>
              <input type="number" className="field" min={15} max={480} step={15} value={settings.sessionTimeoutMinutes} onChange={(e) => setSettings((s) => ({ ...s, sessionTimeoutMinutes: Number(e.target.value) }))} />
            </label>
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-bold">Notification Routing</h2>
          <div className="mt-4 space-y-3">
            <label className="flex items-center justify-between rounded-xl bg-background p-3">
              <span className="text-sm font-semibold">Alert on HIGH/EMERGENCY urgency</span>
              <input type="checkbox" className="h-5 w-5 rounded accent-primary" checked={settings.notifyOnHighUrgency} onChange={(e) => setSettings((s) => ({ ...s, notifyOnHighUrgency: e.target.checked }))} />
            </label>
            <label className="flex items-center justify-between rounded-xl bg-background p-3">
              <span className="text-sm font-semibold">Alert on every new report</span>
              <input type="checkbox" className="h-5 w-5 rounded accent-primary" checked={settings.notifyOnNewReport} onChange={(e) => setSettings((s) => ({ ...s, notifyOnNewReport: e.target.checked }))} />
            </label>
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-bold">Storage Settings</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-background p-3">
              <span className="font-semibold text-text-muted">Photo storage</span>
              <Badge tone="green">Available</Badge>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-background p-3">
              <span className="font-semibold text-text-muted">Audit retention</span>
              <span className="font-bold">90 days</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-background p-3">
              <span className="font-semibold text-text-muted">Exact coords encryption</span>
              <Badge tone="teal">AES-256</Badge>
            </div>
          </div>
        </Card>
      </div>
      <PrivacyWarningBanner />
    </div>
  );
}
