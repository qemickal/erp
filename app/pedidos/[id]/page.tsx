export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney, formatDate } from "@/lib/helpers";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { OrderDetail } from "@/components/order-detail";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      client: true,
      user: true,
      items: { include: { product: true } },
      quote: true,
      productionOrder: true,
      postSales: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!order) notFound();

  return (
    <div className="max-w-4xl">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Pedido {order.number}</h1>
          <p className="text-muted-foreground">{order.client.name}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {order.quote && (
            <Link href={`/cotizaciones/${order.quote.id}`} className="text-xs font-medium text-primary hover:underline">
              Cotización {order.quote.number} →
            </Link>
          )}
          <Link href="/pedidos" className="text-xs font-medium text-muted-foreground hover:underline">
            Volver a pedidos
          </Link>
        </div>
      </div>

      <OrderDetail
        order={{
          id: order.id,
          number: order.number,
          client: { name: order.client.name },
          status: order.status,
          paymentStatus: order.paymentStatus,
          subtotal: Number(order.subtotal),
          tax: Number(order.tax),
          total: Number(order.total),
          deliveryDate: order.deliveryDate,
          notes: order.notes,
          createdAt: order.createdAt,
          items: order.items.map((i: any) => ({
            id: i.id,
            description: i.description,
            quantity: i.quantity,
            unitPrice: Number(i.unitPrice),
            total: Number(i.total),
            product: i.product ? { name: i.product.name } : null,
          })),
          production: order.productionOrder
            ? { id: order.productionOrder.id, number: order.productionOrder.number, status: order.productionOrder.status }
            : null,
          quality: null,
          packaging: null,
          postSales: order.postSales.map((p: any) => ({ id: p.id, type: p.type, status: p.status, description: p.description })),
        }}
      />
    </div>
  );
}
