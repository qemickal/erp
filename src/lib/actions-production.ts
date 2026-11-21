'use server'

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

// ---------------------------------------------------------------------------
// Production Orders (Órdenes de producción internas)
// ---------------------------------------------------------------------------

export async function listProductionOrders() {
  return prisma.productionOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: { order: { include: { client: true } }, user: true, stages: { orderBy: { order: "asc" } }, quality: true, packaging: true },
  });
}

export async function getProductionOrder(id: string) {
  return prisma.productionOrder.findUnique({
    where: { id },
    include: { order: { include: { client: true, items: { include: { product: true } } } }, user: true, stages: { orderBy: { order: "asc" }, include: { operator: true } }, quality: { include: { inspector: true } }, packaging: { include: { inspector: true } } },
  });
}

export async function createProductionOrder(formData: FormData) {
  const orderId = String(formData.get("orderId") || "");
  const dueDate = String(formData.get("dueDate") || "") || undefined;
  const notes = String(formData.get("notes") || "") || undefined;

  const user = await getSessionUser();
  if (!user) return { error: "Sesión expirada" as const };

  const po = await prisma.productionOrder.create({
    data: {
      number: `OP-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
      orderId,
      userId: user.id,
      status: "SCHEDULED",
      dueDate: dueDate ? new Date(dueDate) : null,
      notes,
    },
  });
  await prisma.productionStage.createMany({
    data: [
      { productionId: po.id, name: "Diseño y arte final", order: 1, status: "PENDING" },
      { productionId: po.id, name: "Preprensa y pruebas de color", order: 2, status: "PENDING" },
      { productionId: po.id, name: "Impresión", order: 3, status: "PENDING" },
      { productionId: po.id, name: "Acabado y troquelado", order: 4, status: "PENDING" },
    ],
  });
  return { success: true, id: po.id };
}

export async function updateProductionOrderStatus(formData: FormData) {
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const data: any = { status };
  if (status === "IN_PROGRESS" && !(await prisma.productionOrder.findUnique({ where: { id }, select: { startDate: true } }))?.startDate) {
    data.startDate = new Date();
  }
  if (status === "COMPLETED") data.completedAt = new Date();
  await prisma.productionOrder.update({ where: { id }, data });
  return { success: true };
}

export async function updateProductionStage(formData: FormData) {
  const stageId = String(formData.get("stageId") || "");
  const status = String(formData.get("status") || "");
  const operatorId = String(formData.get("operatorId") || "") || undefined;
  const data: any = { status };
  if (status === "IN_PROGRESS") data.startedAt = new Date();
  if (status === "APPROVED") data.completedAt = new Date();
  if (operatorId) data.operatorId = operatorId;
  await prisma.productionStage.update({ where: { id: stageId }, data });
  return { success: true };
}

export async function deleteProductionOrder(id: string) {
  await prisma.productionOrder.delete({ where: { id } });
  return { success: true };
}
