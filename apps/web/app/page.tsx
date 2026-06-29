import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  BookOpen,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  FileHeart,
  Heart,
  HeartHandshake,
  Lock,
  Map,
  MapPin,
  MessageCircle,
  PawPrint,
  QrCode,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Syringe,
  UserCheck,
  Users,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ProtectedLink } from "@/components/auth/access-gate";
import { TopNav } from "@/components/layout/top-nav";
import { cn } from "@/lib/utils";

const stats = [
  { icon: MapPin, value: "24,860", label: "Sightings reported", note: "16% this month", color: "text-soft-blue", bg: "bg-blue-50" },
  { icon: Heart, value: "5,312", label: "Lost pets reunited", note: "28% this month", color: "text-emergency-red", bg: "bg-red-50" },
  { icon: PawPrint, value: "1,286", label: "Rescue cases supported", note: "19% this month", color: "text-amber", bg: "bg-amber-50" },
  { icon: ShieldCheck, value: "18,940", label: "Privacy-protected cases", note: "42% this month", color: "text-primary", bg: "bg-mint" },
];

const steps = [
  { icon: Camera, title: "Report a sighting", desc: "Share a photo, condition, and an approximate location.", color: "bg-blue-50 text-soft-blue" },
  { icon: Search, title: "Search or post a lost pet", desc: "Browse nearby reports or create a profile for your missing pet.", color: "bg-mint text-primary" },
  { icon: Sparkles, title: "Get possible match suggestions", desc: "Review clear match reasons based on appearance, place, and time.", color: "bg-violet-50 text-match-purple" },
  { icon: HeartHandshake, title: "Help reunite safely", desc: "Connect through protected contact and trusted community support.", color: "bg-red-50 text-emergency-red" },
];

const features = [
  { icon: Map, title: "Community Map", desc: "See recent sightings, lost pets, and rescue needs near you.", accent: "bg-blue-50 text-soft-blue" },
  { icon: Search, title: "Lost Pet Search", desc: "Search by pet, appearance, area, or last-seen details.", accent: "bg-red-50 text-emergency-red" },
  { icon: BellRing, title: "Possible Match Alerts", desc: "Get notified when a community sighting may match your pet.", accent: "bg-violet-50 text-match-purple" },
  { icon: HeartHandshake, title: "Rescue Support", desc: "Connect verified volunteers and rescue partners to urgent cases.", accent: "bg-amber-50 text-amber" },
  { icon: FileHeart, title: "Pet Passport", desc: "Keep identity, microchip, health, and owner details together.", accent: "bg-mint text-primary" },
  { icon: Syringe, title: "Vaccination Book", desc: "Store vaccine records and see upcoming care reminders.", accent: "bg-emerald-50 text-reunited-green" },
  { icon: QrCode, title: "QR Pet Profile", desc: "Share a protected pet profile that is quick to scan and update.", accent: "bg-slate-100 text-text-strong" },
  { icon: Lock, title: "Protected Contact", desc: "Keep personal details private while the community helps.", accent: "bg-teal-50 text-primary-deep" },
];

const productPreviews = [
  { title: "Live Map", type: "map" },
  { title: "Lost Pets", type: "lost" },
  { title: "Possible Matches", type: "match" },
  { title: "Pet Passport", type: "passport" },
  { title: "Vaccination & Health", type: "health" },
];

const community = [
  { title: "Caring Community", desc: "Neighbors looking out for pets every day.", image: "/landing/community-dog.jpg", position: "object-center" },
  { title: "Verified Volunteers", desc: "Trusted people supporting safe follow-up.", image: "/landing/hero-care.jpg", position: "object-[65%_45%]" },
  { title: "Rescue Partners", desc: "Coordinated support when cases need more care.", image: "/landing/cat-portrait.jpg", position: "object-center" },
  { title: "Make a Difference", desc: "One report can help a family find their pet.", image: "/landing/orange-cat.jpg", position: "object-center" },
];

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className={cn("flex items-center justify-center rounded-2xl bg-primary text-white shadow-soft", compact ? "h-9 w-9" : "h-11 w-11")}>
        <PawPrint className={compact ? "h-4 w-4" : "h-5 w-5"} strokeWidth={2.25} />
      </span>
      <span>
        <span className={cn("block font-bold text-text-strong", compact ? "text-lg" : "text-xl")}>PetRadar</span>
        {!compact && <span className="block text-[10px] font-medium text-text-muted">Reuniting pets safely</span>}
      </span>
    </span>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  centered = true,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  centered?: boolean;
}) {
  return (
    <div className={cn("mb-9", centered ? "mx-auto max-w-2xl text-center" : "max-w-xl")}>
      {eyebrow && <p className="mb-2 text-xs font-bold uppercase text-primary">{eyebrow}</p>}
      <h2 className="text-balance text-3xl font-bold text-text-strong sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-sm leading-7 text-text-muted sm:text-base">{description}</p>}
    </div>
  );
}

function MiniPetCard({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-white shadow-card", compact ? "p-2.5" : "p-3")}>
      <div className="flex gap-3">
        <Image
          src="/landing/orange-cat.jpg"
          alt="Milo, an orange cat"
          width={160}
          height={160}
          className={cn("rounded-xl object-cover", compact ? "h-14 w-14" : "h-20 w-20")}
        />
        <div className="min-w-0 flex-1">
          <span className="text-[9px] font-bold uppercase text-emergency-red">Lost pet</span>
          <p className="font-bold text-text-strong">Milo</p>
          <p className="mt-0.5 text-[10px] text-text-muted">Cat · Male · 2 years</p>
          <p className="mt-2 text-[10px] font-semibold text-text-strong">Phaya Thai, Bangkok</p>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between rounded-lg bg-violet-50 px-2.5 py-2 text-[10px] font-bold text-match-purple">
        <span className="inline-flex items-center gap-1"><Sparkles className="h-3 w-3" /> Possible matches</span>
        <span>86%</span>
      </div>
    </div>
  );
}

function MapCanvas({ small = false }: { small?: boolean }) {
  return (
    <div className={cn("landing-map relative overflow-hidden rounded-xl border border-border", small ? "h-28" : "h-full min-h-44")}>
      <div className="landing-route landing-route-one" />
      <div className="landing-route landing-route-two" />
      <span className="landing-pin left-[22%] top-[24%] bg-emergency-red"><PawPrint /></span>
      <span className="landing-pin left-[58%] top-[48%] bg-primary"><Heart /></span>
      <span className="landing-pin left-[76%] top-[18%] bg-match-purple"><Sparkles /></span>
      <span className="landing-pin left-[38%] top-[70%] bg-amber"><PawPrint /></span>
      <span className="absolute bottom-2 right-2 rounded-lg border border-border bg-white px-2 py-1 text-[9px] font-bold text-primary shadow-soft">
        Approximate area
      </span>
    </div>
  );
}

function ProductPreview({ type }: { type: string }) {
  if (type === "map") return <MapCanvas small />;

  if (type === "lost") {
    return (
      <div className="space-y-2">
        {["Milo", "Luna"].map((name, index) => (
          <div key={name} className="flex items-center gap-2 rounded-lg border border-border bg-white p-2">
            <Image
              src={index ? "/landing/cat-portrait.jpg" : "/landing/orange-cat.jpg"}
              alt=""
              width={48}
              height={48}
              className="h-10 w-10 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-text-strong">{name}</p>
              <p className="truncate text-[9px] text-text-muted">Last seen near Ari, Bangkok</p>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "match") {
    return (
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <Image src="/landing/orange-cat.jpg" alt="" width={90} height={110} className="h-24 w-full rounded-lg object-cover" />
        <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-violet-100 bg-white text-xs font-black text-match-purple">86%</div>
        <Image src="/landing/cat-portrait.jpg" alt="" width={90} height={110} className="h-24 w-full rounded-lg object-cover" />
      </div>
    );
  }

  if (type === "passport") {
    return (
      <div className="flex gap-3 rounded-xl border border-border bg-white p-3">
        <Image src="/landing/orange-cat.jpg" alt="" width={70} height={80} className="h-16 w-14 rounded-lg object-cover" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold">Milo</p>
            <span className="rounded-full bg-mint px-2 py-0.5 text-[8px] font-bold text-primary">Verified</span>
          </div>
          <p className="mt-1 text-[9px] text-text-muted">CAT-00021</p>
          <div className="mt-2 flex items-center gap-1 text-[9px] font-semibold text-primary"><QrCode className="h-4 w-4" /> QR profile ready</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {[
        [ShieldCheck, "Vaccine status", "Up to date"],
        [Syringe, "Next vaccination", "May 8, 2026"],
        [Stethoscope, "Health profile", "Complete"],
      ].map(([Icon, label, value]) => {
        const HealthIcon = Icon as typeof ShieldCheck;
        return (
          <div key={label as string} className="flex items-center gap-2 rounded-lg border border-border bg-white p-2">
            <HealthIcon className="h-4 w-4 text-primary" />
            <span className="flex-1 text-[9px] font-semibold text-text-strong">{label as string}</span>
            <span className="text-[8px] text-text-muted">{value as string}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fbfcfa]">
      <TopNav />

      <main>
        <section className="mx-auto max-w-[1440px] px-3 pt-3 sm:px-6 sm:pt-6 lg:px-8">
          <div className="relative min-h-[680px] overflow-hidden rounded-3xl border border-border bg-white shadow-card lg:min-h-[720px]">
            <Image
              src="/landing/hero-care.jpg"
              alt="A pet owner caring for her dog at home"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1400px"
              className="object-cover object-[62%_center]"
            />
            <div className="absolute inset-y-0 left-0 w-full bg-white/90 md:w-[58%] lg:w-[50%]" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-white/70 md:hidden" />

            <div className="relative z-10 flex min-h-[680px] flex-col justify-between p-6 sm:p-10 lg:min-h-[720px] lg:p-12">
              <div className="max-w-xl pt-4 sm:pt-8">
                <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-mint px-3 py-2 text-xs font-bold text-primary shadow-soft">
                  <ShieldCheck className="h-4 w-4" />
                  Trusted by a caring community
                </div>
                <h1 className="text-balance text-4xl font-bold leading-[1.08] text-text-strong sm:text-5xl lg:text-6xl">
                  A trusted place for pet safety, rescue, and <span className="text-primary">reunion.</span>
                </h1>
                <p className="mt-5 max-w-lg text-base leading-7 text-text-muted">
                  Report animal sightings, search lost pets, get possible match suggestions, support rescues, and protect your pet&apos;s identity in one safe community.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link href="/report" className={buttonVariants({ size: "lg" })}>
                    <PawPrint className="h-5 w-5" /> Report an Animal
                  </Link>
                  <Link href="/lost-pets" className={buttonVariants({ variant: "outline", size: "lg" })}>
                    <Search className="h-5 w-5" /> Search Lost Pets
                  </Link>
                  <Link href="/map" className={buttonVariants({ variant: "ghost", size: "lg" })}>
                    Explore the Map <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-8 hidden max-w-lg grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-soft sm:grid sm:grid-cols-3">
                  {[
                    [Shield, "Protected locations"],
                    [Users, "Community reports"],
                    [Sparkles, "Match alerts"],
                    [HeartHandshake, "Rescue support"],
                    [QrCode, "QR pet profile"],
                    [BookOpen, "Health records"],
                  ].map(([Icon, label]) => {
                    const ItemIcon = Icon as typeof Shield;
                    return (
                      <div key={label as string} className="flex items-center gap-2 bg-white px-3 py-3 text-[10px] font-semibold text-text-strong">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-mint text-primary"><ItemIcon className="h-3.5 w-3.5" /></span>
                        {label as string}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="hidden items-center gap-3 pt-10 text-xs font-medium text-text-muted sm:flex">
                <div className="flex -space-x-2">
                  {["/landing/hero-care.jpg", "/landing/community-dog.jpg", "/landing/cat-portrait.jpg", "/landing/orange-cat.jpg"].map((src) => (
                    <Image key={src} src={src} alt="" width={34} height={34} className="h-8 w-8 rounded-full border-2 border-white object-cover" />
                  ))}
                </div>
                <span><strong className="text-text-strong">50,000+ members</strong><br />helping pets across their communities</span>
              </div>
            </div>

            <div className="absolute right-[25%] top-12 hidden w-56 lg:block"><MiniPetCard /></div>
            <div className="absolute right-8 top-20 hidden w-52 xl:block">
              <div className="rounded-2xl border border-border bg-white p-4 shadow-card">
                <div className="flex items-center gap-2 text-xs font-bold text-match-purple"><Sparkles className="h-4 w-4" /> Possible match</div>
                <div className="mt-3 flex items-center gap-3">
                  <Image src="/landing/cat-portrait.jpg" alt="" width={55} height={55} className="h-14 w-14 rounded-xl object-cover" />
                  <div><p className="text-lg font-black text-match-purple">86%</p><p className="text-[9px] text-text-muted">High confidence</p></div>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-violet-100"><div className="h-full w-[86%] rounded-full bg-match-purple" /></div>
              </div>
            </div>
            <div className="absolute bottom-10 right-10 hidden w-48 rounded-2xl border border-border bg-white p-4 shadow-card xl:block">
              <div className="flex items-center gap-2 text-xs font-bold text-primary"><FileHeart className="h-4 w-4" /> Pet Passport</div>
              <div className="mt-3 flex items-center gap-2">
                <Image src="/landing/orange-cat.jpg" alt="" width={42} height={42} className="h-10 w-10 rounded-lg object-cover" />
                <div className="flex-1"><p className="text-xs font-bold">Milo</p><p className="text-[9px] text-text-muted">CAT-00021</p></div>
                <span className="rounded-full bg-mint px-2 py-1 text-[8px] font-bold text-primary">Verified</span>
              </div>
              <div className="mt-3 flex items-center justify-center rounded-xl bg-background p-3"><QrCode className="h-16 w-16 text-text-strong" /></div>
            </div>
            <div className="absolute bottom-12 right-[26%] hidden rounded-2xl border border-border bg-white p-4 shadow-card lg:block">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint text-primary"><Lock className="h-5 w-5" /></span>
                <div><p className="text-xs font-bold text-text-strong">Privacy-protected location</p><p className="mt-1 max-w-40 text-[10px] leading-4 text-text-muted">Exact location stays hidden to keep pets and people safe.</p></div>
              </div>
            </div>
          </div>
        </section>

        <section aria-label="PetRadar impact" className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid overflow-hidden rounded-2xl border border-border bg-white shadow-soft sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(({ icon: Icon, value, label, note, color, bg }, index) => (
              <div key={label} className={cn("flex items-center gap-4 p-5 lg:p-6", index > 0 && "border-t border-border sm:border-l sm:border-t-0", index === 2 && "sm:border-l-0 sm:border-t lg:border-l lg:border-t-0")}>
                <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full", bg, color)}><Icon className="h-5 w-5" /></span>
                <div>
                  <p className="text-2xl font-black text-text-strong">{value}</p>
                  <p className="text-xs font-semibold text-text-muted">{label}</p>
                  <p className="mt-1 text-[10px] font-bold text-reunited-green">{note}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="border-y border-border bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeading
              eyebrow="Simple, safe, community-powered"
              title="How PetRadar works"
              description="A clear path from the first report to a safe reunion, with privacy built into every step."
            />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {steps.map(({ icon: Icon, title, desc, color }, index) => (
                <article key={title} className="relative rounded-2xl border border-border bg-white p-6 shadow-soft">
                  <div className="mb-5 flex items-center justify-between">
                    <span className={cn("flex h-12 w-12 items-center justify-center rounded-xl", color)}><Icon className="h-5 w-5" /></span>
                    <span className="text-3xl font-black text-border">0{index + 1}</span>
                  </div>
                  <h3 className="font-bold text-text-strong">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-text-muted">{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="pet-passport" className="scroll-mt-24 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeading
              eyebrow="One connected place"
              title="Core tools for everyday pet safety"
              description="Useful when a pet is missing, when an animal needs help, and for the care that happens in between."
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(({ icon: Icon, title, desc, accent }) => (
                <article key={title} className="group rounded-2xl border border-border bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-card">
                  <span className={cn("mb-5 flex h-11 w-11 items-center justify-center rounded-xl", accent)}><Icon className="h-5 w-5" /></span>
                  <h3 className="font-bold text-text-strong">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-text-muted">{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-white py-20">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Product preview"
              title="See PetRadar in action"
              description="Every part of the experience is designed to be clear when people need to act quickly."
            />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {productPreviews.map(({ title, type }) => (
                <article key={title} className="rounded-2xl border border-border bg-background p-3 shadow-soft">
                  <div className="min-h-36 rounded-xl bg-white p-3"><ProductPreview type={type} /></div>
                  <p className="px-1 pb-1 pt-3 text-center text-xs font-bold text-text-strong">{title}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="relative mx-auto w-full max-w-lg rounded-3xl border border-border bg-white p-5 shadow-card">
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div><p className="text-xs font-bold uppercase text-primary">Pet Passport</p><p className="mt-1 text-xl font-bold text-text-strong">Milo</p><p className="text-xs text-text-muted">CAT-00021</p></div>
                <span className="rounded-full bg-mint px-3 py-1 text-xs font-bold text-primary">Verified</span>
              </div>
              <div className="mt-5 grid grid-cols-[120px_1fr] gap-5">
                <Image src="/landing/orange-cat.jpg" alt="Milo's pet passport photo" width={240} height={280} className="h-40 w-full rounded-2xl object-cover" />
                <div className="flex flex-col justify-between">
                  <dl className="space-y-2 text-xs">
                    <div className="flex justify-between gap-2"><dt className="text-text-muted">Breed</dt><dd className="font-semibold">Domestic Shorthair</dd></div>
                    <div className="flex justify-between gap-2"><dt className="text-text-muted">Microchip</dt><dd className="font-semibold">Registered</dd></div>
                    <div className="flex justify-between gap-2"><dt className="text-text-muted">Vaccines</dt><dd className="font-semibold text-primary">Up to date</dd></div>
                  </dl>
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-background p-3"><QrCode className="h-11 w-11" /><span className="text-[10px] font-semibold text-text-muted">Scan to open Milo&apos;s protected profile</span></div>
                </div>
              </div>
            </div>
            <div>
              <SectionHeading eyebrow="Pet identity & health" title="Your pet&apos;s essential details, ready when they matter" description="Pet Passport gives owners one protected place for identity, health, and recovery information." centered={false} />
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Store identity and microchip details",
                  "Track vaccination records",
                  "Share a protected QR profile",
                  "Report your pet as lost quickly",
                  "Keep owner contact private",
                  "Improve possible match accuracy",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm font-semibold text-text-strong">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mint text-primary"><Check className="h-3.5 w-3.5" /></span>
                    {item}
                  </div>
                ))}
              </div>
              <ProtectedLink href="/pets/new" reason="Log in to create your pet's Passport and protected QR profile." className={cn(buttonVariants({ size: "lg" }), "mt-8")}>
                Create Pet Passport <ArrowRight className="h-4 w-4" />
              </ProtectedLink>
            </div>
          </div>
        </section>

        <section id="safety" className="border-y border-border bg-white py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionHeading eyebrow="Safety by design" title="Share enough to help, never more than needed" description="PetRadar protects exact locations and personal details while keeping every case useful to the community." centered={false} />
              <div className="space-y-4">
                {[
                  [MapPin, "Approximate location only", "Public viewers see a helpful area, not an exact address."],
                  [Lock, "Private owner details", "You control what is shared and when."],
                  [MessageCircle, "Safe in-app communication", "Connect without exposing personal contact details."],
                  [ShieldCheck, "Built for community safety", "Moderation, reporting, and trusted roles support every case."],
                ].map(([Icon, title, desc]) => {
                  const SafetyIcon = Icon as typeof Lock;
                  return (
                    <div key={title as string} className="flex gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mint text-primary"><SafetyIcon className="h-5 w-5" /></span>
                      <div><h3 className="text-sm font-bold text-text-strong">{title as string}</h3><p className="mt-1 text-sm leading-6 text-text-muted">{desc as string}</p></div>
                    </div>
                  );
                })}
              </div>
              <Link href="/safety" className={cn(buttonVariants({ variant: "outline" }), "mt-8")}>Read our safety approach <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="relative min-h-[430px] rounded-3xl border border-border bg-background p-5 shadow-soft">
              <MapCanvas />
              <div className="absolute left-1/2 top-1/2 flex h-52 w-52 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-dashed border-primary/40 bg-mint/30">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-white shadow-elevated"><PawPrint className="h-9 w-9" /></div>
              </div>
              <div className="absolute bottom-8 right-8 max-w-52 rounded-2xl border border-border bg-white p-4 shadow-card">
                <p className="text-xs font-bold text-text-strong">Approximate location radius</p>
                <p className="mt-1 text-lg font-black text-primary">About 1 km</p>
                <p className="mt-1 text-[10px] leading-4 text-text-muted">Exact coordinates remain protected.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeading
              eyebrow="Lost pet matching"
              title="Clear evidence for a more confident reunion"
              description="PetRadar organizes the sighting details and explains why a possible match was suggested."
            />
            <div className="rounded-3xl border border-border bg-white p-4 shadow-card sm:p-6">
              <div className="grid gap-4 lg:grid-cols-[1fr_180px_1fr_1.15fr]">
                <article className="rounded-2xl border border-border bg-background p-3">
                  <p className="mb-3 text-xs font-bold text-text-strong">Lost pet · Milo</p>
                  <Image src="/landing/orange-cat.jpg" alt="Lost pet Milo" width={420} height={300} className="h-48 w-full rounded-xl object-cover" />
                  <p className="mt-3 text-xs font-semibold text-text-strong">Orange tabby · Red collar</p>
                  <p className="mt-1 text-[10px] text-text-muted">Last seen in Phaya Thai</p>
                </article>
                <div className="flex flex-col items-center justify-center rounded-2xl bg-violet-50 p-5 text-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-[7px] border-match-purple bg-white text-2xl font-black text-match-purple">86%</div>
                  <p className="mt-3 text-xs font-bold text-text-strong">High confidence</p>
                  <p className="mt-1 text-[10px] text-text-muted">Possible match</p>
                </div>
                <article className="rounded-2xl border border-border bg-background p-3">
                  <p className="mb-3 text-xs font-bold text-text-strong">Community sighting</p>
                  <Image src="/landing/cat-portrait.jpg" alt="Similar cat sighting" width={420} height={300} className="h-48 w-full rounded-xl object-cover" />
                  <p className="mt-3 text-xs font-semibold text-text-strong">Seen near Ari</p>
                  <p className="mt-1 text-[10px] text-text-muted">0.8 km away · 2 hours ago</p>
                </article>
                <article className="rounded-2xl border border-border bg-background p-5">
                  <p className="text-xs font-bold text-text-strong">Why this may be a match</p>
                  <ul className="mt-4 space-y-3">
                    {["Same species and breed", "Similar orange coat pattern", "Wearing a red collar", "Seen near the last location"].map((reason) => (
                      <li key={reason} className="flex items-center gap-2 text-xs font-semibold text-text-muted"><CheckCircle2 className="h-4 w-4 text-reunited-green" /> {reason}</li>
                    ))}
                  </ul>
                  <div className="mt-6 grid gap-2">
                    <ProtectedLink href="/matches" reason="Log in to review matches connected to your lost pet posts." className={buttonVariants({ size: "default" })}>
                      Review Possible Match
                    </ProtectedLink>
                    <Link href="/lost-pets" className={buttonVariants({ variant: "outline", size: "default" })}>View Lost Pets</Link>
                  </div>
                </article>
              </div>
              <div className="mt-5 grid gap-3 border-t border-border pt-5 sm:grid-cols-4">
                {["Post a lost pet", "Compare nearby sightings", "Review possible matches", "Coordinate a safe reunion"].map((label, index) => (
                  <div key={label} className="flex items-center gap-3 text-xs font-semibold text-text-strong">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">{index + 1}</span>{label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="community" className="border-y border-border bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-8 lg:grid-cols-[0.65fr_2fr] lg:items-end">
              <SectionHeading eyebrow="People make it possible" title="Built for pet owners, neighbors, and helpers" description="Technology organizes the details. Caring people take the actions that bring pets home." centered={false} />
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {community.map(({ title, desc, image, position }) => (
                  <article key={title} className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
                    <Image src={image} alt="" width={400} height={300} className={cn("h-44 w-full object-cover", position)} />
                    <div className="p-4"><h3 className="text-sm font-bold text-text-strong">{title}</h3><p className="mt-1 text-xs leading-5 text-text-muted">{desc}</p></div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-primary-deep px-6 py-14 text-center text-white sm:px-10">
            <div className="landing-cta-pattern absolute inset-0 opacity-20" />
            <div className="relative mx-auto max-w-3xl">
              <HeartHandshake className="mx-auto mb-5 h-10 w-10 text-mint" />
              <h2 className="text-balance text-3xl font-bold sm:text-4xl">Together, we can bring more pets home.</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/75">Join a trusted community that reports sightings, supports rescues, and helps families reunite safely.</p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
                <Link href="/report" className={cn(buttonVariants({ size: "lg" }), "bg-white text-primary hover:bg-mint")}><PawPrint className="h-4 w-4" /> Start Reporting</Link>
                <Link href="/lost-pets" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "border-white/40 bg-transparent text-white hover:bg-white hover:text-primary")}><Search className="h-4 w-4" /> Search Lost Pets</Link>
                <ProtectedLink href="/pets/new" reason="Log in to create your pet's Passport and protected QR profile." className={cn(buttonVariants({ variant: "outline", size: "lg" }), "border-white/40 bg-transparent text-white hover:bg-white hover:text-primary")}><FileHeart className="h-4 w-4" /> Create Pet Passport</ProtectedLink>
                <ProtectedLink href="/volunteer" reason="Log in to create a volunteer profile and choose your service area." className={cn(buttonVariants({ variant: "outline", size: "lg" }), "border-white/40 bg-transparent text-white hover:bg-white hover:text-primary")}><UserCheck className="h-4 w-4" /> Join as Volunteer</ProtectedLink>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[1.5fr_repeat(5,1fr)]">
            <div>
              <Link href="/"><Brand compact /></Link>
              <p className="mt-4 max-w-56 text-xs leading-6 text-text-muted">A trusted community for pet safety, rescue support, and reunion.</p>
              <div className="mt-5 flex gap-2">
                {[Users, Heart, MessageCircle].map((Icon, index) => (
                  <Link key={index} href="#community" aria-label="PetRadar community" className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-muted hover:border-primary hover:text-primary"><Icon className="h-4 w-4" /></Link>
                ))}
              </div>
            </div>
            {[
              ["Explore", [["Map", "/map"], ["Lost Pets", "/lost-pets"], ["Report", "/report"], ["Matches", "/matches"]]],
              ["Support", [["Help Center", "/safety"], ["Safety", "/safety"], ["Notifications", "/notifications"], ["Contact", "/safety"]]],
              ["About", [["Our Mission", "#community"], ["How It Works", "#how-it-works"], ["Community", "#community"], ["Rescues", "/volunteer"]]],
              ["Legal", [["Privacy Policy", "/safety"], ["Terms of Service", "/safety"], ["Accessibility", "/safety"], ["Data Safety", "/safety"]]],
              ["Get Involved", [["Volunteer", "/volunteer"], ["Rescue Partners", "/volunteer"], ["Create Passport", "/pets/new"], ["Sign Up", "/register"]]],
            ].map(([title, links]) => (
              <div key={title as string}>
                <h3 className="text-xs font-bold text-text-strong">{title as string}</h3>
                <ul className="mt-4 space-y-3">
                  {(links as string[][]).map(([label, href]) => <li key={label}><Link href={href} className="text-xs text-text-muted hover:text-primary">{label}</Link></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div id="footer-nav" className="mt-10 flex flex-col gap-3 border-t border-border pt-5 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 PetRadar. All rights reserved.</p>
            <p className="inline-flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Privacy and animal welfare come first.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
