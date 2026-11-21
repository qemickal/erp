'use server'

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

// ---------------------------------------------------------------------------
// Orders (Pedidos)
// ---------------------------------------------------------------------------

export async function listOrders() {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: true, user: true, productionOrder: true, _count: { select: { items: true, postSales: true } } },
  });
}

export async function getOrder(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { client: true, user: true, items: { include: { product: true } }, quote: true, productionOrder: { include: { stages: { orderBy: { order: "asc" } }, quality: true, packaging: true } }, postSales: { orderBy: { createdAt: "desc" } } },
  });
}

export async function createOrder(formData: FormData) {
  const clientId = String(formData.get("clientId") || "");
  const quoteId = String(formData.get("quoteId") || "") || undefined;
  const deliveryDate = String(formData.get("deliveryDate") || "") || undefined;
  const notes = String(formData.get("notes") || "") || undefined;

  const user = await getSessionUser();
  if (!user) return { error: "Sesión expirada" as const };

  const order = await prisma.order.create({
    data: {
      number: `PED-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
      quoteId,
      clientId,
      userId: user.id,
      status: "PENDING",
      paymentStatus: "UNPAID",
      subtotal: 0,
      tax: 0,
      total: 0,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
      notes,
    },
  });
  return { success: true, id: order.id };
}

export async function addOrderItem(formData: FormData) {
  const orderId = String(formData.get("orderId") || "");
  const productId = String(formData.get("productId") || "") || undefined;
  const description = String(formData.get("description") || "");
  const quantity = Number(formData.get("quantity") || 1);
  const unitPrice = Number(formData.get("unitPrice") || 0);

  await prisma.orderItem.create({ data: { orderId, productId, description, quantity, unitPrice, total: quantity * unitPrice } });
  return { success: true };
}

export async function removeOrderItem(itemId: string) {
  await prisma.orderItem.delete({ where: { id: itemId } });
  return { success: true };
}

export async function recalculateOrder(formData: FormData) {
  const orderId = String(formData.get("orderId") || "");
  const items = await prisma.orderItem.findMany({ where: { orderId } });
  const subtotal = items.reduce((s, i) => s + Number(i.total), 0);
  const tax = Math.round(subtotal * 0.16 * 100) / 100;
  await prisma.order.update({ where: { id: orderId }, data: { subtotal, tax, total: subtotal + tax } });
  return { success: true };
}

export async function updateOrderStatus(formData: FormData) {
  const orderId = String(formData.get("orderId") || "");
  const status = String(formData.get("status") || "");
  await prisma.order.update({ where: { id: orderId }, data: { status } as any });
  return { success: true };
}

export async function updateOrderPayment(formData: FormData) {
  const orderId = String(formData.get("orderId") || "");
  const paymentStatus = String(formData.get("paymentStatus") || "");
  await prisma.order.update({ where: { id: orderId }, data: { paymentStatus } as any });
  return { success: true };
}

export async function deleteOrder(id: string) {
  await prisma.order.delete({ where: { id } });
  return { success: true };
}
