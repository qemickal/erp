import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { Plus, Clock } from "lucide-react";
import { ProductionRow } from "./ProductionRow";

function statusVariant(status: string) {
  const map: Record<string, string> = {
    DRAFT: "default", SCHEDULED: "default", IN_PROGRESS: "default", REWORK: "secondary",
    COMPLETED: "default", CANCELLED: "destructive",
  };
  return map[status] || "default";
}

export default async function ProduccionPage() {
  const production = await prisma.productionOrder
    .findMany({
      orderBy: { createdAt: "desc" },
      include: {
        order: { include: { client: true } },
        user: true,
        stages: true,
        quality: true,
        packaging: true,
      },
    })
    .then((rows) =>
      rows.map((p: any) => ({
        ...p,
        order: p.order
          ? { ...p.order, subtotal: Number(p.order.subtotal), tax: Number(p.order.tax), total: Number(p.order.total) }
          : p.order,
      }))
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Producción</h1>
          <p className="text-muted-foreground">Órdenes de producción internas y seguimiento por etapas.</p>
        </div>
        <Link href="/produccion/nueva">
          <Button className="w-auto"><Plus className="h-4 w-4 mr-2" /> Nueva orden de producción</Button>
        </Link>
      </div>

      <div className="rounded-xl border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left pb-3 pl-4 text-muted-foreground">Número</th>
                <th className="text-left pb-3 pl-4 text-muted-foreground">Pedido / Cliente</th>
                <th className="text-right pb-3 pr-4 text-muted-foreground">Responsable</th>
                <th className="text-right pb-3 pr-4 text-muted-foreground">Vencimiento</th>
                <th className="text-right pb-3 pr-4 text-muted-foreground">Progreso</th>
                <th className="text-right pb-3 pr-4 text-muted-foreground">Estado</th>
                <th className="text-right pb-3 pr-4 text-muted-foreground w-28">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {production.length > 0 ? (
                production.map((p: any) => <ProductionRow key={p.id} p={p} />)
              ) : (
                <tr>
                  <td colSpan={7} className="h-32 text-center text-muted-foreground">
                    <EmptyState key="production" title="Sin órdenes de producción" description="Crea una orden de producción a partir de un pedido para planificar el trabajo del taller." action={() => {}} actionLabel="Crear orden de producción" />
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
