import { PrivacyPage } from "@/components/admin-pages";

export default function Page({ params }: { params: { caseId: string } }) {
  return <PrivacyPage caseId={params.caseId} />;
}
