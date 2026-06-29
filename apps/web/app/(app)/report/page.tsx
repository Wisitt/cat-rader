"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Check, MapPin, Camera, AlertTriangle, PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Species, SightingStatus, Urgency } from "@/types";
import { useAuthStore } from "@/store/auth-store";
import { loginHref } from "@/lib/access-control";

const STEPS = [
  { label: "Animal", icon: PawPrint },
  { label: "Location", icon: MapPin },
  { label: "Photos", icon: Camera },
  { label: "Urgency", icon: AlertTriangle },
  { label: "Review", icon: Check },
];

interface FormData {
  species: Species | "";
  color: string;
  pattern: string;
  description: string;
  status: SightingStatus | "";
  urgency: Urgency | "";
}

const initial: FormData = {
  species: "",
  color: "",
  pattern: "",
  description: "",
  status: "",
  urgency: "",
};

export default function ReportPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initial);
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [radius, setRadius] = useState("250");
  const [error, setError] = useState("");
  const [locationSelected, setLocationSelected] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const patch = (data: Partial<FormData>) => setForm((f) => ({ ...f, ...data }));
  const total = STEPS.length;

  function validateStep(currentStep = step) {
    if (currentStep === 1 && (!form.species || !form.color.trim() || !form.description.trim())) {
      return "Choose a species and add color plus description.";
    }
    if (currentStep === 4 && (!form.urgency || !form.status)) {
      return "Choose urgency and status.";
    }
    return "";
  }

  function next() {
    const message = validateStep();
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
    const accepted = Array.from(files).filter((file) => file.type.startsWith("image/") && file.size <= 10 * 1024 * 1024).slice(0, 6 - photos.length);
    if (accepted.length === 0) {
      window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text: "Use image files under 10MB.", tone: "error" } }));
      return;
    }
    setPhotos((current) => [...current, ...accepted.map((file) => URL.createObjectURL(file))]);
  }

  function submit() {
    const message = validateStep(1) || validateStep(4);
    if (message) {
      setError(message);
      window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text: message, tone: "error" } }));
      return;
    }
    const id = `${form.species || "RPT"}-${Date.now().toString().slice(-5)}`;
    const existing = JSON.parse(window.localStorage.getItem("petradar:sightings") ?? "[]");
    existing.unshift({ id, ...form, publicRadiusMeters: Number(radius), photoUrls: photos, createdAt: new Date().toISOString() });
    window.localStorage.setItem("petradar:sightings", JSON.stringify(existing));
    setSubmittedId(id);
    setSubmitted(true);
    window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text: "Report submitted and added to mock verification queue." } }));
  }

  if (submitted) {
    return (
      <div className="grid min-h-full place-items-center p-4">
        <div className="panel max-w-md p-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <Check className="h-10 w-10 text-green-700" />
        </div>
        <h2 className="mt-5 text-2xl font-bold text-text-strong">Report submitted.</h2>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-text-muted">
          Nearby volunteers and admins can now review it. Exact location remains protected.
        </p>
        <p className="mx-auto mt-3 w-fit rounded-xl bg-background px-4 py-2 font-mono text-sm font-bold text-text-strong">
          Temporary report ID: {submittedId}
        </p>
        {!isAuthenticated ? (
          <div className="mt-4 rounded-2xl border border-teal-200 bg-mint p-4 text-left">
            <p className="text-sm font-bold text-primary">Want status updates?</p>
            <p className="mt-1 text-xs leading-5 text-text-muted">Log in to track this report and receive verification updates.</p>
            <Link href={loginHref("/my-petradar", "Log in to track your guest report and receive status updates.")} className="mt-3 inline-flex text-sm font-bold text-primary underline">
              Log in to track report
            </Link>
          </div>
        ) : null}
        <button
          onClick={() => { setStep(1); setForm(initial); setPhotos([]); setLocationSelected(false); setSubmitted(false); }}
          className="mt-6 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-soft transition-colors hover:bg-primary-dark"
        >
          Report another
        </button>
        <Link href={`/sightings/${submittedId}`} className="ml-2 mt-6 inline-flex rounded-xl border border-border bg-white px-6 py-2.5 text-sm font-bold text-text-strong">
          View My Report
        </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell max-w-4xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-strong">Report Animal</h1>
          <p className="mt-1 text-sm text-text-muted">Map-first, privacy-protected reporting for community response.</p>
        </div>
        <span className="rounded-full border border-border bg-white px-3 py-1 text-xs font-bold text-text-muted">Step {step} of {total}</span>
      </div>

      {/* Step progress */}
      <div className="panel p-4">
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => {
          const n = i + 1;
          const done = step > n;
          const active = step === n;
          return (
            <div key={s.label} className="flex items-center flex-1">
              <button
                onClick={() => n < step && setStep(n)}
                disabled={n > step}
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  done ? "bg-primary text-white" : active ? "bg-primary text-white ring-4 ring-primary/15" : "bg-background border border-border text-text-muted"
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : n}
              </button>
              {i < STEPS.length - 1 && (
                <div className={cn("flex-1 h-0.5 mx-1 rounded", done ? "bg-primary" : "bg-border")} />
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs font-semibold text-text-muted">{STEPS[step - 1].label}</p>
      </div>

      {/* Step content */}
      <div className="panel space-y-5 p-5 sm:p-6">
        {step === 1 && (
          <>
            <h2 className="font-semibold text-text-strong">What animal did you see?</h2>
            <div>
              <label className="text-xs font-medium text-text-muted uppercase tracking-wide">Species</label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(["CAT", "DOG", "OTHER"] as Species[]).map((sp) => (
                  <button
                    key={sp}
                    onClick={() => patch({ species: sp })}
                    className={cn(
                      "rounded-2xl border p-4 text-sm font-bold transition-colors",
                      form.species === sp ? "border-primary bg-mint text-primary shadow-inner-sm" : "border-border text-text-muted hover:bg-background"
                    )}
                  >
                    <PawPrint className="mx-auto mb-2 h-6 w-6" />
                    {sp.charAt(0) + sp.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-text-muted uppercase tracking-wide">Color / Markings</label>
                <input
                  value={form.color}
                  onChange={(e) => patch({ color: e.target.value })}
                  placeholder="e.g. Orange tabby, white chest"
                  className="field mt-1.5"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-muted uppercase tracking-wide">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => patch({ description: e.target.value })}
                  placeholder="Describe the animal's condition, behavior, and location details..."
                  rows={3}
                  className="field mt-1.5 h-auto resize-none py-3"
                />
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="font-semibold text-text-strong">Where did you see it?</h2>
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-background py-14">
              <MapPin className="h-8 w-8 text-text-muted" />
              <p className="text-sm font-medium text-text-strong">Pick location on map</p>
              <p className="text-xs text-text-muted">Tap to set the approximate location</p>
              <button
                type="button"
                onClick={() => {
                  setLocationSelected(true);
                  window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text: "Approximate location selected. Exact coordinates remain protected." } }));
                }}
                className="mt-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-soft transition-colors hover:bg-primary-dark"
              >
                {locationSelected ? "Approximate location selected" : "Use my current location"}
              </button>
            </div>
            <p className="rounded-2xl border border-teal-200 bg-mint p-3 text-xs font-medium text-primary">
              Exact location is protected. Public viewers only see an approximate area.
            </p>
            <label className="block space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-text-muted">Approximate public radius</span>
              <select value={radius} onChange={(event) => setRadius(event.target.value)} className="field">
                <option value="100">100 meters</option>
                <option value="250">250 meters</option>
                <option value="500">500 meters</option>
              </select>
            </label>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="font-semibold text-text-strong">Add photos (optional)</h2>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-background py-14">
              <Camera className="h-8 w-8 text-text-muted" />
              <p className="text-sm font-medium text-text-strong">Upload photos</p>
              <p className="text-xs text-text-muted">Photos help with matching and verification</p>
              <span className="mt-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-soft transition-colors hover:bg-primary-dark">
                Choose photos
              </span>
              <input type="file" accept="image/*" multiple className="sr-only" onChange={(event) => onFiles(event.target.files)} />
            </label>
            {photos.length ? (
              <div className="grid grid-cols-3 gap-3">
                {photos.map((photo) => (
                  <div key={photo} className="relative">
                    <img src={photo} alt="" className="aspect-square rounded-2xl object-cover" />
                    <button onClick={() => setPhotos((current) => current.filter((item) => item !== photo))} className="absolute right-1 top-1 rounded-full bg-white px-2 py-1 text-xs font-bold">Remove</button>
                  </div>
                ))}
              </div>
            ) : null}
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="font-semibold text-text-strong">Urgency & Status</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-text-muted uppercase tracking-wide">Urgency Level</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {([
                    { value: "LOW", label: "Low", desc: "Appears healthy" },
                    { value: "MEDIUM", label: "Medium", desc: "Needs attention" },
                    { value: "HIGH", label: "High", desc: "Possibly injured" },
                    { value: "EMERGENCY", label: "Emergency", desc: "Immediate rescue" },
                  ] as { value: Urgency; label: string; desc: string }[]).map(({ value, label, desc }) => (
                    <button
                      key={value}
                      onClick={() => patch({ urgency: value })}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition-colors",
                        form.urgency === value ? "border-primary bg-mint shadow-inner-sm" : "border-border hover:bg-background"
                      )}
                    >
                      <p className="text-sm font-medium text-text-strong">{label}</p>
                      <p className="text-xs text-text-muted">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-text-muted uppercase tracking-wide">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => patch({ status: e.target.value as SightingStatus })}
                  className="field mt-1.5"
                >
                  <option value="">Select status…</option>
                  <option value="STRAY">Stray</option>
                  <option value="INJURED">Injured</option>
                  <option value="POSSIBLE_LOST">Possible Lost Pet</option>
                  <option value="RESCUE_NEEDED">Rescue Needed</option>
                </select>
              </div>
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <h2 className="font-semibold text-text-strong">Review & Submit</h2>
            <div className="space-y-2.5">
              {[
                { label: "Species", value: form.species || "—" },
                { label: "Color", value: form.color || "—" },
                { label: "Description", value: form.description || "—" },
                { label: "Status", value: form.status ? form.status.replace(/_/g, " ") : "—" },
                { label: "Urgency", value: form.urgency || "—" },
                { label: "Location", value: `Approximate — Bangkok (${radius}m radius)` },
                { label: "Photos", value: `${photos.length} selected` },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-3 text-sm border-b border-border pb-2 last:border-0">
                  <span className="font-medium text-text-muted w-24 shrink-0">{label}</span>
                  <span className="text-text-strong">{value}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {error ? <p className="flex-1 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}
        {step > 1 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-bold text-text-strong shadow-inner-sm transition-colors hover:bg-background"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
        )}
        {step < total ? (
          <button
            onClick={next}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-soft transition-colors hover:bg-primary-dark"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={submit}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-soft transition-colors hover:bg-primary-dark"
          >
            <Check className="h-4 w-4" />
            Submit Report
          </button>
        )}
      </div>
    </div>
  );
}
