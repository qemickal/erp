import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { PSRow } from "./PSRow";

function typeVariant(type: string) {
  const map: Record<string, string> = { FOLLOW_UP: "default", CLAIM: "destructive", RETURN: "secondary", SATISFACTION: "default" };
  return map[type] || "default";
}

function statusVariant(status: string) {
  const map: Record<string, string> = { OPEN: "secondary", IN_PROGRESS: "default", RESOLVED: "default", CLOSED: "secondary" };
  return map[status] || "default";
}

export default async function PostVentaPage() {
  const sales = await prisma.postSale
    .findMany({
      orderBy: { createdAt: "desc" },
      include: { order: { include: { client: true } }, user: true },
    })
    .then((rows) =>
      rows.map((s: any) => ({
        ...s,
        order: s.order
          ? { ...s.order, subtotal: Number(s.order.subtotal), tax: Number(s.order.tax), total: Number(s.order.total) }
          : s.order,
      }))
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Post venta</h1>
          <p className="text-muted-foreground">Seguimientos, reclamos, devoluciones y satisfacción de clientes.</p>
        </div>
      </div>

      <div className="rounded-xl border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left pb-3 pl-4 text-muted-foreground">Pedido</th>
                <th className="text-left pb-3 pl-4 text-muted-foreground">Cliente</th>
                <th className="text-right pb-3 pr-4 text-muted-foreground">Tipo</th>
                <th className="text-right pb-3 pr-4 text-muted-foreground">Estado</th>
                <th className="text-right pb-3 pr-4 text-muted-foreground">Calificación</th>
                <th className="text-right pb-3 pr-4 text-muted-foreground">Fecha</th>
                <th className="text-right pb-3 pr-4 text-muted-foreground w-32">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sales.length > 0 ? (
                sales.map((s: any) => <PSRow key={s.id} s={s} />)
              ) : (
                <tr>
                  <td colSpan={7} className="h-32 text-center text-muted-foreground">
                    <EmptyState key="postsale" title="Sin actividades de post venta" description="Registra seguimientos, reclamos o devoluciones desde el detalle de un pedido." action={() => {}} actionLabel="Ver pedidos" />
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
