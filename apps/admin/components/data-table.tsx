import { EmptyState } from "@/components/empty-state";

export function DataTable({
  empty,
  children
}: {
  empty?: {
    title: string;
    description: string;
    action?: React.ReactNode;
  };
  children: React.ReactNode;
}) {
  if (empty) {
    return (
      <EmptyState
        title={empty.title}
        description={empty.description}
        action={empty.action}
      />
    );
  }

  return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">{children}</div>;
}
