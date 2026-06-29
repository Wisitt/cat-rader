"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  ChevronDown,
  CircleHelp,
  HeartHandshake,
  LifeBuoy,
  LockKeyhole,
  Mail,
  Map,
  PawPrint,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type TopicId = "all" | "reports" | "lost-pets" | "map" | "account" | "privacy" | "emergency";

const topics: { id: Exclude<TopicId, "all">; title: string; description: string; icon: React.ElementType }[] = [
  { id: "reports", title: "Reports & sightings", description: "Create, update, and understand animal reports.", icon: PawPrint },
  { id: "lost-pets", title: "Lost pets & matches", description: "Post a missing pet and review possible matches.", icon: Bell },
  { id: "map", title: "Map & nearby care", description: "Use filters, location, and veterinary care pins.", icon: Map },
  { id: "account", title: "Account & Pet Passport", description: "Manage profiles, QR cards, and pet records.", icon: UserRound },
  { id: "privacy", title: "Safety & privacy", description: "Learn what is public and how exact locations stay safe.", icon: LockKeyhole },
  { id: "emergency", title: "Urgent situations", description: "Know what to do before submitting an urgent report.", icon: AlertTriangle },
];

const faqs: { id: string; topic: Exclude<TopicId, "all">; question: string; answer: string; link?: { label: string; href: string } }[] = [
  {
    id: "report-animal",
    topic: "reports",
    question: "How do I report an animal I have seen?",
    answer: "Open Report Animal, add a recent photo, describe the animal and its condition, then mark an approximate location. Only submit while you are in a safe place.",
    link: { label: "Start a report", href: "/report" },
  },
  {
    id: "edit-report",
    topic: "reports",
    question: "Can I correct or update my report?",
    answer: "Signed-in reporters can open their case from notifications or profile and add new information. Keep updates factual and avoid reposting the same animal.",
  },
  {
    id: "lost-post",
    topic: "lost-pets",
    question: "What makes a useful lost pet post?",
    answer: "Use clear photos from several angles and include breed, color, distinctive marks, collar details, and the last-seen time. PetRadar protects the exact location.",
    link: { label: "Post a lost pet", href: "/lost-pets/new" },
  },
  {
    id: "match-score",
    topic: "lost-pets",
    question: "Does a possible match mean the animal is definitely mine?",
    answer: "No. Match scores are suggestions based on appearance, distance, and timing. Compare the evidence carefully and coordinate through PetRadar before meeting anyone.",
    link: { label: "View matches", href: "/matches" },
  },
  {
    id: "map-location",
    topic: "map",
    question: "Why does the map show an area instead of an exact pin?",
    answer: "Approximate locations help people search nearby without exposing a vulnerable animal or a private home. Exact coordinates are restricted to approved responders.",
    link: { label: "Explore the map", href: "/map" },
  },
  {
    id: "nearby-care",
    topic: "map",
    question: "Where do nearby veterinary locations come from?",
    answer: "The care layer displays nearby veterinary and animal health places from mapped public data. Confirm hours, services, and availability directly with the provider before travelling.",
  },
  {
    id: "passport",
    topic: "account",
    question: "What is a Pet Passport?",
    answer: "A Pet Passport keeps identity, photos, microchip details, health notes, vaccination records, and a protected QR profile together for the pet owner.",
    link: { label: "Open My Pets", href: "/pets" },
  },
  {
    id: "google-login",
    topic: "account",
    question: "Can I sign in with Google?",
    answer: "Yes. Choose Continue with Google on the login or registration page. PetRadar receives your verified email, display name, and profile image; it never receives your Google password.",
    link: { label: "Go to login", href: "/login" },
  },
  {
    id: "private-data",
    topic: "privacy",
    question: "Who can see my phone number and exact location?",
    answer: "Public visitors cannot see exact locations or private contact details. Owners control contact visibility, while restricted case data is available only to authorized roles when necessary.",
    link: { label: "Privacy and safety", href: "/safety" },
  },
  {
    id: "suspicious",
    topic: "privacy",
    question: "What should I do about a suspicious message or false report?",
    answer: "Do not share personal information or continue an unsafe conversation. Save the case reference and contact PetRadar support so the activity can be reviewed.",
    link: { label: "Contact support", href: "mailto:support@petradar.app?subject=Safety%20concern" },
  },
  {
    id: "injured",
    topic: "emergency",
    question: "What should I do if an animal is badly injured or aggressive?",
    answer: "Keep your distance, move people and pets away, and contact local emergency services or a qualified animal rescue. PetRadar is not an emergency dispatch service.",
    link: { label: "Read urgent guidance", href: "/safety#urgent-guidance" },
  },
];

export default function HelpPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const requestedTopic = Array.isArray(searchParams?.topic) ? searchParams.topic[0] : searchParams?.topic;
  const initialTopic = topics.some((topic) => topic.id === requestedTopic) ? requestedTopic as TopicId : "all";
  const [activeTopic, setActiveTopic] = useState<TopicId>(initialTopic);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(initialTopic === "emergency" ? "injured" : null);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return faqs.filter((faq) => {
      const matchesTopic = activeTopic === "all" || faq.topic === activeTopic;
      const matchesQuery = !normalized || `${faq.question} ${faq.answer}`.toLowerCase().includes(normalized);
      return matchesTopic && matchesQuery;
    });
  }, [activeTopic, query]);

  function selectTopic(topic: TopicId) {
    setActiveTopic(topic);
    setOpenId(null);
  }

  return (
    <div className="page-shell max-w-6xl space-y-12 pb-16">
      <section className="border-b border-border pb-10 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-mint text-primary">
          <LifeBuoy className="h-6 w-6" />
        </span>
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-text-strong sm:text-4xl">How can we help?</h1>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-text-muted">
          Find practical answers for reporting, finding a lost pet, using the map, and keeping your information safe.
        </p>
        <div className="relative mx-auto mt-7 max-w-2xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search questions, features, or safety guidance"
            aria-label="Search Help Center"
            className="h-14 rounded-2xl bg-white pl-12 pr-4 text-base shadow-soft"
          />
        </div>
      </section>

      <section>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-primary">Browse by topic</p>
          <h2 className="mt-2 text-2xl font-bold text-text-strong">Start with a category</h2>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map(({ id, title, description, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => selectTopic(id)}
              aria-pressed={activeTopic === id}
              className={cn(
                "flex min-h-32 items-start gap-4 rounded-3xl border bg-white p-5 text-left shadow-soft transition",
                activeTopic === id ? "border-primary bg-mint/50 ring-2 ring-primary/10" : "border-border hover:border-primary/25 hover:shadow-card",
              )}
            >
              <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl", activeTopic === id ? "bg-primary text-white" : "bg-background text-primary")}>
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-bold text-text-strong">{title}</span>
                <span className="mt-1.5 block text-xs leading-5 text-text-muted">{description}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-primary">Common questions</p>
              <h2 className="mt-2 text-2xl font-bold text-text-strong">
                {activeTopic === "all" ? "Help Center answers" : topics.find((topic) => topic.id === activeTopic)?.title}
              </h2>
            </div>
            {activeTopic !== "all" || query ? (
              <button
                type="button"
                onClick={() => { setActiveTopic("all"); setQuery(""); setOpenId(null); }}
                className="text-sm font-bold text-primary hover:text-primary-dark"
              >
                Clear filters
              </button>
            ) : null}
          </div>

          {results.length ? (
            <div className="mt-5 overflow-hidden rounded-3xl border border-border bg-white shadow-soft">
              {results.map((faq) => {
                const open = openId === faq.id;
                return (
                  <div key={faq.id} className="border-b border-border last:border-b-0">
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : faq.id)}
                      aria-expanded={open}
                      className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
                    >
                      <span className="text-sm font-bold text-text-strong sm:text-base">{faq.question}</span>
                      <ChevronDown className={cn("h-5 w-5 shrink-0 text-text-muted transition-transform", open && "rotate-180 text-primary")} />
                    </button>
                    {open ? (
                      <div className="px-5 pb-5 sm:px-6">
                        <p className="max-w-3xl text-sm leading-7 text-text-muted">{faq.answer}</p>
                        {faq.link ? (
                          <Link href={faq.link.href} className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                            {faq.link.label} <ArrowRight className="h-4 w-4" />
                          </Link>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-3xl border border-dashed border-border bg-white px-6 py-14 text-center">
              <CircleHelp className="mx-auto h-10 w-10 text-primary" />
              <h3 className="mt-4 font-bold text-text-strong">No matching answers</h3>
              <p className="mt-2 text-sm text-text-muted">Try a shorter search or clear the selected topic.</p>
              <button type="button" onClick={() => { setActiveTopic("all"); setQuery(""); }} className="mt-4 text-sm font-bold text-primary">Show all questions</button>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-border bg-white p-5 shadow-soft">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h2 className="mt-4 text-base font-bold text-text-strong">Safety comes first</h2>
            <p className="mt-2 text-sm leading-6 text-text-muted">Review safe reporting and protected-location guidance before responding to a case.</p>
            <Link href="/safety" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
              Open Safety Center <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-3xl border border-border bg-white p-5 shadow-soft">
            <Mail className="h-6 w-6 text-primary" />
            <h2 className="mt-4 text-base font-bold text-text-strong">Still need help?</h2>
            <p className="mt-2 text-sm leading-6 text-text-muted">Include the case ID and a short description. Do not email passwords or exact private locations.</p>
            <a href="mailto:support@petradar.app?subject=PetRadar%20support%20request" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
              Email support <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </aside>
      </section>

      <section className="grid gap-4 rounded-3xl border border-teal-200 bg-[#f1faf7] p-6 sm:grid-cols-3 sm:p-8">
        {[
          [PawPrint, "Report an animal", "Create a safe community sighting.", "/report"],
          [Map, "Explore nearby", "View reports and care locations.", "/map"],
          [HeartHandshake, "Volunteer help", "Learn how to support local cases.", "/volunteer"],
        ].map(([Icon, title, description, href]) => {
          const ActionIcon = Icon as typeof PawPrint;
          return (
            <Link key={title as string} href={href as string} className="group flex items-center gap-3 rounded-2xl bg-white p-4 shadow-soft">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mint text-primary"><ActionIcon className="h-5 w-5" /></span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-text-strong">{title as string}</span>
                <span className="mt-0.5 block text-xs text-text-muted">{description as string}</span>
              </span>
              <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
            </Link>
          );
        })}
      </section>
    </div>
  );
}
