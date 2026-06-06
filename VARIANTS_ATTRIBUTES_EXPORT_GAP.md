# Variants & Attributes Export Gap

## Current Finding

The current exported file `products.csv` contains only columns from the `products` table.

Example fields in the CSV:

- `id`
- `title`
- `category`
- `category_label`
- `image_url`
- `image_urls`
- `price`
- `old_price`
- `currency`
- `stock_qty`
- `is_active`

It does **not** include data from:

- `product_variants`
- `product_attributes`
- `product_attribute_values`
- `product_variant_attribute_values`

## What This Means

If you use `products.csv` as the source of truth, variants and attributes appear to be lost because the export is flattened to product-level data only.

The real data can still exist in the database.

## Verified Current Database State

For sample product `solar-flood-light`:

- Parent product exists in `products`
- Variants exist in `product_variants`
- Variant attributes exist through the join table

Verified variant rows:

- `solar-flood-light-100w-6500k`
- `solar-flood-light-200w-6500k`

Verified attribute rows:

- `Wattage`
- `Color Temperature`
- `IP Rating`
- `Warranty`

## Root Cause

Current export shape is product-only.

That means these variant-level fields are missing from the CSV:

- `variant.id`
- `variant.sku`
- `variant.title`
- `variant.price`
- `variant.old_price`
- `variant.currency`
- `variant.stock_qty`
- `variant.low_stock_alert`
- `variant.image_url`
- `variant.sort_order`
- `variant.is_active`

And these attribute-level values are also missing:

- attribute name
- attribute value
- variant-to-attribute mapping

## Correct Export Options

### Option 1: Flat export

Export one row per variant.

Recommended columns:

- product fields
- variant fields
- attribute summary string

Example:

- `product_id`
- `product_title`
- `variant_id`
- `variant_sku`
- `variant_title`
- `variant_price`
- `variant_stock_qty`
- `attributes_json`

### Option 2: Nested JSON export

Export one product object with nested variants and nested attribute pairs.

This is the safest format if the data will be re-imported later.

## Public Website Gap

The current root/public site path in this repo does not query or render variant tables.

So even if the database still contains variants and attributes, the public/root product flow can still appear as if that data does not exist.

## Recommendation

Do not use the current `products.csv` format as the complete export format for catalog recovery or migration.

Use either:

- a dedicated variant-aware CSV export, or
- a nested JSON export

## Related Fix Already Applied

The duplicate product gallery key warning was fixed in:

- `components/product-images.tsx`

That issue was caused by repeated image URLs being used directly as React keys.
