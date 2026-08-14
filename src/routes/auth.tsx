import { useEffect, useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Campo } from "@/components/crm/ui-bits";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acceso — CRM Industrial" },
      {
        name: "description",
        content: "Inicia sesión con tu correo para administrar visitas, oportunidades y cotizaciones.",
      },
      { property: "og:title", content: "Acceso — CRM Industrial" },
      {
        property: "og:description",
        content: "Inicia sesión con tu correo para administrar tu prospección industrial.",
      },
    ],
  }),
  component: Auth,
});

function Auth() {
  const router = useRouter();
  const [modo, setModo] = useState<"entrar" | "registrar">("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void router.navigate({ to: "/inicio" });
    });
  }, [router]);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || password.length < 6) {
      toast.error("Escribe tu correo y una contraseña de al menos 6 caracteres.");
      return;
    }
    setCargando(true);
    try {
      if (modo === "registrar") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/inicio` },
        });
        if (error) throw error;
        toast.success("Cuenta creada. Ya puedes usar el CRM.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      }
      void router.navigate({ to: "/inicio" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo iniciar sesión.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            Ventas técnicas B2B
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">CRM Industrial</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ningún esfuerzo comercial debe perderse y ninguna oportunidad activa debe quedarse sin
            una siguiente acción.
          </p>
        </div>

        <form onSubmit={enviar} className="space-y-4 rounded-xl border bg-card p-4 shadow-sm">
          <Campo label="Correo">
            <Input
              type="email"
              inputMode="email"
              autoComplete="email"
              className="h-11"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@empresa.com"
            />
          </Campo>
          <Campo label="Contraseña">
            <Input
              type="password"
              autoComplete={modo === "entrar" ? "current-password" : "new-password"}
              className="h-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
            />
          </Campo>
          <Button type="submit" className="h-11 w-full" disabled={cargando}>
            {cargando ? "Un momento…" : modo === "entrar" ? "Entrar" : "Crear cuenta"}
          </Button>
          <button
            type="button"
            className="w-full text-xs text-muted-foreground underline-offset-2 hover:underline"
            onClick={() => setModo(modo === "entrar" ? "registrar" : "entrar")}
          >
            {modo === "entrar"
              ? "No tengo cuenta, quiero registrarme"
              : "Ya tengo cuenta, quiero entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
