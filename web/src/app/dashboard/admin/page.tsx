"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { apiRequest } from "@/lib/api";
import { clearSession } from "@/lib/auth";
import { PqrsItem } from "@/lib/pqrs-types";
import { useRoleGuard } from "@/lib/role-guard";

type PqrsResponse = { resultado: PqrsItem[] };

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, token, ready } = useRoleGuard(["admin"], "/dashboard/usuario");
  const [items, setItems] = useState<PqrsItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !ready) return;

    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const data = await apiRequest<PqrsResponse>("/pqrs/asignadas", { token });
        setItems(data.resultado ?? []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "No se pudo cargar el panel admin";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [token, ready]);

  const metrics = useMemo(() => {
    const total = items.length;
    const abiertas = items.filter((item) => ["radicada", "en_revision", "en_gestion"].includes(item.estado)).length;
    const respondidas = items.filter((item) => item.estado === "respondida").length;
    const cerradas = items.filter((item) => ["cerrada", "rechazada"].includes(item.estado)).length;
    return { total, abiertas, respondidas, cerradas };
  }, [items]);

  function handleLogout() {
    clearSession();
    router.replace("/");
  }

  if (!ready) {
    return (
      <main className="py-10">
        <section className="app-shell card p-6">
          <p className="muted">Validando permisos...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="py-10">
      <section className="app-shell">
        <header className="card flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-teal-700">Dashboard Admin</p>
            <h1 className="text-2xl font-bold">Control general PQRS</h1>
            {user ? <p className="muted mt-1 text-sm">{user.nombre} {user.apellido} | {user.correo}</p> : null}
          </div>

          <div className="flex gap-2">
            <Link href="/dashboard/usuario" className="btn-ghost">Vista usuario</Link>
            <Link href="/dashboard/responsable" className="btn-ghost">Vista responsable</Link>
            <button className="btn-primary" onClick={handleLogout}>Cerrar sesion</button>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-4">
          <article className="card p-5"><p className="muted text-sm">Total</p><p className="text-3xl font-bold">{metrics.total}</p></article>
          <article className="card p-5"><p className="muted text-sm">Abiertas</p><p className="text-3xl font-bold">{metrics.abiertas}</p></article>
          <article className="card p-5"><p className="muted text-sm">Respondidas</p><p className="text-3xl font-bold">{metrics.respondidas}</p></article>
          <article className="card p-5"><p className="muted text-sm">Cerradas/Rechazadas</p><p className="text-3xl font-bold">{metrics.cerradas}</p></article>
        </section>

        <section className="card mt-6 p-6">
          <h2 className="text-xl font-semibold">Acciones rapidas</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/dashboard/responsable" className="btn-primary">Gestionar bandeja</Link>
            <Link href="/dashboard/usuario" className="btn-ghost">Ver experiencia de usuario</Link>
            <Link href="/" className="btn-ghost">Ir al inicio</Link>
          </div>

          {loading ? <p className="muted mt-4">Cargando metricas...</p> : null}
          {error ? <p className="error-text mt-4">{error}</p> : null}
        </section>
      </section>
    </main>
  );
}
