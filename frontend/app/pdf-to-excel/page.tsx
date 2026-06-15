import dynamic from "next/dynamic";
import { ToolPageSkeleton } from "@/components/skeleton-loader";

const PDFToExcelClient = dynamic(
  () => import("./pdf-to-excel-client").then((mod) => ({ default: mod.PDFToExcelClient })),
  {
    loading: () => <ToolPageSkeleton />,
    ssr: false,
  }
);

export default function PDFToExcelPage() {
  return (
    <PDFToExcelClient />
  );
}