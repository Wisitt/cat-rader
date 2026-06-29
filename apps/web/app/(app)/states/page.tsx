import { AlertTriangle, CheckCircle, CloudOff, Lock, MapPin, Search } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

const states = [
  [Search, "No Reports Nearby", "No reports in this area right now. Try expanding your search."],
  [MapPin, "No Lost Pet Matches", "We will notify you if something new appears."],
  [CloudOff, "Upload Failed", "We could not upload your photo. Please check your connection."],
  [Lock, "Unauthorized Access", "You do not have permission to view this page."],
  [AlertTriangle, "Location Permission Denied", "Enable location to show nearby reports."],
  [CheckCircle, "Report Submitted", "Your report has been submitted and is under review."],
] as const;

export default function StatesPage() {
  return (
    <div className="page-shell space-y-5">
      <div><h1 className="text-2xl font-bold text-text-strong">Empty, Loading, and Error States</h1><p className="text-sm text-text-muted">Reusable user-facing state patterns.</p></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{states.map(([Icon, title, desc]) => <EmptyState key={title} icon={Icon} title={title} description={desc} />)}</div>
    </div>
  );
}
