import { AbuseReportsPage } from "@/components/admin-pages";

export default function Page({ params }: { params: { id: string } }) {
  return <AbuseReportsPage id={params.id} />;
}
