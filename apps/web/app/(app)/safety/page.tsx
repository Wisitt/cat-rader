import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  EyeOff,
  FileCheck2,
  HeartHandshake,
  HelpCircle,
  LockKeyhole,
  MapPin,
  MessageCircleWarning,
  PawPrint,
  Search,
  ShieldCheck,
  Siren,
  UserCheck,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const situations = [
  {
    icon: PawPrint,
    title: "I found an animal",
    description: "Share a sighting with a photo and approximate location.",
    href: "/report",
    action: "Start a report",
    tone: "bg-mint text-primary",
  },
  {
    icon: Search,
    title: "My pet is missing",
    description: "Create a lost pet post and receive possible match alerts.",
    href: "/lost-pets/new",
    action: "Post a lost pet",
    tone: "bg-red-50 text-emergency-red",
  },
  {
    icon: HeartHandshake,
    title: "I want to help",
    description: "View nearby cases and learn how volunteers respond safely.",
    href: "/volunteer",
    action: "Explore volunteering",
    tone: "bg-amber-50 text-amber-700",
  },
];

const principles = [
  {
    icon: ShieldCheck,
    title: "Keep a safe distance",
    description: "Do not chase, corner, handle, or feed an animal that appears frightened, injured, or aggressive.",
    points: ["Observe from a calm distance", "Keep children and pets away", "Wait for trained help when needed"],
  },
  {
    icon: LockKeyhole,
    title: "Protect exact locations",
    description: "Public reports use an approximate area so vulnerable animals cannot be targeted or disturbed.",
    points: ["Exact coordinates stay restricted", "Private contact details are hidden", "Access is limited to trusted responders"],
  },
  {
    icon: FileCheck2,
    title: "Report what you observed",
    description: "Accurate, recent information helps the community make safer decisions and reduces false alerts.",
    points: ["Use clear, unedited photos", "Describe behavior without guessing", "Update the case when circumstances change"],
  },
  {
    icon: UserCheck,
    title: "Coordinate through PetRadar",
    description: "Use protected contact and verified case updates instead of publishing personal information.",
    points: ["Keep conversations respectful", "Do not arrange unsafe solo rescues", "Report suspicious requests or behavior"],
  },
];

export default function SafetyPage() {
  return (
    <div className="page-shell max-w-6xl space-y-12 pb-16">
      <section className="grid items-center gap-8 border-b border-border pb-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-mint px-3 py-1.5 text-xs font-bold text-primary">
            <ShieldCheck className="h-4 w-4" />
            Safety comes before speed
          </span>
          <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight text-text-strong sm:text-4xl">
            Help animals without putting people or pets at risk.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-text-muted">
            Simple guidance for reporting, responding, sharing locations, and communicating safely through PetRadar.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/report" className={buttonVariants({ size: "lg" })}>
              <PawPrint className="h-4 w-4" /> Report an animal
            </Link>
            <Link href="/help" className={buttonVariants({ variant: "outline", size: "lg" })}>
              <HelpCircle className="h-4 w-4" /> Visit Help Center
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-700 shadow-soft">
              <Siren className="h-6 w-6" />
            </span>
            <div>
              <h2 className="font-bold text-text-strong">Immediate danger?</h2>
              <p className="mt-2 text-sm leading-6 text-text-muted">
                Move to a safe place and contact local emergency services or a qualified animal rescue. PetRadar is not an emergency dispatch service.
              </p>
              <a href="#urgent-guidance" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-amber-800 hover:text-amber-950">
                Read urgent guidance <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-wide text-primary">Choose your next step</p>
          <h2 className="mt-2 text-2xl font-bold text-text-strong">What do you need help with?</h2>
          <p className="mt-2 text-sm leading-6 text-text-muted">Start with the situation that best matches what is happening now.</p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {situations.map(({ icon: Icon, title, description, href, action, tone }) => (
            <Link key={title} href={href} className="group rounded-3xl border border-border bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-card">
              <span className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", tone)}>
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-base font-bold text-text-strong">{title}</h3>
              <p className="mt-2 min-h-12 text-sm leading-6 text-text-muted">{description}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                {action} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-wide text-primary">Safe participation</p>
          <h2 className="mt-2 text-2xl font-bold text-text-strong">Four principles for every case</h2>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {principles.map(({ icon: Icon, title, description, points }) => (
            <article key={title} className="rounded-3xl border border-border bg-white p-6 shadow-soft">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-mint text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-text-strong">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-text-muted">{description}</p>
                </div>
              </div>
              <ul className="mt-5 grid gap-2 border-t border-border pt-4 sm:grid-cols-3">
                {points.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-xs leading-5 text-text-muted">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-teal-200 bg-[#f1faf7]">
        <div className="grid lg:grid-cols-[300px_1fr]">
          <div className="border-b border-teal-200 p-6 lg:border-b-0 lg:border-r">
            <EyeOff className="h-8 w-8 text-primary" />
            <h2 className="mt-4 text-xl font-bold text-text-strong">Location privacy by design</h2>
            <p className="mt-3 text-sm leading-6 text-text-muted">
              PetRadar separates public discovery from restricted rescue coordination.
            </p>
            <Link href="/privacy" className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
              Read our privacy approach <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-px bg-teal-200 sm:grid-cols-3">
            {[
              [MapPin, "Public map", "Shows an approximate area rather than a precise address."],
              [LockKeyhole, "Restricted details", "Exact coordinates are limited to approved case responders."],
              [MessageCircleWarning, "Protected contact", "Owners decide how the community can contact them."],
            ].map(([Icon, title, description]) => {
              const StepIcon = Icon as typeof MapPin;
              return (
                <div key={title as string} className="bg-[#f8fdfb] p-6">
                  <StepIcon className="h-5 w-5 text-primary" />
                  <h3 className="mt-4 text-sm font-bold text-text-strong">{title as string}</h3>
                  <p className="mt-2 text-xs leading-5 text-text-muted">{description as string}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="urgent-guidance" className="scroll-mt-28 rounded-3xl border border-red-200 bg-red-50 p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emergency-red text-white">
              <AlertTriangle className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-red-950">For injured, trapped, or aggressive animals</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-red-900/80">
                Do not approach or attempt a rescue alone. Observe from a safe position, note visible hazards, and contact local trained responders. Submit a PetRadar report only when it is safe to do so.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link href="/report" className={buttonVariants({ className: "bg-emergency-red hover:bg-red-700" })}>Create urgent report</Link>
            <Link href="/help?topic=emergency" className={buttonVariants({ variant: "outline", className: "border-red-200" })}>Emergency FAQ</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
