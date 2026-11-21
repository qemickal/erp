"use client";

import { Activity, ShoppingCart, Package, ShieldAlert, Truck, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ICONS: Record<string, any> = {
  quotes: Activity,
  orders: ShoppingCart,
  production: Package,
  quality: ShieldAlert,
  packaging: Truck,
  postsale: Clock,
  clients: Users,
};

export function EmptyState({
  key,
  title,
  description,
  action,
  actionLabel,
  className,
}: {
  key?: string;
  title: string;
  description: string;
  action?: () => void;
  actionLabel?: string;
  className?: string;
}) {
  const Icon = ICONS[key || ""] || Activity;
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-12", className)}>
      <div className="flex flex-col items-center justify-center w-full">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted p-1 mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-muted-foreground text-sm max-w-xs">{description}</p>
      </div>
      {action && actionLabel ? (
        <Card className="w-full max-w-xs mt-6 border-none bg-transparent shadow-none">
          <CardHeader className="border-b-0 p-0 pt-4">
            <CardTitle className="text-sm font-medium mb-1">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardFooter className="border-0 p-0 pb-4">
            <Button onClick={action} className="w-full">{actionLabel}</Button>
          </CardFooter>
        </Card>
      ) : null}
    </div>
  );
}
