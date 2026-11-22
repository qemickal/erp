"use client";

import { notFound, useRouter } from "next/navigation";
import { updateClient, deleteClient, getClientById } from "@/lib/actions-quality";
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

export default function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [client, setClient] = useState<{ id: string; name: string; email: string | null; phone: string | null; address: string | null; rfc: string | null; notes: string | null } | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const { id } = await params;
      const c = await getClientById(id);
      if (!c) {
        notFound();
        return;
      }
      setClient({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        address: c.address,
        rfc: c.rfc,
        notes: c.notes,
      });
      setLoaded(true);
    })();
  }, [params]);

  if (!loaded) {
    return (
      <div className="max-w-2xl">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Cargando cliente…</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            Cargando…
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!client) return null;

  const [formData] = useState(() => {
    const fd = new FormData();
    fd.append("id", client.id);
    fd.append("name", client.name);
    fd.append("email", client.email ?? "");
    fd.append("phone", client.phone ?? "");
    fd.append("address", client.address ?? "");
    fd.append("rfc", client.rfc ?? "");
    fd.append("notes", client.notes ?? "");
    return fd;
  });

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateClient(formData);
      if ("error" in result) {
        setError(result.error as string);
        return;
      }
      toast.success("Cliente actualizado");
      router.push("/clientes");
    });
  }

  async function handleDelete() {
    if (!window.confirm(`¿Eliminar a ${client!.name}?`)) return;
    try {
      await deleteClient(client!.id);
      toast.success("Cliente eliminado");
      router.push("/clientes");
    } catch {
      toast.error("No se pudo eliminar");
    }
  }

  return (
    <div className="max-w-2xl">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Editar cliente</CardTitle>
          <CardDescription>Edita los datos de {client!.name}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/50 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <form action={handleSubmit} className="space-y-4">
            <input type="hidden" name="id" value={client!.id} />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nombre o razón social</Label>
                <Input name="name" defaultValue={client.name} onChange={(e) => formData.set("name", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Correo electrónico</Label>
                <Input name="email" type="email" defaultValue={client.email ?? ""} onChange={(e) => formData.set("email", e.target.value)} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input name="phone" defaultValue={client.phone ?? ""} onChange={(e) => formData.set("phone", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>RFC</Label>
                <Input name="rfc" defaultValue={client.rfc ?? ""} onChange={(e) => formData.set("rfc", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Dirección</Label>
              <Input name="address" defaultValue={client.address ?? ""} onChange={(e) => formData.set("address", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea name="notes" defaultValue={client.notes ?? ""} onChange={(e) => formData.set("notes", e.target.value)} className="h-24" />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <form id="client-edit-form" action={handleSubmit} className="flex items-center gap-2">
            <Button type="submit" disabled={isPending} className="w-auto">
              {isPending ? "Guardando…" : "Guardar cambios"}
            </Button>
          </form>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleDelete} className="text-destructive w-auto">
              <Trash2 className="mr-1 h-4 w-4" /> Eliminar
            </Button>
            <Button variant="outline" onClick={() => router.push("/clientes")} className="ml-2 w-auto">
              Cancelar
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
