import dynamic from "next/dynamic";
import { ToolPageSkeleton } from "@/components/skeleton-loader";

const PageNumberingClient = dynamic(
  () => import("./page-numbering-client").then((mod) => ({ default: mod.PageNumberingClient })),
  { loading: () => <ToolPageSkeleton />, ssr: false }
);

export default function PageNumberingPage() {
  return (
    <PageNumberingClient />
  );
}