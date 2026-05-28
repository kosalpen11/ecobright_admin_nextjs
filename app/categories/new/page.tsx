import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { requireAuth } from "@/lib/session";
import { createCategoryAction } from "@/app/categories/actions";

export default async function NewCategoryPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAuth();
  const { error } = await searchParams;

  return (
    <AdminShell title="New Category" currentPath="/categories">
      <div className="panel">
        <form action={createCategoryAction} className="form-grid">
          <div className="form-columns">
            <div className="form-row">
              <label htmlFor="name">Name</label>
              <input id="name" name="name" required />
            </div>
            <div className="form-row">
              <label htmlFor="slug">Slug</label>
              <input id="slug" name="slug" required />
            </div>
          </div>

          <div className="form-row">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" rows={4} />
          </div>

          {error ? <p className="error-text">{error}</p> : null}

          <div className="table-actions">
            <button type="submit">Save Category</button>
            <Link href="/categories" className="button-link secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
