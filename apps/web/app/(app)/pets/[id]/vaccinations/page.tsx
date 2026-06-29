"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Bell,
  BellOff,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  Clock,
  FlaskConical,
  Lock,
  Pill,
  Plus,
  Shield,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { mockPets, mockVaccinations } from "@/lib/mock-data";
import type { PetPassport, PetVaccinationRecord, VaccineCategory } from "@/types";

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

const CAT_CONFIG: Record<VaccineCategory, { label: string; Icon: React.ElementType; color: string; bg: string }> = {
  CORE:               { label: "Core Vaccine",         Icon: ShieldCheck,  color: "text-primary",    bg: "bg-mint" },
  RABIES:             { label: "Rabies",               Icon: Shield,       color: "text-red-600",    bg: "bg-red-50" },
  PARASITE_PREVENTION:{ label: "Parasite Prevention",  Icon: FlaskConical, color: "text-purple-600", bg: "bg-purple-50" },
  DEWORMING:          { label: "Deworming",            Icon: Pill,         color: "text-amber-700",  bg: "bg-amber-50" },
  OTHER:              { label: "Other",                Icon: Activity,     color: "text-text-muted", bg: "bg-background" },
};

function StatusChip({ status, nextDueDate }: { status: VaxStatus; nextDueDate?: string }) {
  const cfg = {
    OVERDUE:    { cls: "bg-red-50 border-red-200 text-red-700",     icon: <AlertTriangle className="h-3 w-3" />, label: daysLabel(nextDueDate) },
    DUE_SOON:   { cls: "bg-amber-50 border-amber-200 text-amber-700", icon: <Clock className="h-3 w-3" />,       label: daysLabel(nextDueDate) },
    UP_TO_DATE: { cls: "bg-green-50 border-green-200 text-green-700", icon: <CheckCircle2 className="h-3 w-3" />, label: "Up to date" },
    NO_DATE:    { cls: "bg-background border-border text-text-muted", icon: <Calendar className="h-3 w-3" />,    label: "No next date" },
  }[status];
  return (
    <span className={`inline-flex h-6 items-center gap-1 rounded-full border px-2.5 text-[11px] font-bold ${cfg.cls}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

// Group records by upcoming / past
type Group = { label: string; records: PetVaccinationRecord[] };

function groupRecords(records: PetVaccinationRecord[]): Group[] {
  const overdue   = records.filter((r) => vaccineStatus(r.nextDueDate) === "OVERDUE");
  const dueSoon   = records.filter((r) => vaccineStatus(r.nextDueDate) === "DUE_SOON");
  const upToDate  = records.filter((r) => vaccineStatus(r.nextDueDate) === "UP_TO_DATE");
  const noDate    = records.filter((r) => vaccineStatus(r.nextDueDate) === "NO_DATE");
  const groups: Group[] = [];
  if (overdue.length)  groups.push({ label: "Overdue", records: overdue });
  if (dueSoon.length)  groups.push({ label: "Due Soon", records: dueSoon });
  if (upToDate.length) groups.push({ label: "Up to Date", records: upToDate });
  if (noDate.length)   groups.push({ label: "No Next Date", records: noDate });
  return groups;
}

function ScheduleRow({ record }: { record: PetVaccinationRecord }) {
  const status = vaccineStatus(record.nextDueDate);
  const { Icon, color, bg } = CAT_CONFIG[record.vaccineCategory];
  return (
    <div className={`flex items-center gap-4 rounded-2xl border p-3 ${
      status === "OVERDUE" ? "border-red-200 bg-red-50" :
      status === "DUE_SOON" ? "border-amber-100 bg-amber-50/60" :
      "border-border bg-white"
    }`}>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg}`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-text-strong">{record.vaccineName}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-text-muted">
          <span className="flex items-center gap-1"><Stethoscope className="h-3 w-3 text-primary" />{record.clinicName}</span>
          {record.nextDueDate && (
            <span className="flex items-center gap-1">
              <CalendarClock className="h-3 w-3" />
              {fmtDate(record.nextDueDate)}
            </span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <StatusChip status={status} nextDueDate={record.nextDueDate} />
        <span className={`flex items-center gap-1 text-[11px] ${record.reminderEnabled ? "text-primary font-bold" : "text-text-muted"}`}>
          {record.reminderEnabled ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
          {record.reminderEnabled ? "Reminder on" : "No reminder"}
        </span>
      </div>
    </div>
  );
}

// Coverage summary
function CoverageCard({ label, covered, total, color }: { label: string; covered: number; total: number; color: string }) {
  const pct = total === 0 ? 100 : Math.round((covered / total) * 100);
  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <div className="flex items-center justify-between text-xs font-bold">
        <span className="text-text-muted">{label}</span>
        <span className={color}>{covered}/{total}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background">
        <div className={`h-full rounded-full transition-all ${color.replace("text-", "bg-")}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function VaccinationSchedulePage() {
  const { id } = useParams<{ id: string }>();
  const [pet, setPet] = useState<PetPassport | null>(null);
  const [records, setRecords] = useState<PetVaccinationRecord[]>([]);

  useEffect(() => {
    setPet(loadPets().find((p) => p.id === id) ?? mockPets[0]);
    setRecords(loadVaccinations().filter((v) => v.petPassportId === id));
  }, [id]);

  const sorted = useMemo(
    () => [...records].sort((a, b) => {
      if (!a.nextDueDate && !b.nextDueDate) return 0;
      if (!a.nextDueDate) return 1;
      if (!b.nextDueDate) return -1;
      return new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime();
    }),
    [records]
  );

  const groups = useMemo(() => groupRecords(sorted), [sorted]);

  const overdueCt  = records.filter((r) => vaccineStatus(r.nextDueDate) === "OVERDUE").length;
  const upToDateCt = records.filter((r) => vaccineStatus(r.nextDueDate) === "UP_TO_DATE").length;
  const withRemind = records.filter((r) => r.reminderEnabled).length;

  if (!pet) return null;

  return (
    <div className="page-shell max-w-2xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/pets/${id}`} className="flex h-9 w-9 items-center justify-center rounded-xl border border-border hover:bg-background">
          <ArrowLeft className="h-4 w-4 text-text-muted" />
        </Link>
        <div className="flex flex-1 items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-text-strong">Vaccination Schedule</h1>
            <p className="text-sm text-text-muted">{pet.name} · {records.length} records</p>
          </div>
          <Link
            href={`/pets/${id}?tab=vaccines&add=1`}
            className="flex items-center gap-1.5 rounded-2xl bg-primary px-3.5 py-2 text-sm font-bold text-white hover:bg-primary-dark transition"
          >
            <Plus className="h-4 w-4" /> Add
          </Link>
        </div>
      </div>

      {/* Coverage summary */}
      {records.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          <CoverageCard label="Up to date" covered={upToDateCt} total={records.length} color="text-green-600" />
          <CoverageCard label="Need attention" covered={overdueCt} total={records.length} color={overdueCt > 0 ? "text-red-600" : "text-text-muted"} />
          <CoverageCard label="Reminders set" covered={withRemind} total={records.length} color="text-primary" />
        </div>
      )}

      {/* Privacy notice */}
      <div className="flex items-start gap-3 rounded-2xl border border-border bg-background p-3 text-xs text-text-muted">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <span>Vaccination records are private by default. Only records you mark as <strong className="text-text-strong">Public Summary</strong> appear on the QR scan page.</span>
      </div>

      {/* Groups */}
      {records.length === 0 ? (
        <div className="rounded-3xl border border-border bg-white py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-mint text-primary">
            <CalendarCheck className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-base font-bold text-text-strong">No vaccination records yet</h3>
          <p className="mt-2 text-sm text-text-muted">Add records from the Vaccination Book tab.</p>
          <Link
            href={`/pets/${id}?tab=vaccines&add=1`}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition"
          >
            <Plus className="h-4 w-4" /> Add Record
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map((group) => (
            <div key={group.label}>
              <div className="mb-3 flex items-center gap-2">
                {group.label === "Overdue" && <AlertTriangle className="h-4 w-4 text-red-600" />}
                {group.label === "Due Soon" && <Clock className="h-4 w-4 text-amber-600" />}
                {group.label === "Up to Date" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                {group.label === "No Next Date" && <Calendar className="h-4 w-4 text-text-muted" />}
                <h2 className={`text-sm font-bold ${
                  group.label === "Overdue" ? "text-red-700" :
                  group.label === "Due Soon" ? "text-amber-700" :
                  group.label === "Up to Date" ? "text-green-700" :
                  "text-text-muted"
                }`}>{group.label} <span className="font-normal text-text-muted">({group.records.length})</span></h2>
              </div>
              <div className="space-y-2">
                {group.records.map((r) => <ScheduleRow key={r.id} record={r} />)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}
