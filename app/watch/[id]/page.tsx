import { redirect } from "next/navigation";

export default function Page({ params }: { params: { id: string } }) {
  redirect(`/films/${params.id}/watch`);
  return null;
}