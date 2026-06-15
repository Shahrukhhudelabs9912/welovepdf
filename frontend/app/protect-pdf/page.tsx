import dynamic from "next/dynamic";
import { ToolPageSkeleton } from "@/components/skeleton-loader";

const ProtectPDFClient = dynamic(
  () => import("./protect-pdf-client").then((mod) => ({ default: mod.ProtectPDFClient })),
  { loading: () => <ToolPageSkeleton />, ssr: false }
);

export default function ProtectPDFPage() {
  return (
    <ProtectPDFClient />
  );
}