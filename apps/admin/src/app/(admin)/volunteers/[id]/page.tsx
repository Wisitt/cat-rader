import { PeopleManagementPage } from "@/components/admin-pages";

export default function Page({ params }: { params: { id: string } }) {
  return <PeopleManagementPage type="volunteers" id={params.id} />;
}
