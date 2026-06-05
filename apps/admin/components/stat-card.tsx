import { Card, CardContent } from "@/components/ui";

export function StatCard({
  label,
  value,
  hint,
  icon
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="space-y-3 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
          </div>
          {icon ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
              {icon}
            </div>
          ) : null}
        </div>
        {hint ? <p className="text-sm text-slate-500">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
