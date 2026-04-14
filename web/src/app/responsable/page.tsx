"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import PqrsBadges from "@/components/pqrs/PqrsBadges";
import PqrsHistorial from "@/components/pqrs/PqrsHistorial";
import { apiRequest } from "@/lib/api";
import { clearSession } from "@/lib/auth";
import { HistorialItem, PqrsItem, PqrsPrioridad, PqrsTipo } from "@/lib/pqrs-types";
import { useRoleGuard } from "@/lib/role-guard";

type ResponsablePqrsItem = PqrsItem & {
  usuario: { id: number; nombre: string; apellido: string; correo: string };
  categoria: { id: number; nombre: string };
};

type PqrsResponse = { resultado: ResponsablePqrsItem[] };
type PqrsDetailResponse = { resultado: ResponsablePqrsItem };
type HistorialResponse = { resultado: HistorialItem[] };

export default function ResponsablePage() {
  const router = useRouter();
  const { user, token, ready } = useRoleGuard(["responsable", "admin"], "/dashboard/usuario");

  const [asignadas, setAsignadas] = useState<ResponsablePqrsItem[]>([]);
  const [selected, setSelected] = useState<ResponsablePqrsItem | null>(null);
  const [historial, setHistorial] = useState<HistorialItem[]>([]);

  const [nuevoEstado, setNuevoEstado] = useState("en_revision");
  const [respuesta, setRespuesta] = useState("");
  const [comentario, setComentario] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const dashboardHref = user?.rol === "admin" ? "/dashboard/admin" : "/dashboard/responsable";

  const estadosDisponibles = [
    "radicada",
    "en_revision",
    "en_gestion",
    "respondida",
    "cerrada",
    "rechazada",
  ];

  useEffect(() => {
    if (!token || !ready) return;

    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const data = await apiRequest<PqrsResponse>("/pqrs/asignadas", { token });
        setAsignadas(data.resultado ?? []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "No se pudo cargar bandeja";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [token, ready]);

  async function reloadAsignadas() {
    if (!token) return;
    const data = await apiRequest<PqrsResponse>("/pqrs/asignadas", { token });
    setAsignadas(data.resultado ?? []);
  }

  async function loadDetalle(id: number) {
    if (!token) return;
    setError("");
    try {
      const [detailData, historyData] = await Promise.all([
        apiRequest<PqrsDetailResponse>(`/pqrs/${id}`, { token }),
        apiRequest<HistorialResponse>(`/pqrs/${id}/historial`, { token }),
      ]);
      setSelected(detailData.resultado);
      setHistorial(historyData.resultado ?? []);
      setNuevoEstado(detailData.resultado.estado);
      setRespuesta(detailData.resultado.respuesta ?? "");
      setComentario("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo cargar detalle";
      setError(message);
    }
  }

  async function onUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !selected) return;

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await apiRequest<{ resultado: string }>(`/pqrs/${selected.id}/estado`, {
        method: "PATCH",
        token,
        body: {
          estado: nuevoEstado,
          respuesta: respuesta.trim() || null,
          comentario: comentario.trim() || null,
        },
      });
      setSuccess("Estado y respuesta actualizados");
      await Promise.all([reloadAsignadas(), loadDetalle(selected.id)]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo actualizar la PQRS";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

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
            <p className="text-sm uppercase tracking-[0.2em] text-teal-700">Modulo Responsable</p>
            <h1 className="text-2xl font-bold">Bandeja de gestion</h1>
            {user ? (
              <p className="muted mt-1 text-sm">
                {user.nombre} {user.apellido} | rol: {user.rol}
              </p>
            ) : null}
          </div>

          <div className="flex gap-2">
            <Link href={dashboardHref} className="btn-ghost">
              Dashboard
            </Link>
            <Link href="/pqrs" className="btn-ghost">
              Mis PQRS
            </Link>
            <button className="btn-primary" onClick={handleLogout}>
              Cerrar sesion
            </button>
          </div>
        </header>

        <section className="card mt-6 p-6">
          <h2 className="text-xl font-semibold">Asignadas</h2>

          {loading ? <p className="muted mt-3">Cargando...</p> : null}
          {error ? <p className="error-text mt-3">{error}</p> : null}
          {success ? <p className="mt-3 rounded-md bg-emerald-100 px-3 py-2 text-sm text-emerald-800">{success}</p> : null}
          {!loading && asignadas.length === 0 ? <p className="muted mt-3">No tienes PQRS asignadas.</p> : null}

          <div className="mt-4 space-y-3">
            {asignadas.map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <PqrsBadges tipo={item.tipo as PqrsTipo} prioridad={item.prioridad as PqrsPrioridad} estado={item.estado} />
                <p className="mt-2 font-semibold">{item.numero_radicado}</p>
                <p className="muted mt-1 text-sm">{item.usuario.nombre} {item.usuario.apellido} | {item.categoria.nombre}</p>
                <p className="muted mt-1 text-sm line-clamp-2">{item.descripcion}</p>
                <button className="btn-ghost mt-3" onClick={() => loadDetalle(item.id)}>
                  Gestionar
                </button>
              </article>
            ))}
          </div>
        </section>

        {selected && (
          <section className="card mt-6 p-6">
            <h2 className="text-xl font-semibold">Detalle y gestion</h2>
            <p className="mt-1 text-sm font-medium">{selected.numero_radicado}</p>
            <p className="muted mt-1 text-sm">{selected.descripcion}</p>
            <p className="muted mt-1 text-sm">Solicitante: {selected.usuario.nombre} {selected.usuario.apellido}</p>
            {selected.respuesta ? <p className="mt-2 rounded-md bg-sky-100 px-3 py-2 text-sm text-sky-900">Respuesta actual: {selected.respuesta}</p> : null}

            <form className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={onUpdate}>
              <div>
                <label className="mb-1 block text-sm font-medium">Nuevo estado</label>
                <select className="input" value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value)}>
                  {estadosDisponibles.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">Respuesta</label>
                <textarea className="input min-h-24" value={respuesta} onChange={(e) => setRespuesta(e.target.value)} />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">Comentario de trazabilidad</label>
                <input className="input" value={comentario} onChange={(e) => setComentario(e.target.value)} />
              </div>

              <button className="btn-primary md:col-span-2" type="submit" disabled={saving}>
                {saving ? "Actualizando..." : "Cambiar estado y respuesta"}
              </button>
            </form>

            <PqrsHistorial items={historial} title="Historial" />
          </section>
        )}
      </section>
    </main>
  );
}
