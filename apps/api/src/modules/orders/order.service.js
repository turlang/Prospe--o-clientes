import { Prisma } from "@prisma/client";
import { AppError } from "../../errors/AppError.js";
import { prisma } from "../../lib/prisma.js";
import { generateOrderCode } from "../../utils/order-code.js";

const FREE_DELIVERY_THRESHOLD = 70;
const STANDARD_DELIVERY_FEE = 7.9;

const orderInclude = {
  user: { select: { id: true, name: true, email: true } },
  items: true
};

/**
 * A taxa é regra de domínio e não deve ser decidida pelo navegador.
 */
function calculateDeliveryFee(deliveryMode, subtotal) {
  if (deliveryMode === "PICKUP") return 0;
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
}

/**
 * Garante que não existam duas linhas do mesmo produto na entrada.
 */
function consolidateItems(items) {
  const quantities = new Map();

  for (const item of items) {
    const totalQuantity = (quantities.get(item.productId) ?? 0) + item.quantity;

    if (totalQuantity > 20) {
      throw new AppError(
        "A quantidade máxima por produto é vinte unidades.",
        422,
        "ITEM_QUANTITY_LIMIT"
      );
    }

    quantities.set(item.productId, totalQuantity);
  }

  return [...quantities.entries()].map(([productId, quantity]) => ({ productId, quantity }));
}

export async function createOrder(userId, input) {
  const requestedItems = consolidateItems(input.items);
  const productIds = requestedItems.map((item) => item.productId);

  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, available: true }
  });

  if (products.length !== productIds.length) {
    throw new AppError(
      "Um ou mais produtos não existem ou estão indisponíveis.",
      409,
      "PRODUCT_UNAVAILABLE"
    );
  }

  const productMap = new Map(products.map((product) => [product.id, product]));
  const calculatedItems = requestedItems.map((item) => {
    const product = productMap.get(item.productId);
    const unitPrice = Number(product.price);
    const lineTotal = Number((unitPrice * item.quantity).toFixed(2));

    return {
      productId: product.id,
      productName: product.name,
      productImageUrl: product.imageUrl,
      unitPrice,
      quantity: item.quantity,
      lineTotal
    };
  });

  const subtotal = Number(
    calculatedItems.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2)
  );
  const deliveryFee = calculateDeliveryFee(input.deliveryMode, subtotal);
  const total = Number((subtotal + deliveryFee).toFixed(2));
  const address = input.deliveryMode === "DELIVERY" ? input.address : undefined;

  return prisma.$transaction(async (transaction) => {
    let code;
    let codeExists = true;

    // Pequeno mecanismo de repetição para colisões improváveis do código curto.
    for (let attempt = 0; attempt < 5 && codeExists; attempt += 1) {
      code = generateOrderCode();
      codeExists = Boolean(await transaction.order.findUnique({ where: { code } }));
    }

    if (codeExists) {
      throw new AppError("Não foi possível gerar o código do pedido.", 500, "ORDER_CODE_FAILURE");
    }

    return transaction.order.create({
      data: {
        code,
        userId,
        deliveryMode: input.deliveryMode,
        paymentMethod: input.paymentMethod,
        subtotal: new Prisma.Decimal(subtotal.toFixed(2)),
        deliveryFee: new Prisma.Decimal(deliveryFee.toFixed(2)),
        total: new Prisma.Decimal(total.toFixed(2)),
        addressStreet: address?.street,
        addressNumber: address?.number,
        addressDistrict: address?.district,
        addressCity: address?.city,
        addressState: address?.state,
        addressZipCode: address?.zipCode,
        addressComplement: address?.complement || null,
        notes: input.notes || null,
        items: {
          create: calculatedItems.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            productImageUrl: item.productImageUrl,
            unitPrice: new Prisma.Decimal(item.unitPrice.toFixed(2)),
            quantity: item.quantity,
            lineTotal: new Prisma.Decimal(item.lineTotal.toFixed(2))
          }))
        }
      },
      include: orderInclude
    });
  });
}

export async function listMyOrders(userId) {
  return prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function getOrderById(id, currentUser) {
  const order = await prisma.order.findUnique({ where: { id }, include: orderInclude });

  if (!order) {
    throw new AppError("Pedido não encontrado.", 404, "ORDER_NOT_FOUND");
  }

  if (currentUser.role !== "ADMIN" && order.userId !== currentUser.id) {
    throw new AppError("Acesso ao pedido não autorizado.", 403, "FORBIDDEN");
  }

  return order;
}

export async function listAllOrders() {
  return prisma.order.findMany({
    include: orderInclude,
    orderBy: { createdAt: "desc" }
  });
}

const allowedTransitions = {
  PENDING: ["CONFIRMED", "CANCELED"],
  CONFIRMED: ["PREPARING", "CANCELED"],
  PREPARING: ["READY", "CANCELED"],
  READY: ["OUT_FOR_DELIVERY", "DELIVERED", "CANCELED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "CANCELED"],
  DELIVERED: [],
  CANCELED: []
};

export async function updateOrderStatus(id, nextStatus) {
  const order = await prisma.order.findUnique({ where: { id } });

  if (!order) {
    throw new AppError("Pedido não encontrado.", 404, "ORDER_NOT_FOUND");
  }

  if (!allowedTransitions[order.status].includes(nextStatus)) {
    throw new AppError(
      `Transição de ${order.status} para ${nextStatus} não permitida.`,
      409,
      "INVALID_STATUS_TRANSITION"
    );
  }

  if (order.deliveryMode === "PICKUP" && nextStatus === "OUT_FOR_DELIVERY") {
    throw new AppError(
      "Pedidos para retirada não podem sair para entrega.",
      409,
      "INVALID_DELIVERY_STATUS"
    );
  }

  return prisma.order.update({
    where: { id },
    data: { status: nextStatus },
    include: orderInclude
  });
}
