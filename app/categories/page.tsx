import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { EmptyState, PageSection, Pagination } from "@/components/ui";
import { getPagination } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { deleteCategoryAction } from "@/app/categories/actions";

export default async function CategoriesPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; page?: string; pageSize?: string }>;
}) {
  await requireAuth();
  const { error, page: pageParam, pageSize: pageSizeParam } = await searchParams;
  const { page, pageSize, skip } = getPagination(pageParam, pageSizeParam);

  const [totalCategories, categories] = await prisma.$transaction([
    prisma.category.count(),
    prisma.category.findMany({
      orderBy: { updatedAt: "desc" },
      skip,
      take: pageSize,
      include: {
        createdBy: {
          select: {
            name: true
          }
        }
      }
    })
  ]);

  const categoryUsage = await prisma.product.groupBy({
    by: ["category"],
    where: {
      category: {
        in: categories.map((category) => category.slug)
      }
    },
    _count: {
      _all: true
    }
  });

  const usageMap = new Map(categoryUsage.map((item) => [item.category, item._count._all]));

  return (
    <AdminShell
      title="Categories"
      description="Admin-managed category dictionary used to normalize legacy product rows."
      currentPath="/categories"
    >
      <PageSection
        title="Category Management"
        description="Paged category reads keep the screen fast and avoid loading unused counts."
        action={
          <Link href="/categories/new" className="button-link">
            New Category
          </Link>
        }
      >
        {error ? <p className="error-text">{error}</p> : null}

        {categories.length === 0 ? (
          <EmptyState
            title="No categories found"
            description="Create categories first so product rows can map to a controlled taxonomy."
          />
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Products</th>
                    <th>Created By</th>
                    <th>Updated</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td>
                        <strong>{category.name}</strong>
                        {category.description ? <div className="muted">{category.description}</div> : null}
                      </td>
                      <td>{category.slug}</td>
                      <td>{usageMap.get(category.slug) ?? 0}</td>
                      <td>{category.createdBy.name}</td>
                      <td>{category.updatedAt.toLocaleString()}</td>
                      <td>
                        <div className="table-actions">
                          <Link href={`/categories/${category.id}/edit`} className="button-link secondary small">
                            Edit
                          </Link>
                          <form action={deleteCategoryAction}>
                            <input type="hidden" name="id" value={category.id} />
                            <button type="submit" className="danger small">
                              Delete
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              basePath="/categories"
              page={page}
              pageSize={pageSize}
              totalItems={totalCategories}
              extraParams={error ? { error } : undefined}
            />
          </>
        )}
      </PageSection>
    </AdminShell>
  );
}
