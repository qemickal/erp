"use client";

import { updatePostSale, deletePostSale } from "@/lib/actions-quality";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2, Clock } from "lucide-react";
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

interface PSRowProps {
  s: {
    id: string;
    order: { id: string; number: string; client: { name: string } };
    type: string;
    status: string;
    rating: number | null;
    createdAt: Date;
  };
}

type BadgeVariant = "default" | "destructive" | "secondary" | "link" | "outline" | "ghost";

function typeVariant(type: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = { FOLLOW_UP: "default", CLAIM: "destructive", RETURN: "secondary", SATISFACTION: "default" };
  return map[type] || "default";
}

function statusVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = { OPEN: "secondary", IN_PROGRESS: "default", RESOLVED: "default", CLOSED: "secondary" };
  return map[status] || "default";
}

export function PSRow({ s }: PSRowProps) {
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
      <td className="pb-3 pl-4 text-right text-muted-foreground">{new Date(s.createdAt).toLocaleDateString("es-MX")}</td>
      <td className="pb-3 pl-4 text-right">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger>
            <Button variant="outline" size="sm" className="w-9 h-9 p-0" disabled={pending}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {[
              { label: "Abierto", value: "OPEN" },
              { label: "En proceso", value: "IN_PROGRESS" },
              { label: "Resuelto", value: "RESOLVED" },
              { label: "Cerrado", value: "CLOSED" },
            ].map((st) => (
              <DropdownMenuItem key={st.value} onClick={() => changeStatus(st.value)} disabled={pending || localStatus === st.value}>
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
