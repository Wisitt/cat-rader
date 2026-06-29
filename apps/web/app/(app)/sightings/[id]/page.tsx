import Link from "next/link";
import { ArrowLeft, Clock, MapPin, Navigation, PawPrint, Shield, User } from "lucide-react";
import { AnimalIcon } from "@/components/icons/pets";
import { mockSightings } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SightingDetailPage({ params }: { params: { id: string } }) {
  const s = mockSightings.find((item) => item.id === params.id) ?? mockSightings[0];
  const approximateLatitude = s.location.latitude.toFixed(2);
  const approximateLongitude = s.location.longitude.toFixed(2);
  const mapsUrl = `https://www.google.com/maps?q=${approximateLatitude},${approximateLongitude}`;

  return (
    <div className="page-shell max-w-2xl space-y-5">

      {/* Back */}
      <Link
        href="/sightings"
        className="inline-flex items-center gap-2 text-sm font-bold text-text-muted hover:text-text-strong"
      >
        <ArrowLeft className="h-4 w-4" /> All sightings
      </Link>

      {/* Photo */}
      <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-card">
        {s.photoUrls[0] ? (
          <img src={s.photoUrls[0]} alt="" className="aspect-[16/9] w-full object-cover" />
        ) : (
          <div className="grid aspect-[16/9] w-full place-items-center bg-mint text-primary">
            <AnimalIcon species={s.species} className="h-20 w-20" />
          </div>
        )}

        <div className="space-y-4 p-5">
          {/* Title + badges */}
          <div>
            <div className="flex flex-wrap gap-1.5">
              <StatusBadge value={s.status} />
              <StatusBadge value={s.urgency} />
              <StatusBadge value={s.verificationStatus} />
            </div>
            <h1 className="mt-3 text-2xl font-bold text-text-strong">
              {s.color} {s.species.charAt(0) + s.species.slice(1).toLowerCase()}
            </h1>
            <p className="mt-2 text-sm leading-6 text-text-muted">{s.description}</p>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background p-3.5">
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-text-muted">
                <Clock className="h-3.5 w-3.5" /> Last seen
              </p>
              <p className="text-sm font-semibold text-text-strong">
                {new Date(s.seenAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-3.5">
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-text-muted">
                <MapPin className="h-3.5 w-3.5" /> Area
              </p>
              <p className="text-sm font-semibold text-text-strong">
                {s.location.district ?? "Bangkok"}
              </p>
              <p className="text-xs text-text-muted">Approximate only</p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-3.5">
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-text-muted">
                <User className="h-3.5 w-3.5" /> Reporter
              </p>
              <p className="text-sm font-semibold text-text-strong">
                {s.reporter?.displayName ?? "Community"}
              </p>
            </div>
          </div>

          {/* Privacy note */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex gap-3 text-sm leading-6 text-amber-800">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <p>
                <strong>Exact location is protected.</strong> Public viewers only see an approximate area.
                Coordinate with a verified volunteer or admin before approaching the animal.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/report" className={cn(buttonVariants(), "flex-1 justify-center")}>
              <PawPrint className="h-4 w-4" /> Report Similar
            </Link>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "outline" }), "flex-1 justify-center")}
            >
              <Navigation className="h-4 w-4" /> Approximate Directions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
