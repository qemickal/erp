"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  addOrderItem,
  removeOrderItem,
  recalculateOrder,
  updateOrderStatus,
  updateOrderPayment,
} from "@/lib/actions-orders";
import {
  createProductionOrder,
} from "@/lib/actions-production";
import {
  updateQualityCheck,
  updatePackagingCheck,
  createPostSale,
} from "@/lib/actions-quality";
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
import { Plus, Trash2, RefreshCw, Factory, ShieldCheck, Truck, Clock } from "lucide-react";
import { toast } from "sonner";

type OrderItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  product: { name: string } | null;
};

type OrderData = {
  id: string;
  number: string;
  client: { name: string };
  status: string;
  paymentStatus: string;
  subtotal: number;
  tax: number;
  total: number;
  deliveryDate: Date | null;
  notes: string | null;
  createdAt: Date;
  items: OrderItem[];
  production: { id: string; number: string; status: string } | null;
  quality: { status: string; criteria: string | null; inspector: string } | null;
  packaging: { status: string; type: string | null; items: number; inspector: string } | null;
  postSales: { id: string; type: string; status: string; description: string }[];
};

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pendiente" },
  { value: "IN_PRODUCTION", label: "En producción" },
  { value: "READY", label: "Listo" },
  { value: "SHIPPED", label: "Enviado" },
  { value: "DELIVERED", label: "Entregado" },
  { value: "CANCELLED", label: "Cancelado" },
];

const PAYMENT_OPTIONS = [
  { value: "UNPAID", label: "No pagado" },
  { value: "PARTIAL", label: "Parcial" },
  { value: "PAID", label: "Pagado" },
];

export function OrderDetail({ order }: { order: OrderData }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [items, setItems] = useState<OrderItem[]>(order.items);

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
      await addOrderItem(formData);
      const recalc = new FormData();
      recalc.append("orderId", order.id);
      await recalculateOrder(recalc);
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
      await removeOrderItem(itemId);
      const recalc = new FormData();
      recalc.append("orderId", order.id);
      await recalculateOrder(recalc);
      router.refresh();
      toast.success("Ítem eliminado");
    } catch {
      toast.error("No se pudo eliminar el ítem");
    } finally {
      setPending(false);
    }
  }

  async function changeStatus(status: string) {
    setPending(true);
    const fd = new FormData();
    fd.append("orderId", order.id);
    fd.append("status", status);
    try {
      await updateOrderStatus(fd);
      toast.success("Estado actualizado");
      router.refresh();
    } catch {
      toast.error("No se pudo actualizar");
    } finally {
      setPending(false);
    }
  }

  async function changePayment(payment: string) {
    setPending(true);
    const fd = new FormData();
    fd.append("orderId", order.id);
    fd.append("paymentStatus", payment);
    try {
      await updateOrderPayment(fd);
      toast.success("Pago actualizado");
      router.refresh();
    } catch {
      toast.error("No se pudo actualizar");
    } finally {
      setPending(false);
    }
  }

  async function createPO() {
    setPending(true);
    const fd = new FormData();
    fd.append("orderId", order.id);
    try {
      await createProductionOrder(fd);
      toast.success("Orden de producción creada");
      router.refresh();
    } catch {
      toast.error("No se pudo crear la orden de producción");
    } finally {
      setPending(false);
    }
  }

  const statusVariant = (s: string) => {
    const map: Record<string, "default" | "destructive" | "secondary" | "outline" | "ghost" | "link"> = {
      PENDING: "secondary",
      IN_PRODUCTION: "default",
      READY: "default",
      SHIPPED: "default",
      DELIVERED: "default",
      CANCELLED: "destructive",
      UNPAID: "destructive",
      PARTIAL: "secondary",
      PAID: "default",
    };
    return (map[s as keyof typeof map]) || "default";
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-2xl font-bold">{formatMoney(order.total)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Estado</div>
            <Badge variant={statusVariant(order.status)} className="text-xs capitalize">
              {order.status}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Pago</div>
            <Badge variant={statusVariant(order.paymentStatus)} className="text-xs capitalize">
              {order.paymentStatus}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Entrega</div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">
                {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString("es-MX") : "—"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ítems del pedido</CardTitle>
          {!order.production && (
            <Button variant="outline" size="sm" onClick={createPO} disabled={pending}>
              <Factory className="h-4 w-4 mr-1" /> Crear orden de producción
            </Button>
          )}
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
                        <Button variant="outline" size="sm" onClick={() => handleRemoveItem(i.id)} className="h-8 w-8 p-0">
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
        <CardFooter className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Estado:</span>
            <Select
              onValueChange={(value: string | null) => changeStatus(String(value ?? order.status))}
              defaultValue={order.status}
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
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Pago:</span>
            <Select
              onValueChange={(value: string | null) => changePayment(String(value ?? order.paymentStatus))}
              defaultValue={order.paymentStatus}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardFooter>
      </Card>

      {order.production && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Factory className="h-4 w-4" /> Orden de producción: {order.production.number}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Estado: <Badge variant={statusVariant(order.production.status)}>{order.production.status}</Badge>
            </p>
            <p className="text-sm">Gestiona las etapas de producción en <a href="/produccion" className="text-primary hover:underline">Producción</a>.</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Control de calidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 pt-2">
            <span className="text-sm">Estado:</span>{" "}
            <Badge variant={order.quality ? statusVariant(order.quality.status) : "default"}>
              {order.quality ? order.quality.status : "Sin revisión"}
            </Badge>
          </div>
          {order.production && (
            <form action={(fd: FormData) => handleQuality(fd)} className="mt-3 grid gap-3 md:grid-cols-4">
              <input type="hidden" name="productionId" value={order.production.id} />
              <Select name="status" defaultValue={order.quality?.status || "PENDING"}>
                <SelectTrigger>
                  <SelectValue placeholder="Resultado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APPROVED">Aprobado</SelectItem>
                  <SelectItem value="REJECTED">Rechazado</SelectItem>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                </SelectContent>
              </Select>
              <Input name="criteria" placeholder="Criterios revisados" defaultValue={order.quality?.criteria || ""} />
              <Button type="submit">Guardar</Button>
            </form>
          )}
          {order.quality && (
            <p className="mt-3 text-xs text-muted-foreground">
              Revisado por {order.quality.inspector}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-4 w-4" /> Empaque
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 pt-2">
            <span className="text-sm">Estado:</span>{" "}
            <Badge variant={order.packaging ? statusVariant(order.packaging.status) : "default"}>
              {order.packaging ? order.packaging.status : "Sin empaque"}
            </Badge>
          </div>
          {order.production && (
            <form action={(fd: FormData) => handlePackaging(fd)} className="mt-3 grid gap-3 md:grid-cols-4">
              <input type="hidden" name="productionId" value={order.production.id} />
              <Select name="status" defaultValue={order.packaging?.status || "PENDING"}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                  <SelectItem value="PACKED">Empacado</SelectItem>
                  <SelectItem value="SHIPPED">Enviado</SelectItem>
                </SelectContent>
              </Select>
              <Input name="packagingType" placeholder="Tipo de empaque" defaultValue={order.packaging?.type || ""} />
              <Input name="itemsPacked" type="number" placeholder="Cantidad" defaultValue={String(order.packaging?.items || 0)} />
              <Button type="submit">Guardar</Button>
            </form>
          )}
          {order.packaging && (
            <p className="mt-3 text-xs text-muted-foreground">
              Revisado por {order.packaging.inspector}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> Post venta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {order.postSales.length > 0 ? (
            <ul className="space-y-2">
              {order.postSales.map((p) => (
                <li key={p.id} className="p-3 rounded border">
                  <p className="text-sm">{p.description}</p>
                  <div className="flex gap-2">
                    <Badge variant={statusVariant(p.type)} className="text-xs capitalize">{p.type}</Badge>
                    <Badge variant={statusVariant(p.status)} className="text-xs">{p.status}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Sin actividades de post venta.</p>
          )}
          <form action={(fd: FormData) => handlePostSale(fd)} className="mt-3 grid gap-3 md:grid-cols-4">
            <input type="hidden" name="orderId" value={order.id} />
            <Select name="type" defaultValue="FOLLOW_UP">
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FOLLOW_UP">Seguimiento</SelectItem>
                <SelectItem value="CLAIM">Reclamo</SelectItem>
                <SelectItem value="RETURN">Devolución</SelectItem>
                <SelectItem value="SATISFACTION">Satisfacción</SelectItem>
              </SelectContent>
            </Select>
            <Input name="description" placeholder="Descripción" />
            <Input name="rating" type="number" min="1" max="5" placeholder="Calificación 1-5" />
            <Button type="submit">Agregar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  function handleQuality(fd: FormData) {
    setPending(true);
    updateQualityCheck(fd).then(
      () => {
        toast.success("Calidad guardada");
        router.refresh();
      },
      () => {
        toast.error("No se pudo guardar");
      },
    );
    setPending(false);
  }
  function handlePackaging(fd: FormData) {
    setPending(true);
    updatePackagingCheck(fd).then(
      () => {
        toast.success("Empaque guardado");
        router.refresh();
      },
      () => {
        toast.error("No se pudo guardar");
      },
    );
    setPending(false);
  }
  function handlePostSale(fd: FormData) {
    setPending(true);
    createPostSale(fd).then(
      () => {
        toast.success("Post venta registrado");
        router.refresh();
      },
      () => {
        toast.error("No se pudo registrar");
      },
    );
    setPending(false);
  }
}
