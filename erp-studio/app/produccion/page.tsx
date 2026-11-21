"use client";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { updateProductionOrderStatus, deleteProductionOrder } from "@/lib/actions-production";
import { formatMoney, formatDate, STATUS_LABELS } from "@/lib/helpers";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { Plus, MoreHorizontal, Trash2, Clock } from "lucide-react";

function statusVariant(status: string) {
  const map: Record<string, "default" | "destructive" | "secondary" | "outline" | "ghost" | "link"> = {
    DRAFT: "default", SCHEDULED: "default", IN_PROGRESS: "default", REWORK: "secondary",
    COMPLETED: "default", CANCELLED: "destructive",
  };
  return (map[status as keyof typeof map]) || "default";
}

async function getProduction() {
  return prisma.productionOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      order: { include: { client: true } },
      user: true,
      stages: true,
      quality: true,
      packaging: true,
    },
  });
}

export default async function ProduccionPage() {
  const production = await getProduction();
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
                    <EmptyState
                      key="production"
                      title="Sin órdenes de producción"
                      description="Crea una orden de producción a partir de un pedido para planificar el trabajo del taller."
                      action={() => (window.location.href = "/produccion/nueva")}
                      actionLabel="Crear orden de producción"
                    />
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

function ProductionRow({ p }: { p: any }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState(p.status);
  const done = p.stages.filter((s: any) => s.status === "APPROVED").length;
  const total = p.stages.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  async function changeStatus(status: string) {
    setPending(true);
    const prev = localStatus;
    setLocalStatus(status);
    const fd = new FormData();
    fd.append("id", p.id);
    fd.append("status", status);
    try {
      await updateProductionOrderStatus(fd);
      toast.success("Estado de producción actualizado");
      router.refresh();
    } catch {
      setLocalStatus(prev);
      toast.error("No se pudo actualizar");
    } finally {
      setPending(false);
      setOpen(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("¿Eliminar esta orden de producción?")) return;
    setPending(true);
    try {
      await deleteProductionOrder(p.id);
      toast.success("Orden eliminada");
      router.refresh();
    } catch {
      toast.error("No se pudo eliminar");
    } finally {
      setPending(false);
    }
  }

  return (
    <tr className="border-b hover:bg-muted/50 transition-colors group">
      <td className="pb-3 pl-4 font-medium">{p.number}</td>
      <td className="pb-3 pl-4">
        <div className="font-medium">{p.order.number}</div>
        <div className="text-xs text-muted-foreground">{p.order.client.name}</div>
      </td>
      <td className="pb-3 pl-4 text-muted-foreground">{p.user.name}</td>
      <td className="pb-3 pl-4 text-muted-foreground">
        {p.dueDate ? formatDate(p.dueDate) : "—"}
      </td>
      <td className="pb-3 pl-4 text-right">
        <div className="w-24 bg-muted rounded-full h-2">
          <div className={`bg-primary h-2 rounded-full transition-all duration-300`} style={{ width: `${pct}%` }} />
        </div>
        <div className="text-xs text-muted-foreground">{done}/{total}</div>
      </td>
      <td className="pb-3 pl-4 text-right">
        <Badge variant={statusVariant(localStatus)} className="text-xs capitalize">
          {STATUS_LABELS[localStatus] ?? localStatus}
        </Badge>
      </td>
      <td className="pb-3 pl-4 text-right">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger>
            <Button variant="outline" size="sm" className="w-9 h-9 p-0" disabled={pending}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {[
              { label: "Borrador", value: "DRAFT" },
              { label: "Programada", value: "SCHEDULED" },
              { label: "En proceso", value: "IN_PROGRESS" },
              { label: "Re-trabajo", value: "REWORK" },
              { label: "Completada", value: "COMPLETED" },
              { label: "Cancelada", value: "CANCELLED" },
            ].map((s) => (
              <DropdownMenuItem
                key={s.value}
                onClick={() => changeStatus(s.value)}
                disabled={pending || localStatus === s.value}
              >
                {s.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="ml-2">
          <Link href={`/produccion/${p.id}`} className="text-primary text-sm font-medium hover:underline">
            Ver detalle <Clock className="ml-1 h-3 w-3" />
          </Link>
        </div>
      </td>
    </tr>
  );
}
