export const dynamic = "force-dynamic";

import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROLE_LABELS } from "@/lib/helpers";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

function roleVariant(role: string) {
  const map: Record<string, "default" | "destructive" | "secondary" | "outline" | "ghost" | "link"> = {
    OWNER: "destructive",
    ADMIN: "default",
    DESIGNER: "default",
    PRODUCTION: "default",
    QUALITY: "default",
    SALES: "outline",
  };
  return map[role as keyof typeof map] || "default";
}

export default async function ConfiguracionPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const [quotes, orders, clients, products] = await Promise.all([
    prisma.quote.count(),
    prisma.order.count(),
    prisma.client.count(),
    prisma.product.count(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Configuración</h1>
          <p className="text-muted-foreground">Cuenta, preferencias y datos del estudio.</p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
        >
          Volver al dashboard
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Nombre</span>
              <span>{user.name}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Correo</span>
              <span className="truncate max-w-xs">{user.email}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Rol</span>
              <Badge variant={roleVariant(user.role)} className="text-xs capitalize">
                {ROLE_LABELS[user.role] ?? user.role}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Datos del estudio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Nombre comercial</span>
              <span className="font-medium">ArteGráfico Studio</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Giro</span>
              <span>Artes gráficas e impresión</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Sistema</span>
              <span className="font-medium">ERP v1.0.0</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen rápido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Cotizaciones</span>
              <span className="font-medium">{quotes}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Pedidos</span>
              <span className="font-medium">{orders}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Clientes</span>
              <span className="font-medium">{clients}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Productos</span>
              <span className="font-medium">{products}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
