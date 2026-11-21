"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createOrder } from "@/lib/actions-orders";
import { listClients } from "@/lib/actions-quality";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function NewOrderPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState("");

  const [formData] = useState(() => {
    const fd = new FormData();
    fd.append("clientId", "");
    fd.append("quoteId", "");
    fd.append("deliveryDate", "");
    fd.append("notes", "");
    return fd;
  });

  useEffect(() => {
    listClients().then((data: any[]) =>
      setClients(data.map((c: any) => ({ id: c.id, name: c.name }))),
    );
  }, []);

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createOrder(formData);
      if ("error" in result) {
        setError(result.error as string);
        return;
      }
      if ("id" in result) {
        toast.success("Pedido creado");
        router.push(`/pedidos/${result.id}`);
      }
    });
  }

  return (
    <div className="max-w-2xl">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Nuevo pedido</CardTitle>
          <CardDescription>
            Crea un pedido de venta. Si vienes de una cotización aceptada, los datos se heredan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/50 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <form action={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select
                  name="clientId"
                  defaultValue=""
                  onValueChange={(v: string | null) => formData.set("clientId", String(v ?? ""))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem disabled value="">Seleccionar cliente</SelectItem>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fecha de entrega</Label>
                <Input
                  name="deliveryDate"
                  type="date"
                  onChange={(e) => formData.set("deliveryDate", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea
                name="notes"
                placeholder="Instrucciones para producción y entrega..."
                onChange={(e) => formData.set("notes", e.target.value)}
                className="h-24"
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <Button
            type="submit"
            formAction={handleSubmit}
            disabled={isPending}
            className="w-auto"
          >
            {isPending ? "Creando…" : "Crear pedido"}
          </Button>
          <Button variant="outline" onClick={() => router.push("/pedidos")} className="ml-2 w-auto">
            Cancelar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
