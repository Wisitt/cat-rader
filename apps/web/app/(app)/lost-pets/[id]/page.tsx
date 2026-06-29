import Link from "next/link";
import { Heart, MapPin, MessageCircle } from "lucide-react";
import { mockLostPets } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { ProtectedLink } from "@/components/auth/access-gate";

export default function LostPetDetailPage({ params }: { params: { id: string } }) {
  const pet = mockLostPets.find((item) => item.id === params.id) ?? mockLostPets[0];
  return (
    <div className="page-shell space-y-5">
      <Link href="/lost-pets" className="text-sm font-bold text-text-muted">Back to Lost Pets</Link>
      <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <section className="panel p-5">{pet.photoUrls[0] ? <img src={pet.photoUrls[0]} alt={pet.petName} className="aspect-square w-full rounded-2xl object-cover" /> : null}</section>
        <section className="panel p-5">
          <div className="flex flex-wrap gap-2"><StatusBadge value={pet.status} />{pet.matchCount ? <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-match-purple">{pet.matchCount} possible matches</span> : null}</div>
          <h1 className="mt-4 text-3xl font-bold text-text-strong">{pet.petName}</h1>
          <p className="mt-1 text-sm text-text-muted">{pet.color} · {pet.pattern}</p>
          <p className="mt-4 text-sm leading-6 text-text-muted">{pet.description}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-background p-4"><MapPin className="h-5 w-5 text-primary" /><p className="mt-2 text-sm font-bold">{pet.location.district ?? "Bangkok"}</p><p className="text-xs text-text-muted">Last seen area</p></div><div className="rounded-2xl bg-background p-4"><Heart className="h-5 w-5 text-match-purple" /><p className="mt-2 text-sm font-bold">{new Date(pet.lastSeenAt).toLocaleDateString()}</p><p className="text-xs text-text-muted">Last seen date</p></div></div>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <ProtectedLink href="/matches" reason="Log in to review matches connected to your lost pet posts." className={buttonVariants()}>View Possible Matches</ProtectedLink>
            <ProtectedLink href="/profile" reason="Log in to contact the owner through PetRadar without exposing private details." className={buttonVariants({ variant: "outline" })}><MessageCircle className="h-4 w-4" /> Contact through PetRadar</ProtectedLink>
          </div>
        </section>
      </div>
    </div>
  );
}
