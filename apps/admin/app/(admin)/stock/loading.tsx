import { LoadingCard } from "@/components/page-shell";

export default function StockLoading() {
  return (
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <LoadingCard rows={8} />
      <LoadingCard rows={8} />
    </div>
  );
}
