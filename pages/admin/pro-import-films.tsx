import dynamic from "next/dynamic";
const ProImportFilms = dynamic(
  () => import("@/components/admin/ProImportFilms"),
  { ssr: false }
);

export default function ProImportFilmsPage() {
  return <ProImportFilms />;
}