import { LoadingCard } from "@/components/page-shell";

export default function Loading() {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6">
      <div className="w-full max-w-2xl">
        <LoadingCard title="Loading admin" rows={4} />
      </div>
    </div>
  );
}
