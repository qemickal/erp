"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/lib/actions";
import { Menu, LogOut, User, ChevronDown, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLE_LABELS } from "@/lib/helpers";
import { toast } from "sonner";

export default function TopBar({ user }: { user: { name: string; email: string; role: string } }) {
  const [openUser, setOpenUser] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    try {
      await logoutAction();
      router.replace("/login");
    } catch {
      toast.error("No se pudo cerrar sesión");
    }
  }

  return (
    <div className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-6 py-3">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <div className="flex flex-col">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              ArteGráfico
            </Link>
            <span className="text-xs text-muted-foreground">ERP — Artes gráficas</span>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <DropdownMenu open={openUser} onOpenChange={setOpenUser}>
            <DropdownMenuTrigger>
              <Button variant="outline" className="flex items-center gap-2 px-3 py-1.5 text-sm">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user.name}</span>
                <ChevronDown className="h-4 w-4 fill-current" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-0">
              <DropdownMenuLabel className="px-4 py-3">
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-muted-foreground truncate max-w-[200px]">{user.email}</div>
                <div className="mt-1 flex items-center gap-1">
                  <span className="px-2 py-0.5 rounded text-xs border">{ROLE_LABELS[user.role] ?? user.role}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/configuracion")}>Configuración</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Cerrar sesión</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
