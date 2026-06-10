# Product Setup Input Guide

This document defines the recommended input standard for creating a complete product in Eco Bright Admin.

It is written for operators, catalog staff, and data reviewers who need consistent product records with:

- parent product data
- reusable attributes
- sellable variants
- main image
- gallery/detail images

The goal is simple: every product should be complete enough to publish, search, price, and maintain without rework.

## 1. Product Data Model

The admin currently stores product data in four layers:

1. `products`
2. `product_attributes`
3. `product_attribute_values`
4. `product_variants`

Practical meaning:

- **Product** = parent catalog item
- **Attribute** = reusable option dimension
- **Attribute Value** = reusable value under an attribute
- **Variant** = sellable SKU-level row with its own price, stock, and optional image

Example:

- Product: `Solar Flood Light`
- Attributes:
  - `Wattage`
  - `Color Temperature`
- Attribute Values:
  - `100W`
  - `200W`
  - `6500K`
- Variants:
  - `100W / 6500K`
  - `200W / 6500K`

## 2. Minimum Complete Product Standard

A product should be considered complete only when it has:

- valid `product id`
- clear `title`
- valid `category`
- usable `description`
- `price`
- `currency`
- `main image`
- correct `active` status

If the product has options that change selling behavior, it should also include:

- attributes
- variants
- variant prices
- variant stock
- variant attribute selections

## 3. Parent Product Fields

These fields belong on the parent product record.

| Field | Required | Purpose | Input Rule |
|---|---|---|---|
| `id` | Yes | Stable product key | Short, unique, lowercase slug-style ID |
| `title` | Yes | Main product name | Human-readable and storefront-friendly |
| `categoryId` | Yes | Category mapping | Must select an existing category |
| `description` | Yes | Core product description | At least one meaningful sentence |
| `price` | Yes | Base/display price | Must be greater than 0 |
| `oldPrice` | No | Compare-at price | Only use when real discount exists |
| `currency` | Yes | Monetary unit | Default `USD` unless business rules differ |
| `stockQty` | Yes | Parent display stock | Use as fallback; variants become source of truth when they exist |
| `imageUrl` | Recommended | Main product image | One clear hero image |
| `imageUrls` | Recommended | Gallery/detail images | Multiple supporting product images |
| `isActive` | Yes | Visibility control | `true` for sellable products only |
| `inStock` | Yes | Public availability flag | Keep aligned with real availability logic |

Recommended supporting fields:

- `badge`
- `tags`
- `useCase`
- `packQty`
- `holeSize`
- `sortOrder`
- `titleKm`
- `categoryLabelKm`
- `useCaseKm`
- `descriptionKm`

## 4. Attribute Input Standard

Use attributes only for option dimensions that matter for buying, stock, or filtering.

Good attribute examples:

- `Wattage`
- `Voltage`
- `Color Temperature`
- `IP Rating`
- `Warranty`

Good attribute value examples:

- `100W`
- `220V`
- `6500K`
- `IP65`
- `1 Year`

Rules:

- attribute name must be singular, stable, and normalized
- avoid duplicates like `Color Temp`, `Color temperature`, `CCT`
- values should use one consistent business format
- do not create attributes for marketing slogans

Recommended normalization:

- `Wattage`, not `Watts`
- `Color Temperature`, not `Light Color`
- `1 Year`, not `1 year`, `12 months`, and `1yr` mixed together

## 5. Variant Input Standard

Create variants when any of these change by option:

- price
- old price
- stock
- SKU
- image

Each variant should include:

| Field | Required | Rule |
|---|---|---|
| `sku` | Recommended | Unique when provided |
| `title` | Recommended | Short internal label |
| `price` | Yes | Must be `>= 0` |
| `oldPrice` | No | Must be `>= 0` when used |
| `currency` | Yes | Normally same as parent |
| `stockQty` | Yes | Must be `>= 0` |
| `lowStockAlert` | Recommended | Default operational threshold |
| `imageUrl` | No | Use when a variant has a distinct image |
| `sortOrder` | Recommended | Stable display order |
| `isActive` | Yes | Disable retired or hidden variants |
| `attributeSelections` | Yes | At least one attribute/value pair |

Variant design rule:

- every sellable customer choice should map to exactly one variant row

Bad pattern:

- using one product row to represent multiple wattages with only text in the description

Correct pattern:

- separate variant row for each wattage or option combination

## 6. Image Input Standard

The current product setup supports:

- `image_url` = main image
- `image_urls` = gallery/detail images array
- variant `image_url` = optional variant-specific image

### Main Image

Use for:

- catalog card
- default product detail hero
- admin preview

Quality rule:

- one clean image
- product centered and readable
- avoid collage layouts for the main image

### Gallery Images

Use for:

- detail angles
- packaging
- installation context
- close-up technical details

Quality rule:

- avoid duplicate images
- keep only useful supporting views
- prioritize real product inspection value

### Variant Images

Use only when:

- the variant is visually different
- the user needs the image to distinguish the option

Do not create variant images when the option changes only:

- wattage
- voltage
- warranty

unless the physical appearance actually differs.

## 7. Recommended Input Workflow

Use this order when creating a product:

1. Create or confirm category
2. Create parent product
3. Upload main image
4. Upload gallery/detail images
5. Add reusable attributes
6. Add variants
7. Assign attribute selections to every variant
8. Review price, stock, and active flags
9. Save

This order reduces correction work because attributes and images are defined before variant mapping is finalized.

## 8. Example of a Complete Product

### Parent Product

| Field | Example |
|---|---|
| `id` | `solar-flood-light` |
| `title` | `Solar Flood Light` |
| `categoryId` | `lighting-category-id` |
| `description` | `Outdoor solar flood light for perimeter and commercial lighting.` |
| `price` | `39.90` |
| `oldPrice` | `49.90` |
| `currency` | `USD` |
| `stockQty` | `36` |
| `imageUrl` | main uploaded image URL |
| `imageUrls` | gallery image URL array |
| `isActive` | `true` |
| `inStock` | `true` |

### Attributes

```text
Wattage: 100W, 200W
Color Temperature: 6500K
IP Rating: IP65
Warranty: 1 Year
```

### Variants

#### Variant A

| Field | Example |
|---|---|
| `sku` | `SFL-100W-6500K` |
| `title` | `100W / 6500K` |
| `price` | `39.90` |
| `oldPrice` | `49.90` |
| `currency` | `USD` |
| `stockQty` | `24` |
| `lowStockAlert` | `5` |
| `isActive` | `true` |

Attribute selections:

```text
Wattage = 100W
Color Temperature = 6500K
IP Rating = IP65
Warranty = 1 Year
```

#### Variant B

| Field | Example |
|---|---|
| `sku` | `SFL-200W-6500K` |
| `title` | `200W / 6500K` |
| `price` | `59.90` |
| `oldPrice` | `69.90` |
| `currency` | `USD` |
| `stockQty` | `12` |
| `lowStockAlert` | `5` |
| `isActive` | `true` |

Attribute selections:

```text
Wattage = 200W
Color Temperature = 6500K
IP Rating = IP65
Warranty = 1 Year
```

## 9. Data Quality Checklist

Before marking product setup complete, verify:

- product ID is unique and stable
- title is clean and not duplicated
- category is correct
- description is usable
- main image exists
- gallery images are useful and not duplicated
- parent price is valid
- every variant has price and stock
- every variant has correct attribute selections
- SKU format is consistent
- `isActive` matches business intent
- `inStock` does not conflict with actual stock state

## 10. Common Input Mistakes

Avoid these:

- storing multiple wattages in one product without variants
- using inconsistent attribute naming
- duplicate gallery images
- variant rows without attribute selections
- variant prices missing while variants exist
- inactive products left visible
- parent stock updated manually without considering variant stock logic

## 11. Operational Recommendation

For catalog governance, use this completion rule:

- **Draft**
  - missing image, missing attributes, missing variants, or missing description
- **Ready**
  - complete product fields, image set, correct active flag
- **Variant-ready**
  - all required variants created and mapped
- **Publish-ready**
  - data quality checklist passed

This classification reduces inconsistent catalog quality and makes review queues easier to manage.
