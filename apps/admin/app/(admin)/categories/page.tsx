import Link from "next/link";
import { db } from "@eco-bright/db";
import { deleteCategoryAction } from "@/actions/categories";
import { RowActionMenu } from "@/components/row-action-menu";
import { DataPagination, EmptyState, PageHeader, QueryError, SectionCard } from "@/components/page-shell";
import { Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { getPagination } from "@/lib/pagination";

export default async function CategoriesPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; page?: string; pageSize?: string }>;
}) {
  const { error, page: pageParam, pageSize: pageSizeParam } = await searchParams;
  const { page, pageSize, skip } = getPagination(pageParam, pageSizeParam);

  const [totalCategories, categories] = await Promise.all([
    db.category.count(),
    db.category.findMany({
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

  const categoryUsage = await db.product.groupBy({
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
    <>
      <PageHeader
        title="Categories"
        description="Admin-managed category dictionary used to normalize legacy product rows."
        action={
          <Button asChild>
            <Link href="/categories/new" className="!text-white">
              New Category
            </Link>
          </Button>
        }
      />

      <SectionCard
        title="Category Management"
        description="Keep taxonomy edits contained to a small, paged working set."
      >
        <div className="space-y-4">
          <QueryError error={error} />

          {categories.length === 0 ? (
            <EmptyState
              title="No categories found"
              description="Create categories first so product rows can map to a controlled taxonomy."
            />
          ) : (
            <>
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="w-[160px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-slate-900">{category.name}</div>
                            {category.description ? (
                              <div className="text-sm text-slate-500">{category.description}</div>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">{category.slug}</TableCell>
                        <TableCell className="text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <span>{usageMap.get(category.slug) ?? 0}</span>
                            {(usageMap.get(category.slug) ?? 0) > 0 ? (
                              <Badge variant="warning">Referenced</Badge>
                            ) : (
                              <Badge variant="success">Unused</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {category.createdBy.name}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {formatDateTime(category.updatedAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end">
                            <RowActionMenu
                              title="Delete category"
                              editHref={`/categories/${category.id}/edit`}
                              deleteAction={deleteCategoryAction}
                              deleteFields={{ id: category.id }}
                              deleteDescription="This only succeeds when no products still reference this category."
                              deleteDisabled={(usageMap.get(category.slug) ?? 0) > 0}
                              deleteDisabledReason="This category is still referenced by products."
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <DataPagination
                basePath="/categories"
                page={page}
                pageSize={pageSize}
                totalItems={totalCategories}
                extraParams={error ? { error } : undefined}
              />
            </>
          )}
        </div>
      </SectionCard>
    </>
  );
}
