"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ShoppingCart,
  Package,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cotizaciones", label: "Cotizaciones", icon: FileText },
  { href: "/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/produccion", label: "Producción", icon: Package },
  { href: "/calidad", label: "Calidad", icon: ShieldCheck },
  { href: "/postventa", label: "Post venta", icon: Truck },
];

export default function NavBottom() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 left-0 right-0 z-50 bg-oxford border-t border-white/5"
    >
      <div className="flex max-w-[880px] mx-auto px-2 py-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = pathname === tab.href;
          return (
            <button
              key={tab.href}
              onClick={() => {
                router.push(tab.href);
              }}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 px-2 py-2 rounded-md transition-colors",
                active
                  ? "text-sky bg-white/5"
                  : "text-nube/55 hover:text-nube hover:bg-white/5",
              )}
              aria-pressed={active}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.6} />
              <span
                className={cn(
                  "font-mono text-[9px] uppercase tracking-[0.12em] leading-none",
                  active ? "text-sky" : "text-nube/55",
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
