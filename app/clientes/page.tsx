export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { ClientRow } from "./ClientRow";
import { EmptyState } from "@/components/empty-state";

export default async function ClientesPage() {
  const clients = await prisma.client.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Directorio de clientes del estudio.</p>
        </div>
        <Link href="/clientes/nueva">
          <Button className="w-auto"><Plus className="h-4 w-4 mr-2" /> Nuevo cliente</Button>
        </Link>
      </div>
      <Card>
        <CardContent>
          {clients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-3 pl-4 text-muted-foreground">Nombre</th>
                    <th className="text-left pb-3 pl-4 text-muted-foreground">Correo</th>
                    <th className="text-left pb-3 pl-4 text-muted-foreground">Teléfono</th>
                    <th className="text-left pb-3 pl-4 text-muted-foreground">RFC</th>
                    <th className="text-right pb-3 pr-4 text-muted-foreground w-32">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c) => (
                    <ClientRow key={c.id} client={c} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <EmptyState key="clients" title="Sin clientes" description="Agrega tu primer cliente para comenzar a cotizar." action={() => {}} actionLabel="Agregar cliente" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
