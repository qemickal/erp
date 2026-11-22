"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/lib/actions";
import { LogOut, User, ChevronDown } from "lucide-react";
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
    <div className="sticky top-0 z-40 bg-oxford text-nube border-b border-white/5">
      <div className="flex items-center justify-between gap-4 px-6 py-2.5">
        {/* Logo + wordmark */}
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/dashboard" aria-label="Mono Cromat & Co. — inicio" className="flex items-center shrink-0">
            <Image
              src="/brand/logo-nube.svg"
              alt="Mono Cromat & Co."
              width={106}
              height={70}
              priority
              className="h-9 w-auto"
            />
          </Link>
          <div className="hidden sm:flex flex-col leading-tight border-l border-white/10 pl-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-sky">
              ERP · Artes gráficas
            </span>
            <span className="font-heading text-[13px] font-medium text-nube/90 tracking-tight">
              Sistema interno del taller
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <DropdownMenu open={openUser} onOpenChange={setOpenUser}>
            <DropdownMenuTrigger>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-3 py-2 text-sm text-nube hover:bg-white/10 hover:text-white"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user.name}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 p-0">
              <DropdownMenuLabel className="px-4 py-3">
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-muted-foreground truncate max-w-[220px]">{user.email}</div>
                <div className="mt-2 flex items-center gap-1">
                  <span className="px-2 py-0.5 rounded border font-mono text-[10px] uppercase tracking-[0.14em] text-royal border-royal/25 bg-accent">
                    {ROLE_LABELS[user.role] ?? user.role}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/configuracion")}>Configuración</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
