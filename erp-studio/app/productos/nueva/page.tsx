"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/lib/actions-quality";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function NewProductPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [formData] = useState(() => {
    const fd = new FormData();
    fd.append("name", "");
    fd.append("description", "");
    fd.append("category", "");
    fd.append("basePrice", "0");
    fd.append("unit", "");
    return fd;
  });

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createProduct(formData);
      if ("error" in result) {
        setError(result.error as string);
        return;
      }
      toast.success("Producto creado");
      router.push("/productos");
    });
  }

  return (
    <div className="max-w-2xl">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Nuevo producto</CardTitle>
          <CardDescription>Artículo o servicio del catálogo del taller.</CardDescription>
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
                <Label>Nombre</Label>
                <Input name="name" defaultValue="" onChange={(e) => formData.set("name", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Input name="category" defaultValue="" onChange={(e) => formData.set("category", e.target.value)} placeholder="Ej: Tarjetas, Flyers, Empaque" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea name="description" defaultValue="" onChange={(e) => formData.set("description", e.target.value)} className="h-24" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Precio base (MXN)</Label>
                <Input name="basePrice" type="number" step="0.01" defaultValue="0" onChange={(e) => formData.set("basePrice", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Unidad</Label>
                <Input name="unit" defaultValue="pza" onChange={(e) => formData.set("unit", e.target.value)} placeholder="Ej: pza, kg, m2" />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <form id="product-form" action={handleSubmit} className="flex items-center gap-2">
            <Button type="submit" disabled={isPending} className="w-auto">
              {isPending ? "Guardando…" : "Guardar producto"}
            </Button>
          </form>
          <Button variant="outline" onClick={() => router.push("/productos")} className="ml-2 w-auto">
            Cancelar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
