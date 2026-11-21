"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  addQuoteItem,
  removeQuoteItem,
  recalculateQuote,
  updateQuoteStatus,
} from "@/lib/actions";
import { listProducts } from "@/lib/actions-quality";
import { formatMoney } from "@/lib/helpers";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type QuoteItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  product: { name: string } | null;
};

type QuoteData = {
  id: string;
  number: string;
  client: { name: string };
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  validUntil: Date | null;
  notes: string | null;
  createdAt: Date;
  items: QuoteItem[];
};

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Borrador" },
  { value: "SENT", label: "Enviada" },
  { value: "ACCEPTED", label: "Aceptada" },
  { value: "REJECTED", label: "Rechazada" },
  { value: "EXPIRED", label: "Expirada" },
];

export function QuoteDetail({ quote }: { quote: QuoteData }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [items, setItems] = useState<QuoteItem[]>(quote.items);
  const [localStatus, setLocalStatus] = useState(quote.status);

  useEffect(() => {
    listProducts().then((data: any[]) =>
      setProducts(data.map((p: any) => ({ id: p.id, name: p.name }))),
    );
  }, []);

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const tax = Math.round(subtotal * 0.16 * 100) / 100;

  async function handleAddItem(formData: FormData) {
    setPending(true);
    try {
      await addQuoteItem(formData);
      const recalc = new FormData();
      recalc.append("quoteId", quote.id);
      await recalculateQuote(recalc);
      router.refresh();
      toast.success("Ítem agregado");
    } catch {
      toast.error("No se pudo agregar el ítem");
    } finally {
      setPending(false);
    }
  }

  async function handleRemoveItem(itemId: string) {
    if (!window.confirm("¿Eliminar este ítem?")) return;
    setPending(true);
    try {
      await removeQuoteItem(itemId);
      const recalc = new FormData();
      recalc.append("quoteId", quote.id);
      await recalculateQuote(recalc);
      router.refresh();
      toast.success("Ítem eliminado");
    } catch {
      toast.error("No se pudo eliminar el ítem");
    } finally {
      setPending(false);
    }
  }

  async function handleStatus(status: string) {
    setPending(true);
    const prev = localStatus;
    setLocalStatus(status);
    const fd = new FormData();
    fd.append("quoteId", quote.id);
    fd.append("status", status);
    try {
      await updateQuoteStatus(fd);
      toast.success("Estado actualizado");
      router.refresh();
    } catch {
      setLocalStatus(prev);
      toast.error("No se pudo actualizar el estado");
    } finally {
      setPending(false);
    }
  }

  const statusVariant = (s: string) => {
    const map: Record<string, "default" | "destructive" | "secondary" | "outline" | "ghost" | "link"> = {
      DRAFT: "default",
      SENT: "default",
      ACCEPTED: "default",
      REJECTED: "destructive",
      EXPIRED: "secondary",
    };
    return (map[s as keyof typeof map]) || "default";
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardTitle>Ítems de la cotización</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Descripción</TableHead>
                  <TableHead className="w-1/6 text-right">Cantidad</TableHead>
                  <TableHead className="w-1/6 text-right">Precio unit.</TableHead>
                  <TableHead className="w-1/6 text-right">Importe</TableHead>
                  <TableHead className="w-12 text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length > 0 ? (
                  items.map((i) => (
                    <TableRow key={i.id} className="border-b">
                      <TableCell className="pl-4">
                        <div className="font-medium">{i.description}</div>
                        {i.product && <span className="text-xs text-muted-foreground">{i.product.name}</span>}
                      </TableCell>
                      <TableCell className="text-right">{i.quantity}</TableCell>
                      <TableCell className="text-right">{formatMoney(i.unitPrice)}</TableCell>
                      <TableCell className="text-right font-medium">{formatMoney(i.total)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveItem(i.id)}
                          className="h-8 w-8 p-0"
                          aria-label="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      Sin ítems
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <form
            action={handleAddItem}
            className="mt-4 grid gap-3 md:grid-cols-5"
          >
            <Select name="productId" defaultValue="">
              <SelectTrigger>
                <SelectValue placeholder="Producto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem disabled value="">Seleccionar producto</SelectItem>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input name="description" placeholder="Descripción del ítem" defaultValue="" className="h-9" />
            <Input name="quantity" type="number" defaultValue="1" className="h-9" />
            <Input name="unitPrice" type="number" step="0.01" defaultValue="0" className="h-9" />
            <Button type="submit" className="h-9">
              <Plus className="h-4 w-4 mr-1" /> Agregar
            </Button>
          </form>

          <div className="flex items-end justify-between mt-4 pt-4 border-t">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Subtotal</div>
              <div className="text-right font-bold">{formatMoney(subtotal)}</div>
              <div className="text-sm text-muted-foreground">IVA (16%)</div>
              <div className="text-right font-bold">{formatMoney(tax)}</div>
              <div className="mt-1 text-right text-xl font-bold">{formatMoney(subtotal + tax)}</div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Estado:</span>
            <Select
              onValueChange={(value: string | null) => handleStatus(String(value ?? localStatus))}
              defaultValue={localStatus}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardFooter>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Detalle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cliente</span>
            <span>{quote.client.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Número</span>
            <span className="font-medium">{quote.number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Creada</span>
            <span>{new Date(quote.createdAt).toLocaleDateString("es-MX")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Vigente hasta</span>
            <span>{quote.validUntil ? new Date(quote.validUntil).toLocaleDateString("es-MX") : "—"}</span>
          </div>
          {quote.notes && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Notas</span>
              <span className="max-w-xs break-words">{quote.notes}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
