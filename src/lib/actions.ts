'use server'

import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { getSessionUser, JWT_SECRET } from "@/lib/session";
import type { SessionUser } from "@/lib/session";

const COOKIE_NAME = "erp_session";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active || !(await verifyPassword(password, user.password))) {
    return { error: "Correo o contraseña incorrectos" as const };
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return { success: true as const, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/login");
}

function requireAuth(): SessionUser {
  const user = globalThis as unknown as { __session?: SessionUser };
  return user.__session ?? null as unknown as SessionUser;
}

// ---------------------------------------------------------------------------
// Quotes (Cotizaciones)
// ---------------------------------------------------------------------------

export async function listQuotes() {
  return prisma.quote.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: true, user: true, _count: { select: { items: true } } },
  });
}

export async function getQuote(id: string) {
  return prisma.quote.findUnique({
    where: { id },
    include: { client: true, user: true, items: { include: { product: true } }, order: true },
  });
}

export async function createQuote(formData: FormData) {
  const clientId = String(formData.get("clientId") || "");
  const validUntil = String(formData.get("validUntil") || "") || undefined;
  const notes = String(formData.get("notes") || "") || undefined;

  const user = await getSessionUser();
  if (!user) return { error: "Sesión expirada" as const };

  const quote = await prisma.quote.create({
    data: {
      number: `COT-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
      clientId,
      userId: user.id,
      status: "DRAFT",
      subtotal: 0,
      tax: 0,
      total: 0,
      validUntil: validUntil ? new Date(validUntil) : null,
      notes,
    },
  });
  return { success: true, id: quote.id };
}

export async function addQuoteItem(formData: FormData) {
  const quoteId = String(formData.get("quoteId") || "");
  const productId = String(formData.get("productId") || "") || undefined;
  const description = String(formData.get("description") || "");
  const quantity = Number(formData.get("quantity") || 1);
  const unitPrice = Number(formData.get("unitPrice") || 0);

  await prisma.quoteItem.create({
    data: { quoteId, productId, description, quantity, unitPrice, total: quantity * unitPrice },
  });
  return { success: true };
}

export async function removeQuoteItem(itemId: string) {
  await prisma.quoteItem.delete({ where: { id: itemId } });
  return { success: true };
}

export async function recalculateQuote(formData: FormData) {
  const quoteId = String(formData.get("quoteId") || "");
  const items = await prisma.quoteItem.findMany({ where: { quoteId } });
  const subtotal = items.reduce((s, i) => s + Number(i.total), 0);
  const tax = Math.round(subtotal * 0.16 * 100) / 100;
  await prisma.quote.update({
    where: { id: quoteId },
    data: { subtotal, tax, total: subtotal + tax },
  });
  return { success: true };
}

export async function updateQuoteStatus(formData: FormData) {
  const quoteId = String(formData.get("quoteId") || "");
  const status = String(formData.get("status") || "");
  await prisma.quote.update({ where: { id: quoteId }, data: { status } as any });
  return { success: true };
}

export async function deleteQuote(id: string) {
  await prisma.quote.delete({ where: { id } });
  return { success: true };
}

// ---------------------------------------------------------------------------
// Usuarios (solo referencia)
// ---------------------------------------------------------------------------

export async function listUsers() {
  return prisma.user.findMany({ where: { active: true }, select: { id: true, name: true, role: true }, orderBy: { name: "asc" } });
}
