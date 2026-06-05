import { Inbox } from "lucide-react";
import { Button } from "@/components/ui";

export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-8 text-center">
      <div className="rounded-full bg-white p-3 shadow-sm">
        <Inbox className="h-5 w-5 text-slate-400" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="max-w-md text-sm text-slate-500">{description}</p>
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
