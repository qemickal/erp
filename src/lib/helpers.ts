import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";

export function formatMoney(value: number | undefined | null): string {
  const raw = value == null ? 0 : typeof value === "object" ? Number(String(value)) : Number(value);
  const n = Number.isFinite(raw) ? raw : 0;
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

export function relativeDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  return formatDistanceToNow(new Date(value), { locale: es, addSuffix: true });
}

export const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Borrador",
  SENT: "Enviada",
  ACCEPTED: "Aceptada",
  REJECTED: "Rechazada",
  EXPIRED: "Expirada",
  PENDING: "Pendiente",
  IN_PRODUCTION: "En producción",
  READY: "Listo",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  UNPAID: "No pagado",
  PARTIAL: "Parcial",
  PAID: "Pagado",
  SCHEDULED: "Programada",
  REWORK: "Re-trabajo",
  COMPLETED: "Completada",
  PENDING_CHECK: "Pendiente",
  APPROVED: "Aprobado",
  REJECTED_Q: "Rechazado",
  PACKED: "Empacado",
  SHIPPED_P: "Enviado",
  FOLLOW_UP: "Seguimiento",
  CLAIM: "Reclamo",
  RETURN: "Devolución",
  SATISFACTION: "Satisfacción",
  OPEN: "Abierto",
  IN_PROGRESS: "En proceso",
  RESOLVED: "Resuelto",
  CLOSED: "Cerrado",
};

export const ROLE_LABELS: Record<string, string> = {
  OWNER: "Dueño",
  ADMIN: "Administrador",
  DESIGNER: "Diseñador",
  PRODUCTION: "Producción",
  QUALITY: "Calidad",
  SALES: "Ventas",
};

export const STATUS_VARIANT: Record<string, string> = {
  DRAFT: "secondary",
  SENT: "info",
  ACCEPTED: "ok",
  REJECTED: "destructive",
  EXPIRED: "secondary",
  PENDING: "info",
  IN_PRODUCTION: "info",
  READY: "ok",
  SHIPPED: "info",
  DELIVERED: "ok",
  CANCELLED: "destructive",
  UNPAID: "destructive",
  PARTIAL: "info",
  PAID: "ok",
  SCHEDULED: "info",
  REWORK: "info",
  COMPLETED: "ok",
  APPROVED: "ok",
  REJECTED_Q: "destructive",
  PACKED: "ok",
  OPEN: "info",
  IN_PROGRESS: "info",
  RESOLVED: "ok",
  CLOSED: "secondary",
};

export function statusBadgeVariant(status: string | undefined | null): string {
  return STATUS_VARIANT[String(status) ?? ""] || "default";
}

export function roleVariant(role: string | undefined | null): "default" | "destructive" | "secondary" | "outline" | "ghost" | "link" {
  const map: Record<string, "default" | "destructive" | "secondary" | "outline" | "ghost" | "link"> = { OWNER: "default", ADMIN: "default", DESIGNER: "default", PRODUCTION: "default", QUALITY: "default", SALES: "outline" };
  return map[String(role ?? "") as keyof typeof map] || "default";
}
