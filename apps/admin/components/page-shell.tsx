import Link from "next/link";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTotalPages } from "@/lib/pagination";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

export function PageHeader({
  title,
  description,
  action
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h1>
        {description ? (
          <p className="max-w-2xl text-sm text-slate-500">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex items-center gap-2">{action}</div> : null}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader className="flex flex-col gap-3 border-b border-slate-100 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {action ? <div className="flex items-center gap-2">{action}</div> : null}
      </CardHeader>
      <CardContent className="pt-6">{children}</CardContent>
    </Card>
  );
}

export function StatCard({
  label,
  value,
  hint
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="space-y-2 p-6">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
        {hint ? <p className="text-sm text-slate-500">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

export function EmptyState({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
      <div className="rounded-full bg-white p-3 shadow-sm">
        <Inbox className="h-5 w-5 text-slate-400" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="max-w-md text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}

export function StatusBadge({
  tone = "default",
  children
}: {
  tone?: "default" | "success" | "warning" | "destructive";
  children: React.ReactNode;
}) {
  return <Badge variant={tone}>{children}</Badge>;
}

export function QueryError({ error }: { error?: string }) {
  if (!error) {
    return null;
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {error}
    </div>
  );
}

export function DataPagination({
  basePath,
  page,
  pageSize,
  totalItems,
  extraParams
}: {
  basePath: string;
  page: number;
  pageSize: number;
  totalItems: number;
  extraParams?: Record<string, string | undefined>;
}) {
  const totalPages = getTotalPages(totalItems, pageSize);
  const currentPage = Math.min(page, totalPages);
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  function getHref(targetPage: number) {
    const params = new URLSearchParams();
    params.set("page", String(targetPage));
    params.set("pageSize", String(pageSize));

    Object.entries(extraParams ?? {}).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    return `${basePath}?${params.toString()}`;
  }

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Showing {start}-{end} of {totalItems}
      </p>
      <div className="flex items-center gap-2">
        {canGoPrevious ? (
          <Button asChild variant="outline" size="sm">
            <Link href={getHref(currentPage - 1)}>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
        )}
        <span className="text-sm text-slate-500">
          Page {currentPage} of {totalPages}
        </span>
        {canGoNext ? (
          <Button asChild variant="outline" size="sm">
            <Link href={getHref(currentPage + 1)}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function LoadingCard({
  title = "Loading",
  rows = 3
}: {
  title?: string;
  rows?: number;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="h-5 w-40 animate-pulse rounded-md bg-slate-200" />
        <div className="h-4 w-64 animate-pulse rounded-md bg-slate-100" />
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={`${title}-${index}`}
            className="h-12 animate-pulse rounded-xl bg-slate-100"
          />
        ))}
      </CardContent>
    </Card>
  );
}
