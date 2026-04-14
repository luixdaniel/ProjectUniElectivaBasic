"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import DashboardShell from "@/components/layout/DashboardShell";
import DataTableWrapper from "@/components/ui/DataTableWrapper";
import EmptyState from "@/components/ui/EmptyState";
import ExportButtons from "@/components/ui/ExportButtons";
import FilterBar from "@/components/ui/FilterBar";
import PriorityBadge from "@/components/ui/PriorityBadge";
import SearchInput from "@/components/ui/SearchInput";
import StatusBadge from "@/components/ui/StatusBadge";
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
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("todos");
  const [prioridadFilter, setPrioridadFilter] = useState("todas");
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

  const loadDetalle = useCallback(async (id: number) => {
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
  }, [token]);

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

  const filteredRows = useMemo(() => {
    return asignadas.filter((item) => {
      const bySearch =
        item.numero_radicado.toLowerCase().includes(search.toLowerCase()) ||
        item.usuario.nombre.toLowerCase().includes(search.toLowerCase()) ||
        item.usuario.apellido.toLowerCase().includes(search.toLowerCase()) ||
        item.categoria.nombre.toLowerCase().includes(search.toLowerCase());
      const byEstado = estadoFilter === "todos" || item.estado === estadoFilter;
      const byPrioridad = prioridadFilter === "todas" || item.prioridad === prioridadFilter;
      return bySearch && byEstado && byPrioridad;
    });
  }, [asignadas, estadoFilter, prioridadFilter, search]);

  const columns = useMemo<ColumnDef<ResponsablePqrsItem>[]>(
    () => [
      {
        header: "Radicado",
        accessorKey: "numero_radicado",
        cell: ({ row }) => <span className="font-semibold">{row.original.numero_radicado}</span>,
      },
      {
        header: "Solicitante",
        id: "solicitante",
        cell: ({ row }) => `${row.original.usuario.nombre} ${row.original.usuario.apellido}`,
      },
      {
        header: "Categoria",
        id: "categoria",
        cell: ({ row }) => row.original.categoria.nombre,
      },
      {
        header: "Estado",
        accessorKey: "estado",
        cell: ({ row }) => <StatusBadge status={row.original.estado} />,
      },
      {
        header: "Prioridad",
        accessorKey: "prioridad",
        cell: ({ row }) => <PriorityBadge priority={row.original.prioridad} />,
      },
      {
        header: "Accion",
        id: "accion",
        enableSorting: false,
        cell: ({ row }) => (
          <button className="btn-ghost" onClick={() => loadDetalle(row.original.id)}>
            Gestionar
          </button>
        ),
      },
    ],
    [loadDetalle]
  );

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
    <DashboardShell
      roleLabel="Dashboard Responsable"
      title="Bandeja de gestion"
      subtitle={user ? `${user.nombre} ${user.apellido} | rol: ${user.rol}` : ""}
      links={[
        { href: dashboardHref, label: "Inicio responsable" },
        { href: "/responsable", label: "PQRS asignadas" },
        { href: "/", label: "Home" },
      ]}
      onLogout={handleLogout}
    >
      <section className="card p-6">
          <h2 className="text-xl font-semibold">Asignadas</h2>

          {loading ? <p className="muted mt-3">Cargando...</p> : null}
          {error ? <p className="error-text mt-3">{error}</p> : null}
          {success ? <p className="mt-3 rounded-md bg-emerald-100 px-3 py-2 text-sm text-emerald-800">{success}</p> : null}

          <FilterBar>
            <SearchInput value={search} onChange={setSearch} placeholder="Buscar por radicado, solicitante o categoria" />
            <select className="input" value={estadoFilter} onChange={(event) => setEstadoFilter(event.target.value)}>
              <option value="todos">Todos los estados</option>
              <option value="radicada">radicada</option>
              <option value="en_revision">en_revision</option>
              <option value="en_gestion">en_gestion</option>
              <option value="respondida">respondida</option>
              <option value="cerrada">cerrada</option>
              <option value="rechazada">rechazada</option>
            </select>
            <select className="input" value={prioridadFilter} onChange={(event) => setPrioridadFilter(event.target.value)}>
              <option value="todas">Todas las prioridades</option>
              <option value="baja">baja</option>
              <option value="media">media</option>
              <option value="alta">alta</option>
            </select>
            <ExportButtons
              fileName="pqrs-asignadas"
              rows={filteredRows.map((item) => ({
                radicado: item.numero_radicado,
                solicitante: `${item.usuario.nombre} ${item.usuario.apellido}`,
                categoria: item.categoria.nombre,
                estado: item.estado,
                prioridad: item.prioridad,
              }))}
              columns={[
                { key: "radicado", label: "Radicado" },
                { key: "solicitante", label: "Solicitante" },
                { key: "categoria", label: "Categoria" },
                { key: "estado", label: "Estado" },
                { key: "prioridad", label: "Prioridad" },
              ]}
            />
          </FilterBar>

          {!loading && filteredRows.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="Sin PQRS asignadas" subtitle="No hay registros para los filtros seleccionados." />
            </div>
          ) : (
            <div className="mt-4">
              <DataTableWrapper data={filteredRows} columns={columns} title="Bandeja de gestion" searchPlaceholder="Buscar en tabla" />
            </div>
          )}
      </section>

      {selected && (
        <section className="card p-6">
            <h2 className="text-xl font-semibold">Detalle y gestion</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <PqrsBadges tipo={selected.tipo as PqrsTipo} prioridad={selected.prioridad as PqrsPrioridad} estado={selected.estado} />
            </div>
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
    </DashboardShell>
  );
}
