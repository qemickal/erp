"use client";

import { updateProductionOrderStatus, deleteProductionOrder } from "@/lib/actions-production";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { STATUS_LABELS } from "@/lib/helpers";

interface ProductionRowProps {
  p: {
    id: string;
    number: string;
    order: { id: string; number: string; client: { name: string } };
    user: { name: string };
    status: string;
    dueDate: Date | null;
    stages: { status: string }[];
  };
}

type BadgeVariant = "default" | "destructive" | "secondary" | "link" | "outline" | "ghost";

function statusVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    DRAFT: "default", SCHEDULED: "default", IN_PROGRESS: "default", REWORK: "secondary",
    COMPLETED: "default", CANCELLED: "destructive",
  };
  return map[status] || "default";
}

export function ProductionRow({ p }: ProductionRowProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState(p.status);
  const done = p.stages.filter((s) => s.status === "APPROVED").length;
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
      <td className="pb-3 pl-4 text-muted-foreground">{p.dueDate ? new Date(p.dueDate).toLocaleDateString("es-MX") : "—"}</td>
      <td className="pb-3 pl-4 text-right">
        <div className="w-24 bg-muted rounded-full h-2">
          <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
        <div className="text-xs text-muted-foreground">{done}/{total}</div>
      </td>
      <td className="pb-3 pl-4 text-right">
        <Badge variant={statusVariant(localStatus)} className="text-xs capitalize">{STATUS_LABELS[localStatus] ?? localStatus}</Badge>
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
              { label: "Borrador", value: "DRAFT" },
              { label: "Programada", value: "SCHEDULED" },
              { label: "En proceso", value: "IN_PROGRESS" },
              { label: "Re-trabajo", value: "REWORK" },
              { label: "Completada", value: "COMPLETED" },
              { label: "Cancelada", value: "CANCELLED" },
            ].map((s) => (
              <DropdownMenuItem key={s.value} onClick={() => changeStatus(s.value)} disabled={pending || localStatus === s.value}>
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
            Ver detalle
          </Link>
        </div>
      </td>
    </tr>
  );
}
