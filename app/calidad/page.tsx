export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/helpers";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { ShieldCheck, Truck } from "lucide-react";

function statusVariant(status: string) {
  const map: Record<string, "default" | "destructive" | "secondary" | "outline" | "ghost" | "link"> = {
    PENDING: "secondary",
    APPROVED: "default",
    REJECTED: "destructive",
  };
  return (map[status as keyof typeof map]) || "default";
}

function packVariant(status: string) {
  const map: Record<string, "default" | "destructive" | "secondary" | "outline" | "ghost" | "link"> = {
    PENDING: "secondary",
    PACKED: "default",
    SHIPPED: "default",
  };
  return (map[status as keyof typeof map]) || "default";
}

export default async function CalidadPage() {
  const production = await prisma.productionOrder.findMany({
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    include: {
      order: { include: { client: true } },
      quality: true,
      packaging: true,
      user: true,
    },
  });

  const pendingQuality = production.filter((p) => !p.quality || p.quality.status !== "APPROVED");
  const pendingPackaging = production.filter((p) => !p.packaging || p.packaging.status !== "PACKED");

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Calidad y empaque</h1>
          <p className="text-muted-foreground">Control de calidad de producción y estado de empaque para envío.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Pendientes de calidad
            </CardTitle>
            <CardFooter>
              <Badge variant={pendingQuality.length > 0 ? "destructive" : "secondary"} className="h-9 w-9">
                {pendingQuality.length}
              </Badge>
            </CardFooter>
          </CardHeader>
          <CardContent>
            {pendingQuality.length > 0 ? (
              <ul className="space-y-3">
                {pendingQuality.map((p) => (
                  <li key={p.id} className="p-3 rounded border flex items-center justify-between">
                    <div>
                      <p className="font-medium">{p.number}</p>
                      <p className="text-xs text-muted-foreground">{p.order.client.name}</p>
                    </div>
                    <Link href={`/produccion/${p.id}`} className="text-sm font-medium text-primary hover:underline">
                      Revisar →
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">Sin pendientes de calidad.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-4 w-4" /> Pendientes de empaque
            </CardTitle>
            <CardFooter>
              <Badge variant={pendingPackaging.length > 0 ? "secondary" : "secondary"} className="h-9 w-9">
                {pendingPackaging.length}
              </Badge>
            </CardFooter>
          </CardHeader>
          <CardContent>
            {pendingPackaging.length > 0 ? (
              <ul className="space-y-3">
                {pendingPackaging.map((p) => (
                  <li key={p.id} className="p-3 rounded border flex items-center justify-between">
                    <div>
                      <p className="font-medium">{p.number}</p>
                      <p className="text-xs text-muted-foreground">{p.order.client.name}</p>
                    </div>
                    <Link href={`/produccion/${p.id}`} className="text-sm font-medium text-primary hover:underline">
                      Empacar →
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">Todo empacado.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de producción</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-3 pl-4 text-muted-foreground">Orden</th>
                  <th className="text-left pb-3 pl-4 text-muted-foreground">Cliente</th>
                  <th className="text-right pb-3 pr-4 text-muted-foreground">Estado orden</th>
                  <th className="text-right pb-3 pr-4 text-muted-foreground">Calidad</th>
                  <th className="text-right pb-3 pr-4 text-muted-foreground">Empaque</th>
                  <th className="text-right pb-3 pr-4 text-muted-foreground">Vencimiento</th>
                </tr>
              </thead>
              <tbody>
                {production.length > 0 ? (
                  production.map((p: any) => (
                    <tr key={p.id} className="border-b">
                      <td className="pb-3 pl-4 font-medium">{p.number}</td>
                      <td className="pb-3 pl-4">{p.order.client.name}</td>
                      <td className="pb-3 pl-4 text-right">
                        <Badge variant={statusVariant(p.status)} className="text-xs">{p.status}</Badge>
                      </td>
                      <td className="pb-3 pl-4 text-right">
                        <Badge variant={statusVariant(p.quality?.status || "PENDING")} className="text-xs">
                          {p.quality ? p.quality.status : "—"}
                        </Badge>
                      </td>
                      <td className="pb-3 pl-4 text-right">
                        <Badge variant={packVariant(p.packaging?.status || "PENDING")} className="text-xs">
                          {p.packaging ? p.packaging.status : "—"}
                        </Badge>
                      </td>
                      <td className="pb-3 pl-4 text-right text-muted-foreground">
                        {formatDate(p.dueDate)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="h-24 text-center text-muted-foreground">
                      <EmptyState key="production" title="Sin órdenes de producción" description="Aún no hay órdenes en el taller." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
