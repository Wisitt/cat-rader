"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Camera, Check, Star, X } from "lucide-react";
import { AnimalIcon } from "@/components/icons/pets";
import { HeartShieldIcon, PassportBookIcon, SafeLocationIcon } from "@/components/icons/pet-passport";
import { mockPets } from "@/lib/mock-data";
import type { PetPassport } from "@/types";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "petradar:pets";
const steps = ["Meet your pet", "What do they look like?", "Add their best photos", "Safety & contact", "Review passport"];

function loadPets(): PetPassport[] {
  try { const stored = localStorage.getItem(STORAGE_KEY); return stored ? JSON.parse(stored) : mockPets; } catch { return mockPets; }
}

export default function NewPetPage() {
  const router = useRouter();
  const ownerId = useAuthStore((state) => state.user?.id) ?? "";
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [cover, setCover] = useState("");
  const [form, setForm] = useState({
    name: "", species: "CAT" as PetPassport["species"], breed: "", sex: "UNKNOWN" as PetPassport["sex"],
    size: "MEDIUM" as PetPassport["size"], color: "", pattern: "", birthDate: "", microchipId: "",
    description: "", hasCollar: false, collarDescription: "", contactPreference: "PETRADAR",
  });

  function patch<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function validate() {
    if (step === 0 && !form.name.trim()) return "Tell us your pet's name.";
    if (step === 1 && !form.color.trim()) return "Add a primary color so others can recognize your pet.";
    return "";
  }

  function next() {
    const message = validate();
    if (message) { setError(message); return; }
    setError("");
    setStep((current) => Math.min(4, current + 1));
  }

  function addPhotos(files: FileList | null) {
    if (!files) return;
    const urls = Array.from(files).filter((file) => file.type.startsWith("image/")).slice(0, 6 - photos.length).map(URL.createObjectURL);
    setPhotos((current) => [...current, ...urls]);
    if (!cover && urls[0]) setCover(urls[0]);
  }

  function removePhoto(url: string) {
    const remaining = photos.filter((photo) => photo !== url);
    setPhotos(remaining);
    if (cover === url) setCover(remaining[0] ?? "");
  }

  function createPassport() {
    if (!form.name.trim() || !form.color.trim()) { setStep(!form.name.trim() ? 0 : 1); setError("Complete the required details first."); return; }
    const now = new Date().toISOString();
    const pet: PetPassport = {
      id: `PET-${String(Date.now()).slice(-6)}`, ownerId, name: form.name.trim(), species: form.species,
      breed: form.breed.trim() || undefined, sex: form.sex, size: form.size, color: form.color.trim(),
      pattern: form.pattern.trim() || undefined, birthDate: form.birthDate || undefined,
      microchipId: form.microchipId.trim() || undefined, description: form.description.trim() || undefined,
      hasCollar: form.hasCollar, collarDescription: form.hasCollar ? form.collarDescription.trim() || undefined : undefined,
      photoUrl: cover, status: "ACTIVE", createdAt: now, updatedAt: now,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([pet, ...loadPets()]));
    window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text: `${pet.name}'s Pet Passport is ready.` } }));
    router.push(`/pets/${pet.id}`);
  }

  const field = (label: string, key: keyof typeof form, placeholder = "") => (
    <label className="space-y-2"><span className="text-xs font-bold text-text-muted">{label}</span><input value={String(form[key])} onChange={(e) => patch(key, e.target.value as never)} placeholder={placeholder} className="field h-11" /></label>
  );

  return (
    <div className="page-shell max-w-4xl">
      <div className="overflow-hidden rounded-3xl border border-[#e7dfd3] bg-[#fffefa] shadow-card">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <Link href="/pets" className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white"><ArrowLeft className="h-4 w-4" /></Link>
          <div className="text-center"><p className="text-sm font-bold text-text-strong">Create Pet Passport</p><p className="text-[10px] text-text-muted">Step {step + 1} of 5</p></div>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f7eee2] text-primary"><PassportBookIcon className="h-5 w-5" /></span>
        </header>

        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">{steps.map((label, index) => <div key={label} className="flex min-w-0 flex-1 items-center gap-2"><span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold", index <= step ? "bg-primary text-white" : "border border-border bg-white text-text-muted")}>{index < step ? <Check className="h-3.5 w-3.5" /> : index + 1}</span>{index < 4 ? <span className={cn("h-0.5 flex-1", index < step ? "bg-primary" : "bg-border")} /> : null}</div>)}</div>
          <p className="mt-3 text-center text-xs font-bold text-primary">{steps[step]}</p>
        </div>

        <main className="min-h-[430px] p-5 sm:p-8">
          {step === 0 && <section><h1 className="text-2xl font-bold text-text-strong">Who is your favorite companion?</h1><p className="mt-2 text-sm text-text-muted">Let&apos;s start with the details that make them family.</p><div className="mt-7 grid grid-cols-3 gap-3">{(["DOG", "CAT", "OTHER"] as const).map((species) => <button key={species} onClick={() => patch("species", species)} className={cn("rounded-2xl border p-5 text-center transition", form.species === species ? "border-primary bg-mint shadow-soft" : "border-border bg-white hover:bg-background")}><AnimalIcon species={species} className="mx-auto h-12 w-12 text-primary" /><span className="mt-3 block text-sm font-bold capitalize">{species.toLowerCase()}</span></button>)}</div><div className="mt-6 grid gap-4 sm:grid-cols-2">{field("Pet name *", "name", "Milo")}{field("Breed or type", "breed", "Domestic Shorthair")}<label className="space-y-2"><span className="text-xs font-bold text-text-muted">Sex</span><select value={form.sex} onChange={(e) => patch("sex", e.target.value as PetPassport["sex"])} className="field"><option value="UNKNOWN">Not specified</option><option value="FEMALE">Female</option><option value="MALE">Male</option></select></label><label className="space-y-2"><span className="text-xs font-bold text-text-muted">Birthday</span><input type="date" value={form.birthDate} onChange={(e) => patch("birthDate", e.target.value)} className="field" /></label></div></section>}

          {step === 1 && <section><h1 className="text-2xl font-bold text-text-strong">What makes {form.name || "your pet"} special?</h1><p className="mt-2 text-sm text-text-muted">Add details that help others recognize your pet.</p><div className="mt-7 grid gap-4 sm:grid-cols-2">{field("Primary color *", "color", "Orange")}{field("Pattern", "pattern", "Tabby")}{field("Microchip ID", "microchipId", "Optional")}<label className="space-y-2"><span className="text-xs font-bold text-text-muted">Size</span><select value={form.size} onChange={(e) => patch("size", e.target.value as PetPassport["size"])} className="field"><option value="SMALL">Small</option><option value="MEDIUM">Medium</option><option value="LARGE">Large</option></select></label></div><label className="mt-4 block space-y-2"><span className="text-xs font-bold text-text-muted">Distinctive marks & personality</span><textarea value={form.description} onChange={(e) => patch("description", e.target.value)} rows={4} className="field h-auto py-3" placeholder="Small notch on left ear, friendly but shy..." /></label></section>}

          {step === 2 && <section><h1 className="text-2xl font-bold text-text-strong">Add their best photos</h1><p className="mt-2 text-sm text-text-muted">Clear photos help matching work better if your pet ever gets lost.</p><label className="mt-7 flex cursor-pointer flex-col items-center rounded-3xl border border-dashed border-primary/30 bg-mint/30 p-8 text-center"><Camera className="h-8 w-8 text-primary" /><span className="mt-3 text-sm font-bold">Choose up to 6 photos</span><span className="mt-1 text-xs text-text-muted">JPG, PNG, or WEBP</span><input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => addPhotos(e.target.files)} /></label><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{photos.map((photo) => <div key={photo} className={cn("relative overflow-hidden rounded-2xl border-2", cover === photo ? "border-primary" : "border-transparent")}><img src={photo} alt="" className="aspect-square w-full object-cover" /><button onClick={() => removePhoto(photo)} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-soft"><X className="h-3.5 w-3.5" /></button><button onClick={() => setCover(photo)} className="absolute bottom-2 left-2 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-primary shadow-soft"><Star className="mr-1 inline h-3 w-3" />{cover === photo ? "Cover" : "Set cover"}</button></div>)}</div></section>}

          {step === 3 && <section><h1 className="text-2xl font-bold text-text-strong">Safety & contact</h1><p className="mt-2 text-sm text-text-muted">Your exact home location is never shown publicly.</p><div className="mt-7 grid gap-4 sm:grid-cols-2"><button onClick={() => patch("hasCollar", !form.hasCollar)} className={cn("rounded-2xl border p-5 text-left", form.hasCollar ? "border-primary bg-mint" : "border-border bg-white")}><HeartShieldIcon className="h-7 w-7 text-primary" /><p className="mt-3 text-sm font-bold">Wears a collar</p><p className="mt-1 text-xs text-text-muted">Add collar details for recognition.</p></button><div className="rounded-2xl border border-border bg-[#f8f3ea] p-5"><SafeLocationIcon className="h-7 w-7 text-primary" /><p className="mt-3 text-sm font-bold">Location protected</p><p className="mt-1 text-xs leading-5 text-text-muted">Only an approximate area appears if reported lost.</p></div></div>{form.hasCollar ? <div className="mt-4">{field("Collar description", "collarDescription", "Red collar with silver bell")}</div> : null}<label className="mt-4 block space-y-2"><span className="text-xs font-bold text-text-muted">Contact preference</span><select value={form.contactPreference} onChange={(e) => patch("contactPreference", e.target.value)} className="field"><option value="PETRADAR">Contact through PetRadar</option><option value="PRIVATE">Keep contact private</option></select></label></section>}

          {step === 4 && <section><h1 className="text-2xl font-bold text-text-strong">Your passport is ready to review</h1><p className="mt-2 text-sm text-text-muted">Keep your pet&apos;s important details ready when it matters.</p><div className="mt-7 grid gap-5 rounded-3xl border border-[#e6ddcf] bg-[#fdf8ef] p-5 sm:grid-cols-[180px_1fr]">{cover ? <img src={cover} alt={form.name} className="aspect-square w-full rounded-2xl object-cover" /> : <div className="grid aspect-square place-items-center rounded-2xl bg-mint text-primary"><AnimalIcon species={form.species} className="h-20 w-20" /></div>}<div><span className="inline-flex rounded-full bg-mint px-3 py-1 text-[10px] font-bold text-primary">Safe digital profile</span><h2 className="mt-3 text-3xl font-bold">{form.name || "Unnamed pet"}</h2><p className="mt-1 text-sm text-text-muted">{form.species} · {form.breed || "Breed not added"} · {form.color || "Color not added"}</p><div className="mt-5 grid grid-cols-2 gap-3 text-xs"><div className="rounded-xl bg-white p-3"><p className="text-text-muted">Size</p><p className="mt-1 font-bold">{form.size}</p></div><div className="rounded-xl bg-white p-3"><p className="text-text-muted">Contact</p><p className="mt-1 font-bold">Protected</p></div></div></div></div></section>}

          {error ? <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}
        </main>

        <footer className="flex gap-3 border-t border-border p-5">
          {step > 0 ? <button onClick={() => { setError(""); setStep((current) => current - 1); }} className="h-11 rounded-xl border border-border bg-white px-5 text-sm font-bold text-text-muted">Back</button> : <Link href="/pets" className="flex h-11 items-center px-4 text-sm font-bold text-text-muted">Cancel</Link>}
          <button onClick={step === 4 ? createPassport : next} className="ml-auto flex h-11 min-w-40 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white">{step === 4 ? <><PassportBookIcon className="h-4 w-4" /> Create Passport</> : <>Continue <ArrowRight className="h-4 w-4" /></>}</button>
        </footer>
      </div>
    </div>
  );
}
