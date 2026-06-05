# Eco Bright Admin: Current Website-to-Schema Mapping

This document describes the current Eco Bright Admin implementation and how it fits the active database schema.

## Scope

Current admin modules:

- Auth / Login
- Dashboard
- Products
- Categories
- Stock Movement
- Users

Current production stack:

- Next.js App Router
- Auth.js with Credentials Provider
- Prisma
- Neon PostgreSQL
- Cloudflare R2 for product images

## Auth

Auth strategy in the current admin:

- Credentials login only
- JWT session strategy
- Session max age: 8 hours
- Middleware-protected admin routes

Safe session fields exposed to the frontend:

- `id`
- `name`
- `email`
- `role`

User table used by admin:

- `users`

Relevant columns:

- `id`
- `name`
- `email`
- `password_hash`
- `role`
- `is_active`
- `created_at`
- `updated_at`

## Products

Admin product CRUD is built around the existing `products` table.

Table:

- `products`

Current mapped product columns:

- `id`
- `title`
- `category`
- `category_label`
- `use_case`
- `description`
- `image_url`
- `image_urls`
- `price`
- `old_price`
- `currency`
- `stock_qty`
- `in_stock`
- `sort_order`
- `is_active`
- `title_km`
- `category_label_km`
- `use_case_km`
- `description_km`
- `raw_category`
- `pack_qty`
- `hole_size`
- `needs_review`
- `review_flags`
- `badge`
- `tags`
- `created_by_id`
- `created_at`
- `updated_at`

### Product images

The website/admin stores product images as URLs only.

- Main image -> `products.image_url`
- Gallery/detail images -> `products.image_urls`

Upload flow:

1. User uploads image
2. Server validates file
3. Server converts image to WebP
4. Server uploads optimized file to Cloudflare R2
5. URL is saved into Neon via Prisma

No binary image data is stored in Neon.

## Product Variants

Variant CRUD is built around the existing table:

- `product_variants`

Current mapped columns:

- `id`
- `product_id`
- `sku`
- `title`
- `price`
- `old_price`
- `currency`
- `stock_qty`
- `low_stock_alert`
- `image_url`
- `sort_order`
- `is_active`
- `created_at`
- `updated_at`

Current rules:

- Product remains the parent item
- Variant is the sellable option
- Variant stock is the source of truth when variants exist
- Parent `products.stock_qty` is used as the rolled-up display stock

## Attributes

Reusable product attributes are stored in:

- `product_attributes`
- `product_attribute_values`
- `product_variant_attribute_values`

Purpose:

- Define reusable attribute names such as `Wattage`
- Define reusable values such as `100W`
- Attach reusable values to specific variants

Current attribute flow:

1. Admin defines attributes/values in the product editor
2. Server ensures reusable rows exist
3. Variant links are stored in the join table

## Categories

Admin categories are managed in:

- `categories`

Current columns used:

- `id`
- `name`
- `slug`
- `description`
- `created_by_id`
- `created_at`
- `updated_at`

Category behavior:

- Category CRUD is internal/admin-managed
- Product save uses the selected category to set:
  - `products.category = categories.slug`
  - `products.category_label = categories.name`

## Stock Movement

Stock movement is managed in:

- `stock_movements`

Current columns used:

- `id`
- `product_id`
- `product_variant_id`
- `type`
- `quantity`
- `previous_stock`
- `new_stock`
- `note`
- `created_by_id`
- `created_at`
- `updated_at`

Current behavior:

- If product has variants, stock movement must target a variant
- If product has no variants, movement can target the product only
- Server calculates stock changes
- Client cannot be trusted for final stock quantity

Movement types:

- `IN`
- `OUT`
- `ADJUSTMENT`

## Users

Admin user management works on:

- `users`

Current supported actions:

- Create user
- Activate/deactivate user
- Change password

Roles supported:

- `ADMIN`
- `STAFF`

## Dashboard

Current dashboard reads from existing data and shows:

- summary counts
- low stock indicators
- recent stock movements

Dashboard is read-only and does not introduce schema changes.

## Current Website Pages

Current admin routes:

- `/login`
- `/dashboard`
- `/products`
- `/products/new`
- `/products/[id]/edit`
- `/categories`
- `/categories/new`
- `/categories/[id]/edit`
- `/stock`
- `/users`
- `/users/[id]/password`

## Seed Data

Current local/dev seed creates:

- default admin user
- sample category
- sample product
- sample product variants
- sample attributes
- sample attribute values
- sample variant-attribute links

Default local/dev login:

- Email: `admin@ecobright.local`
- Password: `Admin@123456`

This credential is for local/dev only and should not be used in production.

## Important Notes

1. `product_variants.sku` uniqueness is enforced by the database using the existing partial unique index, not by Prisma schema `@unique`.
2. Product images are stored in Cloudflare R2, not in Neon.
3. Variant stock is authoritative when variants exist.
4. Server actions handle write flows and keep stock calculations on the server.
5. The current admin is aligned to the existing snake_case database structure through Prisma `@map` and `@@map`.

## Recommended Next Modules

Based on the current schema, the next admin modules that fit naturally are:

- Orders
- Order detail view
- Order status management
- Product migration review
- Inventory alerts
- Media cleanup / R2 delete flow
