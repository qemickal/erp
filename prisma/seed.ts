import { PrismaClient, Role, QuoteStatus, OrderStatus, PaymentStatus, ProductionOrderStatus, CheckStatus, PackagingStatus, PostSaleType, PostSaleStatus } from "@prisma/client";

const prisma = new PrismaClient();

const USERS = [
  { name: "Ana Ramírez", email: "ana@artegrafico.mx", password: "admin123", role: Role.OWNER },
  { name: "Carlos Méndez", email: "carlos@artegrafico.mx", password: "admin123", role: Role.ADMIN },
  { name: "Lucía Fernández", email: "lucia@artegrafico.mx", password: "123456", role: Role.DESIGNER },
  { name: "Diego Ortega", email: "diego@artegrafico.mx", password: "123456", role: Role.PRODUCTION },
  { name: "Sofía León", email: "sofia@artegrafico.mx", password: "123456", role: Role.QUALITY },
  { name: "Martín Ruiz", email: "martin@artegrafico.mx", password: "123456", role: Role.SALES },
];

const CLIENTS = [
  { name: "Café del Barrio", email: "contacto@cafedelbarrio.mx", phone: "55 1234 5678", address: "Av. México 123, Condesa, CDMX", rfc: "CDB900101ABC" },
  { name: "Editorial Vuelta", email: "ventas@vuelta.mx", phone: "55 2345 6789", address: "Eje Central 45, Centro, CDMX", rfc: "EVU950202DEF" },
  { name: "Boutique Flora", email: "hola@boutiqueflora.mx", phone: "55 3456 7890", address: "Calle Nueva España 88, Polanco, CDMX", rfc: "BOF010303GHI" },
  { name: "TechNova Eventos", email: "eventos@technova.mx", phone: "55 4567 8901", address: "Insurgentes Sur 1500, Crédito Constructor, CDMX", rfc: "TNE100404JKL" },
  { name: "Panadería La Tradición", email: "pedidos@latradicion.mx", phone: "55 5678 9012", address: "Av. Tamaulipas 204, Roma Norte, CDMX", rfc: "PLT150505MNO" },
  { name: "Galería Oxido", email: "contacto@galeriaoxido.mx", phone: "55 6789 0123", address: "Río de Janeiro 55, Roma Norte, CDMX", rfc: "GOX200606PQR" },
  { name: "Imprenta Unidos", email: "compras@imprentaunidos.mx", phone: "55 7890 1234", address: "Av. San Antonio 44, Azcapotzalco, CDMX", rfc: "IMU250707STU" },
];

const PRODUCTS = [
  { name: "Tarjetas de presentación (matte soft-touch)", description: "Tarjetas 350g, laminado soft-touch, troqueladas", category: "Tarjetas", basePrice: 420, unit: "juego de 100" },
  { name: "Flyers A5 a todo color", description: "Flyers 150g couché, impresos a 4/4", category: "Flyers", basePrice: 850, unit: "paquete de 500" },
  { name: "Cartel publicitario 60x90cm", description: "Cartel en papel bond 90g, impreso a una tinta", category: "Carteles", basePrice: 180, unit: "pieza" },
  { name: "Caja plegable con estampado", description: "Empaque cartoncillo micro-ondulado, impresión 4 colores", category: "Empaque", basePrice: 65, unit: "pieza" },
  { name: "Etiquetas adhesivas redondas", description: "Etiquetas vinilo adhesivo, Ø 5 cm", category: "Etiquetas", basePrice: 320, unit: "rollo de 250" },
  { name: "Papelería corporativa (carta + sobre)", description: "Carta membretada y sobre a color", category: "Papelería", basePrice: 540, unit: "juego de 250" },
  { name: "Folleto tríptico A4", description: "Folleto plegado en tres, papel 150g, color", category: "Flyers", basePrice: 1250, unit: "paquete de 250" },
  { name: "Banner de vinilo con ojales", description: "Banner impreso en vinilo con ojales y dobladillo", category: "Carteles", basePrice: 420, unit: "metro cuadrado" },
];

async function main() {
  await prisma.postSale.deleteMany();
  await prisma.packagingCheck.deleteMany();
  await prisma.qualityCheck.deleteMany();
  await prisma.productionStage.deleteMany();
  await prisma.productionOrder.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.quoteItem.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.product.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  const crypto = await import("crypto");
  const hash = (p: string) => crypto.createHash("sha256").update(p + process.env.JWT_SECRET!).digest("hex");

  for (const u of USERS) {
    await prisma.user.create({ data: { ...u, password: hash(u.password) } });
  }
  for (const c of CLIENTS) await prisma.client.create({ data: c });
  for (const p of PRODUCTS) await prisma.product.create({ data: p });

  const users = await prisma.user.findMany();
  const clients = await prisma.client.findMany();
  const products = await prisma.product.findMany();

  const owner = users.find(u => u.role === Role.OWNER)!;
  const sales = users.find(u => u.role === Role.SALES)!;
  const designer = users.find(u => u.role === Role.DESIGNER)!;
  const producer = users.find(u => u.role === Role.PRODUCTION)!;
  const quality = users.find(u => u.role === Role.QUALITY)!;

  // ---- Quotes ----
  const now = new Date();
  const quotesData = [
    { client: clients[0], user: sales, status: QuoteStatus.ACCEPTED, items: [{ product: products[0], desc: "Tarjetas de presentación para Café del Barrio", qty: 4, price: 420 }, { product: products[5], desc: "Papelería corporativa inicial", qty: 1, price: 540 }], valid: new Date(Date.now() + 86400000 * 15), accepted: true },
    { client: clients[1], user: sales, status: QuoteStatus.ACCEPTED, items: [{ product: products[1], desc: "Flyers lanzamiento editorial", qty: 2, price: 850 }, { product: products[6], desc: "Folleto tríptico catálogo", qty: 1, price: 1250 }], valid: new Date(Date.now() + 86400000 * 10), accepted: true },
    { client: clients[2], user: sales, status: QuoteStatus.SENT, items: [{ product: products[3], desc: "Cajas plegables colección primavera", qty: 300, price: 65 }, { product: products[4], desc: "Etiquetas para productos", qty: 20, price: 320 }], valid: new Date(Date.now() + 86400000 * 7), accepted: false },
    { client: clients[3], user: sales, status: QuoteStatus.DRAFT, items: [{ product: products[7], desc: "Banner evento TechNova", qty: 12, price: 420 }], valid: null, accepted: false },
    { client: clients[4], user: sales, status: QuoteStatus.REJECTED, items: [{ product: products[2], desc: "Carteles menú panadería", qty: 10, price: 180 }], valid: new Date(Date.now() - 86400000 * 5), accepted: false },
    { client: clients[5], user: sales, status: QuoteStatus.ACCEPTED, items: [{ product: products[0], desc: "Tarjetas galería", qty: 6, price: 420 }], valid: new Date(Date.now() + 86400000 * 30), accepted: true },
  ];

  let quoteSeq = 0;
  for (const qd of quotesData) {
    quoteSeq++;
    const items = qd.items.map((it, i) => ({
      productId: it.product.id,
      description: it.desc,
      quantity: it.qty,
      unitPrice: it.price,
      total: it.qty * it.price,
    }));
    const subtotal = items.reduce((s, i) => s + i.total, 0);
    const tax = Math.round(subtotal * 0.16 * 100) / 100;
    const quote = await prisma.quote.create({
      data: {
        number: `COT-${now.getFullYear()}-${String(quoteSeq).padStart(4, "0")}`,
        clientId: qd.client.id,
        userId: qd.user.id,
        status: qd.status,
        subtotal,
        tax,
        total: subtotal + tax,
        validUntil: qd.valid,
        notes: qd.accepted ? "Cliente aprobó el diseño y el presupuesto." : qd.status === QuoteStatus.REJECTED ? "Presupuesto fuera de alcance del cliente." : undefined,
        acceptedAt: qd.accepted ? new Date(now.getTime() - 86400000 * 2) : undefined,
        items: { create: items },
      },
    });

    // Accepted quotes -> Orders
    if (qd.accepted) {
      const orderSeq = quoteSeq;
      const order = await prisma.order.create({
        data: {
          number: `PED-${now.getFullYear()}-${String(orderSeq).padStart(4, "0")}`,
          quoteId: quote.id,
          clientId: qd.client.id,
          userId: qd.user.id,
          status: quoteSeq <= 2 ? OrderStatus.DELIVERED : OrderStatus.IN_PRODUCTION,
          paymentStatus: quoteSeq === 1 ? PaymentStatus.PAID : quoteSeq === 2 ? PaymentStatus.PARTIAL : PaymentStatus.UNPAID,
          subtotal,
          tax,
          total: subtotal + tax,
          deliveryDate: new Date(now.getTime() + 86400000 * (quoteSeq <= 2 ? -3 : 7)),
          notes: "Orden generada a partir de cotización aceptada.",
          items: { create: items },
        },
      });

      // Production orders for orders 1,2,3,6
      if ([1, 2, 3, 6].includes(orderSeq)) {
        const po = await prisma.productionOrder.create({
          data: {
            number: `OP-${now.getFullYear()}-${String(orderSeq).padStart(4, "0")}`,
            orderId: order.id,
            userId: producer.id,
            status: orderSeq <= 2 ? ProductionOrderStatus.COMPLETED : ProductionOrderStatus.IN_PROGRESS,
            startDate: new Date(now.getTime() - 86400000 * (orderSeq <= 2 ? 10 : 2)),
            dueDate: new Date(now.getTime() + 86400000 * (orderSeq <= 2 ? -2 : 5)),
            completedAt: orderSeq <= 2 ? new Date(now.getTime() - 86400000 * (orderSeq === 1 ? 4 : 3)) : undefined,
            notes: "Producción asignada al taller de impresión offset.",
          },
        });

        const stages = [
          { name: "Diseño y arte final", order: 1, status: CheckStatus.APPROVED },
          { name: "Preprensa y pruebas de color", order: 2, status: orderSeq <= 2 ? CheckStatus.APPROVED : CheckStatus.PENDING },
          { name: "Impresión", order: 3, status: orderSeq <= 2 ? CheckStatus.APPROVED : CheckStatus.PENDING },
          { name: "Acabado y troquelado", order: 4, status: orderSeq <= 2 ? CheckStatus.APPROVED : CheckStatus.PENDING },
        ];
        for (const s of stages) {
          await prisma.productionStage.create({
            data: { productionId: po.id, name: s.name, order: s.order, status: s.status, completedAt: s.status === CheckStatus.APPROVED ? new Date(now.getTime() - 86400000 * 5) : undefined, operatorId: producer.id, notes: s.status === CheckStatus.APPROVED ? "Etapa completada sin observaciones." : undefined },
          });
        }

        if (orderSeq <= 2) {
          await prisma.qualityCheck.create({
            data: { productionId: po.id, inspectorId: quality.id, status: CheckStatus.APPROVED, criteria: "Revisión de color, alineación y acabados. Todo dentro de especificaciones.", notes: "Aprobado para empaque." },
          });
          await prisma.packagingCheck.create({
            data: { productionId: po.id, inspectorId: quality.id, status: PackagingStatus.PACKED, packagingType: "Caja kraft + papel de seda", itemsPacked: orderSeq === 1 ? 500 : 200, notes: "Empaquetado listo para entrega." },
          });

          await prisma.postSale.create({
            data: { orderId: order.id, userId: sales.id, type: PostSaleType.FOLLOW_UP, status: PostSaleStatus.RESOLVED, description: "Seguimiento post-entrega: cliente conforme con las tarjetas. Se cotizará próxima tirada.", rating: 5, resolvedAt: new Date(now.getTime() - 86400000) },
          });
        } else {
          // order 3 in production: pending quality; order 6 delivered
          if (orderSeq === 6) {
            await prisma.qualityCheck.create({ data: { productionId: po.id, inspectorId: quality.id, status: CheckStatus.APPROVED, criteria: "Control final de tarjetas de galería.", notes: "Listo para empaque." } });
            await prisma.packagingCheck.create({ data: { productionId: po.id, inspectorId: quality.id, status: PackagingStatus.PACKED, packagingType: "Sobre rígido", itemsPacked: 600, notes: "" } });
            await prisma.order.update({ where: { id: order.id }, data: { status: OrderStatus.DELIVERED, paymentStatus: PaymentStatus.PAID } });
            await prisma.postSale.create({ data: { orderId: order.id, userId: sales.id, type: PostSaleType.SATISFACTION, status: PostSaleStatus.CLOSED, description: "Cliente dejó reseña positiva en redes sociales.", rating: 5 } });
          }
        }
      }

      // Claims for order 1 (delivered, paid)
      if (orderSeq === 1) {
        await prisma.postSale.create({
          data: { orderId: order.id, userId: sales.id, type: PostSaleType.CLAIM, status: PostSaleStatus.IN_PROGRESS, description: "Cliente reporta lote de tarjetas con corte ligeramente descentrado. Se programa reimpresión del 30%.", rating: 3 },
        });
      }
    }
  }

  console.log("Seed completed successfully.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
