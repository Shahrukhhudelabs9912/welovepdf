import dynamic from "next/dynamic";
import { ToolPageSkeleton } from "@/components/skeleton-loader";

const ExcelToPDFClient = dynamic(
  () => import("./excel-to-pdf-client").then((mod) => ({ default: mod.ExcelToPDFClient })),
  {
    loading: () => <ToolPageSkeleton />,
    ssr: false,
  }
);

export default function ExcelToPDFPage() {
  return <ExcelToPDFClient />;
}