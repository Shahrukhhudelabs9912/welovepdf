import dynamic from "next/dynamic";
import { ToolPageSkeleton } from "@/components/skeleton-loader";

const WordToPDFClient = dynamic(
  () => import("./word-to-pdf-client").then((mod) => ({ default: mod.WordToPDFClient })),
  {
    loading: () => <ToolPageSkeleton />,
    ssr: false,
  }
);

export default function WordToPDFPage() {
  return (
    <WordToPDFClient />
  );
}