"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Copy, Download, Lock, Printer, ShieldCheck, Syringe } from "lucide-react";
import { mockPets, mockVaccinations } from "@/lib/mock-data";
import type { PetPassport, PetVaccinationRecord } from "@/types";
import { PawShieldIcon, QrTagIcon } from "@/components/icons/pet-passport";

const STORAGE_KEY = "petradar:pets";
const VAX_KEY = "petradar:vaccinations";

function loadVaccinations(): PetVaccinationRecord[] {
  if (typeof window === "undefined") return mockVaccinations;
  try { const s = localStorage.getItem(VAX_KEY); return s ? JSON.parse(s) : mockVaccinations; } catch { return mockVaccinations; }
}

function vaxStatusLabel(nextDueDate?: string): { label: string; cls: string } {
  if (!nextDueDate) return { label: "No next date", cls: "text-text-muted" };
  const diff = (new Date(nextDueDate).getTime() - Date.now()) / 86400000;
  if (diff < 0) return { label: "Overdue", cls: "text-red-600 font-bold" };
  if (diff <= 30) return { label: "Due soon", cls: "text-amber-600 font-bold" };
  return { label: "Up to date", cls: "text-green-600 font-bold" };
}

function loadPets(): PetPassport[] {
  if (typeof window === "undefined") return mockPets;
  try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : mockPets; } catch { return mockPets; }
}

export default function PetQrPage() {
  const { id } = useParams<{ id: string }>();
  const [pet, setPet] = useState<PetPassport | null>(null);
  const [qrLoaded, setQrLoaded] = useState(false);
  const [publicVax, setPublicVax] = useState<PetVaccinationRecord[]>([]);
  const [contactMode, setContactMode] = useState("PETRADAR");
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pets = loadPets();
    setPet(pets.find((p) => p.id === id) ?? mockPets[0]);
    // Only PUBLIC_SUMMARY records are shown here — privacy enforcement
    const all = loadVaccinations();
    setPublicVax(all.filter((v) => v.petPassportId === id && v.visibility === "PUBLIC_SUMMARY"));
  }, [id]);

  // Render QR code via a lightweight CSS/SVG approach — no external lib needed
  // Uses a Google Charts redirect-free pattern with a public QR API
  const petUrl = typeof window !== "undefined" ? `${window.location.origin}/p/${id}` : `https://petradar.app/p/${id}`;

  function copyLink() {
    navigator.clipboard.writeText(petUrl);
    window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text: "Safe profile link copied." } }));
  }

  function downloadQr() {
    const img = qrRef.current?.querySelector("img");
    if (!img) return;
    const a = document.createElement("a");
    a.href = img.src;
    a.download = `petradar-${id}-qr.png`;
    a.click();
    window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text: "QR code downloaded." } }));
  }

  if (!pet) return null;

  return (
    <div className="page-shell max-w-5xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href={`/pets/${id}`} className="flex h-9 w-9 items-center justify-center rounded-xl border border-border hover:bg-background">
          <ArrowLeft className="h-4 w-4 text-text-muted" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">{pet.name}&apos;s QR Profile</h1>
          <p className="text-sm text-text-muted">A safe public profile and printable pet tag.</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_.9fr]">
      <section className="pet-tag-print overflow-hidden rounded-[2rem] border border-[#e4dacb] bg-[#fffefa] shadow-card">
        <div className="flex items-center justify-between bg-primary px-5 py-4 text-white"><span className="inline-flex items-center gap-2 text-xs font-bold"><QrTagIcon className="h-5 w-5" /> Safe public profile</span><span className="text-[10px] font-bold opacity-80">{pet.id}</span></div>
        <div className="grid gap-5 p-6 sm:grid-cols-[240px_1fr]" ref={qrRef}>
          <div className="relative flex items-center justify-center rounded-3xl bg-white p-3 shadow-soft">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(petUrl)}&size=220x220&margin=12&format=png&color=0F766E`}
            alt={`QR code for ${pet.name}`}
            className="rounded-2xl"
            width={220}
            height={220}
            onLoad={() => setQrLoaded(true)}
          />
          {!qrLoaded && <div className="grid h-[220px] w-[220px] place-items-center rounded-2xl border border-border bg-background text-sm text-text-muted">Generating QR...</div>}
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3">{pet.photoUrl ? <img src={pet.photoUrl} alt="" className="h-16 w-16 rounded-2xl object-cover" /> : null}<div><h2 className="text-3xl font-bold">{pet.name}</h2><p className="text-xs text-text-muted">{pet.species} · {pet.breed ?? "Mixed breed"} · {pet.color}</p></div></div>
            <span className="mt-4 inline-flex w-fit items-center gap-1 rounded-full bg-mint px-3 py-1.5 text-[10px] font-bold text-primary"><PawShieldIcon className="h-4 w-4" /> Safe public profile</span>
            <p className="mt-4 break-all font-mono text-[10px] text-text-muted">{petUrl}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-white p-5 shadow-soft">
        <h2 className="text-base font-bold">Public profile settings</h2><p className="mt-1 text-xs text-text-muted">Choose how a finder can safely reach you.</p>
        <div className="mt-5 space-y-3">{[["PETRADAR","Contact through PetRadar"],["PRIVATE","Hide contact completely"],["DIRECT_LOST","Show direct contact only when lost"]].map(([value,label]) => <label key={value} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 ${contactMode === value ? "border-primary bg-mint" : "border-border"}`}><input type="radio" name="contact" checked={contactMode === value} onChange={() => setContactMode(value)} className="mt-1 accent-primary" /><span><span className="block text-sm font-bold">{label}</span><span className="text-xs text-text-muted">Private details remain owner-controlled.</span></span></label>)}</div>
        <div className="mt-5 rounded-2xl bg-background p-3 text-xs text-text-muted"><Lock className="mr-2 inline h-4 w-4 text-primary" /> Exact location is never shown on the QR profile.</div>
      </section>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <button
          onClick={copyLink}
          className="flex items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm font-bold text-text-muted hover:bg-background transition"
        >
          <Copy className="h-4 w-4" /> Copy link
        </button>
        <button
          onClick={downloadQr}
          className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-bold text-white hover:bg-primary-dark transition"
        >
          <Download className="h-4 w-4" /> Download
        </button>
        <button onClick={() => window.print()} className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-white py-3 text-sm font-bold text-primary"><Printer className="h-4 w-4" /> Print tag card</button>
      </div>

      {/* Vaccination public summary — only PUBLIC_SUMMARY records */}
      {publicVax.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-border bg-white">
          <div className="flex items-center gap-2.5 border-b border-border bg-background px-4 py-3">
            <Syringe className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-text-strong">Vaccination Summary</h3>
            <span className="ml-auto flex items-center gap-1 text-[11px] text-text-muted">
              <Lock className="h-3 w-3" /> Public summary only
            </span>
          </div>
          <div className="divide-y divide-border">
            {publicVax.map((v) => {
              const { label, cls } = vaxStatusLabel(v.nextDueDate);
              return (
                <div key={v.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
                    <p className="truncate text-sm font-bold text-text-strong">{v.vaccineName}</p>
                  </div>
                  <span className={`shrink-0 text-xs ${cls}`}>{label}</span>
                </div>
              );
            })}
          </div>
          <p className="border-t border-border px-4 py-2.5 text-[11px] text-text-muted">
            Medical notes, batch numbers, and clinic details are not shown on public profiles.
          </p>
        </div>
      )}

      {publicVax.length === 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3 text-xs text-text-muted">
          <Lock className="h-4 w-4 shrink-0 text-primary" />
          Vaccination records are private. The owner has not shared any vaccination information on this public profile.
        </div>
      )}

      <div className="rounded-2xl border border-border bg-background p-4 text-center text-xs leading-5 text-text-muted">
        Print this card for a carrier or pet folder. Anyone who scans it sees only the details you choose to share.
      </div>
    </div>
  );
}
