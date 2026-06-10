"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { ActionForm } from "@/components/action-form";
// uploaders disabled for manual URL fields
import { Button, Card, CardContent, Input, Label, Select, Textarea } from "@/components/ui";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

type AttributeValueDraft = {
  name: string;
  values: string[];
};

type VariantAttributeSelectionDraft = {
  attributeName: string;
  value: string;
};

type VariantDraft = {
  id?: string;
  sku: string;
  title: string;
  price: string;
  oldPrice: string;
  currency: string;
  stockQty: string;
  lowStockAlert: string;
  imageUrl: string;
  sortOrder: string;
  isActive: boolean;
  attributeSelections: VariantAttributeSelectionDraft[];
};

type ProductFormValues = {
  id: string;
  title: string;
  categoryId: string;
  description: string;
  price: string;
  oldPrice: string;
  currency: string;
  stockQty: string;
  imageUrl: string;
  imageUrls: string[];
  isActive: string;
  inStock: string;
  badge?: string;
  tags?: string;
  useCase?: string;
  packQty?: string;
  holeSize?: string;
  sortOrder?: string;
  needsReview?: string;
  rawCategory?: string;
  reviewFlags?: string;
  titleKm?: string;
  categoryLabelKm?: string;
  useCaseKm?: string;
  descriptionKm?: string;
  attributes: AttributeValueDraft[];
  variants: VariantDraft[];
};

type AttributeRowState = {
  key: string;
  name: string;
  values: string;
};

type VariantAttributeState = {
  key: string;
  attributeName: string;
  value: string;
};

type VariantRowState = {
  key: string;
  id?: string;
  sku: string;
  title: string;
  price: string;
  oldPrice: string;
  currency: string;
  stockQty: string;
  lowStockAlert: string;
  imageUrl: string;
  sortOrder: string;
  isActive: boolean;
  attributeSelections: VariantAttributeState[];
};

type ProductFieldState = Omit<
  ProductFormValues,
  "imageUrl" | "imageUrls" | "attributes" | "variants"
> & {
  badge: string;
  tags: string;
  useCase: string;
  packQty: string;
  holeSize: string;
  sortOrder: string;
  needsReview: string;
  rawCategory: string;
  reviewFlags: string;
  titleKm: string;
  categoryLabelKm: string;
  useCaseKm: string;
  descriptionKm: string;
};

type ProductDraftPayload = {
  fields: ProductFieldState;
  mainImageUrl: string;
  galleryImageUrls: string[];
  attributes: Array<{
    name: string;
    values: string;
  }>;
  variants: Array<{
    id?: string;
    sku: string;
    title: string;
    price: string;
    oldPrice: string;
    currency: string;
    stockQty: string;
    lowStockAlert: string;
    imageUrl: string;
    sortOrder: string;
    isActive: boolean;
    attributeSelections: Array<{
      attributeName: string;
      value: string;
    }>;
  }>;
  savedAt: string;
};

function createInitialFieldState(initialValues: ProductFormValues): ProductFieldState {
  return {
    id: initialValues.id,
    title: initialValues.title,
    categoryId: initialValues.categoryId,
    description: initialValues.description,
    price: initialValues.price,
    oldPrice: initialValues.oldPrice,
    currency: initialValues.currency,
    stockQty: initialValues.stockQty,
    isActive: initialValues.isActive,
    inStock: initialValues.inStock,
    badge: initialValues.badge ?? "",
    tags: initialValues.tags ?? "",
    useCase: initialValues.useCase ?? "",
    packQty: initialValues.packQty ?? "",
    holeSize: initialValues.holeSize ?? "",
    sortOrder: initialValues.sortOrder ?? "",
    needsReview: initialValues.needsReview ?? "false",
    rawCategory: initialValues.rawCategory ?? "",
    reviewFlags: initialValues.reviewFlags ?? "",
    titleKm: initialValues.titleKm ?? "",
    categoryLabelKm: initialValues.categoryLabelKm ?? "",
    useCaseKm: initialValues.useCaseKm ?? "",
    descriptionKm: initialValues.descriptionKm ?? ""
  };
}

function createEmptyAttributeRow(): AttributeRowState {
  return {
    key: nanoid(),
    name: "",
    values: ""
  };
}

function createEmptyVariantAttribute(): VariantAttributeState {
  return {
    key: nanoid(),
    attributeName: "",
    value: ""
  };
}

function createEmptyVariantRow(): VariantRowState {
  return {
    key: nanoid(),
    sku: "",
    title: "",
    price: "",
    oldPrice: "",
    currency: "USD",
    stockQty: "0",
    lowStockAlert: "5",
    imageUrl: "",
    sortOrder: "0",
    isActive: true,
    attributeSelections: [createEmptyVariantAttribute()]
  };
}

function ProductSubmitButton({
  mode
}: {
  mode: "create" | "edit";
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending
        ? mode === "create"
          ? "Creating..."
          : "Saving..."
        : mode === "create"
          ? "Create Product"
          : "Save Changes"}
    </Button>
  );
}

function isBlankVariant(variant: VariantRowState) {
  return (
    !variant.id &&
    !variant.sku.trim() &&
    !variant.title.trim() &&
    !variant.price.trim() &&
    !variant.oldPrice.trim() &&
    !variant.imageUrl.trim() &&
    variant.currency.trim() === "USD" &&
    variant.stockQty.trim() === "0" &&
    variant.lowStockAlert.trim() === "5" &&
    variant.sortOrder.trim() === "0" &&
    variant.attributeSelections.every(
      (selection) => !selection.attributeName.trim() && !selection.value.trim()
    )
  );
}

function buildDraftSnapshot(
  fields: ProductFieldState,
  mainImageUrl: string,
  galleryImageUrls: string[],
  attributes: AttributeRowState[],
  variants: VariantRowState[]
) {
  return {
    fields,
    mainImageUrl,
    galleryImageUrls,
    attributes: attributes.map((attribute) => ({
      name: attribute.name,
      values: attribute.values
    })),
    variants: variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      title: variant.title,
      price: variant.price,
      oldPrice: variant.oldPrice,
      currency: variant.currency,
      stockQty: variant.stockQty,
      lowStockAlert: variant.lowStockAlert,
      imageUrl: variant.imageUrl,
      sortOrder: variant.sortOrder,
      isActive: variant.isActive,
      attributeSelections: variant.attributeSelections.map((selection) => ({
        attributeName: selection.attributeName,
        value: selection.value
      }))
    }))
  };
}

export function ProductForm({
  action,
  categories,
  mode,
  error,
  initialValues
}: {
  action: (formData: FormData) => void | Promise<void>;
  categories: CategoryOption[];
  mode: "create" | "edit";
  error?: string;
  initialValues: ProductFormValues;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const initialFieldState = useMemo(() => createInitialFieldState(initialValues), [initialValues]);
  const [fields, setFields] = useState<ProductFieldState>(initialFieldState);
  const [mainImageUrl, setMainImageUrl] = useState(initialValues.imageUrl);
  const [galleryImageUrls, setGalleryImageUrls] = useState(initialValues.imageUrls);
  const [attributes, setAttributes] = useState<AttributeRowState[]>(
    initialValues.attributes.length > 0
      ? initialValues.attributes.map((attribute) => ({
          key: nanoid(),
          name: attribute.name,
          values: attribute.values.join(", ")
        }))
      : [createEmptyAttributeRow()]
  );
  const [variants, setVariants] = useState<VariantRowState[]>(
    initialValues.variants.length > 0
      ? initialValues.variants.map((variant) => ({
          key: nanoid(),
          id: variant.id,
          sku: variant.sku,
          title: variant.title,
          price: variant.price,
          oldPrice: variant.oldPrice,
          currency: variant.currency,
          stockQty: variant.stockQty,
          lowStockAlert: variant.lowStockAlert,
          imageUrl: variant.imageUrl,
          sortOrder: variant.sortOrder,
          isActive: variant.isActive,
          attributeSelections:
            variant.attributeSelections.length > 0
              ? variant.attributeSelections.map((selection) => ({
                  key: nanoid(),
                  attributeName: selection.attributeName,
                  value: selection.value
                }))
              : [createEmptyVariantAttribute()]
        }))
      : []
  );
  const [restoredDraftAt, setRestoredDraftAt] = useState<string | null>(null);
  const [savedDraftAt, setSavedDraftAt] = useState<string | null>(null);
  const [draftReady, setDraftReady] = useState(false);
  const tempId = useMemo(() => nanoid(10), []);
  const entityId = fields.id.trim() || tempId;
  const draftStorageKey = useMemo(
    () => `eco-bright:product-draft:${mode}:${initialValues.id || "new"}`,
    [initialValues.id, mode]
  );
  const initialSnapshot = useMemo(
    () =>
      JSON.stringify(
        buildDraftSnapshot(
          initialFieldState,
          initialValues.imageUrl,
          initialValues.imageUrls,
          initialValues.attributes.length > 0
            ? initialValues.attributes.map((attribute) => ({
                key: "initial",
                name: attribute.name,
                values: attribute.values.join(", ")
              }))
            : [createEmptyAttributeRow()],
          initialValues.variants.length > 0
            ? initialValues.variants.map((variant) => ({
                key: "initial",
                id: variant.id,
                sku: variant.sku,
                title: variant.title,
                price: variant.price,
                oldPrice: variant.oldPrice,
                currency: variant.currency,
                stockQty: variant.stockQty,
                lowStockAlert: variant.lowStockAlert,
                imageUrl: variant.imageUrl,
                sortOrder: variant.sortOrder,
                isActive: variant.isActive,
                attributeSelections:
                  variant.attributeSelections.length > 0
                    ? variant.attributeSelections.map((selection) => ({
                        key: "initial",
                        attributeName: selection.attributeName,
                        value: selection.value
                      }))
                    : [createEmptyVariantAttribute()]
              }))
            : []
        )
      ),
    [initialFieldState, initialValues]
  );
  const currentSnapshot = useMemo(
    () =>
      JSON.stringify(
        buildDraftSnapshot(fields, mainImageUrl, galleryImageUrls, attributes, variants)
      ),
    [attributes, fields, galleryImageUrls, mainImageUrl, variants]
  );
  const isDirty = currentSnapshot !== initialSnapshot;

  const selectedCategory = categories.find((category) => category.id === fields.categoryId);

  useEffect(() => {
    const rawDraft = window.sessionStorage.getItem(draftStorageKey);

    if (!rawDraft) {
      setDraftReady(true);
      return;
    }

    try {
      const draft = JSON.parse(rawDraft) as ProductDraftPayload;
      setFields(draft.fields);
      setMainImageUrl(draft.mainImageUrl);
      setGalleryImageUrls(draft.galleryImageUrls);
      setAttributes(
        draft.attributes.length > 0
          ? draft.attributes.map((attribute) => ({
              key: nanoid(),
              name: attribute.name,
              values: attribute.values
            }))
          : [createEmptyAttributeRow()]
      );
      setVariants(
        draft.variants.map((variant) => ({
          key: nanoid(),
          id: variant.id,
          sku: variant.sku,
          title: variant.title,
          price: variant.price,
          oldPrice: variant.oldPrice,
          currency: variant.currency,
          stockQty: variant.stockQty,
          lowStockAlert: variant.lowStockAlert,
          imageUrl: variant.imageUrl,
          sortOrder: variant.sortOrder,
          isActive: variant.isActive,
          attributeSelections:
            variant.attributeSelections.length > 0
              ? variant.attributeSelections.map((selection) => ({
                  key: nanoid(),
                  attributeName: selection.attributeName,
                  value: selection.value
                }))
              : [createEmptyVariantAttribute()]
        }))
      );
      setRestoredDraftAt(draft.savedAt);
      setSavedDraftAt(draft.savedAt);
    } catch {
      window.sessionStorage.removeItem(draftStorageKey);
    }

    setDraftReady(true);
  }, [draftStorageKey]);

  useEffect(() => {
    if (!draftReady) {
      return;
    }

    const payload: ProductDraftPayload = {
      ...buildDraftSnapshot(fields, mainImageUrl, galleryImageUrls, attributes, variants),
      savedAt: new Date().toISOString()
    };

    window.sessionStorage.setItem(draftStorageKey, JSON.stringify(payload));
    setSavedDraftAt(payload.savedAt);
  }, [attributes, draftReady, draftStorageKey, fields, galleryImageUrls, mainImageUrl, variants]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  function updateField<K extends keyof ProductFieldState>(field: K, value: ProductFieldState[K]) {
    setFields((current) => ({
      ...current,
      [field]: value
    }));
  }

  function clearLocalDraft() {
    window.sessionStorage.removeItem(draftStorageKey);
    setRestoredDraftAt(null);
    setSavedDraftAt(null);
  }

  const serializedAttributes = JSON.stringify(
    attributes
      .map((attribute) => ({
        name: attribute.name.trim(),
        values: attribute.values
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      }))
      .filter((attribute) => attribute.name || attribute.values.length > 0)
  );

  const serializedVariants = JSON.stringify(
    variants
      .filter((variant) => !isBlankVariant(variant))
      .map((variant) => ({
        id: variant.id,
        sku: variant.sku.trim(),
        title: variant.title.trim(),
        price: variant.price,
        oldPrice: variant.oldPrice.trim() ? variant.oldPrice : null,
        currency: variant.currency.trim() || "USD",
        stockQty: variant.stockQty,
        lowStockAlert: variant.lowStockAlert,
        imageUrl: variant.imageUrl.trim(),
        sortOrder: variant.sortOrder.trim() ? variant.sortOrder : null,
        isActive: variant.isActive,
        attributeSelections: variant.attributeSelections
          .map((selection) => ({
            attributeName: selection.attributeName.trim(),
            value: selection.value.trim()
          }))
          .filter((selection) => selection.attributeName || selection.value)
      }))
  );

  function updateAttributeRow(key: string, field: "name" | "values", value: string) {
    setAttributes((current) =>
      current.map((attribute) =>
        attribute.key === key ? { ...attribute, [field]: value } : attribute
      )
    );
  }

  function removeAttributeRow(key: string) {
    setAttributes((current) =>
      current.length === 1 ? [createEmptyAttributeRow()] : current.filter((item) => item.key !== key)
    );
  }

  function updateVariantRow(
    key: string,
    field:
      | "sku"
      | "title"
      | "price"
      | "oldPrice"
      | "currency"
      | "stockQty"
      | "lowStockAlert"
      | "imageUrl"
      | "sortOrder",
    value: string
  ) {
    setVariants((current) =>
      current.map((variant) =>
        variant.key === key ? { ...variant, [field]: value } : variant
      )
    );
  }

  function updateVariantActive(key: string, isActive: boolean) {
    setVariants((current) =>
      current.map((variant) => (variant.key === key ? { ...variant, isActive } : variant))
    );
  }

  function updateVariantAttribute(
    variantKey: string,
    selectionKey: string,
    field: "attributeName" | "value",
    value: string
  ) {
    setVariants((current) =>
      current.map((variant) =>
        variant.key === variantKey
          ? {
              ...variant,
              attributeSelections: variant.attributeSelections.map((selection) =>
                selection.key === selectionKey ? { ...selection, [field]: value } : selection
              )
            }
          : variant
      )
    );
  }

  function addVariantAttribute(variantKey: string) {
    setVariants((current) =>
      current.map((variant) =>
        variant.key === variantKey
          ? {
              ...variant,
              attributeSelections: [...variant.attributeSelections, createEmptyVariantAttribute()]
            }
          : variant
      )
    );
  }

  function removeVariantAttribute(variantKey: string, selectionKey: string) {
    setVariants((current) =>
      current.map((variant) => {
        if (variant.key !== variantKey) {
          return variant;
        }

        const nextSelections = variant.attributeSelections.filter(
          (selection) => selection.key !== selectionKey
        );

        return {
          ...variant,
          attributeSelections:
            nextSelections.length > 0 ? nextSelections : [createEmptyVariantAttribute()]
        };
      })
    );
  }

  function removeVariantRow(key: string) {
    setVariants((current) => current.filter((variant) => variant.key !== key));
  }

  return (
    <ActionForm
      action={action}
      ref={formRef}
      className="space-y-6"
      pendingTitle={mode === "create" ? "Creating product" : "Saving product"}
      pendingDescription="Images, product details, variants, and stock settings are being saved."
    >
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <AlertCircle className="h-4 w-4 text-slate-500" />
          <span>
            {isDirty
              ? "Unsaved changes detected. Draft is being saved locally."
              : "Draft is synced locally for this session."}
          </span>
          {savedDraftAt ? (
            <span className="text-slate-400">
              {new Date(savedDraftAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              })}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {restoredDraftAt ? <span>Restored local draft.</span> : null}
          <Button type="button" variant="outline" size="sm" onClick={clearLocalDraft}>
            Clear Draft
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {/* Image fields (uploader disabled) */}
      <input type="hidden" name="attributesPayload" value={serializedAttributes} />
      <input type="hidden" name="variantsPayload" value={serializedVariants} />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardContent className="space-y-5 p-6">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="id">Product ID</Label>
                  <Input
                    id="id"
                    name="id"
                    value={fields.id}
                    onChange={(event) => updateField("id", event.target.value)}
                    readOnly={mode === "edit"}
                    className={mode === "edit" ? "bg-slate-50" : undefined}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={fields.title}
                    onChange={(event) => updateField("title", event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category</Label>
                  <Select
                    id="categoryId"
                    name="categoryId"
                    value={fields.categoryId}
                    onChange={(event) => updateField("categoryId", event.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryValue">Category Slug</Label>
                  <Input id="categoryValue" value={selectedCategory?.slug ?? ""} readOnly className="bg-slate-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryLabel">Category Label</Label>
                  <Input id="categoryLabel" value={selectedCategory?.name ?? ""} readOnly className="bg-slate-50" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={fields.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  rows={5}
                  required
                />
              </div>

              <div className="grid gap-5 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Base Price</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={fields.price}
                    onChange={(event) => updateField("price", event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oldPrice">Base Old Price</Label>
                  <Input
                    id="oldPrice"
                    name="oldPrice"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={fields.oldPrice}
                    onChange={(event) => updateField("oldPrice", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    name="currency"
                    value={fields.currency}
                    onChange={(event) => updateField("currency", event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stockQty">Base Stock</Label>
                  <Input
                    id="stockQty"
                    name="stockQty"
                    type="number"
                    min="0"
                    step="1"
                    value={fields.stockQty}
                    onChange={(event) => updateField("stockQty", event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="inStock">In Stock</Label>
                  <Select
                    id="inStock"
                    name="inStock"
                    value={fields.inStock}
                    onChange={(event) => updateField("inStock", event.target.value)}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isActive">Active</Label>
                  <Select
                    id="isActive"
                    name="isActive"
                    value={fields.isActive}
                    onChange={(event) => updateField("isActive", event.target.value)}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="needsReview">Needs Review</Label>
                  <Select
                    id="needsReview"
                    name="needsReview"
                    value={fields.needsReview}
                    onChange={(event) => updateField("needsReview", event.target.value)}
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </Select>
                </div>
              </div>

              <p className="text-sm text-slate-500">
                Base price and base stock remain on the parent product for compatibility. When variants
                exist, variant stock becomes the source of truth.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Attributes</h3>
                  <p className="text-sm text-slate-500">
                    Define reusable attributes and values such as Wattage or Color Temperature.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAttributes((current) => [...current, createEmptyAttributeRow()])}
                >
                  <Plus className="h-4 w-4" />
                  Add Attribute
                </Button>
              </div>

              <div className="space-y-4">
                {attributes.map((attribute) => (
                  <div key={attribute.key} className="grid gap-4 rounded-2xl border border-slate-200 p-4 md:grid-cols-[1fr_1.4fr_auto]">
                    <div className="space-y-2">
                      <Label>Attribute Name</Label>
                      <Input
                        value={attribute.name}
                        onChange={(event) => updateAttributeRow(attribute.key, "name", event.target.value)}
                        placeholder="Wattage"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Values</Label>
                      <Input
                        value={attribute.values}
                        onChange={(event) => updateAttributeRow(attribute.key, "values", event.target.value)}
                        placeholder="100W, 200W"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button type="button" variant="secondary" size="icon" onClick={() => removeAttributeRow(attribute.key)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Variants</h3>
                  <p className="text-sm text-slate-500">
                    Create sellable options one by one. SKU is optional, but unique when present.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setVariants((current) => [...current, createEmptyVariantRow()])}
                >
                  <Plus className="h-4 w-4" />
                  Add Variant
                </Button>
              </div>

              {variants.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  No variants yet. Create a variant when price or stock should differ by option.
                </div>
              ) : (
                <div className="space-y-4">
                  {variants.map((variant, variantIndex) => (
                    <div key={variant.key} className="space-y-4 rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900">
                            Variant {variantIndex + 1}
                          </h4>
                          {variant.id ? (
                            <p className="text-xs text-slate-500">Existing variant keeps its history and ID.</p>
                          ) : null}
                        </div>
                        <Button type="button" variant="secondary" size="icon" onClick={() => removeVariantRow(variant.key)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                        <div className="space-y-2">
                          <Label>SKU</Label>
                          <Input
                            value={variant.sku}
                            onChange={(event) => updateVariantRow(variant.key, "sku", event.target.value)}
                            placeholder="SFL-100W-6500K"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            value={variant.title}
                            onChange={(event) => updateVariantRow(variant.key, "title", event.target.value)}
                            placeholder="100W / 6500K"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Price</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={variant.price}
                            onChange={(event) => updateVariantRow(variant.key, "price", event.target.value)}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Old Price</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={variant.oldPrice}
                            onChange={(event) => updateVariantRow(variant.key, "oldPrice", event.target.value)}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Currency</Label>
                          <Input
                            value={variant.currency}
                            onChange={(event) => updateVariantRow(variant.key, "currency", event.target.value)}
                            placeholder="USD"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div className="space-y-2">
                          <Label>Stock Qty</Label>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            value={variant.stockQty}
                            onChange={(event) => updateVariantRow(variant.key, "stockQty", event.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Low Stock Alert</Label>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            value={variant.lowStockAlert}
                            onChange={(event) =>
                              updateVariantRow(variant.key, "lowStockAlert", event.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Sort Order</Label>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            value={variant.sortOrder}
                            onChange={(event) => updateVariantRow(variant.key, "sortOrder", event.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Active</Label>
                          <Select
                            value={String(variant.isActive)}
                            onChange={(event) =>
                              updateVariantActive(variant.key, event.target.value === "true")
                            }
                          >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </Select>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-1">
                        <div className="space-y-2">
                          <Label>Image URL</Label>
                          <Input
                            value={variant.imageUrl}
                            onChange={(event) => updateVariantRow(variant.key, "imageUrl", event.target.value)}
                            placeholder="https://..."
                          />
                        </div>
                      </div>

                      <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h5 className="text-sm font-semibold text-slate-900">Variant Attributes</h5>
                            <p className="text-xs text-slate-500">
                              Assign reusable attribute values such as 100W and 6500K.
                            </p>
                          </div>
                          <Button type="button" variant="outline" size="sm" onClick={() => addVariantAttribute(variant.key)}>
                            <Plus className="h-4 w-4" />
                            Add Pair
                          </Button>
                        </div>

                        {variant.attributeSelections.map((selection) => (
                          <div key={selection.key} className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                            <div className="space-y-2">
                              <Label>Attribute Name</Label>
                              <Input
                                value={selection.attributeName}
                                onChange={(event) =>
                                  updateVariantAttribute(
                                    variant.key,
                                    selection.key,
                                    "attributeName",
                                    event.target.value
                                  )
                                }
                                placeholder="Wattage"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Attribute Value</Label>
                              <Input
                                value={selection.value}
                                onChange={(event) =>
                                  updateVariantAttribute(
                                    variant.key,
                                    selection.key,
                                    "value",
                                    event.target.value
                                  )
                                }
                                placeholder="100W"
                              />
                            </div>
                            <div className="flex items-end">
                              <Button
                                type="button"
                                variant="secondary"
                                size="icon"
                                onClick={() => removeVariantAttribute(variant.key, selection.key)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="space-y-5 p-6">
              <div className="grid gap-5 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="badge">Badge</Label>
                  <Input id="badge" name="badge" value={fields.badge} onChange={(event) => updateField("badge", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input id="tags" name="tags" value={fields.tags} onChange={(event) => updateField("tags", event.target.value)} placeholder="Comma-separated" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="useCase">Use Case</Label>
                  <Input id="useCase" name="useCase" value={fields.useCase} onChange={(event) => updateField("useCase", event.target.value)} />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="packQty">Pack Qty</Label>
                  <Input id="packQty" name="packQty" type="number" min="1" step="1" value={fields.packQty} onChange={(event) => updateField("packQty", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="holeSize">Hole Size</Label>
                  <Input id="holeSize" name="holeSize" value={fields.holeSize} onChange={(event) => updateField("holeSize", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input id="sortOrder" name="sortOrder" type="number" step="1" value={fields.sortOrder} onChange={(event) => updateField("sortOrder", event.target.value)} />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rawCategory">Raw Category</Label>
                  <Input id="rawCategory" name="rawCategory" value={fields.rawCategory} onChange={(event) => updateField("rawCategory", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reviewFlags">Review Flags</Label>
                  <Input id="reviewFlags" name="reviewFlags" value={fields.reviewFlags} onChange={(event) => updateField("reviewFlags", event.target.value)} placeholder="Comma-separated" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="space-y-5 p-6">
              <div className="grid gap-5 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="titleKm">Khmer Title</Label>
                  <Input id="titleKm" name="titleKm" value={fields.titleKm} onChange={(event) => updateField("titleKm", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryLabelKm">Khmer Category Label</Label>
                  <Input id="categoryLabelKm" name="categoryLabelKm" value={fields.categoryLabelKm} onChange={(event) => updateField("categoryLabelKm", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="useCaseKm">Khmer Use Case</Label>
                  <Input id="useCaseKm" name="useCaseKm" value={fields.useCaseKm} onChange={(event) => updateField("useCaseKm", event.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descriptionKm">Khmer Description</Label>
                <Textarea id="descriptionKm" name="descriptionKm" value={fields.descriptionKm} onChange={(event) => updateField("descriptionKm", event.target.value)} rows={4} />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-3">
            <ProductSubmitButton mode={mode} />
            <Button asChild variant="outline">
              <Link href="/products" onClick={clearLocalDraft}>Cancel</Link>
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <Label htmlFor="image_url">Main Image URL</Label>
                <Input
                  id="image_url"
                  name="image_url"
                  value={mainImageUrl}
                  onChange={(event) => setMainImageUrl(event.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_urls">Gallery Image URLs (comma-separated)</Label>
                <Textarea
                  id="image_urls"
                  name="image_urls"
                  value={galleryImageUrls.join(", ")}
                  onChange={(event) =>
                    setGalleryImageUrls(
                      event.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    )
                  }
                  rows={4}
                  placeholder="https://..., https://..."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ActionForm>
  );
}
