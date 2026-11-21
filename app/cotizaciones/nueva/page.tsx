"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createQuote } from "@/lib/actions";
import { listClients } from "@/lib/actions-quality";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function NewQuotePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    listClients().then((data: any[]) =>
      setClients(data.map((c: any) => ({ id: c.id, name: c.name }))),
    );
  }, []);

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createQuote(formData);
      if ("error" in result) {
        setError(result.error as string);
        return;
      }
      if ("id" in result) {
        toast.success("Cotización creada");
        router.push(`/cotizaciones/${result.id}`);
      }
    });
  }

  return (
    <div className="max-w-2xl">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Nueva cotización</CardTitle>
          <CardDescription>
            Selecciona al cliente y los detalles iniciales. Los productos se agregan en el detalle.
          </CardDescription>
        </CardHeader>
        <form action={handleSubmit} className="space-y-4">
          <CardContent>
            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/50 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select name="clientId" defaultValue="" required>
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
                <Label>Vigente hasta</Label>
                <Input name="validUntil" type="date" defaultValue="" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notas internas</Label>
              <Textarea name="notes" placeholder="Ej: Aplicar descuento de lanzamiento..." defaultValue="" className="h-24" />
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <Button type="submit" disabled={isPending} className="w-auto">
              {isPending ? "Creando…" : "Crear cotización"}
            </Button>
            <Button variant="outline" onClick={() => router.push("/cotizaciones")} className="ml-2 w-auto">
              Cancelar
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
