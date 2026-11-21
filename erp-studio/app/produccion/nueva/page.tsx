"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProductionOrder } from "@/lib/actions-production";
import { listOrders as listOrdersAction } from "@/lib/actions-orders";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function NewProductionPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [orders, setOrders] = useState<{ id: string; number: string; clientName: string }[]>([]);
  const [error, setError] = useState("");

  const [formData] = useState(() => {
    const fd = new FormData();
    fd.append("orderId", "");
    fd.append("dueDate", "");
    fd.append("notes", "");
    return fd;
  });

  async function loadOrders() {
    const data = await listOrdersAction();
    setOrders(
      (data as any[])
        .filter((o: any) => !o.productionOrder)
        .map((o: any) => ({
          id: o.id,
          number: o.number,
          clientName: o.client.name,
        })),
    );
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createProductionOrder(formData);
      if ("error" in result) {
        setError(result.error as string);
        return;
      }
      if ("id" in result) {
        toast.success("Orden de producción creada");
        router.push(`/produccion/${result.id}`);
      }
    });
  }

  return (
    <div className="max-w-2xl">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Nueva orden de producción</CardTitle>
          <CardDescription>
            Vincula un pedido de venta y planifica las etapas del taller.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/50 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Pedido de venta</Label>
              <Select
                name="orderId"
                defaultValue=""
                onValueChange={(v: string | null) => formData.set("orderId", String(v ?? ""))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar pedido" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem disabled value="">Seleccionar pedido</SelectItem>
                  {orders.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.number} — {o.clientName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fecha de vencimiento</Label>
              <Input
                name="dueDate"
                type="date"
                onChange={(e) => formData.set("dueDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <TextareaPlaceholder name="notes" onChange={(e) => formData.set("notes", e.target.value)} />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <form id="po-form" action={handleSubmit} className="flex items-center gap-2">
            <Button type="submit" disabled={isPending} className="w-auto">
              {isPending ? "Creando…" : "Crear orden de producción"}
            </Button>
          </form>
          <Button variant="outline" onClick={() => router.push("/produccion")} className="ml-2 w-auto">
            Cancelar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function TextareaPlaceholder({ name, onChange }: { name: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void }) {
  return (
    <textarea
      name={name}
      onChange={onChange}
      placeholder="Instrucciones para el taller..."
      className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-24"
    />
  );
}
