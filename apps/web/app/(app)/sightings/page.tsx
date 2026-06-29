import Link from "next/link";
import { Clock, Eye, MapPin, Plus, Search, ShieldCheck, User } from "lucide-react";
import { mockSightings } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";

function titleFor(color: string, species: string) {
  return `${color} ${species.charAt(0) + species.slice(1).toLowerCase()}`;
}

export default function SightingsPage() {
  return (
    <div className="page-shell space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-strong">Sightings</h1>
          <p className="mt-1 text-sm text-text-muted">{mockSightings.length} reports in the area</p>
        </div>
        <Link href="/report" className={buttonVariants()}>
          <Plus className="h-4 w-4" /> Report Animal
        </Link>
      </div>

      <div className="panel p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input className="field pl-9" placeholder="Search cases, animals, locations..." />
          </label>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {["All", "Cat", "Dog", "Sightings", "Possible match", "Rescues", "Reunited"].map((filter, index) => (
              <button key={filter} className={index === 0 ? "chip h-10 rounded-xl border-primary bg-primary text-white hover:text-white" : "chip h-10 rounded-xl"}>
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {mockSightings.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {mockSightings.map((s) => (
            <Link key={s.id} href={`/sightings/${s.id}`} className="panel block overflow-hidden transition hover:-translate-y-0.5 hover:shadow-card">
              <div className="relative">
                {s.photoUrls[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.photoUrls[0]} alt="" className="h-48 w-full object-cover" />
                ) : (
                  <div className="grid h-48 place-items-center bg-background text-sm font-semibold text-text-muted">No photo uploaded</div>
                )}
                <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                  <StatusBadge value={s.status} />
                  <StatusBadge value={s.urgency} />
                </div>
              </div>
              <div className="space-y-3 p-4">
                <div>
                  <h2 className="text-base font-bold text-text-strong">{titleFor(s.color, s.species)}</h2>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-text-muted">{s.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-background p-3">
                    <p className="mb-1 flex items-center gap-1 font-bold text-text-muted"><MapPin className="h-3.5 w-3.5" /> Area</p>
                    <p className="font-semibold text-text-strong">{s.location.district ?? "Bangkok"}</p>
                  </div>
                  <div className="rounded-xl bg-background p-3">
                    <p className="mb-1 flex items-center gap-1 font-bold text-text-muted"><Clock className="h-3.5 w-3.5" /> Seen</p>
                    <p className="font-semibold text-text-strong">{new Date(s.seenAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <User className="h-3.5 w-3.5" />
                    <span>{s.reporter?.displayName ?? "Community reporter"}</span>
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
                    <Eye className="h-3.5 w-3.5" /> View detail
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState icon={MapPin} title="No reports nearby" description="Try changing filters or create the first report for this area." />
      )}
    </div>
  );
}
