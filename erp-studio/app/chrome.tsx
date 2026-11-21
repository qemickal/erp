"use client";

import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toast";
import TopBar from "@/components/top-bar";
import NavBottom from "@/components/nav-bottom";
import { getSessionAction } from "@/lib/session-actions";

type SessionUser = { id: string; name: string; email: string; role: string };

export default function Chrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getSessionAction().then((u) => {
      setUser(u);
      setReady(true);
    });
  }, []);

  // Mientras se resuelve la sesión, renderizamos siempre la misma estructura
  // (solo los hijos, sin navbar) para evitar errores de hidratación.
  if (!ready) {
    return (
      <div className="min-h-screen bg-background">
        <Toaster />
        <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      {user && (
        <div className="relative z-10">
          <TopBar user={user} />
        </div>
      )}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      {user && <NavBottom />}
    </div>
  );
}
