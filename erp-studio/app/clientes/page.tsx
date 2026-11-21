"use client";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { deleteClient } from "@/lib/actions-quality";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
                  {clients.map((c: any) => (
                    <ClientRow key={c.id} c={c} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <EmptyState key="clients" title="Sin clientes" description="Agrega tu primer cliente para comenzar a cotizar." action={() => (window.location.href = "/clientes/nueva")} actionLabel="Agregar cliente" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ClientRow({ c }: { c: any }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  async function handleDelete() {
    if (!window.confirm(`¿Eliminar a ${c.name}?`)) return;
    setPending(true);
    try {
      await deleteClient(c.id);
      toast.success("Cliente eliminado");
      router.refresh();
    } catch {
      toast.error("No se pudo eliminar (¿tiene pedidos asociados?)");
    } finally {
      setPending(false);
    }
  }
  return (
    <tr className="border-b hover:bg-muted/50">
      <td className="pb-3 pl-4 font-medium">{c.name}</td>
      <td className="pb-3 pl-4 text-muted-foreground">{c.email || "—"}</td>
      <td className="pb-3 pl-4 text-muted-foreground">{c.phone || "—"}</td>
      <td className="pb-3 pl-4 text-muted-foreground">{c.rfc || "—"}</td>
      <td className="pb-3 pl-4 text-right">
        <Link href={`/clientes/${c.id}/editar`} className="text-sm text-primary hover:underline mr-3">Editar</Link>
        <button onClick={handleDelete} disabled={pending} className="text-xs text-destructive hover:underline">
          Eliminar
        </button>
      </td>
    </tr>
  );
}
