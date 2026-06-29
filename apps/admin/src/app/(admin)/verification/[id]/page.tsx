import { ReportDetailPage } from "@/components/admin-pages";

export default function Page({ params }: { params: { id: string } }) {
  return <ReportDetailPage id={params.id} />;
}
