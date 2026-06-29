"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Lock, MessageCircle } from "lucide-react";
import type { PetPassport } from "@/types";
import { mockPets } from "@/lib/mock-data";
import { AnimalIcon } from "@/components/icons/pets";
import { PawShieldIcon, SafeLocationIcon } from "@/components/icons/pet-passport";

export default function PublicPetProfilePage() {
  const { qrSlug } = useParams<{ qrSlug: string }>();
  const [pet, setPet] = useState<PetPassport | null>(null);
  useEffect(() => {
    try {
      const stored = localStorage.getItem("petradar:pets");
      const pets: PetPassport[] = stored ? JSON.parse(stored) : mockPets;
      setPet(pets.find((item) => item.id === qrSlug) ?? null);
    } catch { setPet(mockPets.find((item) => item.id === qrSlug) ?? null); }
  }, [qrSlug]);
  if (!pet) return <div className="grid min-h-full place-items-center p-6 text-sm text-text-muted">Safe pet profile not found.</div>;
  return <div className="mx-auto max-w-md p-4 sm:py-8"><article className="overflow-hidden rounded-[2rem] border border-[#e4dacb] bg-[#fffefa] shadow-card"><div className="relative">{pet.photoUrl ? <img src={pet.photoUrl} alt={pet.name} className="aspect-[4/3] w-full object-cover" /> : <div className="grid aspect-[4/3] place-items-center bg-mint text-primary"><AnimalIcon species={pet.species} className="h-24 w-24" /></div>}<span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-primary shadow-soft"><PawShieldIcon className="h-4 w-4" /> Safe public profile</span>{pet.status === "LOST" ? <span className="absolute right-4 top-4 rounded-full bg-red-600 px-3 py-1.5 text-[10px] font-bold text-white">Lost pet</span> : null}</div><div className="p-5"><h1 className="text-3xl font-bold">{pet.name}</h1><p className="mt-1 text-sm text-text-muted">{pet.species} · {pet.breed ?? "Mixed breed"} · {pet.sex}</p><div className="mt-5 grid grid-cols-2 gap-3 text-xs"><div className="rounded-2xl bg-white p-3"><p className="text-text-muted">Color</p><p className="mt-1 font-bold">{pet.color}</p></div><div className="rounded-2xl bg-white p-3"><p className="text-text-muted">Pattern</p><p className="mt-1 font-bold">{pet.pattern ?? "Not listed"}</p></div></div>{pet.description ? <div className="mt-4 rounded-2xl bg-white p-4 text-sm leading-6 text-text-muted"><p className="font-bold text-text-strong">About {pet.name}</p><p className="mt-1">{pet.description}</p></div> : null}<div className="mt-4 flex items-center gap-3 rounded-2xl bg-mint p-4"><SafeLocationIcon className="h-6 w-6 text-primary" /><div><p className="text-sm font-bold">Approximate area only</p><p className="text-xs text-text-muted">Exact home and owner details stay protected.</p></div></div><button onClick={() => window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text: "A secure contact request was sent through PetRadar." } }))} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-white"><MessageCircle className="h-4 w-4" /> Contact through PetRadar</button><p className="mt-4 text-center text-[10px] text-text-muted"><Lock className="mr-1 inline h-3 w-3" /> Private contact and exact location are protected.</p></div></article></div>;
}
