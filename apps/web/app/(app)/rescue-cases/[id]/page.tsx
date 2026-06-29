"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Clock, MapPin, PawPrint, User } from "lucide-react";
import { mockRescueCases } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

const timelineBase = [
  { label: "Report submitted", by: "Community reporter" },
  { label: "Admin verified", by: "Admin team" },
  { label: "Volunteer assigned", by: "Rescue coordinator" },
];

export default function RescueCasePage({ params }: { params: { id: string } }) {
  const rescue = mockRescueCases.find((item) => item.id === params.id) ?? mockRescueCases[0];
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function submitUpdate() {
    if (!note.trim()) {
      window.dispatchEvent(
        new CustomEvent("petradar:toast", {
          detail: { text: "Please enter an update note before submitting.", tone: "error" },
        })
      );
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setNote("");
      window.dispatchEvent(
        new CustomEvent("petradar:toast", {
          detail: { text: "Update submitted. The rescue team has been notified." },
        })
      );
    }, 700);
  }

  return (
    <div className="page-shell space-y-5">
      <Link
        href="/volunteer"
        className="inline-flex items-center gap-2 text-sm font-bold text-text-muted hover:text-text-strong"
      >
        <ArrowLeft className="h-4 w-4" /> Volunteer Center
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-text-strong">Case {rescue.id}</h1>
        <StatusBadge value={rescue.status} />
        <StatusBadge value={rescue.priority} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          {rescue.sighting.photoUrls[0] ? (
            <img
              src={rescue.sighting.photoUrls[0]}
              alt=""
              className="h-56 w-full rounded-2xl object-cover shadow-card"
            />
          ) : (
            <div className="grid h-56 place-items-center rounded-2xl bg-mint shadow-card">
              <PawPrint className="h-12 w-12 text-primary" />
            </div>
          )}

          <div className="panel p-5">
            <h2 className="text-sm font-bold text-text-strong">About this case</h2>
            <p className="mt-2 text-sm leading-6 text-text-muted">{rescue.notes}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-background p-3">
                <p className="mb-1 flex items-center gap-1 text-xs font-bold text-text-muted">
                  <MapPin className="h-3.5 w-3.5" /> Area
                </p>
                <p className="text-sm font-semibold text-text-strong">
                  {rescue.sighting.location.district ?? "Bangkok"}
                </p>
              </div>
              <div className="rounded-xl bg-background p-3">
                <p className="mb-1 flex items-center gap-1 text-xs font-bold text-text-muted">
                  <User className="h-3.5 w-3.5" /> Assigned to
                </p>
                <p className="text-sm font-semibold text-text-strong">
                  {rescue.assignedTo?.displayName ?? "Unassigned"}
                </p>
              </div>
            </div>
          </div>

          <div className="panel p-5">
            <h2 className="text-sm font-bold text-text-strong">Add update</h2>
            {submitted ? (
              <div className="mt-3 flex items-center gap-3 rounded-2xl bg-green-50 p-4">
                <CheckCircle className="h-5 w-5 text-reunited-green" />
                <p className="text-sm font-bold text-reunited-green">
                  Update submitted successfully.
                </p>
              </div>
            ) : (
              <>
                <textarea
                  className="field mt-3 h-28 py-3"
                  placeholder="Describe what you found or what action you took..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <Button className="mt-3 w-full" onClick={submitUpdate} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Update"}
                </Button>
              </>
            )}
          </div>
        </div>

        <aside className="panel p-5">
          <h2 className="text-sm font-bold text-text-strong">Timeline</h2>
          <div className="relative mt-4 space-y-5 pl-5 before:absolute before:inset-y-2 before:left-[7px] before:w-0.5 before:bg-border">
            {timelineBase.map((item, index) => (
              <div key={index} className="relative flex gap-3 text-sm">
                <Clock className="absolute -left-[22px] h-3.5 w-3.5 bg-white text-primary" />
                <div>
                  <p className="font-bold text-text-strong">{item.label}</p>
                  <p className="text-xs text-text-muted">by {item.by}</p>
                  <p className="text-xs text-text-muted">
                    {new Date(rescue.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
