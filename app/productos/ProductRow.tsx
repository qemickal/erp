"use client";

import { deleteProduct } from "@/lib/actions-quality";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatMoney } from "@/lib/helpers";

interface ProductRowProps {
  p: { id: string; name: string; category: string | null; unit: string | null; basePrice: number };
}

export function ProductRow({ p }: ProductRowProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`¿Eliminar ${p.name}?`)) return;
    setPending(true);
    try {
      await deleteProduct(p.id);
      toast.success("Producto eliminado");
      router.push("/productos");
    } catch {
      toast.error("No se pudo eliminar");
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
