"use client";

import { deleteClient } from "@/lib/actions-quality";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ClientRowProps {
  client: { id: string; name: string; email: string | null; phone: string | null; rfc: string | null };
}

export function ClientRow({ client }: ClientRowProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`¿Eliminar a ${client.name}?`)) return;
    setPending(true);
    try {
      await deleteClient(client.id);
      toast.success("Cliente eliminado");
      router.push("/clientes");
    } catch {
      toast.error("No se pudo eliminar");
    } finally {
      setPending(false);
    }
  }

  return (
    <tr className="border-b hover:bg-muted/50">
      <td className="pb-3 pl-4 font-medium">{client.name}</td>
      <td className="pb-3 pl-4 text-muted-foreground">{client.email || "—"}</td>
      <td className="pb-3 pl-4 text-muted-foreground">{client.phone || "—"}</td>
      <td className="pb-3 pl-4 text-muted-foreground">{client.rfc || "—"}</td>
      <td className="pb-3 pl-4 text-right">
        <Link href={`/clientes/${client.id}/editar`} className="text-sm text-primary hover:underline mr-3">Editar</Link>
        <button onClick={handleDelete} disabled={pending} className="text-xs text-destructive hover:underline">
          Eliminar
        </button>
      </td>
    </tr>
  );
}
