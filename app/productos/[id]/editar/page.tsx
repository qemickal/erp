"use client";

import { notFound, useRouter } from "next/navigation";
import { updateProduct, deleteProduct, getProductById } from "@/lib/actions-quality";
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
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import Link from "next/link";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [product, setProduct] = useState<{ id: string; name: string; description: string | null; category: string | null; basePrice: number; unit: string | null } | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const { id } = await params;
      const p = await getProductById(id);
      if (!p) {
        notFound();
        return;
      }
      setProduct({
        id: p.id,
        name: p.name,
        description: p.description,
        category: p.category,
        basePrice: Number(p.basePrice),
        unit: p.unit,
      });
      setLoaded(true);
    })();
  }, [params]);

  if (!loaded) {
    return (
      <div className="max-w-2xl">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Cargando producto…</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            Cargando…
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!product) return null;

  const [formData] = useState(() => {
    const fd = new FormData();
    fd.append("id", product.id);
    fd.append("name", product.name);
    fd.append("description", product.description ?? "");
    fd.append("category", product.category ?? "");
    fd.append("basePrice", String(product.basePrice));
    fd.append("unit", product.unit ?? "");
    return fd;
  });

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateProduct(formData);
      if ("error" in result) {
        setError(result.error as string);
        return;
      }
      toast.success("Producto actualizado");
      router.push("/productos");
    });
  }

  async function handleDelete() {
    if (!window.confirm(`¿Eliminar ${product!.name}?`)) return;
    try {
      await deleteProduct(product!.id);
      toast.success("Producto eliminado");
      router.push("/productos");
    } catch {
      toast.error("No se pudo eliminar");
    }
  }

  return (
    <div className="max-w-2xl">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Editar producto</CardTitle>
          <CardDescription>Edita {product!.name}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/50 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <form action={handleSubmit} className="space-y-4">
            <input type="hidden" name="id" value={product!.id} />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input name="name" defaultValue={product.name} onChange={(e) => formData.set("name", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Input name="category" defaultValue={product.category ?? ""} onChange={(e) => formData.set("category", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea name="description" defaultValue={product.description ?? ""} onChange={(e) => formData.set("description", e.target.value)} className="h-24" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Precio base (MXN)</Label>
                <Input name="basePrice" type="number" step="0.01" defaultValue={String(product.basePrice)} onChange={(e) => formData.set("basePrice", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Unidad</Label>
                <Input name="unit" defaultValue={product.unit ?? ""} onChange={(e) => formData.set("unit", e.target.value)} />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <form id="product-edit-form" action={handleSubmit} className="flex items-center gap-2">
            <Button type="submit" disabled={isPending} className="w-auto">
              {isPending ? "Guardando…" : "Guardar cambios"}
            </Button>
          </form>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleDelete} className="text-destructive w-auto">
              <Trash2 className="mr-1 h-4 w-4" /> Eliminar
            </Button>
            <Button variant="outline" onClick={() => router.push("/productos")} className="ml-2 w-auto">
              <Link href="/productos">Cancelar</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
