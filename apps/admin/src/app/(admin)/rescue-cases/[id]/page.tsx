import { RescueCaseDetailPage } from "@/components/admin-pages";

export default function Page({ params }: { params: { id: string } }) {
  return <RescueCaseDetailPage id={params.id} />;
}
