export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { formatMoney, formatDate, STATUS_LABELS, ROLE_LABELS, statusBadgeVariant } from "@/lib/helpers";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  ShoppingCart,
  Package,
  ShieldAlert,
  Clock,
  Users,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ICONS: Record<string, any> = {
  quotes: Activity,
  orders: ShoppingCart,
  production: Package,
  quality: ShieldAlert,
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
    recentQuotes,
    urgentOrders,
  };
}

const STATS = [
  { key: "quotes", label: "Cotizaciones", icon: Activity },
  { key: "orders", label: "Pedidos", icon: ShoppingCart },
  { key: "production", label: "Producción", icon: Package },
  { key: "quality", label: "Calidad", icon: ShieldAlert },
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
      {/* Encabezado — ficha de pieza, no banner */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-bright">
            Ficha del taller · {new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" })}
          </p>
          <h1 className="mt-2 font-heading text-4xl font-bold tracking-[-0.035em] text-oxford">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Bienvenido de vuelta, {user.name} · {ROLE_LABELS[user.role] ?? user.role}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/cotizaciones/nueva">
            <Button className="w-auto">
              <Plus className="h-4 w-4 mr-1.5" /> Nueva cotización
            </Button>
          </Link>
          <Link href="/pedidos/nueva">
            <Button variant="outline" className="w-auto">
              <Plus className="h-4 w-4 mr-1.5" /> Nuevo pedido
            </Button>
          </Link>
        </div>
      </div>

      {/* Cifras — Space Grotesk, sin baldosas de color */}
      <div className="grid gap-px bg-border border border-border overflow-hidden rounded-lg sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => {
          const value: number = (stats as any)[s.key];
          const Icon = ICONS[s.key];
          return (
            <div key={s.key} className="bg-white p-5 flex flex-col gap-4 min-h-[132px]">
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {s.label}
                </p>
                <Icon className="h-4 w-4 text-royal/70" strokeWidth={1.6} />
              </div>
              <div className="mt-auto flex items-end justify-between gap-2">
                <span className="font-heading text-4xl font-bold tracking-[-0.03em] text-oxford tabular-nums">
                  {value}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-bright">
                  Total
                </span>
              </div>
            </div>
          );
        })}
        {/* Cifras de operación */}
        <div className="bg-oxford p-5 flex flex-col gap-4 min-h-[132px]">
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-sky">Pendientes</p>
            <ArrowUpRight className="h-4 w-4 text-sky/70" strokeWidth={1.6} />
          </div>
          <div className="mt-auto flex items-end justify-between gap-2">
            <span className="font-heading text-4xl font-bold tracking-[-0.03em] text-nube tabular-nums">
              {stats.pendingOrders}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-nube/50">Pedidos</span>
          </div>
        </div>
        <div className="bg-oxford p-5 flex flex-col gap-4 min-h-[132px]">
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-sky">En producción</p>
            <ArrowUpRight className="h-4 w-4 text-sky/70" strokeWidth={1.6} />
          </div>
          <div className="mt-auto flex items-end justify-between gap-2">
            <span className="font-heading text-4xl font-bold tracking-[-0.03em] text-nube tabular-nums">
              {stats.inProduction}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-nube/50">Órdenes</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cotizaciones recientes */}
        <Card className="lg:col-span-2 rounded-md border-border shadow-none">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
            <CardTitle className="font-heading text-lg text-oxford">Cotizaciones recientes</CardTitle>
            <Link href="/cotizaciones" className="font-mono text-[10px] uppercase tracking-[0.18em] text-royal hover:text-royal/70 transition-colors">
              Ver todas →
            </Link>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.18em] text-muted-foreground">Folio</th>
                    <th className="text-left py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.18em] text-muted-foreground">Cliente</th>
                    <th className="text-right py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.18em] text-muted-foreground">Total</th>
                    <th className="text-right py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.18em] text-muted-foreground">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentQuotes.length > 0 ? (
                    stats.recentQuotes.map((q: any) => (
                      <tr key={q.id} className="border-b border-border/60 last:border-0 hover:bg-accent/60 transition-colors">
                        <td className="py-3 font-mono text-[13px] text-oxford">{q.number}</td>
                        <td className="py-3 text-oxford">{q.client.name}</td>
                        <td className="py-3 text-right font-mono text-[13px] tabular-nums text-oxford">
                          {formatMoney(q.total)}
                        </td>
                        <td className="py-3 text-right">
                          <Badge variant={statusBadgeVariant(q.status) as any} className="text-[11px]">
                            {STATUS_LABELS[q.status] ?? q.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="h-24 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        Sin cotizaciones registradas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pedidos pendientes */}
        <Card className="rounded-md border-border shadow-none">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
            <CardTitle className="font-heading text-lg text-oxford">Pedidos pendientes</CardTitle>
            <Link href="/pedidos" className="font-mono text-[10px] uppercase tracking-[0.18em] text-royal hover:text-royal/70 transition-colors">
              Ver todos →
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            {stats.urgentOrders.length > 0 ? (
              <ul className="divide-y divide-border">
                {stats.urgentOrders.map((o: any) => (
                  <li key={o.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="font-mono text-[13px] text-oxford">{o.number}</p>
                      <p className="text-xs text-muted-foreground truncate">{o.client.name}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Badge variant={statusBadgeVariant(o.status) as any} className="text-[11px]">
                        {STATUS_LABELS[o.status] ?? o.status}
                      </Badge>
                      {o.deliveryDate && (
                        <span className="font-mono text-[10px] text-muted-foreground">{formatDate(o.deliveryDate)}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Sin pedidos pendientes
              </p>
            )}
          </CardContent>
        </Card>

        {/* Post venta abierto */}
        <Card className="rounded-md border-border shadow-none">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
            <CardTitle className="font-heading text-lg text-oxford">Post venta abierto</CardTitle>
            <Link href="/postventa" className="font-mono text-[10px] uppercase tracking-[0.18em] text-royal hover:text-royal/70 transition-colors">
              Ver todos →
            </Link>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="flex items-end justify-between gap-4">
              <span className="font-heading text-6xl font-bold tracking-[-0.04em] text-oxford tabular-nums">
                {stats.openPostSales}
              </span>
              <span className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.2em]">
                {stats.openPostSales > 0 ? (
                  <span className="text-destructive">Por atender</span>
                ) : (
                  <span className="text-royal">Al día</span>
                )}
              </span>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Casos de seguimiento, reclamos, devoluciones y satisfacción sin cerrar.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
