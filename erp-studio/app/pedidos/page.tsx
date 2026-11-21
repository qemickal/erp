"use client";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { updateOrderStatus, updateOrderPayment, deleteOrder } from "@/lib/actions-orders";
import { formatMoney, formatDate, STATUS_LABELS } from "@/lib/helpers";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { Plus, MoreHorizontal, Trash2, CreditCard } from "lucide-react";

function statusVariant(status: string): "default" | "destructive" | "secondary" | "outline" | "ghost" | "link" {
  const map: Record<string, "default" | "destructive" | "secondary" | "outline" | "ghost" | "link"> = {
    PENDING: "secondary", IN_PRODUCTION: "default", READY: "default", SHIPPED: "default",
    DELIVERED: "default", CANCELLED: "destructive",
  };
  return (map[status as keyof typeof map]) || "default";
}

function paymentVariant(status: string): "default" | "destructive" | "secondary" | "outline" | "ghost" | "link" {
  const map: Record<string, "default" | "destructive" | "secondary" | "outline" | "ghost" | "link"> = { UNPAID: "destructive", PARTIAL: "secondary", PAID: "default" };
  return (map[status as keyof typeof map]) || "default";
}

async function getOrders() {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: true, user: true },
  });
}

export default async function PedidosPage() {
  const orders = await getOrders();
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
                    <EmptyState
                      key="orders"
                      title="Sin pedidos"
                      description="Los pedidos se crean al aceptar una cotización o directamente desde aquí."
                      action={() => (window.location.href = "/pedidos/nueva")}
                      actionLabel="Crear pedido"
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

function OrderRow({ order }: { order: any }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState(order.status);
  const [localPayment, setLocalPayment] = useState(order.paymentStatus);

  async function changeStatus(status: string) {
    setPending(true);
    const prev = localStatus;
    setLocalStatus(status);
    const fd = new FormData();
    fd.append("orderId", order.id);
    fd.append("status", status);
    try {
      await updateOrderStatus(fd);
      toast.success("Estado del pedido actualizado");
      router.refresh();
    } catch {
      setLocalStatus(prev);
      toast.error("No se pudo actualizar");
    } finally {
      setPending(false);
      setOpen(false);
    }
  }

  async function changePayment(payment: string) {
    setPending(true);
    const prev = localPayment;
    setLocalPayment(payment);
    const fd = new FormData();
    fd.append("orderId", order.id);
    fd.append("paymentStatus", payment);
    try {
      await updateOrderPayment(fd);
      toast.success("Estado de pago actualizado");
      router.refresh();
    } catch {
      setLocalPayment(prev);
      toast.error("No se pudo actualizar");
    } finally {
      setPending(false);
      setOpen(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("¿Eliminar este pedido? Esta acción no se puede deshacer.")) return;
    setPending(true);
    try {
      await deleteOrder(order.id);
      toast.success("Pedido eliminado");
      router.refresh();
    } catch {
      toast.error("No se pudo eliminar");
    } finally {
      setPending(false);
    }
  }

  return (
    <tr className="border-b hover:bg-muted/50 transition-colors group">
      <td className="pb-3 pl-4 font-medium">{order.number}</td>
      <td className="pb-3 pl-4">{order.client.name}</td>
      <td className="pb-3 pl-4 text-muted-foreground">{formatDate(order.createdAt)}</td>
      <td className="pb-3 pl-4 text-muted-foreground">
        {order.deliveryDate ? formatDate(order.deliveryDate) : "—"}
      </td>
      <td className="pb-3 pl-4 text-right font-medium">{formatMoney(order.total)}</td>
      <td className="pb-3 pl-4 text-right">
        <Badge variant={statusVariant(localStatus)} className="text-xs capitalize">
          {STATUS_LABELS[localStatus] ?? localStatus}
        </Badge>
      </td>
      <td className="pb-3 pl-4 text-right">
        <Badge variant={paymentVariant(localPayment)} className="text-xs capitalize">
          {STATUS_LABELS[localPayment] ?? localPayment}
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
              { label: "Pendiente", value: "PENDING" },
              { label: "En producción", value: "IN_PRODUCTION" },
              { label: "Listo", value: "READY" },
              { label: "Enviado", value: "SHIPPED" },
              { label: "Entregado", value: "DELIVERED" },
              { label: "Cancelado", value: "CANCELLED" },
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
            <DropdownMenuLabel className="px-4 py-2 text-xs font-medium uppercase">Pago</DropdownMenuLabel>
            {[
              { label: "No pagado", value: "UNPAID" },
              { label: "Parcial", value: "PARTIAL" },
              { label: "Pagado", value: "PAID" },
            ].map((s) => (
              <DropdownMenuItem
                key={s.value}
                onClick={() => changePayment(s.value)}
                disabled={pending || localPayment === s.value}
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
          <Link href={`/pedidos/${order.id}`} className="text-primary text-sm font-medium hover:underline">
            Ver detalle <CreditCard className="ml-1 h-3 w-3" />
          </Link>
        </div>
      </td>
    </tr>
  );
}
