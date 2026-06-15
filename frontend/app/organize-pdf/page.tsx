import dynamic from "next/dynamic";
import { ToolPageSkeleton } from "@/components/skeleton-loader";

const OrganizePDFClient = dynamic(
  () => import("./organize-pdf-client").then((mod) => ({ default: mod.OrganizePDFClient })),
  { loading: () => <ToolPageSkeleton />, ssr: false }
);

export default function OrganizePDFPage() {
  return (
    <OrganizePDFClient />
  );
}