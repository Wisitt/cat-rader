import { DuplicateReviewPage } from "@/components/admin-pages";

export default function Page({ params }: { params: { id: string } }) {
  return <DuplicateReviewPage id={params.id} />;
}
