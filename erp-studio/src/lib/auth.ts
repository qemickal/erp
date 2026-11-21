import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "erp-studio-dev-secret-change-in-production";
const COOKIE_NAME = "erp_session";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export function signSession(payload: { id: string; email: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function setSession(token: string): void {
  // Set via response headers is handled in route handlers; this is a helper
  // kept for symmetry. Actual cookie setting happens in auth actions.
  void token;
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };
    return { id: decoded.id, email: decoded.email, role: decoded.role, name: "" };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, email: true, role: true, active: true },
  });
  if (!user || !user.active) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function hashPassword(password: string): Promise<string> {
  // Simple deterministic-ish hash for demo without extra deps beyond bcryptjs
  const { createHash } = await import("crypto");
  return createHash("sha256").update(password + JWT_SECRET).digest("hex");
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return (await hashPassword(password)) === hash;
}

export const AUTH_ROUTES = ["/login"];
export const PROTECTED_ROUTES = [
  "/dashboard",
  "/cotizaciones",
  "/pedidos",
  "/produccion",
  "/calidad",
  "/postventa",
  "/clientes",
  "/productos",
  "/configuracion",
];
