"use client";

import { updateOrderStatus, updateOrderPayment, deleteOrder } from "@/lib/actions-orders";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { STATUS_LABELS } from "@/lib/helpers";

interface OrderRowProps {
  order: {
    id: string;
    number: string;
    client: { name: string };
    status: string;
    paymentStatus: string;
    total: number;
    deliveryDate: Date | null;
    createdAt: Date;
  };
}

type BadgeVariant = "default" | "destructive" | "secondary" | "link" | "outline" | "ghost";

function statusVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    PENDING: "secondary", IN_PRODUCTION: "default", READY: "default", SHIPPED: "default",
    DELIVERED: "default", CANCELLED: "destructive",
  };
  return map[status] || "default";
}

function paymentVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = { UNPAID: "destructive", PARTIAL: "secondary", PAID: "default" };
  return map[status] || "default";
}

export function OrderRow({ order }: OrderRowProps) {
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
      <td className="pb-3 pl-4 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("es-MX")}</td>
      <td className="pb-3 pl-4 text-muted-foreground">{order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString("es-MX") : "—"}</td>
      <td className="pb-3 pl-4 text-right font-medium">{order.total.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}</td>
      <td className="pb-3 pl-4 text-right">
        <Badge variant={statusVariant(localStatus)} className="text-xs capitalize">{STATUS_LABELS[localStatus] ?? localStatus}</Badge>
      </td>
      <td className="pb-3 pl-4 text-right">
        <Badge variant={paymentVariant(localPayment)} className="text-xs capitalize">{STATUS_LABELS[localPayment] ?? localPayment}</Badge>
      </td>
      <td className="pb-3 pl-4 text-right">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger>
            <Button variant="outline" size="sm" className="w-9 h-9 p-0" disabled={pending}>
              <Trash2 className="h-4 w-4" />
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
              <DropdownMenuItem key={s.value} onClick={() => changeStatus(s.value)} disabled={pending || localStatus === s.value}>
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
              <DropdownMenuItem key={s.value} onClick={() => changePayment(s.value)} disabled={pending || localPayment === s.value}>
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
