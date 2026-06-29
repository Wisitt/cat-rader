"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Plus, Search } from "lucide-react";
import { AnimalIcon } from "@/components/icons/pets";
import { PassportBookIcon, QrTagIcon, VaccineCareIcon } from "@/components/icons/pet-passport";
import { mockPets } from "@/lib/mock-data";
import type { PetPassport } from "@/types";
import { useAuthStore } from "@/store/auth-store";

const STORAGE_KEY = "petradar:pets";

function loadPets(): PetPassport[] {
  if (typeof window === "undefined") return mockPets;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : mockPets;
  } catch {
    return mockPets;
  }
}

function PetCard({ pet }: { pet: PetPassport }) {
  const isLost = pet.status === "LOST";
  const isArchived = pet.status === "ARCHIVED";
  return (
    <article className="group overflow-hidden rounded-3xl border border-[#e5e1d9] bg-[#fffefa] shadow-soft transition hover:-translate-y-1 hover:shadow-card">
      <Link href={`/pets/${pet.id}`} className="relative block aspect-[4/3] overflow-hidden bg-mint">
        {pet.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pet.photoUrl} alt={pet.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
        ) : (
          <div className="grid h-full place-items-center text-primary"><AnimalIcon species={pet.species} className="h-20 w-20" /></div>
        )}
        <span className={`absolute left-3 top-3 rounded-full border px-3 py-1 text-[10px] font-black uppercase shadow-soft ${isLost ? "border-red-200 bg-red-50 text-red-700" : isArchived ? "border-gray-200 bg-white text-gray-600" : "border-emerald-200 bg-white text-emerald-700"}`}>
          {isLost ? "Lost" : isArchived ? "Archived" : "Active"}
        </span>
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-primary shadow-soft">
          <PassportBookIcon className="h-3.5 w-3.5" /> Passport
        </span>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-mint text-primary"><AnimalIcon species={pet.species} className="h-4 w-4" /></span>
              <h2 className="text-lg font-bold text-text-strong">{pet.name}</h2>
            </div>
            <p className="mt-1 text-xs text-text-muted">{pet.breed ?? pet.species} · {pet.color}</p>
          </div>
          <span className="rounded-lg bg-[#f7f2e9] px-2 py-1 font-mono text-[10px] font-bold text-text-muted">{pet.id}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700"><VaccineCareIcon className="h-3.5 w-3.5" /> Health ready</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-bold text-primary"><QrTagIcon className="h-3.5 w-3.5" /> QR enabled</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link href={`/pets/${pet.id}`} className="flex h-9 items-center justify-center rounded-xl bg-primary text-xs font-bold text-white">View Passport</Link>
          <Link href={`/pets/${pet.id}/qr`} className="flex h-9 items-center justify-center rounded-xl border border-border bg-white text-xs font-bold text-primary">QR Profile</Link>
          <Link href={`/pets/${pet.id}/vaccinations`} className="flex h-9 items-center justify-center rounded-xl border border-border bg-white text-xs font-bold text-text-muted">Health Book</Link>
          <Link href={isLost ? `/lost-pets/${pet.lostPetId ?? ""}` : `/pets/${pet.id}/lost`} className={`flex h-9 items-center justify-center rounded-xl border text-xs font-bold ${isLost ? "border-red-200 bg-red-50 text-red-700" : "border-border bg-white text-text-muted"}`}>
            {isLost ? "View Lost Post" : "Report Lost"}
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function PetsPage() {
  const userId = useAuthStore((state) => state.user?.id);
  const [pets, setPets] = useState<PetPassport[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const normalized = loadPets().map((pet) => pet.id === "PET-002" && pet.photoUrl.includes("1605459568858")
      ? { ...pet, photoUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&q=85" }
      : pet);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    setPets(normalized.filter((pet) => pet.ownerId === userId));
  }, [userId]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return pets.filter((pet) => !term || [pet.name, pet.species, pet.breed, pet.color].filter(Boolean).join(" ").toLowerCase().includes(term));
  }, [pets, query]);

  return (
    <div className="page-shell max-w-7xl space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl border border-[#e8e2d8] bg-[#fffefa] p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f7eee2] text-primary"><PassportBookIcon className="h-7 w-7" /></span>
          <div><h1 className="text-3xl font-bold tracking-tight text-text-strong">My Pets</h1><p className="mt-1 text-sm text-text-muted">Keep each pet&apos;s identity, health, and safety details in one place.</p></div>
        </div>
        <Link href="/pets/new" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-bold text-white shadow-soft"><Plus className="h-4 w-4" /> Create Pet Passport</Link>
      </section>

      <label className="relative block">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} className="field h-12 rounded-2xl bg-white pl-11" placeholder="Search your pet family..." />
      </label>

      {filtered.length ? (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((pet) => <PetCard key={pet.id} pet={pet} />)}</section>
      ) : (
        <section className="grid min-h-80 place-items-center rounded-3xl border border-dashed border-[#d9d1c4] bg-[#fffefa] p-8 text-center">
          <div>
            <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-[#f7eee2] text-primary">
              <PassportBookIcon className="h-12 w-12" />
              <span className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-mint"><CheckCircle2 className="h-4 w-4" /></span>
            </div>
            <h2 className="mt-6 text-xl font-bold text-text-strong">{query ? "No pets match that search" : "No pets added yet"}</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-text-muted">{query ? "Try searching by name, breed, or color." : "Create a safe digital profile for your favorite companion."}</p>
            {!query ? <Link href="/pets/new" className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white"><Plus className="h-4 w-4" /> Create your first Pet Passport</Link> : null}
          </div>
        </section>
      )}
    </div>
  );
}
