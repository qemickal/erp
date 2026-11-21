"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/actions-quality";
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

export default function NewClientPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createClient(formData);
      if ("error" in result) {
        setError(result.error as string);
        return;
      }
      toast.success("Cliente creado");
      router.push("/clientes");
    });
  }

  return (
    <div className="max-w-2xl">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Nuevo cliente</CardTitle>
          <CardDescription>Datos fiscales y de contacto del cliente.</CardDescription>
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
                <Label>Nombre o razón social</Label>
                <Input name="name" defaultValue="" required />
              </div>
              <div className="space-y-2">
                <Label>Correo electrónico</Label>
                <Input name="email" type="email" defaultValue="" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input name="phone" defaultValue="" />
              </div>
              <div className="space-y-2">
                <Label>RFC</Label>
                <Input name="rfc" defaultValue="" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Dirección</Label>
              <Input name="address" defaultValue="" />
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea name="notes" placeholder="Notas del cliente..." defaultValue="" className="h-24" />
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <Button type="submit" disabled={isPending} className="w-auto">
              {isPending ? "Guardando…" : "Guardar cliente"}
            </Button>
            <Button variant="outline" onClick={() => router.push("/clientes")} className="ml-2 w-auto">
              Cancelar
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
