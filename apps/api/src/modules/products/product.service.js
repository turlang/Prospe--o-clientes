import { Prisma } from "@prisma/client";
import { AppError } from "../../errors/AppError.js";
import { prisma } from "../../lib/prisma.js";
import { slugify } from "../../utils/slugify.js";

export async function listProducts(filters) {
  const where = {
    available: true,
    ...(filters.category ? { category: filters.category } : {}),
    ...(typeof filters.featured === "boolean" ? { featured: filters.featured } : {}),
    ...(filters.search
      ? {
          OR: [
            { name: { contains: filters.search, mode: "insensitive" } },
            { description: { contains: filters.search, mode: "insensitive" } }
          ]
        }
      : {})
  };

  return prisma.product.findMany({
    where,
    orderBy: [{ featured: "desc" }, { category: "asc" }, { name: "asc" }]
  });
}

export async function getProductById(id) {
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    throw new AppError("Produto não encontrado.", 404, "PRODUCT_NOT_FOUND");
  }

  return product;
}

export async function createProduct(input) {
  return prisma.product.create({
    data: {
      ...input,
      price: new Prisma.Decimal(input.price.toFixed(2)),
      slug: slugify(input.name)
    }
  });
}

export async function updateProduct(id, input) {
  await getProductById(id);

  return prisma.product.update({
    where: { id },
    data: {
      ...input,
      ...(input.name ? { slug: slugify(input.name) } : {}),
      ...(typeof input.price === "number"
        ? { price: new Prisma.Decimal(input.price.toFixed(2)) }
        : {})
    }
  });
}

export async function deleteProduct(id) {
  await getProductById(id);
  await prisma.product.delete({ where: { id } });
}
