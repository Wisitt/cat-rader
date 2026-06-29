import Link from "next/link";
import { Heart, MapPin, ShieldCheck, Star } from "lucide-react";
import { mockUser, mockRescueCases } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";

const completed = mockRescueCases
  .filter((rc) => rc.status === "RESCUED" || rc.status === "CLOSED")
  .slice(0, 3);

export default function VolunteerProfilePage() {
  return (
    <div className="page-shell max-w-3xl space-y-5">
      <section className="panel overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-primary/10 to-mint" />
        <div className="-mt-10 p-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-primary text-2xl font-bold text-white shadow-soft">
            N
          </div>
          <div className="mt-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-text-strong">{mockUser.displayName}</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-mint px-2 py-0.5 text-xs font-bold text-primary">
                <ShieldCheck className="h-3 w-3" /> Verified Volunteer
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1 text-sm text-text-muted">
              <MapPin className="h-3.5 w-3.5" /> Bangkok · Active since 2023
            </p>
            <p className="mt-1 flex items-center gap-1 text-sm font-bold text-amber-600">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> 4.9 community rating
            </p>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-5">
            {[
              { label: "Cases Assisted", value: "86", icon: Heart, color: "text-primary" },
              { label: "Rescues Completed", value: "42", icon: ShieldCheck, color: "text-reunited-green" },
              { label: "Service Radius", value: "5 km", icon: MapPin, color: "text-soft-blue" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="text-center">
                <Icon className={`mx-auto h-5 w-5 ${color}`} />
                <p className="mt-1 text-lg font-bold text-text-strong">{value}</p>
                <p className="text-xs text-text-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {completed.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-base font-bold text-text-strong">Recent Contributions</h2>
          <div className="space-y-2">
            {completed.map((rc) => (
              <Link
                key={rc.id}
                href={`/rescue-cases/${rc.id}`}
                className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated"
              >
                {rc.sighting.photoUrls[0] ? (
                  <img
                    src={rc.sighting.photoUrls[0]}
                    alt=""
                    className="h-12 w-12 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-mint text-primary">
                    <Heart className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-text-strong">
                    {rc.sighting.color}{" "}
                    {rc.sighting.species.charAt(0) + rc.sighting.species.slice(1).toLowerCase()}
                  </p>
                  <p className="text-xs text-text-muted">
                    {rc.sighting.location.district ?? "Bangkok"}
                  </p>
                </div>
                <StatusBadge value={rc.status} />
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
