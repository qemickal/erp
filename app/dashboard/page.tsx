export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { formatMoney, formatDate, STATUS_LABELS, ROLE_LABELS } from "@/lib/helpers";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  ShoppingCart,
  Package,
  ShieldAlert,
  Truck,
  Clock,
  Users,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ICONS: Record<string, any> = {
  quotes: Activity,
  orders: ShoppingCart,
  production: Package,
  quality: ShieldAlert,
  packaging: Truck,
  postsale: Clock,
  clients: Users,
  products: Package,
};

async function getStats() {
  const [quotes, orders, production, quality, postsales, clients, products] =
    await Promise.all([
      prisma.quote.count(),
      prisma.order.count(),
      prisma.productionOrder.count(),
      prisma.qualityCheck.count(),
      prisma.postSale.count(),
      prisma.client.count(),
      prisma.product.count(),
    ]);
  const pendingOrders = await prisma.order.count({ where: { status: "PENDING" } });
  const inProduction = await prisma.productionOrder.count({ where: { status: "IN_PROGRESS" } });
  const openPostSales = await prisma.postSale.count({ where: { status: "OPEN" } });
  const revenue = await prisma.order.aggregate({
    where: { paymentStatus: "PAID" },
    _sum: { total: true },
  });
  const recentQuotes = await prisma.quote.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { client: true },
  });
  const urgentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    where: { status: { in: ["PENDING", "IN_PRODUCTION"] } },
    include: { client: true },
  });
  return {
    quotes,
    orders,
    production,
    quality,
    postsales,
    clients,
    products,
    pendingOrders,
    inProduction,
    openPostSales,
    revenue: revenue._sum.total ?? 0,
    recentQuotes,
    urgentOrders,
  };
}

const STATS = [
  { key: "quotes", label: "Cotizaciones", icon: Activity },
  { key: "orders", label: "Pedidos", icon: ShoppingCart },
  { key: "production", label: "Órdenes de producción", icon: Package },
  { key: "quality", label: "Control de calidad", icon: ShieldAlert },
  { key: "packaging", label: "Empaque", icon: Truck },
  { key: "postsale", label: "Post venta", icon: Clock },
  { key: "clients", label: "Clientes", icon: Users },
  { key: "products", label: "Productos", icon: Package },
];

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) return null;
  const stats = await getStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido de vuelta, {user.name} ({ROLE_LABELS[user.role] ?? user.role})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/cotizaciones">
            <Button className="w-auto"><Plus className="h-4 w-4 mr-2" /> Nueva cotización</Button>
          </Link>
          <Link href="/pedidos">
            <Button variant="outline" className="w-auto"><Plus className="h-4 w-4 mr-2" /> Nuevo pedido</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-8">
        {STATS.map((s) => {
          const value: number = (stats as any)[s.key];
          const Icon = ICONS[s.key];
          return (
            <Card key={s.key} className="rounded-xl overflow-hidden">
              <CardContent className="p-5 flex flex-row justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold mt-1">{s.key === "revenue" ? formatMoney(value) : value}</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Cotizaciones recientes</CardTitle>
            <CardFooter>
              <Link href="/cotizaciones" className="text-sm font-medium text-primary">
                Ver todas →
              </Link>
            </CardFooter>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-2 text-muted-foreground">Número</th>
                    <th className="text-left pb-2 text-muted-foreground">Cliente</th>
                    <th className="text-right pb-2 text-muted-foreground">Total</th>
                    <th className="text-right pb-2 text-muted-foreground">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentQuotes.length > 0 ? (
                    stats.recentQuotes.map((q: any) => (
                      <tr key={q.id} className="border-b hover:bg-muted/50">
                        <td className="pb-3 font-medium">{q.number}</td>
                        <td className="pb-3">{q.client.name}</td>
                        <td className="pb-3 text-right font-medium">{formatMoney(q.total)}</td>
                        <td className="pb-3 text-right">
                          <Badge variant={statusBadgeVariant(q.status)} className="text-xs">
                            {STATUS_LABELS[q.status] ?? q.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="h-24 text-center text-muted-foreground">
                        No hay cotizaciones registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pedidos pendientes</CardTitle>
            <CardFooter>
              <Link href="/pedidos" className="text-sm font-medium text-primary">
                Ver todos →
              </Link>
            </CardFooter>
          </CardHeader>
          <CardContent>
            {stats.urgentOrders.length > 0 ? (
              <ul className="space-y-3">
                {stats.urgentOrders.map((o: any) => (
                  <li key={o.id} className="flex items-center justify-between p-3 rounded-lg border border-muted bg-muted/50">
                    <div>
                      <p className="font-medium">{o.number}</p>
                      <p className="text-xs text-muted-foreground">{o.client.name}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={statusBadgeVariant(o.status)} className="text-xs">
                        {STATUS_LABELS[o.status] ?? o.status}
                      </Badge>
                      {o.deliveryDate && <span className="text-xs text-muted-foreground">{formatDate(o.deliveryDate)}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-4">No hay pedidos pendientes.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Post venta abierto</CardTitle>
            <CardFooter>
              <Link href="/postventa" className="text-sm font-medium text-primary">
                Ver todos →
              </Link>
            </CardFooter>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-2xl font-bold">
              <span>{stats.openPostSales}</span>
              <Badge variant={stats.openPostSales > 0 ? "destructive" : "secondary"} className="h-9 w-9">
                {stats.openPostSales > 0 ? "¡Atención!" : "Al día"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function statusBadgeVariant(status: string | undefined | null) {
  const map: Record<string, "default" | "destructive" | "secondary" | "outline" | "ghost" | "link"> = {
    DRAFT: "default", SENT: "default", ACCEPTED: "default", REJECTED: "destructive", EXPIRED: "secondary",
    PENDING: "secondary", IN_PRODUCTION: "default", READY: "default", SHIPPED: "default", DELIVERED: "default",
    CANCELLED: "destructive",
  };
  return (map[String(status) ?? ""] as "default" | "destructive" | "secondary" | "outline" | "ghost" | "link") || "default";
}
