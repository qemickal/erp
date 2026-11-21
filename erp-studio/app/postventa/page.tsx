"use client";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { updatePostSale, deletePostSale } from "@/lib/actions-quality";
import { formatDate } from "@/lib/helpers";
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
import { MoreHorizontal, Trash2, Clock } from "lucide-react";

function typeVariant(type: string): "default" | "destructive" | "secondary" | "outline" | "ghost" | "link" {
  const map: Record<string, "default" | "destructive" | "secondary" | "outline" | "ghost" | "link"> = { FOLLOW_UP: "default", CLAIM: "destructive", RETURN: "secondary", SATISFACTION: "default" };
  return (map[type as keyof typeof map]) || "default";
}

function statusVariant(status: string): "default" | "destructive" | "secondary" | "outline" | "ghost" | "link" {
  const map: Record<string, "default" | "destructive" | "secondary" | "outline" | "ghost" | "link"> = { OPEN: "secondary", IN_PROGRESS: "default", RESOLVED: "default", CLOSED: "secondary" };
  return (map[status as keyof typeof map]) || "default";
}

export default async function PostVentaPage() {
  const sales = await prisma.postSale.findMany({
    orderBy: { createdAt: "desc" },
    include: { order: { include: { client: true } }, user: true },
  });

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
                    <EmptyState
                      key="postsale"
                      title="Sin actividades de post venta"
                      description="Registra seguimientos, reclamos o devoluciones desde el detalle de un pedido."
                      action={() => (window.location.href = "/pedidos")}
                      actionLabel="Ver pedidos"
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

function PSRow({ s }: { s: any }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState(s.status);

  async function changeStatus(status: string) {
    setPending(true);
    const prev = localStatus;
    setLocalStatus(status);
    const fd = new FormData();
    fd.append("id", s.id);
    fd.append("status", status);
    try {
      await updatePostSale(fd);
      toast.success("Estado actualizado");
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
    if (!window.confirm("¿Eliminar este registro de post venta?")) return;
    setPending(true);
    try {
      await deletePostSale(s.id);
      toast.success("Registro eliminado");
      router.refresh();
    } catch {
      toast.error("No se pudo eliminar");
    } finally {
      setPending(false);
    }
  }

  return (
    <tr className="border-b hover:bg-muted/50 transition-colors group">
      <td className="pb-3 pl-4 font-medium">{s.order.number}</td>
      <td className="pb-3 pl-4">{s.order.client.name}</td>
      <td className="pb-3 pl-4 text-right">
        <Badge variant={typeVariant(s.type)} className="text-xs capitalize">{s.type}</Badge>
      </td>
      <td className="pb-3 pl-4 text-right">
        <Badge variant={statusVariant(localStatus)} className="text-xs capitalize">{localStatus}</Badge>
      </td>
      <td className="pb-3 pl-4 text-right">{s.rating ? `${s.rating} ★` : "—"}</td>
      <td className="pb-3 pl-4 text-right text-muted-foreground">{formatDate(s.createdAt)}</td>
      <td className="pb-3 pl-4 text-right">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger>
            <Button variant="outline" size="sm" className="w-9 h-9 p-0" disabled={pending}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {[
              { label: "Abierto", value: "OPEN" },
              { label: "En proceso", value: "IN_PROGRESS" },
              { label: "Resuelto", value: "RESOLVED" },
              { label: "Cerrado", value: "CLOSED" },
            ].map((st) => (
              <DropdownMenuItem
                key={st.value}
                onClick={() => changeStatus(st.value)}
                disabled={pending || localStatus === st.value}
              >
                {st.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="ml-2">
          <Link href={`/pedidos/${s.order.id}`} className="text-primary text-sm font-medium hover:underline">
            Ver pedido <Clock className="ml-1 h-3 w-3" />
          </Link>
        </div>
      </td>
    </tr>
  );
}
