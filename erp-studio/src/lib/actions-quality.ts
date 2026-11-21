'use server'

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

// ---------------------------------------------------------------------------
// Calidad y Empaque
// ---------------------------------------------------------------------------

export async function updateQualityCheck(formData: FormData) {
  const productionId = String(formData.get("productionId") || "");
  const status = String(formData.get("status") || "");
  const criteria = String(formData.get("criteria") || "") || undefined;
  const notes = String(formData.get("notes") || "") || undefined;

  const user = await getSessionUser();
  if (!user) return { error: "Sesión expirada" as const };

  const existing = await prisma.qualityCheck.findUnique({ where: { productionId } });
  if (existing) {
    await prisma.qualityCheck.update({ where: { id: existing.id }, data: { status: status as any, criteria, notes } });
  } else {
    await prisma.qualityCheck.create({ data: { productionId, inspectorId: user.id, status: status as any, criteria, notes } });
  }
  return { success: true };
}

export async function updatePackagingCheck(formData: FormData) {
  const productionId = String(formData.get("productionId") || "");
  const status = String(formData.get("status") || "");
  const packagingType = String(formData.get("packagingType") || "") || undefined;
  const itemsPacked = Number(formData.get("itemsPacked") || 0);
  const notes = String(formData.get("notes") || "") || undefined;

  const user = await getSessionUser();
  if (!user) return { error: "Sesión expirada" as const };

  const existing = await prisma.packagingCheck.findUnique({ where: { productionId } });
  if (existing) {
    await prisma.packagingCheck.update({ where: { id: existing.id }, data: { status: status as any, packagingType, itemsPacked, notes } });
  } else {
    await prisma.packagingCheck.create({ data: { productionId, inspectorId: user.id, status: status as any, packagingType, itemsPacked, notes } });
  }
  return { success: true };
}

// ---------------------------------------------------------------------------
// Post venta
// ---------------------------------------------------------------------------

export async function listPostSales() {
  return prisma.postSale.findMany({
    orderBy: { createdAt: "desc" },
    include: { order: { include: { client: true } }, user: true },
  });
}

export async function createPostSale(formData: FormData) {
  const orderId = String(formData.get("orderId") || "");
  const type = String(formData.get("type") || "FOLLOW_UP");
  const description = String(formData.get("description") || "");
  const rating = Number(formData.get("rating") || 0) || undefined;

  const user = await getSessionUser();
  if (!user) return { error: "Sesión expirada" as const };

  await prisma.postSale.create({ data: { orderId, userId: user.id, type: type as any, description, rating } });
  return { success: true };
}

export async function updatePostSale(formData: FormData) {
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const description = String(formData.get("description") || "") || undefined;
  await prisma.postSale.update({ where: { id }, data: { status: status as any, description } });
  return { success: true };
}

export async function deletePostSale(id: string) {
  await prisma.postSale.delete({ where: { id } });
  return { success: true };
}

// ---------------------------------------------------------------------------
// Catálogos: Clientes y Productos
// ---------------------------------------------------------------------------

export async function listClients() {
  return prisma.client.findMany({ orderBy: { name: "asc" } });
}

export async function createClient(formData: FormData) {
  await prisma.client.create({
    data: {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || "") || null,
      phone: String(formData.get("phone") || "") || null,
      address: String(formData.get("address") || "") || null,
      rfc: String(formData.get("rfc") || "") || null,
      notes: String(formData.get("notes") || "") || null,
    },
  });
  return { success: true };
}

export async function updateClient(formData: FormData) {
  const id = String(formData.get("id") || "");
  await prisma.client.update({ where: { id }, data: { name: String(formData.get("name") || ""), email: String(formData.get("email") || "") || null, phone: String(formData.get("phone") || "") || null, address: String(formData.get("address") || "") || null, rfc: String(formData.get("rfc") || "") || null, notes: String(formData.get("notes") || "") || null } });
  return { success: true };
}

export async function deleteClient(id: string) {
  await prisma.client.delete({ where: { id } });
  return { success: true };
}

export async function listProducts() {
  return prisma.product.findMany({ orderBy: { name: "asc" } });
}

export async function createProduct(formData: FormData) {
  await prisma.product.create({
    data: {
      name: String(formData.get("name") || ""),
      description: String(formData.get("description") || "") || null,
      category: String(formData.get("category") || "") || null,
      basePrice: Number(formData.get("basePrice") || 0),
      unit: String(formData.get("unit") || "") || null,
    },
  });
  return { success: true };
}

export async function updateProduct(formData: FormData) {
  const id = String(formData.get("id") || "");
  await prisma.product.update({ where: { id }, data: { name: String(formData.get("name") || ""), description: String(formData.get("description") || "") || null, category: String(formData.get("category") || "") || null, basePrice: Number(formData.get("basePrice") || 0), unit: String(formData.get("unit") || "") || null } });
  return { success: true };
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
  return { success: true };
}
