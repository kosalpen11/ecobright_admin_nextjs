import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Admin@123456", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@ecobright.local" },
    update: {
      name: "Eco Bright Admin",
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true
    },
    create: {
      name: "Eco Bright Admin",
      email: "admin@ecobright.local",
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true
    }
  });

  const category = await prisma.category.upsert({
    where: { slug: "solar-lighting" },
    update: {
      name: "Solar Lighting",
      description: "Local development seed category.",
      createdById: admin.id
    },
    create: {
      name: "Solar Lighting",
      slug: "solar-lighting",
      description: "Local development seed category.",
      createdById: admin.id
    }
  });

  await prisma.product.upsert({
    where: { id: "solar-flood-light" },
    update: {
      title: "Solar Flood Light",
      category: category.slug,
      categoryLabel: category.name,
      description: "Local development seed product for variant testing.",
      price: 89.99,
      oldPrice: 109.99,
      currency: "USD",
      stockQty: 36,
      inStock: true,
      isActive: true,
      createdById: admin.id
    },
    create: {
      id: "solar-flood-light",
      title: "Solar Flood Light",
      category: category.slug,
      categoryLabel: category.name,
      description: "Local development seed product for variant testing.",
      price: 89.99,
      oldPrice: 109.99,
      currency: "USD",
      stockQty: 36,
      inStock: true,
      isActive: true,
      createdById: admin.id
    }
  });

  await prisma.productVariant.upsert({
    where: { id: "solar-flood-light-100w-6500k" },
    update: {
      productId: "solar-flood-light",
      sku: "SFL-100W-6500K",
      title: "100W / 6500K",
      price: 89.99,
      oldPrice: 109.99,
      currency: "USD",
      stockQty: 24,
      lowStockAlert: 5,
      sortOrder: 0,
      isActive: true
    },
    create: {
      id: "solar-flood-light-100w-6500k",
      productId: "solar-flood-light",
      sku: "SFL-100W-6500K",
      title: "100W / 6500K",
      price: 89.99,
      oldPrice: 109.99,
      currency: "USD",
      stockQty: 24,
      lowStockAlert: 5,
      sortOrder: 0,
      isActive: true
    }
  });

  await prisma.productVariant.upsert({
    where: { id: "solar-flood-light-200w-6500k" },
    update: {
      productId: "solar-flood-light",
      sku: "SFL-200W-6500K",
      title: "200W / 6500K",
      price: 129.99,
      oldPrice: 149.99,
      currency: "USD",
      stockQty: 12,
      lowStockAlert: 4,
      sortOrder: 1,
      isActive: true
    },
    create: {
      id: "solar-flood-light-200w-6500k",
      productId: "solar-flood-light",
      sku: "SFL-200W-6500K",
      title: "200W / 6500K",
      price: 129.99,
      oldPrice: 149.99,
      currency: "USD",
      stockQty: 12,
      lowStockAlert: 4,
      sortOrder: 1,
      isActive: true
    }
  });

  const wattage = await prisma.productAttribute.upsert({
    where: { name: "Wattage" },
    update: {},
    create: { name: "Wattage" }
  });

  const colorTemperature = await prisma.productAttribute.upsert({
    where: { name: "Color Temperature" },
    update: {},
    create: { name: "Color Temperature" }
  });

  const ipRating = await prisma.productAttribute.upsert({
    where: { name: "IP Rating" },
    update: {},
    create: { name: "IP Rating" }
  });

  const warranty = await prisma.productAttribute.upsert({
    where: { name: "Warranty" },
    update: {},
    create: { name: "Warranty" }
  });

  const wattage100w = await prisma.productAttributeValue.upsert({
    where: {
      productAttributeId_value: {
        productAttributeId: wattage.id,
        value: "100W"
      }
    },
    update: {},
    create: {
      productAttributeId: wattage.id,
      value: "100W"
    }
  });

  const wattage200w = await prisma.productAttributeValue.upsert({
    where: {
      productAttributeId_value: {
        productAttributeId: wattage.id,
        value: "200W"
      }
    },
    update: {},
    create: {
      productAttributeId: wattage.id,
      value: "200W"
    }
  });

  const color6500k = await prisma.productAttributeValue.upsert({
    where: {
      productAttributeId_value: {
        productAttributeId: colorTemperature.id,
        value: "6500K"
      }
    },
    update: {},
    create: {
      productAttributeId: colorTemperature.id,
      value: "6500K"
    }
  });

  const ip65 = await prisma.productAttributeValue.upsert({
    where: {
      productAttributeId_value: {
        productAttributeId: ipRating.id,
        value: "IP65"
      }
    },
    update: {},
    create: {
      productAttributeId: ipRating.id,
      value: "IP65"
    }
  });

  const warranty1Year = await prisma.productAttributeValue.upsert({
    where: {
      productAttributeId_value: {
        productAttributeId: warranty.id,
        value: "1 Year"
      }
    },
    update: {},
    create: {
      productAttributeId: warranty.id,
      value: "1 Year"
    }
  });

  const variantAttributeLinks = [
    {
      productVariantId: "solar-flood-light-100w-6500k",
      productAttributeValueId: wattage100w.id
    },
    {
      productVariantId: "solar-flood-light-100w-6500k",
      productAttributeValueId: color6500k.id
    },
    {
      productVariantId: "solar-flood-light-100w-6500k",
      productAttributeValueId: ip65.id
    },
    {
      productVariantId: "solar-flood-light-100w-6500k",
      productAttributeValueId: warranty1Year.id
    },
    {
      productVariantId: "solar-flood-light-200w-6500k",
      productAttributeValueId: wattage200w.id
    },
    {
      productVariantId: "solar-flood-light-200w-6500k",
      productAttributeValueId: color6500k.id
    },
    {
      productVariantId: "solar-flood-light-200w-6500k",
      productAttributeValueId: ip65.id
    },
    {
      productVariantId: "solar-flood-light-200w-6500k",
      productAttributeValueId: warranty1Year.id
    }
  ];

  for (const link of variantAttributeLinks) {
    await prisma.productVariantAttributeValue.upsert({
      where: {
        productVariantId_productAttributeValueId: {
          productVariantId: link.productVariantId,
          productAttributeValueId: link.productAttributeValueId
        }
      },
      update: {},
      create: link
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
