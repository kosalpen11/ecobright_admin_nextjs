import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@eco-bright/db";
import { updateCategoryAction } from "@/actions/categories";
import { ActionForm } from "@/components/action-form";
import { PageHeader, QueryError, SectionCard } from "@/components/page-shell";
import { Button, Input, Textarea } from "@/components/ui";

export default async function EditCategoryPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const category = await db.category.findUnique({
    where: { id }
  });

  if (!category) {
    notFound();
  }

  const action = updateCategoryAction.bind(null, id);

  return (
    <>
      <PageHeader
        title="Edit Category"
        description="Updating a category also remaps products that reference its slug."
        breadcrumbs={[
          { label: "Categories", href: "/categories" },
          { label: category.name }
        ]}
        action={
          <Button asChild variant="outline">
            <Link href="/categories">Back to Categories</Link>
          </Button>
        }
      />

      <SectionCard title="Category Details" description="Keep the slug stable unless you intend to remap products.">
        <ActionForm
          action={action}
          className="max-w-2xl space-y-5"
          pendingTitle="Saving category"
          pendingDescription="Category details and linked product mappings are being updated."
        >
          <QueryError error={error} />

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-slate-700">
              Name
            </label>
            <Input id="name" name="name" defaultValue={category.name} required />
          </div>

          <div className="space-y-2">
            <label htmlFor="slug" className="text-sm font-medium text-slate-700">
              Slug
            </label>
            <Input id="slug" name="slug" defaultValue={category.slug} required />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-slate-700">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              defaultValue={category.description ?? ""}
              rows={4}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit">Save Changes</Button>
            <Button asChild variant="outline">
              <Link href="/categories">Cancel</Link>
            </Button>
          </div>
        </ActionForm>
      </SectionCard>
    </>
  );
}
