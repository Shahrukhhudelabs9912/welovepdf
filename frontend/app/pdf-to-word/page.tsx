import dynamic from "next/dynamic";
import { ToolPageSkeleton } from "@/components/skeleton-loader";

const PDFToWordClient = dynamic(
  () => import("./pdf-to-word-client").then((mod) => ({ default: mod.PDFToWordClient })),
  {
    loading: () => <ToolPageSkeleton />,
    ssr: false,
  }
);

export default function PDFToWordPage() {
  return (
    <PDFToWordClient />
  );
}