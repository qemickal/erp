"use client";

import { updateQuoteStatus, deleteQuote } from "@/lib/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2, ShoppingCart } from "lucide-react";
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

interface QuoteRowProps {
  quote: {
    id: string;
    number: string;
    client: { name: string };
    status: string;
    total: number;
    createdAt: Date;
    validUntil: Date | null;
    order: { id: string; number: string } | null;
  };
}

type BadgeVariant = "default" | "destructive" | "secondary" | "link" | "outline" | "ghost";

function statusVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    DRAFT: "default", SENT: "default", ACCEPTED: "default", REJECTED: "destructive", EXPIRED: "secondary",
  };
  return map[status] || "default";
}

export function QuoteRow({ quote }: QuoteRowProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState(quote.status);

  async function handleStatus(status: string) {
    setPending(true);
    const prev = localStatus;
    setLocalStatus(status);
    const fd = new FormData();
    fd.append("quoteId", quote.id);
    fd.append("status", status);
    try {
      await updateQuoteStatus(fd);
      toast.success("Estado de cotización actualizado");
      router.refresh();
    } catch {
      setLocalStatus(prev);
      toast.error("No se pudo actualizar el estado");
    } finally {
      setPending(false);
      setOpen(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("¿Eliminar esta cotización? Esta acción no se puede deshacer.")) return;
    setPending(true);
    try {
      await deleteQuote(quote.id);
      toast.success("Cotización eliminada");
      router.refresh();
    } catch {
      toast.error("No se pudo eliminar");
    } finally {
      setPending(false);
    }
  }

  const hasOrder = !!quote.order;
  return (
    <tr className="border-b hover:bg-muted/50 transition-colors group">
      <td className="pb-3 pl-4 font-medium">{quote.number}</td>
      <td className="pb-3 pl-4">{quote.client.name}</td>
      <td className="pb-3 pl-4 text-muted-foreground">{new Date(quote.createdAt).toLocaleDateString("es-MX")}</td>
      <td className="pb-3 pl-4 text-muted-foreground">{quote.validUntil ? new Date(quote.validUntil).toLocaleDateString("es-MX") : "—"}</td>
      <td className="pb-3 pl-4 text-right font-medium">{quote.total.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}</td>
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
              { label: "Enviada", value: "SENT" },
              { label: "Aceptada", value: "ACCEPTED" },
              { label: "Rechazada", value: "REJECTED" },
              { label: "Expirada", value: "EXPIRED" },
            ].map((s) => (
              <DropdownMenuItem key={s.value} onClick={() => handleStatus(s.value)} disabled={pending || localStatus === s.value} className={localStatus === s.value ? "text-muted-foreground" : undefined}>
                {s.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            {!hasOrder && quote.status === "ACCEPTED" && (
              <DropdownMenuItem onClick={() => router.push(`/pedidos/nueva?cotizacion=${quote.id}`)}>
                <ShoppingCart className="mr-2 h-4 w-4" /> Convertir en pedido
              </DropdownMenuItem>
            )}
            {quote.status !== "ACCEPTED" && (
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="ml-2">
          <Link href={`/cotizaciones/${quote.id}`} className="text-primary text-sm font-medium hover:underline">
            Ver detalle
          </Link>
        </div>
      </td>
    </tr>
  );
}
