import Link from "next/link";
import { createCategoryAction } from "@/actions/categories";
import { AdminShell } from "@/components/admin-shell";
import { PageHeader, QueryError, SectionCard } from "@/components/page-shell";
import { Button, Input, Textarea } from "@/components/ui";
import { requireAuth } from "@/lib/session";

export default async function NewCategoryPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAuth();
  const { error } = await searchParams;

  return (
    <AdminShell currentPath="/categories">
      <PageHeader
        title="New Category"
        description="Create a controlled category row for product normalization."
        action={
          <Button asChild variant="outline">
            <Link href="/categories">Back to Categories</Link>
          </Button>
        }
      />

      <SectionCard title="Category Details" description="Use a stable slug. Product rows reference it directly.">
        <form action={createCategoryAction} className="max-w-2xl space-y-5">
          <QueryError error={error} />

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-slate-700">
              Name
            </label>
            <Input id="name" name="name" required />
          </div>

          <div className="space-y-2">
            <label htmlFor="slug" className="text-sm font-medium text-slate-700">
              Slug
            </label>
            <Input id="slug" name="slug" required placeholder="lighting-accessories" />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-slate-700">
              Description
            </label>
            <Textarea id="description" name="description" rows={4} />
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit">Create Category</Button>
            <Button asChild variant="outline">
              <Link href="/categories">Cancel</Link>
            </Button>
          </div>
        </form>
      </SectionCard>
    </AdminShell>
  );
}
