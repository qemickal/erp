export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { Plus } from "lucide-react";
import { QuoteRow } from "./QuoteRow";

function statusVariant(status: string) {
  const map: Record<string, string> = {
    DRAFT: "default", SENT: "default", ACCEPTED: "default", REJECTED: "destructive", EXPIRED: "secondary",
  };
  return map[status] || "default";
}

export default async function CotizacionesPage() {
  const quotes = await prisma.quote
    .findMany({
      orderBy: { createdAt: "desc" },
      include: { client: true, user: true, order: true },
    })
    .then((rows) =>
      rows.map((q: any) => ({
        ...q,
        subtotal: Number(q.subtotal),
        tax: Number(q.tax),
        total: Number(q.total),
        order: q.order
          ? { ...q.order, subtotal: Number(q.order.subtotal), tax: Number(q.order.tax), total: Number(q.order.total) }
          : null,
      }))
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Cotizaciones</h1>
          <p className="text-muted-foreground">Gestiona los presupuestos enviados a tus clientes.</p>
        </div>
        <Link href="/cotizaciones/nueva">
          <Button className="w-auto"><Plus className="h-4 w-4 mr-2" /> Nueva cotización</Button>
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
                <th className="text-right pb-3 pr-4 text-muted-foreground">Vigente hasta</th>
                <th className="text-right pb-3 pr-4 text-muted-foreground">Total</th>
                <th className="text-right pb-3 pr-4 text-muted-foreground">Estado</th>
                <th className="text-right pb-3 pr-4 text-muted-foreground w-32">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {quotes.length > 0 ? (
                quotes.map((q: any) => <QuoteRow key={q.id} quote={q} />)
              ) : (
                <tr>
                  <td colSpan={7} className="h-32 text-center text-muted-foreground">
                    <EmptyState key="quotes" title="Sin cotizaciones" description="Crea tu primera cotización para empezar a trabajar con un cliente." action={() => {}} actionLabel="Crear cotización" />
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
