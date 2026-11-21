"use client";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { deleteProduct } from "@/lib/actions-quality";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/helpers";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";

export default async function ProductosPage() {
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Productos</h1>
          <p className="text-muted-foreground">Catálogo de productos y servicios del taller.</p>
        </div>
        <Link href="/productos/nueva">
          <Button className="w-auto"><Plus className="h-4 w-4 mr-2" /> Nuevo producto</Button>
        </Link>
      </div>
      <Card>
        <CardContent>
          {products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-3 pl-4 text-muted-foreground">Nombre</th>
                    <th className="text-left pb-3 pl-4 text-muted-foreground">Categoría</th>
                    <th className="text-left pb-3 pl-4 text-muted-foreground">Unidad</th>
                    <th className="text-right pb-3 pr-4 text-muted-foreground">Precio base</th>
                    <th className="text-right pb-3 pr-4 text-muted-foreground w-32">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p: any) => (
                    <ProductRow key={p.id} p={p} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <EmptyState key="products" title="Sin productos" description="Agrega productos al catálogo para usarlos en cotizaciones y pedidos." action={() => (window.location.href = "/productos/nueva")} actionLabel="Agregar producto" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProductRow({ p }: { p: any }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  async function handleDelete() {
    if (!window.confirm(`¿Eliminar ${p.name}?`)) return;
    setPending(true);
    try {
      await deleteProduct(p.id);
      toast.success("Producto eliminado");
      router.refresh();
    } catch {
      toast.error("No se pudo eliminar (¿está en uso?)");
    } finally {
      setPending(false);
    }
  }
  return (
    <tr className="border-b hover:bg-muted/50">
      <td className="pb-3 pl-4 font-medium">{p.name}</td>
      <td className="pb-3 pl-4 text-muted-foreground">{p.category || "—"}</td>
      <td className="pb-3 pl-4 text-muted-foreground">{p.unit || "—"}</td>
      <td className="pb-3 pl-4 text-right font-medium">{formatMoney(p.basePrice)}</td>
      <td className="pb-3 pl-4 text-right">
        <Link href={`/productos/${p.id}/editar`} className="text-sm text-primary hover:underline mr-3">Editar</Link>
        <button onClick={handleDelete} disabled={pending} className="text-xs text-destructive hover:underline">
          Eliminar
        </button>
      </td>
    </tr>
  );
}
