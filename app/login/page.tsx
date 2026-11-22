"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { loginAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock } from "lucide-react";

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
    <div className="flex min-h-screen bg-white">
      {/* Panel de marca — Oxford */}
      <aside className="relative hidden lg:flex lg:w-[46%] flex-col justify-between bg-oxford text-nube px-14 py-12 overflow-hidden">
        {/* filete de margen, guiño a la retícula del manual */}
        <div aria-hidden className="absolute left-6 top-12 bottom-12 w-px bg-white/10" />
        <div aria-hidden className="absolute right-6 top-12 bottom-12 w-px bg-white/10" />
        <div className="relative flex items-center gap-3">
          <span className="h-px w-10 bg-bright" />
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-sky">
            ERP · Uso interno
          </span>
        </div>

        <div className="relative flex flex-col items-start gap-10">
          <Image
            src="/brand/logo-nube.svg"
            alt="Mono Cromat & Co. — taller de artes gráficas"
            width={520}
            height={341}
            priority
            className="w-[78%] max-w-[460px] h-auto"
          />
          <p className="font-heading text-4xl xl:text-5xl font-bold tracking-[-0.035em] leading-[0.98] text-nube">
            Lift Your<br />Vision
          </p>
        </div>

        <div className="relative flex flex-col gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-nube/55">
          <span>Taller de artes gráficas · CDMX</span>
          <span>Foil · Laminado · Offset · Encuadernación</span>
          <span>monocromat.mx</span>
        </div>
      </aside>

      {/* Formulario */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex lg:hidden justify-center">
            <Image
              src="/brand/logo-royal.svg"
              alt="Mono Cromat & Co."
              width={168}
              height={110}
              priority
              className="h-20 w-auto"
            />
          </div>

          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-bright">
            Mono Cromat & Co.
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-[-0.03em] text-oxford">
            Iniciar sesión
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sistema interno del taller. Acceso restringido al equipo.
          </p>

          <form action={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-oxford/80">
                <Mail className="h-3.5 w-3.5" />
                Correo
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="ana@monocromat.mx"
                defaultValue="ana@artegrafico.mx"
                className="w-full"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-oxford/80">
                <Lock className="h-3.5 w-3.5" />
                Contraseña
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                defaultValue="admin123"
                className="w-full"
                required
              />
            </div>
            {error && (
              <div
                role="alert"
                className="border border-destructive/40 bg-destructive/5 px-3 py-2.5 text-xs text-destructive"
              >
                {error}
              </div>
            )}
            <Button type="submit" className="w-full h-11 text-sm tracking-wide" disabled={isPending}>
              {isPending ? "Verificando…" : "Entrar al taller"}
            </Button>
          </form>

          <p className="mt-8 border-t border-border pt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Demo · ana@artegrafico.mx · admin123
          </p>
        </div>
      </main>
    </div>
  );
}
