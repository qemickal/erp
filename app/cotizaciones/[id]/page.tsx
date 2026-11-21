export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/helpers";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { QuoteDetail } from "@/components/quote-detail";

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { client: true, user: true, items: { include: { product: true } }, order: true },
  });
  if (!quote) notFound();

  return (
    <div className="max-w-4xl">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Cotización {quote.number}</h1>
          <p className="text-muted-foreground">{quote.client.name}</p>
        </div>
        <div className="flex items-end gap-2">
          <Badge variant={quote.status === "ACCEPTED" ? "default" : quote.status === "REJECTED" ? "destructive" : "default"}>
            {quote.status}
          </Badge>
          {quote.order && (
            <Link href={`/pedidos/${quote.order.id}`} className="text-xs font-medium text-primary hover:underline">
              Pedido {quote.order.number} →
            </Link>
          )}
        </div>
      </div>

      <QuoteDetail
        quote={{
          id: quote.id,
          number: quote.number,
          client: { name: quote.client.name },
          status: quote.status,
          subtotal: Number(quote.subtotal),
          tax: Number(quote.tax),
          total: Number(quote.total),
          validUntil: quote.validUntil,
          notes: quote.notes,
          createdAt: quote.createdAt,
          items: quote.items.map((i: any) => ({
            id: i.id,
            description: i.description,
            quantity: i.quantity,
            unitPrice: Number(i.unitPrice),
            total: Number(i.total),
            product: i.product ? { name: i.product.name } : null,
          })),
        }}
      />
    </div>
  );
}
