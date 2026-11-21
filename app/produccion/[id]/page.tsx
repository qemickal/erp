export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/helpers";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProductionDetail } from "@/components/production-detail";

export default async function ProductionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const po = await prisma.productionOrder.findUnique({
    where: { id },
    include: {
      order: { include: { client: true } },
      user: true,
      stages: { orderBy: { order: "asc" }, include: { operator: true } },
      quality: { include: { inspector: true } },
      packaging: { include: { inspector: true } },
    },
  });
  if (!po) notFound();

  const done = po.stages.filter((s) => s.status === "APPROVED").length;
  const pct = po.stages.length === 0 ? 0 : Math.round((done / po.stages.length) * 100);

  return (
    <div className="max-w-4xl">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Producción {po.number}</h1>
          <p className="text-muted-foreground">Pedido {po.order.number} — {po.order.client.name}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href={`/pedidos/${po.order.id}`} className="text-xs font-medium text-primary hover:underline">
            Ver pedido →
          </Link>
          <Link href="/produccion" className="text-xs font-medium text-muted-foreground hover:underline">
            Volver a producción
          </Link>
        </div>
      </div>

      <ProductionDetail
        production={{
          id: po.id,
          number: po.number,
          order: { id: po.order.id, number: po.order.number },
          status: po.status,
          responsible: { id: po.user.id, name: po.user.name },
          startDate: po.startDate,
          dueDate: po.dueDate,
          completedAt: po.completedAt,
          notes: po.notes,
          pct,
          stages: po.stages.map((s) => ({
            id: s.id,
            name: s.name,
            order: s.order,
            status: s.status,
            startedAt: s.startedAt,
            completedAt: s.completedAt,
            operator: s.operator ? { id: s.operator.id, name: s.operator.name } : null,
            notes: s.notes,
          })),
          quality: po.quality ? { status: po.quality.status, criteria: po.quality.criteria, inspector: po.quality.inspector.name } : null,
          packaging: po.packaging
            ? { status: po.packaging.status, type: po.packaging.packagingType, items: po.packaging.itemsPacked, inspector: po.packaging.inspector.name }
            : null,
        }}
      />
    </div>
  );
}
