import { LoadingBlock } from "@/components/ui";

export default function StockLoading() {
  return (
    <div className="grid" style={{ gridTemplateColumns: "minmax(320px, 420px) minmax(0, 1fr)" }}>
      <LoadingBlock label="Loading stock form..." />
      <LoadingBlock label="Loading stock history..." />
    </div>
  );
}
