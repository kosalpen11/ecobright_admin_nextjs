import Link from "next/link";

export function PageSection({
  title,
  description,
  action,
  children
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="panel stack panel-surface">
      <div className="section-header">
        <div className="stack stack-tight">
          <h2 className="section-title">{title}</h2>
          {description ? <p className="section-description">{description}</p> : null}
        </div>
        {action ? <div className="section-action">{action}</div> : null}
      </div>
      {children}
    </section>
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
    <div className="panel stat-card">
      <p className="stat-label">{label}</p>
      <div className="stat-value">{value}</div>
      {hint ? <p className="stat-hint">{hint}</p> : null}
    </div>
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
    <div className="empty-state">
      <h3>{title}</h3>
      <p className="muted">{description}</p>
    </div>
  );
}

export function StatusPill({
  tone,
  children
}: {
  tone: "default" | "success" | "warning" | "danger";
  children: React.ReactNode;
}) {
  return <span className={`status-pill status-${tone}`}>{children}</span>;
}

export function Pagination({
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
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const previousPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);
  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

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
    <div className="pagination">
      <p className="muted pagination-meta">
        Showing {start}-{end} of {totalItems}
      </p>
      <div className="pagination-controls">
        {canGoPrevious ? (
          <Link href={getHref(previousPage)} className="button-link secondary small">
            Previous
          </Link>
        ) : (
          <span className="button-link secondary small disabled">Previous</span>
        )}
        <span className="pagination-page">
          Page {page} of {totalPages}
        </span>
        {canGoNext ? (
          <Link href={getHref(nextPage)} className="button-link secondary small">
            Next
          </Link>
        ) : (
          <span className="button-link secondary small disabled">Next</span>
        )}
      </div>
    </div>
  );
}

export function LoadingBlock({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="panel loading-panel">
      <div className="skeleton-line skeleton-title" />
      <div className="skeleton-grid">
        <div className="skeleton-line" />
        <div className="skeleton-line" />
        <div className="skeleton-line" />
      </div>
      <p className="muted">{label}</p>
    </div>
  );
}
