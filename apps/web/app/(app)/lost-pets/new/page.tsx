"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Camera, Check, MapPin, PawPrint, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const steps = ["Identity", "Appearance", "Last Seen & Contact"];

export default function NewLostPetPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState("");
  const [form, setForm] = useState({
    petName: "",
    species: "",
    breed: "",
    sex: "",
    age: "",
    size: "",
    color: "",
    pattern: "",
    collar: "",
    microchip: "",
    marks: "",
    contact: "",
    email: "",
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [hideContact, setHideContact] = useState(true);
  const [error, setError] = useState("");

  const patch = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  function validate(currentStep = step) {
    if (currentStep === 1 && (!form.petName.trim() || !form.species.trim())) return "Pet name and species are required.";
    if (currentStep === 2 && !form.color.trim()) return "Primary color is required.";
    if (currentStep === 3 && !form.email.includes("@")) return "A valid contact email is required.";
    return "";
  }

  function next() {
    const message = validate();
    if (message) {
      setError(message);
      window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text: message, tone: "error" } }));
      return;
    }
    setError("");
    setStep((s) => s + 1);
  }

  function onFiles(files: FileList | null) {
    if (!files) return;
    const accepted = Array.from(files).filter((file) => file.type.startsWith("image/") && file.size <= 10 * 1024 * 1024).slice(0, 8 - photos.length);
    if (!accepted.length) {
      window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text: "Use image files under 10MB.", tone: "error" } }));
      return;
    }
    setPhotos((current) => [...current, ...accepted.map((file) => URL.createObjectURL(file))]);
  }

  function saveDraft() {
    window.localStorage.setItem("petradar:lost-pet-draft", JSON.stringify({ form, photos, hideContact }));
    window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text: "Lost pet draft saved." } }));
  }

  function submit() {
    const message = validate(1) || validate(2) || validate(3);
    if (message) {
      setError(message);
      window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text: message, tone: "error" } }));
      return;
    }
    const id = `LP-${Date.now().toString().slice(-5)}`;
    const existing = JSON.parse(window.localStorage.getItem("petradar:lost-pets") ?? "[]");
    existing.unshift({ id, ...form, photos, hideContact, status: "ACTIVE", createdAt: new Date().toISOString() });
    window.localStorage.setItem("petradar:lost-pets", JSON.stringify(existing));
    setSubmittedId(id);
    setSubmitted(true);
    window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text: "Lost pet listing submitted and matching started." } }));
  }

  if (submitted) {
    return (
      <div className="grid min-h-full place-items-center p-4">
        <div className="panel max-w-md p-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <Check className="h-10 w-10 text-green-700" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-text-strong">Lost pet post submitted.</h1>
          <p className="mt-2 text-sm leading-6 text-text-muted">PetRadar will compare the post with nearby sightings and show possible matches.</p>
          <Link href={`/lost-pets/${submittedId}`} className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-soft">
            View My Report
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <Link href="/lost-pets" className="inline-flex items-center gap-2 text-sm font-bold text-text-muted hover:text-text-strong">
          <ArrowLeft className="h-4 w-4" /> Lost Pets
        </Link>
        <Button variant="outline" onClick={saveDraft}><Save className="h-4 w-4" /> Save Draft</Button>
      </div>

      <section className="panel p-5 sm:p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-text-strong">Post Lost Pet</h1>
        </div>

        <div className="mx-auto mt-6 flex max-w-2xl items-center gap-2">
          {steps.map((label, index) => {
            const n = index + 1;
            const active = step === n;
            const done = step > n;
            return (
              <div key={label} className="flex flex-1 items-center">
                <button
                  onClick={() => n < step && setStep(n)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold",
                    done || active ? "border-primary bg-primary text-white" : "border-border bg-background text-text-muted"
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : n}
                </button>
                <span className="ml-2 hidden text-xs font-bold text-text-muted sm:block">{label}</span>
                {index < steps.length - 1 ? <div className={cn("mx-3 h-0.5 flex-1 rounded", done ? "bg-primary" : "bg-border")} /> : null}
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          {step === 1 ? (
            <div className="grid gap-5 md:grid-cols-2">
              {[
                ["Pet Name", "petName"],
                ["Species", "species"],
                ["Breed / Type", "breed"],
                ["Sex", "sex"],
                ["Age", "age"],
                ["Size", "size"],
              ].map(([label, key]) => (
                <label key={label} className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-text-muted">{label}</span>
                  <Input value={form[key as keyof typeof form]} onChange={(event) => patch(key as keyof typeof form, event.target.value)} placeholder={label === "Pet Name" ? "Milo" : label} required={key === "petName" || key === "species"} />
                </label>
              ))}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="grid gap-5 sm:grid-cols-2">
                {[
                  ["Primary Color", "color"],
                  ["Pattern", "pattern"],
                  ["Collar Description", "collar"],
                  ["Microchip", "microchip"],
                  ["Distinctive Marks", "marks"],
                ].map(([label, key]) => (
                  <label key={label} className={cn("space-y-2", label === "Distinctive Marks" && "sm:col-span-2")}>
                    <span className="text-xs font-bold uppercase tracking-wide text-text-muted">{label}</span>
                    <Input value={form[key as keyof typeof form]} onChange={(event) => patch(key as keyof typeof form, event.target.value)} placeholder={label} required={key === "color"} />
                  </label>
                ))}
              </div>
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">Photos</p>
                <label className="grid min-h-64 cursor-pointer place-items-center rounded-2xl border border-dashed border-border bg-background p-6 text-center">
                  <div>
                    <Camera className="mx-auto h-9 w-9 text-primary" />
                    <p className="mt-3 text-sm font-bold text-text-strong">Add photos</p>
                    <p className="mt-1 text-xs text-text-muted">JPG, PNG up to 10MB</p>
                  </div>
                  <input type="file" accept="image/*" multiple className="sr-only" onChange={(event) => onFiles(event.target.files)} />
                </label>
                {photos.length ? (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {photos.map((photo) => (
                      <div key={photo} className="relative">
                        <img src={photo} alt="" className="aspect-square rounded-xl object-cover" />
                        <button onClick={() => setPhotos((current) => current.filter((item) => item !== photo))} className="absolute right-1 top-1 rounded-full bg-white px-2 py-1 text-xs font-bold">Remove</button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="grid min-h-96 place-items-center rounded-2xl border border-border bg-background text-center">
                <div>
                  <MapPin className="mx-auto h-10 w-10 text-primary" />
                  <p className="mt-3 text-sm font-bold text-text-strong">Last seen location</p>
                  <p className="mt-1 text-xs text-text-muted">Drag the map pin to the closest approximate location.</p>
                </div>
              </div>
              <div className="space-y-5">
                {[
                  ["Last Seen Date & Time", "contact"],
                  ["Contact Preference", "contact"],
                  ["Email Address", "email"],
                ].map(([label, key]) => (
                  <label key={label} className="block space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-text-muted">{label}</span>
                    <Input value={form[key as keyof typeof form]} onChange={(event) => patch(key as keyof typeof form, event.target.value)} placeholder={label} required={key === "email"} />
                  </label>
                ))}
                <button onClick={() => setHideContact((value) => !value)} className="flex items-center justify-between rounded-2xl border border-border bg-background p-4 text-left text-sm font-semibold text-text-strong">
                  Hide my contact information publicly
                  <span className={cn("relative h-6 w-11 rounded-full", hideContact ? "bg-primary" : "bg-gray-300")}><span className={cn("absolute top-1 h-4 w-4 rounded-full bg-white", hideContact ? "right-1" : "left-1")} /></span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <div className="flex gap-3">
        {error ? <p className="flex-1 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}
        {step > 1 ? (
          <Button variant="outline" onClick={() => setStep((s) => s - 1)}>Back</Button>
        ) : null}
        {step < steps.length ? (
          <Button className="flex-1" onClick={next}>
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button className="flex-1" onClick={submit}>
            <PawPrint className="h-4 w-4" /> Review & Submit
          </Button>
        )}
      </div>
    </div>
  );
}
