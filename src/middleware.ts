import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "erp_session";
const JWT_SECRET = process.env.JWT_SECRET || "erp-studio-dev-secret-change-in-production";
const PUBLIC = ["/login"];
const PROTECTED = ["/dashboard", "/cotizaciones", "/pedidos", "/produccion", "/calidad", "/postventa", "/clientes", "/productos", "/configuracion"];

function base64UrlToBytes(input: string): Uint8Array {
  let b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function verifyToken(token: string): Promise<{ id: string; email: string; role: string } | null> {
  try {
    const [headerB64, payloadB64, sigB64] = token.split(".");
    if (!headerB64 || !payloadB64 || !sigB64) return null;
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(JWT_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const ok = await crypto.subtle.verify("HMAC", key, base64UrlToBytes(sigB64) as unknown as BufferSource, new TextEncoder().encode(`${headerB64}.${payloadB64}`));
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payloadB64)));
    return { id: payload.id, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifyToken(token) : null;

  if (PUBLIC.includes(pathname)) {
    if (session) return NextResponse.redirect(new URL("/dashboard", request.url));
    return NextResponse.next();
  }

  const protectedRoute = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (protectedRoute) {
    if (!session) return NextResponse.redirect(new URL("/login", request.url));
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.*).*)"],
};
