import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { updateCategoryAction } from "@/app/categories/actions";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

export default async function EditCategoryPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAuth();
  const [{ id }, { error }] = await Promise.all([params, searchParams]);
  const category = await prisma.category.findUnique({
    where: { id }
  });

  if (!category) {
    notFound();
  }

  return (
    <AdminShell title="Edit Category" currentPath="/categories">
      <div className="panel">
        <form action={updateCategoryAction.bind(null, category.id)} className="form-grid">
          <div className="form-columns">
            <div className="form-row">
              <label htmlFor="name">Name</label>
              <input id="name" name="name" defaultValue={category.name} required />
            </div>
            <div className="form-row">
              <label htmlFor="slug">Slug</label>
              <input id="slug" name="slug" defaultValue={category.slug} required />
            </div>
          </div>

          <div className="form-row">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={category.description ?? ""}
            />
          </div>

          {error ? <p className="error-text">{error}</p> : null}

          <div className="table-actions">
            <button type="submit">Update Category</button>
            <Link href="/categories" className="button-link secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
