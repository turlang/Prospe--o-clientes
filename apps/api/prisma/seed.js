import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Populariza o banco com dados determinísticos para demonstração acadêmica.
 */
async function main() {
  const [adminPasswordHash, customerPasswordHash] = await Promise.all([
    bcrypt.hash("Admin@123", 12),
    bcrypt.hash("Cliente@123", 12)
  ]);

  await prisma.user.upsert({
    where: { email: "admin@burger.local" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@burger.local",
      passwordHash: adminPasswordHash,
      role: "ADMIN"
    }
  });

  await prisma.user.upsert({
    where: { email: "cliente@burger.local" },
    update: {},
    create: {
      name: "Cliente Demonstração",
      email: "cliente@burger.local",
      passwordHash: customerPasswordHash,
      role: "CUSTOMER"
    }
  });

  const products = [
    {
      name: "Burger Clássico",
      slug: "burger-classico",
      description: "Pão brioche, carne bovina de 160 g, queijo, alface, tomate e molho da casa.",
      imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
      price: "29.90",
      category: "BURGER",
      available: true,
      featured: true
    },
    {
      name: "Burger Duplo Bacon",
      slug: "burger-duplo-bacon",
      description: "Dois hambúrgueres, cheddar, bacon crocante, cebola caramelizada e molho barbecue.",
      imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80",
      price: "39.90",
      category: "BURGER",
      available: true,
      featured: true
    },
    {
      name: "Burger Vegetal",
      slug: "burger-vegetal",
      description: "Hambúrguer vegetal, queijo, rúcula, tomate e maionese temperada.",
      imageUrl: "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=900&q=80",
      price: "31.90",
      category: "BURGER",
      available: true,
      featured: false
    },
    {
      name: "Batata Crocante",
      slug: "batata-crocante",
      description: "Porção individual de batatas fritas crocantes com tempero especial.",
      imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80",
      price: "14.90",
      category: "SIDE",
      available: true,
      featured: true
    },
    {
      name: "Anéis de Cebola",
      slug: "aneis-de-cebola",
      description: "Cebola empanada e frita, acompanhada de molho cremoso.",
      imageUrl: "https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=900&q=80",
      price: "17.90",
      category: "SIDE",
      available: true,
      featured: false
    },
    {
      name: "Refrigerante Lata",
      slug: "refrigerante-lata",
      description: "Lata de 350 ml. O sabor é confirmado no atendimento do pedido.",
      imageUrl: "https://images.unsplash.com/photo-1629203849820-fdd70d49c38e?auto=format&fit=crop&w=900&q=80",
      price: "7.00",
      category: "DRINK",
      available: true,
      featured: false
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product
    });
  }

  console.log("Seed concluído com usuários e produtos de demonstração.");
}

main()
  .catch((error) => {
    console.error("Falha ao executar seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
