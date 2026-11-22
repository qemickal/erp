export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/helpers";
import { Plus } from "lucide-react";
import { ProductRow } from "./ProductRow";
import { EmptyState } from "@/components/empty-state";

export default async function ProductosPage() {
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } }).then((rows) =>
    rows.map((p) => ({ ...p, basePrice: Number(p.basePrice) }))
  );

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
                  {products.map((p) => (
                    <ProductRow key={p.id} p={p} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <EmptyState key="products" title="Sin productos" description="Agrega productos al catálogo para usarlos en cotizaciones y pedidos." action={() => {}} actionLabel="Agregar producto" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
