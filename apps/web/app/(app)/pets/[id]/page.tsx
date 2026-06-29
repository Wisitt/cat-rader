"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Bell,
  BellOff,
  Calendar,
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  Edit2,
  Eye,
  FileText,
  FlaskConical,
  Lock,
  Pill,
  Plus,
  Save,
  Shield,
  ShieldCheck,
  Stethoscope,
  Syringe,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { mockPets, mockVaccinations } from "@/lib/mock-data";
import type { PetPassport, PetVaccinationRecord, VaccineCategory, VaccineVisibility } from "@/types";
import { HeartShieldIcon, MatchPawIcon, PassportBookIcon, PawShieldIcon, QrTagIcon, SafeLocationIcon, VaccineCareIcon } from "@/components/icons/pet-passport";
import { AnimalIcon } from "@/components/icons/pets";

// ── Storage helpers ────────────────────────────────────────────────────────────

const PET_KEY = "petradar:pets";
const VAX_KEY = "petradar:vaccinations";

function loadPets(): PetPassport[] {
  if (typeof window === "undefined") return mockPets;
  try { const s = localStorage.getItem(PET_KEY); return s ? JSON.parse(s) : mockPets; } catch { return mockPets; }
}

function loadVaccinations(): PetVaccinationRecord[] {
  if (typeof window === "undefined") return mockVaccinations;
  try { const s = localStorage.getItem(VAX_KEY); return s ? JSON.parse(s) : mockVaccinations; } catch { return mockVaccinations; }
}

function saveVaccinations(records: PetVaccinationRecord[]) {
  try { localStorage.setItem(VAX_KEY, JSON.stringify(records)); } catch {}
}

function toast(text: string, type: "success" | "error" = "success") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text, type } }));
}

// ── Vaccine status helpers ─────────────────────────────────────────────────────

type VaxStatus = "OVERDUE" | "DUE_SOON" | "UP_TO_DATE" | "NO_DATE";

function vaccineStatus(nextDueDate?: string): VaxStatus {
  if (!nextDueDate) return "NO_DATE";
  const diff = (new Date(nextDueDate).getTime() - Date.now()) / 86400000;
  if (diff < 0) return "OVERDUE";
  if (diff <= 30) return "DUE_SOON";
  return "UP_TO_DATE";
}

function daysLabel(nextDueDate?: string): string {
  if (!nextDueDate) return "";
  const diff = Math.round((new Date(nextDueDate).getTime() - Date.now()) / 86400000);
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";
  return `Due in ${diff}d`;
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// ── Category config ────────────────────────────────────────────────────────────

const CAT_CONFIG: Record<VaccineCategory, { label: string; Icon: React.ElementType; color: string; bg: string }> = {
  CORE:               { label: "Core Vaccine",         Icon: ShieldCheck,    color: "text-primary",     bg: "bg-mint" },
  RABIES:             { label: "Rabies",               Icon: Shield,         color: "text-red-600",     bg: "bg-red-50" },
  PARASITE_PREVENTION:{ label: "Parasite Prevention",  Icon: FlaskConical,   color: "text-purple-600",  bg: "bg-purple-50" },
  DEWORMING:          { label: "Deworming",            Icon: Pill,           color: "text-amber-700",   bg: "bg-amber-50" },
  OTHER:              { label: "Other",                Icon: Activity,       color: "text-text-muted",  bg: "bg-background" },
};

const VIS_CONFIG: Record<VaccineVisibility, { label: string; Icon: React.ElementType; note: string }> = {
  PRIVATE:              { label: "Private",              Icon: Lock,    note: "Only you" },
  OWNER_ONLY:           { label: "Owner only",           Icon: Lock,    note: "Same as private" },
  SHARED_WITH_VOLUNTEER:{ label: "Shared w/ volunteer",  Icon: Eye,     note: "Rescue volunteers" },
  PUBLIC_SUMMARY:       { label: "Public summary",       Icon: Eye,     note: "QR scan shows safe summary" },
};

// ── Status badge ───────────────────────────────────────────────────────────────

function VaxStatusChip({ status, nextDueDate }: { status: VaxStatus; nextDueDate?: string }) {
  const cfg = {
    OVERDUE:    { cls: "bg-red-50 border-red-200 text-red-700",    icon: <AlertTriangle className="h-3 w-3" />, label: daysLabel(nextDueDate) },
    DUE_SOON:   { cls: "bg-amber-50 border-amber-200 text-amber-700", icon: <Clock className="h-3 w-3" />,     label: daysLabel(nextDueDate) },
    UP_TO_DATE: { cls: "bg-green-50 border-green-200 text-green-700", icon: <CheckCircle2 className="h-3 w-3" />, label: "Up to date" },
    NO_DATE:    { cls: "bg-background border-border text-text-muted", icon: <Calendar className="h-3 w-3" />,  label: "No next date" },
  }[status];
  return (
    <span className={`inline-flex h-6 items-center gap-1 rounded-full border px-2.5 text-[11px] font-bold ${cfg.cls}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ── Category badge ─────────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: VaccineCategory }) {
  const { Icon, label, color, bg } = CAT_CONFIG[category];
  return (
    <span className={`inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-bold ${bg} ${color}`}>
      <Icon className="h-3 w-3" /> {label}
    </span>
  );
}

// ── Vaccination record card ────────────────────────────────────────────────────

function VaxCard({
  record,
  onEdit,
  onDelete,
}: {
  record: PetVaccinationRecord;
  onEdit: (r: PetVaccinationRecord) => void;
  onDelete: (id: string) => void;
}) {
  const status = vaccineStatus(record.nextDueDate);
  const { Icon: CatIcon, color, bg } = CAT_CONFIG[record.vaccineCategory];
  const [confirmDel, setConfirmDel] = useState(false);
  const { Icon: VisIcon } = VIS_CONFIG[record.visibility];

  return (
    <article className={`overflow-hidden rounded-3xl border bg-white transition ${status === "OVERDUE" ? "border-red-200 shadow-[0_0_0_1px_rgba(239,68,68,.1)]" : status === "DUE_SOON" ? "border-amber-200" : "border-border"} shadow-card`}>
      {/* Colour accent stripe */}
      <div className={`h-1 w-full ${status === "OVERDUE" ? "bg-red-400" : status === "DUE_SOON" ? "bg-amber-400" : "bg-primary/40"}`} />

      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${bg}`}>
            <CatIcon className={`h-5 w-5 ${color}`} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-bold text-text-strong">{record.vaccineName}</h3>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <CategoryBadge category={record.vaccineCategory} />
              <VaxStatusChip status={status} nextDueDate={record.nextDueDate} />
            </div>
          </div>
          <div className="flex shrink-0 gap-1">
            <button
              onClick={() => onEdit(record)}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-border text-text-muted transition hover:border-primary/30 hover:text-primary"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setConfirmDel(true)}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-border text-text-muted transition hover:border-red-200 hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
          <div className="flex items-center gap-1.5 text-text-muted">
            <Syringe className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span>Given: <strong className="text-text-strong">{fmtDate(record.vaccinationDate)}</strong></span>
          </div>
          {record.nextDueDate && (
            <div className={`flex items-center gap-1.5 font-semibold ${status === "OVERDUE" ? "text-red-600" : status === "DUE_SOON" ? "text-amber-700" : "text-text-muted"}`}>
              <CalendarClock className="h-3.5 w-3.5 shrink-0" />
              <span>Next: <strong>{fmtDate(record.nextDueDate)}</strong></span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-text-muted">
            <Stethoscope className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate">{record.clinicName}</span>
          </div>
          {record.veterinarianName && (
            <div className="flex items-center gap-1.5 text-text-muted">
              <ClipboardList className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="truncate">{record.veterinarianName}</span>
            </div>
          )}
        </div>

        {record.notes && (
          <p className="mt-3 rounded-xl bg-background px-3 py-2 text-xs leading-5 text-text-muted">{record.notes}</p>
        )}

        {record.proofFiles.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {record.proofFiles.map((url, i) => (
              url.endsWith(".pdf") ? (
                <div key={i} className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-text-muted">
                  <FileText className="h-7 w-7" />
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={url} alt="Proof" className="h-16 w-16 shrink-0 rounded-xl object-cover border border-border" />
              )
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-text-muted">
            <VisIcon className="h-3 w-3" />
            <span>{VIS_CONFIG[record.visibility].label}</span>
            {record.reminderEnabled ? (
              <span className="flex items-center gap-1 rounded-full bg-mint px-2 py-0.5 font-bold text-primary"><Bell className="h-3 w-3" />Reminder on</span>
            ) : (
              <span className="flex items-center gap-1 text-text-muted/70"><BellOff className="h-3 w-3" />No reminder</span>
            )}
          </div>
        </div>
      </div>

      {confirmDel && (
        <div className="border-t border-red-100 bg-red-50 px-4 py-3">
          <p className="text-sm font-bold text-red-700">Delete this record?</p>
          <p className="mt-0.5 text-xs text-red-600">This cannot be undone.</p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => { onDelete(record.id); setConfirmDel(false); }}
              className="flex-1 rounded-xl bg-red-600 py-2 text-xs font-bold text-white hover:bg-red-700"
            >
              Yes, delete
            </button>
            <button
              onClick={() => setConfirmDel(false)}
              className="flex-1 rounded-xl border border-border bg-white py-2 text-xs font-semibold text-text-muted hover:bg-background"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

// ── Upcoming reminders banner ─────────────────────────────────────────────────

function UpcomingSection({ records }: { records: PetVaccinationRecord[] }) {
  const upcoming = records.filter((r) => {
    const s = vaccineStatus(r.nextDueDate);
    return s === "OVERDUE" || s === "DUE_SOON";
  });
  if (upcoming.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="flex items-center gap-2 text-sm font-bold text-text-strong">
        <AlertTriangle className="h-4 w-4 text-amber-500" /> Needs Attention
      </h3>
      {upcoming.map((r) => {
        const status = vaccineStatus(r.nextDueDate);
        return (
          <div
            key={r.id}
            className={`flex items-center gap-3 rounded-2xl border p-3 ${status === "OVERDUE" ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${status === "OVERDUE" ? "bg-red-100" : "bg-amber-100"}`}>
              {status === "OVERDUE" ? <AlertTriangle className="h-4 w-4 text-red-600" /> : <Clock className="h-4 w-4 text-amber-600" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`truncate text-sm font-bold ${status === "OVERDUE" ? "text-red-800" : "text-amber-800"}`}>{r.vaccineName}</p>
              <p className={`text-xs ${status === "OVERDUE" ? "text-red-600" : "text-amber-700"}`}>{daysLabel(r.nextDueDate)} · {r.clinicName}</p>
            </div>
            <CalendarPlus className={`h-4 w-4 shrink-0 ${status === "OVERDUE" ? "text-red-400" : "text-amber-500"}`} />
          </div>
        );
      })}
    </div>
  );
}

// ── Add / Edit drawer ─────────────────────────────────────────────────────────

const EMPTY_FORM = {
  vaccineName: "",
  vaccineCategory: "CORE" as VaccineCategory,
  vaccinationDate: "",
  nextDueDate: "",
  clinicName: "",
  veterinarianName: "",
  batchNumber: "",
  notes: "",
  proofFiles: [] as string[],
  reminderEnabled: true,
  visibility: "PRIVATE" as VaccineVisibility,
};

function VaxDrawer({
  open,
  petId,
  record,
  onClose,
  onSave,
}: {
  open: boolean;
  petId: string;
  record: PetVaccinationRecord | null;
  onClose: () => void;
  onSave: (r: PetVaccinationRecord) => void;
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const proofInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (record) {
      setForm({
        vaccineName: record.vaccineName,
        vaccineCategory: record.vaccineCategory,
        vaccinationDate: record.vaccinationDate,
        nextDueDate: record.nextDueDate ?? "",
        clinicName: record.clinicName,
        veterinarianName: record.veterinarianName ?? "",
        batchNumber: record.batchNumber ?? "",
        notes: record.notes ?? "",
        proofFiles: record.proofFiles,
        reminderEnabled: record.reminderEnabled,
        visibility: record.visibility,
      });
    } else {
      setForm({ ...EMPTY_FORM, vaccinationDate: new Date().toISOString().slice(0, 10) });
    }
    setErrors({});
  }, [open, record]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.vaccineName.trim()) e.vaccineName = "Vaccine name is required";
    if (!form.vaccinationDate) e.vaccinationDate = "Date given is required";
    if (!form.clinicName.trim()) e.clinicName = "Clinic name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const now = new Date().toISOString();
    const saved: PetVaccinationRecord = {
      id: record?.id ?? `VAX-${String(Date.now()).slice(-6)}`,
      petPassportId: petId,
      vaccineName: form.vaccineName.trim(),
      vaccineCategory: form.vaccineCategory,
      vaccinationDate: form.vaccinationDate,
      nextDueDate: form.nextDueDate || undefined,
      clinicName: form.clinicName.trim(),
      veterinarianName: form.veterinarianName.trim() || undefined,
      batchNumber: form.batchNumber.trim() || undefined,
      notes: form.notes.trim() || undefined,
      proofFiles: form.proofFiles,
      reminderEnabled: form.reminderEnabled,
      visibility: form.visibility,
      createdAt: record?.createdAt ?? now,
      updatedAt: now,
    };
    onSave(saved);
  }

  function addProofUrl() {
    const url = proofInputRef.current?.value.trim();
    if (!url) return;
    setForm((f) => ({ ...f, proofFiles: [...f.proofFiles, url] }));
    if (proofInputRef.current) proofInputRef.current.value = "";
  }

  function removeProof(idx: number) {
    setForm((f) => ({ ...f, proofFiles: f.proofFiles.filter((_, i) => i !== idx) }));
  }

  function set<K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => { const n = { ...e }; delete n[key as string]; return n; });
  }

  const fld = (label: string, key: keyof typeof EMPTY_FORM, required?: boolean, placeholder?: string, type = "text") => (
    <label className="block space-y-1.5">
      <span className="text-xs font-bold text-text-muted">{label}{required && " *"}</span>
      <input
        type={type}
        placeholder={placeholder}
        className={`field ${errors[key as string] ? "border-red-400" : ""}`}
        value={form[key] as string}
        onChange={(e) => set(key as keyof typeof EMPTY_FORM, e.target.value as never)}
      />
      {errors[key as string] && <p className="text-xs text-red-500">{errors[key as string]}</p>}
    </label>
  );

  return (
    <>
      {open && <div className="fixed inset-0 z-[800] bg-black/30" onClick={onClose} />}
      <div className={`fixed inset-y-0 right-0 z-[810] flex w-full max-w-lg flex-col bg-white shadow-elevated transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-text-strong">{record ? "Edit Vaccination Record" : "Add Vaccination"}</h2>
            <p className="text-xs text-text-muted">Records are private by default</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl border border-border text-text-muted hover:bg-background">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Vaccine name & category */}
          {fld("Vaccine name *", "vaccineName", true, "e.g. Feline FVRCP, Rabies...")}
          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-text-muted">Category *</span>
            <select className="field" value={form.vaccineCategory} onChange={(e) => set("vaccineCategory", e.target.value as VaccineCategory)}>
              <option value="CORE">Core Vaccine</option>
              <option value="RABIES">Rabies</option>
              <option value="PARASITE_PREVENTION">Parasite Prevention</option>
              <option value="DEWORMING">Deworming</option>
              <option value="OTHER">Other</option>
            </select>
          </label>

          {/* Dates */}
          <div className="grid gap-4 sm:grid-cols-2">
            {fld("Date given *", "vaccinationDate", true, "", "date")}
            {fld("Next due date", "nextDueDate", false, "", "date")}
          </div>

          {/* Clinic & vet */}
          {fld("Clinic / hospital *", "clinicName", true, "e.g. Happy Pet Hospital")}
          {fld("Veterinarian name", "veterinarianName", false, "Dr. ...")}
          {fld("Batch number", "batchNumber", false, "Optional — from vaccine label")}

          {/* Notes */}
          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-text-muted">Notes</span>
            <textarea
              className="field h-24 py-3"
              placeholder="Reactions, weight at vaccination, special instructions..."
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </label>

          {/* Proof files */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-text-muted">Proof photos / PDF</span>
            <div className="flex gap-2">
              <input
                ref={proofInputRef}
                type="url"
                className="field flex-1 text-xs"
                placeholder="Paste image URL or https://..."
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addProofUrl(); } }}
              />
              <button type="button" onClick={addProofUrl} className="flex h-10 items-center gap-1.5 rounded-2xl border border-border bg-background px-3 text-xs font-bold text-primary hover:bg-mint">
                <Upload className="h-3.5 w-3.5" /> Add
              </button>
            </div>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, proofFiles: [...f.proofFiles, "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80"] }))}
              className="text-xs font-bold text-text-muted underline"
            >
              Use sample proof photo
            </button>
            {form.proofFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.proofFiles.map((url, i) => (
                  <div key={i} className="relative">
                    {url.endsWith(".pdf") ? (
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-border bg-background text-text-muted">
                        <FileText className="h-7 w-7" />
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={url} alt="" className="h-16 w-16 rounded-xl object-cover border border-border" />
                    )}
                    <button
                      onClick={() => removeProof(i)}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reminder toggle */}
          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-border bg-background p-3">
            <div className="flex items-center gap-2.5">
              <Bell className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-bold text-text-strong">Due date reminder</p>
                <p className="text-xs text-text-muted">Alert before next vaccination</p>
              </div>
            </div>
            <input
              type="checkbox"
              className="h-5 w-5 rounded accent-primary"
              checked={form.reminderEnabled}
              onChange={(e) => set("reminderEnabled", e.target.checked)}
            />
          </label>

          {/* Visibility */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-text-muted">Who can see this record?</span>
            <div className="grid gap-2">
              {(["PRIVATE", "OWNER_ONLY", "SHARED_WITH_VOLUNTEER", "PUBLIC_SUMMARY"] as VaccineVisibility[]).map((v) => {
                const { label, Icon: VIcon, note } = VIS_CONFIG[v];
                return (
                  <label key={v} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition ${form.visibility === v ? "border-primary bg-mint" : "border-border bg-white hover:bg-background"}`}>
                    <input type="radio" name="visibility" className="mt-0.5 accent-primary" checked={form.visibility === v} onChange={() => set("visibility", v)} />
                    <VIcon className={`mt-0.5 h-4 w-4 shrink-0 ${form.visibility === v ? "text-primary" : "text-text-muted"}`} />
                    <div>
                      <p className={`text-sm font-bold ${form.visibility === v ? "text-primary" : "text-text-strong"}`}>{label}</p>
                      <p className="text-xs text-text-muted">{note}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-border p-4 flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-bold text-white transition hover:bg-primary-dark"
          >
            <Save className="h-4 w-4" /> {record ? "Save Changes" : "Add Record"}
          </button>
          <button type="button" onClick={onClose} className="flex items-center justify-center gap-2 rounded-2xl border border-border px-5 py-3 text-sm font-semibold text-text-muted hover:bg-background">
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

// ── Pet status badge ───────────────────────────────────────────────────────────

function PetStatusChip({ status }: { status: PetPassport["status"] }) {
  const cfg: Record<PetPassport["status"], string> = {
    ACTIVE: "bg-green-50 text-green-700 border-green-200",
    LOST: "bg-red-50 text-red-700 border-red-200",
    FOUND: "bg-blue-50 text-blue-700 border-blue-200",
    ARCHIVED: "bg-gray-100 text-gray-600 border-gray-200",
    DECEASED: "bg-gray-100 text-gray-500 border-gray-200",
  };
  return (
    <span className={`inline-flex h-7 items-center gap-1.5 rounded-full border px-3 text-xs font-bold ${cfg[status]}`}>
      {status === "LOST" && <AlertTriangle className="h-3.5 w-3.5" />}
      {status}
    </span>
  );
}

// ── Vaccination stats bar ─────────────────────────────────────────────────────

function VaxStats({ records }: { records: PetVaccinationRecord[] }) {
  const overdue  = records.filter((r) => vaccineStatus(r.nextDueDate) === "OVERDUE").length;
  const dueSoon  = records.filter((r) => vaccineStatus(r.nextDueDate) === "DUE_SOON").length;
  const upToDate = records.filter((r) => vaccineStatus(r.nextDueDate) === "UP_TO_DATE").length;
  return (
    <div className="grid grid-cols-3 divide-x divide-border overflow-hidden rounded-2xl border border-border bg-white text-center">
      <div className="py-3">
        <p className={`text-lg font-bold ${overdue > 0 ? "text-red-600" : "text-text-muted"}`}>{overdue}</p>
        <p className="text-[11px] text-text-muted">Overdue</p>
      </div>
      <div className="py-3">
        <p className={`text-lg font-bold ${dueSoon > 0 ? "text-amber-600" : "text-text-muted"}`}>{dueSoon}</p>
        <p className="text-[11px] text-text-muted">Due Soon</p>
      </div>
      <div className="py-3">
        <p className={`text-lg font-bold ${upToDate > 0 ? "text-green-600" : "text-text-muted"}`}>{upToDate}</p>
        <p className="text-[11px] text-text-muted">Up to Date</p>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

type Tab = "overview" | "health" | "vaccines" | "qr" | "lost" | "activity";

const tabLabels: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" }, { id: "health", label: "Health" }, { id: "vaccines", label: "Vaccines" },
  { id: "qr", label: "QR" }, { id: "lost", label: "Lost Pet" }, { id: "activity", label: "Activity" },
];

function JournalCard({ icon, title, children, tone = "bg-white" }: { icon: React.ReactNode; title: string; children: React.ReactNode; tone?: string }) {
  return <section className={`rounded-3xl border border-[#e8e2d8] p-5 shadow-soft ${tone}`}><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f7eee2] text-primary">{icon}</span><h2 className="text-sm font-bold text-text-strong">{title}</h2></div><div className="mt-4 text-sm leading-6 text-text-muted">{children}</div></section>;
}

export default function PetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [pet, setPet] = useState<PetPassport | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [vaccinations, setVaccinations] = useState<PetVaccinationRecord[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<PetVaccinationRecord | null>(null);

  useEffect(() => {
    setPet(loadPets().find((item) => item.id === id) ?? null);
    setVaccinations(loadVaccinations().filter((record) => record.petPassportId === id));
    const search = new URLSearchParams(window.location.search);
    const requested = search.get("tab");
    if (requested === "vaccinations" || requested === "vaccines") setTab("vaccines");
    if (search.get("add") === "1") {
      setEditRecord(null);
      setDrawerOpen(true);
    }
  }, [id]);

  const records = useMemo(() => [...vaccinations].sort((a, b) => new Date(b.vaccinationDate).getTime() - new Date(a.vaccinationDate).getTime()), [vaccinations]);
  const openAdd = useCallback(() => { setEditRecord(null); setDrawerOpen(true); }, []);
  const openEdit = useCallback((record: PetVaccinationRecord) => { setEditRecord(record); setDrawerOpen(true); }, []);

  function handleSave(saved: PetVaccinationRecord) {
    const all = loadVaccinations();
    const updated = all.some((record) => record.id === saved.id) ? all.map((record) => record.id === saved.id ? saved : record) : [saved, ...all];
    saveVaccinations(updated); setVaccinations(updated.filter((record) => record.petPassportId === id)); setDrawerOpen(false); toast("Vaccination book updated.");
  }
  function handleDelete(recordId: string) {
    const updated = loadVaccinations().filter((record) => record.id !== recordId);
    saveVaccinations(updated); setVaccinations(updated.filter((record) => record.petPassportId === id)); toast("Record deleted.");
  }

  if (!pet) return <div className="page-shell"><div className="panel p-8 text-center">Pet Passport not found.</div></div>;
  const nextDue = records.map((record) => record.nextDueDate).filter(Boolean).sort()[0];

  return <>
    <VaxDrawer open={drawerOpen} petId={id} record={editRecord} onClose={() => setDrawerOpen(false)} onSave={handleSave} />
    <div className="page-shell max-w-6xl space-y-5">
      <Link href="/pets" className="inline-flex items-center gap-2 text-sm font-bold text-text-muted"><ArrowLeft className="h-4 w-4" /> My Pets</Link>

      <section className="relative overflow-hidden rounded-[2rem] border border-[#e6dac8] bg-[#fdf7ec] p-5 shadow-card sm:p-7">
        <div className="absolute right-8 top-6 text-primary/10"><PassportBookIcon className="h-32 w-32" /></div>
        <div className="relative grid gap-6 md:grid-cols-[240px_1fr]">
          <div className="overflow-hidden rounded-3xl border-4 border-white bg-mint shadow-card">
            {pet.photoUrl ? <img src={pet.photoUrl} alt={pet.name} className="aspect-square h-full w-full object-cover" /> : <div className="grid aspect-square place-items-center text-primary"><AnimalIcon species={pet.species} className="h-24 w-24" /></div>}
          </div>
          <div className="flex min-w-0 flex-col justify-center">
            <div className="flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-3 py-1 text-[10px] font-bold text-emerald-700"><PawShieldIcon className="h-3.5 w-3.5" /> Verified owner</span><PetStatusChip status={pet.status} /></div>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-text-strong sm:text-5xl">{pet.name}</h1>
            <p className="mt-2 text-sm text-text-muted">{pet.species} · {pet.breed ?? "Mixed breed"} · {pet.sex} · {pet.size}</p>
            <p className="mt-1 font-mono text-xs font-bold text-primary">Passport ID: {pet.id}</p>
            <div className="mt-5 flex flex-wrap gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"><VaccineCareIcon className="h-4 w-4" /> Health profile ready</span><Link href={`/pets/${id}/qr`} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-2 text-xs font-bold text-primary"><QrTagIcon className="h-4 w-4" /> QR profile</Link></div>
            <div className="mt-5 flex flex-wrap gap-2"><Link href={`/pets/${id}/edit`} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white"><Edit2 className="h-4 w-4" /> Edit Passport</Link><Link href={`/pets/${id}/lost`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-bold text-red-700"><AlertTriangle className="h-4 w-4" /> Report as Lost</Link></div>
          </div>
        </div>
      </section>

      <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-white p-1 shadow-soft">{tabLabels.map((item) => <button key={item.id} onClick={() => setTab(item.id)} className={`min-w-24 flex-1 rounded-xl px-3 py-2.5 text-xs font-bold transition ${tab === item.id ? "bg-mint text-primary" : "text-text-muted hover:bg-background"}`}>{item.label}</button>)}</nav>

      {tab === "overview" && <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <JournalCard icon={<AnimalIcon species={pet.species} className="h-5 w-5" />} title={`About ${pet.name}`}><dl className="grid grid-cols-2 gap-3"><div><dt>Color</dt><dd className="font-bold text-text-strong">{pet.color}</dd></div><div><dt>Pattern</dt><dd className="font-bold text-text-strong">{pet.pattern ?? "Not added"}</dd></div><div><dt>Birthday</dt><dd className="font-bold text-text-strong">{pet.birthDate ? fmtDate(pet.birthDate) : "Not added"}</dd></div><div><dt>Microchip</dt><dd className="font-bold text-text-strong">{pet.microchipId ? "Registered" : "Not added"}</dd></div></dl></JournalCard>
        <JournalCard icon={<HeartShieldIcon className="h-5 w-5" />} title="What makes them special" tone="bg-[#fffefa]"><p>{pet.description || "Add personality notes and distinctive marks to help others recognize your pet."}</p><p className="mt-3 font-semibold text-text-strong">{pet.hasCollar ? pet.collarDescription || "Wears a collar" : "No collar added"}</p></JournalCard>
        <JournalCard icon={<SafeLocationIcon className="h-5 w-5" />} title="Safety & contact"><p>Private contact stays hidden. If {pet.name} is lost, the public sees only an approximate area.</p></JournalCard>
        <JournalCard icon={<VaccineCareIcon className="h-5 w-5" />} title="Health notes" tone="bg-emerald-50/50"><p className="font-bold text-emerald-700">{records.length ? `${records.length} care records saved` : "No vaccine records yet"}</p>{nextDue ? <p className="mt-2">Next due: {fmtDate(nextDue)}</p> : null}<button onClick={() => setTab("vaccines")} className="mt-3 font-bold text-primary">Open vaccination book</button></JournalCard>
        <JournalCard icon={<QrTagIcon className="h-5 w-5" />} title="QR pet profile"><p>A safe public profile for faster reunions without exposing private details.</p><Link href={`/pets/${id}/qr`} className="mt-3 inline-flex font-bold text-primary">Open QR profile <ChevronRight className="h-4 w-4" /></Link></JournalCard>
        <JournalCard icon={<MatchPawIcon className="h-5 w-5" />} title={`If ${pet.name} gets lost`} tone="bg-red-50/40"><p>Ready to create a lost pet post and start matching nearby sightings.</p><Link href={`/pets/${id}/lost`} className="mt-3 inline-flex font-bold text-red-700">Report this pet as lost</Link></JournalCard>
      </div>}

      {tab === "health" && <div className="grid gap-4 md:grid-cols-2"><JournalCard icon={<Stethoscope className="h-5 w-5" />} title="Health snapshot" tone="bg-emerald-50/50"><VaxStats records={records} /></JournalCard><JournalCard icon={<Lock className="h-5 w-5" />} title="Private care notes"><p>Medical details and vaccine batch numbers remain owner-only. Public QR scans show a safe summary.</p></JournalCard><JournalCard icon={<Bell className="h-5 w-5" />} title="Care reminders"><p>{nextDue ? `Next reminder: ${fmtDate(nextDue)}` : "Add a vaccine record to create the first reminder."}</p></JournalCard><JournalCard icon={<ShieldCheck className="h-5 w-5" />} title="Last updated"><p>{fmtDate(pet.updatedAt)}</p></JournalCard></div>}

      {tab === "vaccines" && <div className="space-y-5"><div className="flex items-center justify-between"><div><h2 className="text-xl font-bold">Vaccination book</h2><p className="text-sm text-text-muted">A gentle care record for {pet.name}.</p></div><button onClick={openAdd} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white"><Plus className="h-4 w-4" /> Add vaccine</button></div><UpcomingSection records={records} />{records.length ? <div className="space-y-3">{records.map((record) => <VaxCard key={record.id} record={record} onEdit={openEdit} onDelete={handleDelete} />)}</div> : <div className="rounded-3xl border border-dashed border-border bg-[#fffefa] py-14 text-center"><VaccineCareIcon className="mx-auto h-14 w-14 text-primary" /><h3 className="mt-4 font-bold">No vaccine records yet</h3><button onClick={openAdd} className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white">Add first vaccine</button></div>}<Link href={`/pets/${id}/vaccinations`} className="flex h-11 items-center justify-center rounded-xl border border-border bg-white text-sm font-bold text-primary">View full vaccination schedule</Link></div>}

      {tab === "qr" && <div className="grid gap-4 md:grid-cols-2"><JournalCard icon={<QrTagIcon className="h-5 w-5" />} title="Safe QR profile"><p>Share {pet.name}&apos;s essential identity details without exposing your phone number or exact location.</p><Link href={`/pets/${id}/qr`} className="mt-4 inline-flex h-10 items-center rounded-xl bg-primary px-4 font-bold text-white">Design QR tag</Link></JournalCard><JournalCard icon={<PawShieldIcon className="h-5 w-5" />} title="Public visibility"><p>Name, photo, breed, color, and safe contact through PetRadar. Health details stay private.</p></JournalCard></div>}
      {tab === "lost" && <div className="grid gap-4 md:grid-cols-2"><JournalCard icon={<AlertTriangle className="h-5 w-5" />} title={`Ready if ${pet.name} goes missing`} tone="bg-red-50/50"><p>Create a lost post, notify nearby helpers, and begin possible matching.</p><Link href={`/pets/${id}/lost`} className="mt-4 inline-flex h-10 items-center rounded-xl bg-red-600 px-4 font-bold text-white">Report as lost</Link></JournalCard><JournalCard icon={<MatchPawIcon className="h-5 w-5" />} title="Possible matches"><p>No active possible matches. PetRadar will alert you when a similar sighting appears.</p></JournalCard></div>}
      {tab === "activity" && <JournalCard icon={<Activity className="h-5 w-5" />} title="Care timeline"><div className="space-y-4">{[["Passport created", pet.createdAt],["Profile updated", pet.updatedAt],...(records.slice(0, 3).map((record) => [`${record.vaccineName} added`, record.vaccinationDate]))].map(([label, date]) => <div key={`${label}-${date}`} className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full bg-primary" /><div><p className="font-bold text-text-strong">{label}</p><p className="text-xs">{fmtDate(date)}</p></div></div>)}</div></JournalCard>}
    </div>
  </>;
}
