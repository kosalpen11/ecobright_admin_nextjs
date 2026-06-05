"use client";

import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { createStockMovementAction } from "@/actions/stock";
import { ActionForm } from "@/components/action-form";
import { LoadingButton } from "@/components/loading-button";
import { QueryError } from "@/components/page-shell";
import { Button, Input, Select, Textarea } from "@/components/ui";

type StockFormProduct = {
  id: string;
  title: string;
  stockQty: number;
  variants: Array<{
    id: string;
    sku: string | null;
    stockQty: number;
    attributeLinks: Array<{
      productAttributeValue: {
        value: string;
      };
    }>;
  }>;
};

function getVariantLabel(variant: StockFormProduct["variants"][number]) {
  const labels = variant.attributeLinks.map((link) => link.productAttributeValue.value);
  return labels.length > 0 ? labels.join(" / ") : variant.sku || "Variant";
}

export function StockMovementForm({
  products,
  error
}: {
  products: StockFormProduct[];
  error?: string;
}) {
  const [productId, setProductId] = useState("");
  const [variantId, setVariantId] = useState("");
  const [type, setType] = useState("IN");
  const [quantity, setQuantity] = useState("");
  const [pending, setPending] = useState(false);

  const selectedProduct = products.find((product) => product.id === productId);
  const selectedVariant = selectedProduct?.variants.find((variant) => variant.id === variantId);
  const currentStock = selectedVariant?.stockQty ?? selectedProduct?.stockQty ?? 0;
  const showVariantSelect = (selectedProduct?.variants.length ?? 0) > 0;
  const showOutWarning =
    type === "OUT" && quantity.trim() !== "" && Number(quantity) > currentStock;

  const variantOptions = useMemo(
    () =>
      selectedProduct?.variants.map((variant) => ({
        id: variant.id,
        label: getVariantLabel(variant),
        stockQty: variant.stockQty
      })) ?? [],
    [selectedProduct]
  );

  async function submit(formData: FormData) {
    setPending(true);
    try {
      await createStockMovementAction(formData);
    } finally {
      setPending(false);
    }
  }

  return (
    <ActionForm
      action={submit}
      className="space-y-4"
      pendingTitle="Saving stock movement"
      pendingDescription="Stock levels and movement history are being updated."
    >
      <div className="space-y-2">
        <label htmlFor="productId" className="text-sm font-medium text-slate-700">
          Product
        </label>
        <Select
          id="productId"
          name="productId"
          value={productId}
          onChange={(event) => {
            setProductId(event.target.value);
            setVariantId("");
          }}
          required
        >
          <option value="" disabled>
            Select a product
          </option>
          {products.map((item) => {
            const totalStock =
              item.variants.length > 0
                ? item.variants.reduce((sum, variant) => sum + variant.stockQty, 0)
                : item.stockQty;

            return (
              <option key={item.id} value={item.id}>
                {item.title} ({item.id}) - {totalStock} in stock
              </option>
            );
          })}
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="productVariantId" className="text-sm font-medium text-slate-700">
          Variant
        </label>
        <Select
          id="productVariantId"
          name="productVariantId"
          value={variantId}
          onChange={(event) => setVariantId(event.target.value)}
          disabled={!showVariantSelect}
        >
          <option value="">
            {showVariantSelect ? "Select a variant" : "No variants for this product"}
          </option>
          {variantOptions.map((variant) => (
            <option key={variant.id} value={variant.id}>
              {variant.label} ({variant.stockQty} in stock)
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="type" className="text-sm font-medium text-slate-700">
            Type
          </label>
          <Select id="type" name="type" value={type} onChange={(event) => setType(event.target.value)} required>
            <option value="IN">IN</option>
            <option value="OUT">OUT</option>
            <option value="ADJUSTMENT">ADJUST</option>
          </Select>
        </div>
        <div className="space-y-2">
          <label htmlFor="quantity" className="text-sm font-medium text-slate-700">
            Quantity
          </label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            required
          />
        </div>
      </div>

      {selectedProduct ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Current stock: <span className="font-medium text-slate-900">{currentStock}</span>
        </div>
      ) : null}

      {showOutWarning ? (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>OUT quantity is larger than current stock. The server will reject this movement.</span>
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="note" className="text-sm font-medium text-slate-700">
          Note
        </label>
        <Textarea id="note" name="note" rows={4} />
      </div>

      <QueryError error={error} />

      <div className="flex items-center gap-3">
        <LoadingButton type="submit" loading={pending}>
          Save Movement
        </LoadingButton>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => {
            setProductId("");
            setVariantId("");
            setType("IN");
            setQuantity("");
          }}
        >
          Reset
        </Button>
      </div>
    </ActionForm>
  );
}
