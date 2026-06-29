"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, Check, MapPin } from "lucide-react";
import { mockPets } from "@/lib/mock-data";
import type { PetPassport } from "@/types";

const PET_KEY = "petradar:pets";
const LOST_KEY = "petradar:lost-pets";

function loadPets(): PetPassport[] {
  if (typeof window === "undefined") return mockPets;
  try { const s = localStorage.getItem(PET_KEY); return s ? JSON.parse(s) : mockPets; } catch { return mockPets; }
}
function savePets(pets: PetPassport[]) {
  try { localStorage.setItem(PET_KEY, JSON.stringify(pets)); } catch {}
}

interface StoredLostPet {
  id: string;
  petPassportId: string;
  petName: string;
  species: string;
  color: string;
  photoUrl: string;
  lastSeenArea: string;
  lastSeenDate: string;
  description: string;
  contactPhone: string;
  status: "ACTIVE" | "FOUND" | "CLOSED";
  createdAt: string;
}

function loadLostPets(): StoredLostPet[] {
  if (typeof window === "undefined") return [];
  try { const s = localStorage.getItem(LOST_KEY); return s ? JSON.parse(s) : []; } catch { return []; }
}
function saveLostPets(pets: StoredLostPet[]) {
  try { localStorage.setItem(LOST_KEY, JSON.stringify(pets)); } catch {}
}

export default function ReportLostPage() {
  const { id } = useParams<{ id: string }>();
  const [pet, setPet] = useState<PetPassport | null>(null);
  const [form, setForm] = useState({ lastSeenArea: "", lastSeenDate: "", contactPhone: "", additionalNotes: "" });
  const [submitted, setSubmitted] = useState(false);
  const [lostId, setLostId] = useState("");

  useEffect(() => {
    const pets = loadPets();
    const found = pets.find((p) => p.id === id) ?? mockPets[0];
    setPet(found);
    const today = new Date().toISOString().slice(0, 10);
    setForm((f) => ({ ...f, lastSeenDate: today }));
  }, [id]);

  function submit() {
    if (!pet) return;
    if (!form.lastSeenArea.trim()) {
      window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text: "Please enter where the pet was last seen.", type: "error" } }));
      return;
    }

    const lostPetId = `LP-${String(Date.now()).slice(-6)}`;
    const newLostPet: StoredLostPet = {
      id: lostPetId,
      petPassportId: pet.id,
      petName: pet.name,
      species: pet.species,
      color: pet.color + (pet.pattern ? ` · ${pet.pattern}` : ""),
      photoUrl: pet.photoUrl,
      lastSeenArea: form.lastSeenArea.trim(),
      lastSeenDate: form.lastSeenDate,
      description: [pet.description, form.additionalNotes.trim()].filter(Boolean).join(" "),
      contactPhone: form.contactPhone.trim(),
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    };

    const existing = loadLostPets();
    saveLostPets([newLostPet, ...existing]);

    const pets = loadPets();
    savePets(pets.map((p) => p.id === pet.id ? { ...p, status: "LOST", lostPetId, updatedAt: new Date().toISOString() } : p));

    setLostId(lostPetId);
    setSubmitted(true);
    window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text: `${pet.name} reported as lost. ID: ${lostPetId}` } }));
  }

  if (!pet) return null;

  if (submitted) {
    return (
      <div className="page-shell max-w-md">
        <div className="overflow-hidden rounded-3xl border border-border bg-white">
          <div className="bg-primary px-5 py-6 text-white text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
              <Check className="h-8 w-8" />
            </div>
            <h1 className="mt-3 text-xl font-bold">Report Submitted</h1>
            <p className="mt-1 text-sm opacity-80">{pet.name} has been reported as lost.</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="rounded-2xl bg-background p-4 text-center">
              <p className="text-xs font-bold text-text-muted">Lost Listing ID</p>
              <p className="font-mono text-xl font-bold text-primary">{lostId}</p>
            </div>
            <p className="text-sm leading-6 text-text-muted text-center">
              Your listing is now visible to the PetRadar community. You will be notified of any potential matches. Only your approximate location is shared publicly.
            </p>
            <div className="grid gap-2">
              <Link href="/lost-pets" className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-bold text-white hover:bg-primary-dark transition">
                View Lost Pets Board
              </Link>
              <Link href={`/pets/${id}`} className="flex items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm font-bold text-text-muted hover:bg-background transition">
                Back to {pet.name}&apos;s Passport
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href={`/pets/${id}`} className="flex h-9 w-9 items-center justify-center rounded-xl border border-border hover:bg-background">
          <ArrowLeft className="h-4 w-4 text-text-muted" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-strong">Report {pet.name} as Lost</h1>
          <p className="text-sm text-text-muted">This will create a public lost pet listing</p>
        </div>
      </div>

      <div className="rounded-3xl border border-red-200 bg-red-50 p-4">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div className="text-sm leading-5 text-red-800">
            <strong>Privacy reminder:</strong> Only your pet&apos;s approximate area will be shown publicly. Exact coordinates are never shared. Your contact information is protected unless you choose to display it.
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-white">
        <div className="flex gap-4 border-b border-border p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pet.photoUrl} alt={pet.name} className="h-16 w-16 rounded-2xl object-cover" />
          <div>
            <h2 className="font-bold text-text-strong">{pet.name}</h2>
            <p className="text-sm text-text-muted">{pet.breed ?? pet.species} · {pet.color}</p>
            {pet.microchipId && <p className="mt-1 font-mono text-xs text-text-muted">Chip: {pet.microchipId}</p>}
          </div>
        </div>

        <div className="space-y-4 p-5">
          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-text-muted"><MapPin className="mr-1 inline h-3.5 w-3.5" />Where were they last seen? *</span>
            <input
              type="text"
              className="field"
              placeholder="e.g. Ari BTS, Soi 4, near the park..."
              value={form.lastSeenArea}
              onChange={(e) => setForm((f) => ({ ...f, lastSeenArea: e.target.value }))}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-text-muted">Date last seen *</span>
            <input
              type="date"
              className="field"
              value={form.lastSeenDate}
              onChange={(e) => setForm((f) => ({ ...f, lastSeenDate: e.target.value }))}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-text-muted">Contact phone (optional)</span>
            <input
              type="tel"
              className="field"
              placeholder="08X-XXX-XXXX"
              value={form.contactPhone}
              onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-text-muted">Additional notes (optional)</span>
            <textarea
              className="field h-28 py-3"
              placeholder="Anything else people should know — favorite spots, fear of strangers, any health issues..."
              value={form.additionalNotes}
              onChange={(e) => setForm((f) => ({ ...f, additionalNotes: e.target.value }))}
            />
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={submit}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-700 transition"
        >
          <AlertTriangle className="h-4 w-4" /> Submit Lost Report
        </button>
        <Link href={`/pets/${id}`} className="flex items-center justify-center gap-2 rounded-2xl border border-border px-5 py-3 text-sm font-bold text-text-muted hover:bg-background">
          Cancel
        </Link>
      </div>
    </div>
  );
}
