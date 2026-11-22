export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { Plus, CreditCard } from "lucide-react";
import { OrderRow } from "./OrderRow";

function statusVariant(status: string) {
  const map: Record<string, string> = {
    PENDING: "secondary", IN_PRODUCTION: "default", READY: "default", SHIPPED: "default",
    DELIVERED: "default", CANCELLED: "destructive",
  };
  return map[status] || "default";
}

function paymentVariant(status: string) {
  const map: Record<string, string> = { UNPAID: "destructive", PARTIAL: "secondary", PAID: "default" };
  return map[status] || "default";
}

export default async function PedidosPage() {
  const orders = await prisma.order
    .findMany({
      orderBy: { createdAt: "desc" },
      include: { client: true, user: true },
    })
    .then((rows) =>
      rows.map((o: any) => ({ ...o, subtotal: Number(o.subtotal), tax: Number(o.tax), total: Number(o.total) }))
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pedidos</h1>
          <p className="text-muted-foreground">Órdenes de venta aceptadas o creadas directamente.</p>
        </div>
        <Link href="/pedidos/nueva">
          <Button className="w-auto"><Plus className="h-4 w-4 mr-2" /> Nuevo pedido</Button>
        </Link>
      </div>

      <div className="rounded-xl border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left pb-3 pl-4 text-muted-foreground">Número</th>
                <th className="text-left pb-3 pl-4 text-muted-foreground">Cliente</th>
                <th className="text-right pb-3 pr-4 text-muted-foreground">Fecha</th>
                <th className="text-right pb-3 pr-4 text-muted-foreground">Entrega</th>
                <th className="text-right pb-3 pr-4 text-muted-foreground">Total</th>
                <th className="text-right pb-3 pr-4 text-muted-foreground">Estado</th>
                <th className="text-right pb-3 pr-4 text-muted-foreground">Pago</th>
                <th className="text-right pb-3 pr-4 text-muted-foreground w-32">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((o: any) => <OrderRow key={o.id} order={o} />)
              ) : (
                <tr>
                  <td colSpan={8} className="h-32 text-center text-muted-foreground">
                    <EmptyState key="orders" title="Sin pedidos" description="Los pedidos se crean al aceptar una cotización o directamente desde aquí." action={() => {}} actionLabel="Crear pedido" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
