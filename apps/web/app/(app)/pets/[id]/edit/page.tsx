"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Archive, ArrowLeft, Save, Trash2 } from "lucide-react";
import { mockPets } from "@/lib/mock-data";
import type { PetPassport } from "@/types";

const STORAGE_KEY = "petradar:pets";

function loadPets(): PetPassport[] {
  if (typeof window === "undefined") return mockPets;
  try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : mockPets; } catch { return mockPets; }
}
function savePets(pets: PetPassport[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(pets)); } catch {}
}

export default function EditPetPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [pet, setPet] = useState<PetPassport | null>(null);
  const [form, setForm] = useState({ name: "", species: "CAT" as PetPassport["species"], breed: "", sex: "UNKNOWN" as PetPassport["sex"], size: "MEDIUM" as PetPassport["size"], color: "", pattern: "", birthDate: "", microchipId: "", description: "", hasCollar: false, collarDescription: "", photoUrl: "", status: "ACTIVE" as PetPassport["status"] });
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const pets = loadPets();
    const found = pets.find((p) => p.id === id) ?? mockPets[0];
    setPet(found);
    setForm({ name: found.name, species: found.species, breed: found.breed ?? "", sex: found.sex, size: found.size, color: found.color, pattern: found.pattern ?? "", birthDate: found.birthDate ?? "", microchipId: found.microchipId ?? "", description: found.description ?? "", hasCollar: found.hasCollar, collarDescription: found.collarDescription ?? "", photoUrl: found.photoUrl, status: found.status });
  }, [id]);

  function save() {
    if (!pet || !form.name.trim()) { window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text: "Name is required.", type: "error" } })); return; }
    const updated: PetPassport = { ...pet, name: form.name.trim(), species: form.species, breed: form.breed.trim() || undefined, sex: form.sex, size: form.size, color: form.color.trim(), pattern: form.pattern.trim() || undefined, birthDate: form.birthDate || undefined, microchipId: form.microchipId.trim() || undefined, description: form.description.trim() || undefined, hasCollar: form.hasCollar, collarDescription: form.collarDescription.trim() || undefined, photoUrl: form.photoUrl, status: form.status, updatedAt: new Date().toISOString() };
    const pets = loadPets();
    savePets(pets.map((p) => p.id === id ? updated : p));
    window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text: `${updated.name} updated.` } }));
    router.push(`/pets/${id}`);
  }

  function deletePet() {
    const pets = loadPets();
    savePets(pets.filter((p) => p.id !== id));
    window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text: "Pet passport deleted." } }));
    router.push("/pets");
  }

  function archivePet() {
    const pets = loadPets();
    savePets(pets.map((item) => item.id === id ? { ...item, status: "ARCHIVED", updatedAt: new Date().toISOString() } : item));
    window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text: `${pet?.name ?? "Pet"} archived.` } }));
    router.push("/pets");
  }

  if (!pet) return null;

  function fld(label: string, key: keyof typeof form, type = "text", placeholder = "") {
    return (
      <label className="block space-y-1.5">
        <span className="text-xs font-bold text-text-muted">{label}</span>
        <input type={type} placeholder={placeholder} className="field" value={form[key] as string} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
      </label>
    );
  }

  return (
    <div className="page-shell max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/pets/${id}`} className="flex h-9 w-9 items-center justify-center rounded-xl border border-border hover:bg-background">
          <ArrowLeft className="h-4 w-4 text-text-muted" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Edit {pet.name}</h1>
          <p className="text-sm text-text-muted">Update pet passport details</p>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-white p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={form.photoUrl} alt={form.name} className="h-20 w-20 rounded-2xl object-cover" />
          <label className="block flex-1 space-y-1.5">
            <span className="text-xs font-bold text-text-muted">Photo URL</span>
            <input type="url" className="field" value={form.photoUrl} onChange={(e) => setForm((f) => ({ ...f, photoUrl: e.target.value }))} />
          </label>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">{fld("Pet Name *", "name", "text", "e.g. Mochi")}{fld("Color *", "color", "text", "e.g. White")}</div>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block space-y-1.5"><span className="text-xs font-bold text-text-muted">Species</span>
              <select className="field" value={form.species} onChange={(e) => setForm((f) => ({ ...f, species: e.target.value as PetPassport["species"] }))}>
                <option value="CAT">Cat</option><option value="DOG">Dog</option><option value="OTHER">Other</option>
              </select>
            </label>
            <label className="block space-y-1.5"><span className="text-xs font-bold text-text-muted">Sex</span>
              <select className="field" value={form.sex} onChange={(e) => setForm((f) => ({ ...f, sex: e.target.value as PetPassport["sex"] }))}>
                <option value="MALE">Male</option><option value="FEMALE">Female</option><option value="UNKNOWN">Unknown</option>
              </select>
            </label>
            <label className="block space-y-1.5"><span className="text-xs font-bold text-text-muted">Size</span>
              <select className="field" value={form.size} onChange={(e) => setForm((f) => ({ ...f, size: e.target.value as PetPassport["size"] }))}>
                <option value="SMALL">Small</option><option value="MEDIUM">Medium</option><option value="LARGE">Large</option>
              </select>
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">{fld("Breed", "breed", "text", "e.g. Scottish Fold")}{fld("Pattern", "pattern", "text", "e.g. Tabby")}</div>
          <div className="grid gap-4 sm:grid-cols-2">{fld("Date of Birth", "birthDate", "date")}{fld("Microchip ID", "microchipId", "text", "15-digit chip")}</div>

          <label className="block space-y-1.5"><span className="text-xs font-bold text-text-muted">Status</span>
            <select className="field" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as PetPassport["status"] }))}>
              <option value="ACTIVE">Active</option><option value="LOST">Lost</option><option value="FOUND">Found</option><option value="ARCHIVED">Archived</option><option value="DECEASED">Deceased</option>
            </select>
          </label>

          <label className="block space-y-1.5"><span className="text-xs font-bold text-text-muted">Description</span>
            <textarea className="field h-28 py-3" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-background p-3">
            <input type="checkbox" className="h-4 w-4 rounded accent-primary" checked={form.hasCollar} onChange={(e) => setForm((f) => ({ ...f, hasCollar: e.target.checked }))} />
            <span className="text-sm font-bold">Has a collar</span>
          </label>
          {form.hasCollar && fld("Collar description", "collarDescription", "text", "Color, bell, tag...")}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={save} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-bold text-white hover:bg-primary-dark transition">
            <Save className="h-4 w-4" /> Save Changes
          </button>
          <Link href={`/pets/${id}`} className="flex items-center justify-center gap-2 rounded-2xl border border-border px-5 py-3 text-sm font-semibold text-text-muted hover:bg-background">
            Cancel
          </Link>
        </div>

        <div className="mt-5 flex flex-col gap-4 border-t border-border pt-5">
          <button type="button" onClick={archivePet} className="flex items-center gap-2 text-sm font-bold text-amber-700 hover:underline">
            <Archive className="h-4 w-4" /> Archive pet passport
          </button>
          {confirmDelete ? (
            <div className="flex flex-col gap-2 rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-bold text-red-700">Delete {pet.name}&apos;s passport? This cannot be undone.</p>
              <div className="flex gap-2">
                <button onClick={deletePet} className="flex-1 rounded-xl bg-red-600 py-2 text-sm font-bold text-white hover:bg-red-700">Yes, delete</button>
                <button onClick={() => setConfirmDelete(false)} className="flex-1 rounded-xl border border-border py-2 text-sm font-semibold text-text-muted hover:bg-white">Cancel</button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmDelete(true)} className="flex items-center gap-2 text-sm font-bold text-red-600 hover:underline">
              <Trash2 className="h-4 w-4" /> Delete pet passport
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
