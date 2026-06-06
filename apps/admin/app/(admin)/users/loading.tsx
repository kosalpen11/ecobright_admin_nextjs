import { LoadingCard } from "@/components/page-shell";

export default function UsersLoading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <LoadingCard rows={2} />
        <LoadingCard rows={2} />
        <LoadingCard rows={2} />
        <LoadingCard rows={2} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <LoadingCard rows={6} />
        <LoadingCard rows={8} />
      </div>
    </div>
  );
}
