"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  updateProductionOrderStatus,
  updateProductionStage,
} from "@/lib/actions-production";
import {
  updateQualityCheck,
  updatePackagingCheck,
} from "@/lib/actions-quality";
import { listUsers } from "@/lib/actions";
import { formatDate } from "@/lib/helpers";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, User, ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";

type Stage = {
  id: string;
  name: string;
  order: number;
  status: string;
  startedAt: Date | null;
  completedAt: Date | null;
  operator: { id: string; name: string } | null;
  notes: string | null;
};

type ProductionData = {
  id: string;
  number: string;
  order: { id: string; number: string };
  status: string;
  responsible: { id: string; name: string };
  startDate: Date | null;
  dueDate: Date | null;
  completedAt: Date | null;
  notes: string | null;
  pct: number;
  stages: Stage[];
  quality: { status: string; criteria: string | null; inspector: string } | null;
  packaging: { status: string; type: string | null; items: number; inspector: string } | null;
};

const STAGE_STATUS = [
  { value: "PENDING", label: "Pendiente" },
  { value: "IN_PROGRESS", label: "En proceso" },
  { value: "APPROVED", label: "Completada" },
];

const PO_STATUS = [
  { value: "SCHEDULED", label: "Programada" },
  { value: "IN_PROGRESS", label: "En proceso" },
  { value: "REWORK", label: "Re-trabajo" },
  { value: "COMPLETED", label: "Completada" },
  { value: "CANCELLED", label: "Cancelada" },
];

export function ProductionDetail({ production }: { production: ProductionData }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [users, setUsers] = useState<{ id: string; name: string; role: string }[]>([]);
  const [localStatus, setLocalStatus] = useState(production.status);

  useEffect(() => {
    listUsers().then((data: any[]) => setUsers(data));
  }, []);

  async function changePOStatus(status: string) {
    setPending(true);
    const fd = new FormData();
    fd.append("id", production.id);
    fd.append("status", status);
    try {
      await updateProductionOrderStatus(fd);
      toast.success("Estado de orden actualizado");
      router.refresh();
    } catch {
      toast.error("No se pudo actualizar");
    } finally {
      setPending(false);
    }
  }

  async function changeStage(stageId: string, status: string, operatorId: string) {
    setPending(true);
    const fd = new FormData();
    fd.append("stageId", stageId);
    fd.append("status", status);
    if (operatorId) fd.append("operatorId", operatorId);
    try {
      await updateProductionStage(fd);
      toast.success("Etapa actualizada");
      router.refresh();
    } catch {
      toast.error("No se pudo actualizar la etapa");
    } finally {
      setPending(false);
    }
  }

  const statusVariant = (s: string) => {
    const map: Record<string, "default" | "destructive" | "secondary" | "outline" | "ghost" | "link"> = {
      DRAFT: "default", SCHEDULED: "default", IN_PROGRESS: "default", REWORK: "secondary",
      COMPLETED: "default", CANCELLED: "destructive", APPROVED: "default", PENDING: "secondary", IN_PROGRESS_STAGE: "default",
    };
    return (map[s as keyof typeof map]) || "default";
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-12">
        <div className="md:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Estado de la orden</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Estado actual</span>
                <Select
                  onValueChange={(value: string | null) =>
                    changePOStatus(String(value ?? localStatus))
                  }
                  defaultValue={localStatus}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {PO_STATUS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Responsable</span>
                <span>{production.responsible.name}</span>
              </div>
              {production.startDate && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Iniciada</span>
                  <span>{formatDate(production.startDate)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Vencimiento</span>
                <span>{production.dueDate ? formatDate(production.dueDate) : "—"}</span>
              </div>
              {production.completedAt && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Completada</span>
                  <span>{formatDate(production.completedAt)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Progreso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">{production.pct}% completado</span>
                <span className="font-medium">{production.pct}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div className="bg-primary h-3 rounded-full transition-all duration-500" style={{ width: `${production.pct}%` }} />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-4">
          {production.notes && (
            <Card>
              <CardHeader><CardTitle>Notas</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground">{production.notes}</CardContent>
            </Card>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Etapas de producción</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/4">Etapa</TableHead>
                  <TableHead className="w-1/6 text-center">N.º</TableHead>
                  <TableHead className="w-1/5">Estado</TableHead>
                  <TableHead className="w-1/5">Operador</TableHead>
                  <TableHead className="w-1/5 text-right">Fechas</TableHead>
                  <TableHead className="w-12 text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {production.stages.map((s) => (
                  <TableRow key={s.id} className="border-b">
                    <TableCell className="pl-4">
                      <div className="font-medium">{s.name}</div>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">{s.order}</TableCell>
                    <TableCell>
                      <Select
                        onValueChange={(v: string | null) => changeStage(s.id, String(v ?? "PENDING"), "")}
                        defaultValue={s.status}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder={s.status} />
                        </SelectTrigger>
                        <SelectContent>
                          {STAGE_STATUS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        onValueChange={(v: string | null) => changeStage(s.id, s.status, String(v ?? ""))}
                        defaultValue={s.operator?.id || ""}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Sin asignar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem disabled value="">Sin asignar</SelectItem>
                          {users.map((u) => (
                            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {s.startedAt ? <div className="flex items-center gap-1"><Clock className="h-3 w-3" /><span>{formatDate(s.startedAt)}</span></div> : null}
                      {s.completedAt ? <div className="flex items-center gap-1 mt-1"><User className="h-3 w-3" /><span>{formatDate(s.completedAt)}</span></div> : null}
                    </TableCell>
                    <TableCell className="text-right">
                      {s.status === "PENDING" && (
                        <Button variant="outline" size="sm" onClick={() => changeStage(s.id, "IN_PROGRESS", "")} className="h-7 w-7 p-0">
                          <Clock className="h-3 w-3" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {production.order.id && (
        <>
          <Card>
            <CardHeader className="flex items-center gap-2">
              <CardTitle>
                <ShieldCheck className="h-4 w-4" /> Control de calidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={(fd: FormData) => handleQuality(fd)} className="mt-3 grid gap-3 md:grid-cols-4">
                <input type="hidden" name="productionId" value={production.id} />
                <Select name="status" defaultValue={production.quality?.status || "PENDING"}>
                  <SelectTrigger><SelectValue placeholder="Resultado" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APPROVED">Aprobado</SelectItem>
                    <SelectItem value="REJECTED">Rechazado</SelectItem>
                    <SelectItem value="PENDING">Pendiente</SelectItem>
                  </SelectContent>
                </Select>
                <Input name="criteria" placeholder="Criterios (color, alineación, acabado)" defaultValue={production.quality?.criteria || ""} />
                <Button type="submit">Guardar</Button>
              </form>
              {production.quality && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Revisado por {production.quality.inspector}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center gap-2">
              <CardTitle>
                <Truck className="h-4 w-4" /> Empaque y despacho
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={(fd: FormData) => handlePackaging(fd)} className="mt-3 grid gap-3 md:grid-cols-4">
                <input type="hidden" name="productionId" value={production.id} />
                <Select name="status" defaultValue={production.packaging?.status || "PENDING"}>
                  <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pendiente</SelectItem>
                    <SelectItem value="PACKED">Empacado</SelectItem>
                    <SelectItem value="SHIPPED">Enviado</SelectItem>
                  </SelectContent>
                </Select>
                <Input name="packagingType" placeholder="Tipo de empaque" defaultValue={production.packaging?.type || ""} />
                <Input name="itemsPacked" type="number" placeholder="Cantidad" defaultValue={String(production.packaging?.items || 0)} />
                <Button type="submit">Guardar</Button>
              </form>
              {production.packaging && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Revisado por {production.packaging.inspector}
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );

  async function handleQuality(fd: FormData) {
    setPending(true);
    try {
      await updateQualityCheck(fd);
      toast.success("Calidad guardada");
      router.refresh();
    } catch {
      toast.error("No se pudo guardar");
    } finally {
      setPending(false);
    }
  }
  async function handlePackaging(fd: FormData) {
    setPending(true);
    try {
      await updatePackagingCheck(fd);
      toast.success("Empaque guardado");
      router.refresh();
    } catch {
      toast.error("No se pudo guardar");
    } finally {
      setPending(false);
    }
  }
}
