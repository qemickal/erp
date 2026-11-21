"use client";

import Link from "next/link";
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
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
      )}
    >
      <div className="flex max-w-[800px] mx-auto px-2 py-2">
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
                "flex flex-1 flex-col items-center justify-center gap-1 px-3 py-2 text-sm rounded-xl transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
              aria-pressed={active}
            >
              <Icon className={cn("h-5 w-5", active ? "text-primary-foreground" : "text-muted-foreground")} />
              <span className={cn("font-medium", active ? "text-primary-foreground" : "text-muted-foreground")}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
