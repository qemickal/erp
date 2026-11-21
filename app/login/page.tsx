"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldCheck, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [from] = useState("/dashboard");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await loginAction(formData);
      if ("error" in result) {
        setError(result.error as string);
        return;
      }
      router.replace(from);
    });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary/10 via-background to-muted/10 px-4">
      <ShieldCheck className="mb-6 h-10 w-10 text-primary" />
      <Card className="w-full max-w-md shadow-xl border">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Iniciar sesión</CardTitle>
          <CardDescription>
            Sistema de gestión de Artes Gráficas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="items-center gap-2">
                <Mail className="h-4 w-4" />
                Correo electrónico
              </Label>
              <Input
                name="email"
                type="email"
                placeholder="ana@artegrafico.mx"
                defaultValue="ana@artegrafico.mx"
                className="w-full"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="items-center gap-2">
                <Lock className="h-4 w-4" />
                Contraseña
              </Label>
              <Input
                name="password"
                type="password"
                placeholder="••••••••"
                defaultValue="admin123"
                className="w-full"
                required
              />
            </div>
            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/50 p-3 text-xs text-destructive">
                {error}
              </div>
            )}
            <CardFooter className="pt-6">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Ingresando…" : "Ingresar"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
      <p className="mt-6 text-xs text-muted-foreground">
        Demo: ana@artegrafico.mx / admin123
      </p>
    </div>
  );
}
