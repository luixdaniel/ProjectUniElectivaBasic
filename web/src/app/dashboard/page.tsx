"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getToken, getUser } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentToken = getToken();
    const currentUser = getUser();

    if (!currentToken || !currentUser) {
      router.replace("/login");
      return;
    }

    const byRole = {
      usuario: "/dashboard/usuario",
      responsable: "/dashboard/responsable",
      admin: "/dashboard/admin",
    } as const;

    const destination = byRole[currentUser.rol] ?? "/login";

    const timer = window.setTimeout(() => {
      setTarget(destination);
      setLoading(false);
      router.replace(destination);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <main className="py-10">
      <section className="app-shell card p-8 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-teal-700">Redireccionando</p>
        <h1 className="mt-3 text-2xl font-bold">Preparando tu dashboard</h1>
        {loading ? <p className="muted mt-2">Validando sesion y rol...</p> : <p className="muted mt-2">Destino: {target}</p>}
      </section>
    </main>
  );
}
