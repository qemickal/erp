"use client";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { updateQuoteStatus, deleteQuote } from "@/lib/actions";
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
import { Plus, MoreHorizontal, ArrowRight, ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";

function statusVariant(status: string): "default" | "destructive" | "secondary" | "outline" | "ghost" | "link" {
  const map: Record<string, "default" | "destructive" | "secondary" | "outline" | "ghost" | "link"> = {
    DRAFT: "default", SENT: "default", ACCEPTED: "default", REJECTED: "destructive", EXPIRED: "secondary",
  };
  return (map[status as keyof typeof map]) || "default";
}

async function getQuotes() {
  return prisma.quote.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: true, user: true, order: true },
  });
}

export default async function CotizacionesPage() {
  const quotes = await getQuotes();
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
                quotes.map((q: any) => (
                  <QuoteRow key={q.id} quote={q} />
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="h-32 text-center text-muted-foreground">
                    <EmptyState
                      key="quotes"
                      title="Sin cotizaciones"
                      description="Crea tu primera cotización para empezar a trabajar con un cliente."
                      action={() => (window.location.href = "/cotizaciones/nueva")}
                      actionLabel="Crear cotización"
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

function QuoteRow({ quote }: { quote: any }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState(quote.status);

  async function handleStatus(status: string) {
    setPending(true);
    const prev = localStatus;
    setLocalStatus(status);
    try {
      const fd = new FormData();
      fd.append("quoteId", quote.id);
      fd.append("status", status);
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
      <td className="pb-3 pl-4 text-muted-foreground">{formatDate(quote.createdAt)}</td>
      <td className="pb-3 pl-4 text-muted-foreground">
        {quote.validUntil ? formatDate(quote.validUntil) : "—"}
      </td>
      <td className="pb-3 pl-4 text-right font-medium">{formatMoney(quote.total)}</td>
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
              { label: "Enviada", value: "SENT" },
              { label: "Aceptada", value: "ACCEPTED" },
              { label: "Rechazada", value: "REJECTED" },
              { label: "Expirada", value: "EXPIRED" },
            ].map((s) => (
              <DropdownMenuItem
                key={s.value}
                onClick={() => handleStatus(s.value)}
                disabled={pending || localStatus === s.value}
                className={localStatus === s.value ? "text-muted-foreground" : undefined}
              >
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
            Ver detalle <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>
      </td>
    </tr>
  );
}
